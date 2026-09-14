import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../database/prisma.service';

import { CreatePaymentDto } from './dto/create-payment.dto';
import { PayPaymentDto } from './dto/pay-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  // ==========================================
  // SSLCOMMERZ CONFIGURATION
  // ==========================================

  private get sslStoreId(): string {
    return process.env.SSLCOMMERZ_STORE_ID || '';
  }

  private get sslStorePassword(): string {
    return process.env.SSLCOMMERZ_STORE_PASSWORD || '';
  }

  private get sslIsLive(): boolean {
    return process.env.SSLCOMMERZ_IS_LIVE === 'true';
  }

  private get frontendUrl(): string {
    return (
      process.env.FRONTEND_URL ||
      'http://localhost:5174'
    );
  }

  private get backendUrl(): string {
    return (
      process.env.BACKEND_URL ||
      'http://localhost:3000'
    );
  }

  private get sslBaseUrl(): string {
    return this.sslIsLive
      ? 'https://securepay.sslcommerz.com'
      : 'https://sandbox.sslcommerz.com';
  }

  // ==========================================
  // PAYMENT INCLUDE
  // ==========================================

  private readonly paymentInclude = {
    order: {
      include: {
        table: true,
        orderItems: {
          include: {
            menuItem: true,
          },
        },
      },
    },
  };

  // ==========================================
  // CREATE PAYMENT
  // ==========================================

  async create(
    createPaymentDto: CreatePaymentDto,
  ) {
    const {
      orderId,
      amount,
      method,
      transactionId,
    } = createPaymentDto;

    const numericOrderId = Number(orderId);

    if (
      !Number.isInteger(numericOrderId) ||
      numericOrderId <= 0
    ) {
      throw new BadRequestException(
        'Invalid order ID',
      );
    }

    const order =
      await this.prisma.order.findUnique({
        where: {
          id: numericOrderId,
        },
        include: {
          payment: true,
        },
      });

    if (!order) {
      throw new NotFoundException(
        'Order not found',
      );
    }

    if (order.payment) {
      throw new BadRequestException(
        'Payment already exists for this order',
      );
    }

    const requestedAmount = Number(amount);
    const orderAmount = Number(
      order.totalAmount,
    );

    if (
      !Number.isFinite(requestedAmount) ||
      requestedAmount <= 0
    ) {
      throw new BadRequestException(
        'Invalid payment amount',
      );
    }

    if (requestedAmount !== orderAmount) {
      throw new BadRequestException(
        `Payment amount must be ${order.totalAmount}`,
      );
    }

    const onlineMethods = [
      'CARD',
      'BKASH',
      'NAGAD',
      'ROCKET',
    ];

    if (
      onlineMethods.includes(String(method)) &&
      (
        requestedAmount < 10 ||
        requestedAmount > 500000
      )
    ) {
      throw new BadRequestException(
        'Online payment amount must be between ৳10 and ৳500000',
      );
    }

    return this.prisma.payment.create({
      data: {
        orderId: numericOrderId,
        amount: requestedAmount,
        method,
        status: 'PENDING',
        transactionId:
          transactionId?.trim() || undefined,
      },
      include: this.paymentInclude,
    });
  }

  // ==========================================
  // INITIATE SSLCOMMERZ
  // ==========================================

  async initiate(paymentId: number) {
    if (
      !this.sslStoreId ||
      !this.sslStorePassword
    ) {
      throw new BadRequestException(
        'SSLCOMMERZ credentials are not configured',
      );
    }

    const payment =
      await this.prisma.payment.findUnique({
        where: {
          id: paymentId,
        },
        include: {
          order: {
            include: {
              table: true,
            },
          },
        },
      });

    if (!payment) {
      throw new NotFoundException(
        'Payment not found',
      );
    }

    if (payment.status !== 'PENDING') {
      throw new BadRequestException(
        `Payment cannot be initiated because its current status is ${payment.status}`,
      );
    }

    const onlineMethods = [
      'CARD',
      'BKASH',
      'NAGAD',
      'ROCKET',
    ];

    if (
      !onlineMethods.includes(
        String(payment.method),
      )
    ) {
      throw new BadRequestException(
        'SSLCOMMERZ can only be initiated for online payment methods',
      );
    }

    const amount = Number(payment.amount);

    if (
      !Number.isFinite(amount) ||
      amount < 10 ||
      amount > 500000
    ) {
      throw new BadRequestException(
        'SSLCOMMERZ payment amount must be between ৳10 and ৳500000',
      );
    }

    const tranId =
      payment.transactionId ||
      `DRS-${payment.orderId}-${payment.id}-${Date.now()}`;

    if (!payment.transactionId) {
      await this.prisma.payment.update({
        where: {
          id: payment.id,
        },
        data: {
          transactionId: tranId,
        },
      });
    }

    // ==========================================
    // CUSTOMER INFORMATION
    // ==========================================

    const customerName =
      payment.order.customerName?.trim() ||
      'Restaurant Customer';

    // ==========================================
    // SSLCOMMERZ PARAMETERS
    // ==========================================

    const params = new URLSearchParams();

    params.append(
      'store_id',
      this.sslStoreId,
    );

    params.append(
      'store_passwd',
      this.sslStorePassword,
    );

    params.append(
      'total_amount',
      amount.toFixed(2),
    );

    params.append(
      'currency',
      'BDT',
    );

    params.append(
      'tran_id',
      tranId,
    );

    params.append(
      'success_url',
      `${this.backendUrl}/payments/success`,
    );

    params.append(
      'fail_url',
      `${this.backendUrl}/payments/fail`,
    );

    params.append(
      'cancel_url',
      `${this.backendUrl}/payments/cancel`,
    );

    params.append(
      'ipn_url',
      `${this.backendUrl}/payments/ipn`,
    );

    params.append(
      'cus_name',
      customerName,
    );

    // ==========================================
    // PRODUCT INFORMATION
    // ==========================================

    params.append(
      'product_name',
      `Restaurant Order #${payment.orderId}`,
    );

    params.append(
      'product_category',
      'Restaurant',
    );

    params.append(
      'product_profile',
      'general',
    );

    params.append(
      'shipping_method',
      'NO',
    );

    // ==========================================
    // SEND REQUEST TO SSLCOMMERZ
    // ==========================================

    let response: Response;

    try {
      response = await fetch(
        `${this.sslBaseUrl}/gwprocess/v4/api.php`,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/x-www-form-urlencoded',
          },
          body: params.toString(),
        },
      );
    } catch (error) {
      console.error(
        'SSLCOMMERZ connection error:',
        error,
      );

      throw new BadRequestException(
        'Unable to connect to SSLCOMMERZ',
      );
    }

    if (!response.ok) {
      throw new BadRequestException(
        `SSLCOMMERZ request failed with status ${response.status}`,
      );
    }

    // ==========================================
    // PARSE RESPONSE
    // ==========================================

    let result: Record<string, any>;

    try {
      result = await response.json();
    } catch (error) {
      console.error(
        'SSLCOMMERZ response parsing error:',
        error,
      );

      throw new BadRequestException(
        'Invalid response received from SSLCOMMERZ',
      );
    }

    // ==========================================
    // GATEWAY URL
    // ==========================================

    if (!result?.GatewayPageURL) {
      throw new BadRequestException(
        result?.failedreason ||
          result?.error ||
          'SSLCOMMERZ did not return a gateway URL',
      );
    }

    return {
      success: true,
      paymentId: payment.id,
      orderId: payment.orderId,
      transactionId: tranId,
      gatewayPageURL:
        result.GatewayPageURL,
      sessionKey:
        result.sessionkey || null,
    };
  }

  // ==========================================
  // SUCCESS CALLBACK
  // ==========================================

  async success(
    body: Record<string, any>,
  ): Promise<string> {
    const tranId = String(
      body?.tran_id || '',
    );

    const valId = String(
      body?.val_id || '',
    );

    if (!tranId || !valId) {
      return this.buildFrontendRedirect(
        'failed',
      );
    }

    const payment =
      await this.prisma.payment.findFirst({
        where: {
          transactionId: tranId,
        },
        include: {
          order: true,
        },
      });

    if (!payment) {
      return this.buildFrontendRedirect(
        'failed',
      );
    }

    if (payment.status === 'PAID') {
      return this.buildFrontendRedirect(
        'success',
        payment.orderId,
        payment.id,
      );
    }

    const validation =
      await this.validateTransaction(
        valId,
      );

    const validationStatus =
      String(
        validation?.status || '',
      ).toUpperCase();

    if (
      validationStatus !== 'VALID' &&
      validationStatus !== 'VALIDATED'
    ) {
      await this.prisma.payment.update({
        where: {
          id: payment.id,
        },
        data: {
          status: 'FAILED',
        },
      });

      return this.buildFrontendRedirect(
        'failed',
        payment.orderId,
        payment.id,
      );
    }

    // ==========================================
    // TRANSACTION ID VALIDATION
    // ==========================================

    if (
      String(validation?.tran_id) !==
      String(payment.transactionId)
    ) {
      throw new BadRequestException(
        'Transaction ID mismatch',
      );
    }

    // ==========================================
    // AMOUNT VALIDATION
    // ==========================================

    const gatewayAmount = Number(
      validation?.amount,
    );

    const paymentAmount = Number(
      payment.amount,
    );

    if (
      !Number.isFinite(gatewayAmount) ||
      gatewayAmount !== paymentAmount
    ) {
      throw new BadRequestException(
        'Payment amount mismatch',
      );
    }

    // ==========================================
    // CURRENCY VALIDATION
    // ==========================================

    if (
      validation?.currency &&
      String(
        validation.currency,
      ).toUpperCase() !== 'BDT'
    ) {
      throw new BadRequestException(
        'Payment currency mismatch',
      );
    }

    // ==========================================
    // MARK PAYMENT AS PAID
    // ==========================================

    const paidPayment =
      await this.prisma.payment.update({
        where: {
          id: payment.id,
        },
        data: {
          status: 'PAID',
          transactionId:
            String(
              validation?.tran_id ||
                payment.transactionId,
            ),
        },
        include: this.paymentInclude,
      });

    return this.buildFrontendRedirect(
      'success',
      paidPayment.orderId,
      paidPayment.id,
    );
  }

  // ==========================================
  // FAIL CALLBACK
  // ==========================================

  async fail(
    body: Record<string, any>,
  ): Promise<string> {
    const tranId = String(
      body?.tran_id || '',
    );

    if (tranId) {
      const payment =
        await this.prisma.payment.findFirst({
          where: {
            transactionId: tranId,
          },
        });

      if (
        payment &&
        payment.status === 'PENDING'
      ) {
        await this.prisma.payment.update({
          where: {
            id: payment.id,
          },
          data: {
            status: 'FAILED',
          },
        });

        return this.buildFrontendRedirect(
          'failed',
          payment.orderId,
          payment.id,
        );
      }
    }

    return this.buildFrontendRedirect(
      'failed',
    );
  }

  // ==========================================
  // CANCEL CALLBACK
  // ==========================================

  async cancel(
    body: Record<string, any>,
  ): Promise<string> {
    const tranId = String(
      body?.tran_id || '',
    );

    if (tranId) {
      const payment =
        await this.prisma.payment.findFirst({
          where: {
            transactionId: tranId,
          },
        });

      if (
        payment &&
        payment.status === 'PENDING'
      ) {
        await this.prisma.payment.update({
          where: {
            id: payment.id,
          },
          data: {
            status: 'FAILED',
          },
        });

        return this.buildFrontendRedirect(
          'cancelled',
          payment.orderId,
          payment.id,
        );
      }
    }

    return this.buildFrontendRedirect(
      'cancelled',
    );
  }

  // ==========================================
  // IPN
  // ==========================================

  async ipn(
    body: Record<string, any>,
  ) {
    const tranId = String(
      body?.tran_id || '',
    );

    const valId = String(
      body?.val_id || '',
    );

    if (!tranId) {
      return {
        success: false,
        message: 'Transaction ID missing',
      };
    }

    const payment =
      await this.prisma.payment.findFirst({
        where: {
          transactionId: tranId,
        },
      });

    if (!payment) {
      return {
        success: false,
        message: 'Payment not found',
      };
    }

    if (payment.status === 'PAID') {
      return {
        success: true,
        message:
          'Payment already completed',
      };
    }

    if (valId) {
      const validation =
        await this.validateTransaction(
          valId,
        );

      const validationStatus =
        String(
          validation?.status || '',
        ).toUpperCase();

      if (
        validationStatus === 'VALID' ||
        validationStatus === 'VALIDATED'
      ) {
        const gatewayAmount = Number(
          validation?.amount,
        );

        const paymentAmount = Number(
          payment.amount,
        );

        const transactionMatches =
          String(
            validation?.tran_id,
          ) ===
          String(payment.transactionId);

        const amountMatches =
          Number.isFinite(
            gatewayAmount,
          ) &&
          gatewayAmount ===
            paymentAmount;

        const currencyMatches =
          !validation?.currency ||
          String(
            validation.currency,
          ).toUpperCase() === 'BDT';

        if (
          transactionMatches &&
          amountMatches &&
          currencyMatches
        ) {
          await this.prisma.payment.update({
            where: {
              id: payment.id,
            },
            data: {
              status: 'PAID',
            },
          });

          return {
            success: true,
            status: 'PAID',
          };
        }
      }
    }

    return {
      success: true,
      status: 'PENDING',
    };
  }

  // ==========================================
  // VALIDATE SSLCOMMERZ TRANSACTION
  // ==========================================

  private async validateTransaction(
    valId: string,
  ) {
    if (
      !this.sslStoreId ||
      !this.sslStorePassword
    ) {
      throw new BadRequestException(
        'SSLCOMMERZ credentials are not configured',
      );
    }

    const url = new URL(
      `${this.sslBaseUrl}/validator/api/validationserverAPI.php`,
    );

    url.searchParams.set(
      'val_id',
      valId,
    );

    url.searchParams.set(
      'store_id',
      this.sslStoreId,
    );

    url.searchParams.set(
      'store_passwd',
      this.sslStorePassword,
    );

    url.searchParams.set(
      'format',
      'json',
    );

    let response: Response;

    try {
      response = await fetch(
        url.toString(),
        {
          method: 'GET',
        },
      );
    } catch (error) {
      console.error(
        'SSLCOMMERZ validation connection error:',
        error,
      );

      throw new BadRequestException(
        'Unable to validate SSLCOMMERZ transaction',
      );
    }

    if (!response.ok) {
      throw new BadRequestException(
        'Unable to validate SSLCOMMERZ transaction',
      );
    }

    try {
      return await response.json();
    } catch (error) {
      console.error(
        'SSLCOMMERZ validation response error:',
        error,
      );

      throw new BadRequestException(
        'Invalid SSLCOMMERZ validation response',
      );
    }
  }

  // ==========================================
  // CASHIER: MARK PAYMENT AS PAID
  // ==========================================

  async pay(
    id: number,
    payPaymentDto: PayPaymentDto,
  ) {
    const {
      method,
      transactionId,
    } = payPaymentDto;

    const payment =
      await this.prisma.payment.findUnique({
        where: {
          id,
        },
        include: {
          order: true,
        },
      });

    if (!payment) {
      throw new NotFoundException(
        'Payment not found',
      );
    }

    if (payment.status === 'PAID') {
      throw new BadRequestException(
        'Payment already completed',
      );
    }

    if (payment.status !== 'PENDING') {
      throw new BadRequestException(
        `Payment cannot be completed because its current status is ${payment.status}`,
      );
    }

    // ==========================================
    // CASHIER MANUAL PAYMENT
    // ==========================================

    if (
      payment.method !== 'CASH' ||
      method !== 'CASH'
    ) {
      throw new BadRequestException(
        'Only CASH payments can be manually completed by the cashier',
      );
    }

    return this.prisma.payment.update({
      where: {
        id,
      },
      data: {
        status: 'PAID',
        method: 'CASH',
        ...(transactionId !== undefined
          ? {
              transactionId:
                transactionId.trim() ||
                undefined,
            }
          : {}),
      },
      include: this.paymentInclude,
    });
  }

  // ==========================================
  // GET ALL PAYMENTS
  // ==========================================

  async findAll() {
    return this.prisma.payment.findMany({
      orderBy: {
        id: 'desc',
      },
      include: this.paymentInclude,
    });
  }

  // ==========================================
  // GET PAYMENT BY ID
  // ==========================================

  async findOne(id: number) {
    const payment =
      await this.prisma.payment.findUnique({
        where: {
          id,
        },
        include: this.paymentInclude,
      });

    if (!payment) {
      throw new NotFoundException(
        'Payment not found',
      );
    }

    return payment;
  }

  // ==========================================
  // GET PAYMENT BY ORDER ID
  // ==========================================

  async findByOrderId(
    orderId: number,
  ) {
    const payment =
      await this.prisma.payment.findUnique({
        where: {
          orderId,
        },
        include: this.paymentInclude,
      });

    if (!payment) {
      throw new NotFoundException(
        'Payment not found for this order',
      );
    }

    return payment;
  }

  // ==========================================
  // FRONTEND REDIRECT URL
  // ==========================================

  private buildFrontendRedirect(
    status: string,
    orderId?: number,
    paymentId?: number,
  ): string {
    const url = new URL(
      '/customer/payment-result',
      this.frontendUrl,
    );

    url.searchParams.set(
      'status',
      status,
    );

    if (orderId !== undefined) {
      url.searchParams.set(
        'orderId',
        String(orderId),
      );
    }

    if (paymentId !== undefined) {
      url.searchParams.set(
        'paymentId',
        String(paymentId),
      );
    }

    return url.toString();
  }
}