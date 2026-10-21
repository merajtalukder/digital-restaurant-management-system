import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';

import { PrismaService } from '../database/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PayPaymentDto } from './dto/pay-payment.dto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(private readonly prisma: PrismaService) {}

  private get sslStoreId(): string {
    return process.env.SSLCOMMERZ_STORE_ID?.trim() || '';
  }

  private get sslStorePassword(): string {
    return process.env.SSLCOMMERZ_STORE_PASSWORD?.trim() || '';
  }

  private get sslIsLive(): boolean {
    return process.env.SSLCOMMERZ_IS_LIVE?.trim().toLowerCase() === 'true';
  }

  private get frontendUrl(): string {
    return (
      process.env.FRONTEND_URL ||
      'https://digital-restaurant-management-system-9kp8scfur-meraj10.vercel.app'
    ).replace(/\/+$/, '');
  }

  private get backendUrl(): string {
    return (
      process.env.BACKEND_URL ||
      'https://digital-restaurant-backend.onrender.com'
    ).replace(/\/+$/, '');
  }

  private get sslBaseUrl(): string {
    return this.sslIsLive
      ? 'https://securepay.sslcommerz.com'
      : 'https://sandbox.sslcommerz.com';
  }

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

  private readonly onlineMethods = ['CARD', 'BKASH', 'NAGAD', 'ROCKET'];

  private getPaymentSource(
    transactionId: string,
  ): 'waiter' | 'customer' {
    return transactionId.startsWith('DRS-W-') ? 'waiter' : 'customer';
  }

  private buildFrontendRedirect(
    status: string,
    orderId?: number,
    paymentId?: number,
    source?: 'waiter' | 'customer',
  ): string {
    const path =
      source === 'waiter'
        ? '/waiter/payment-success'
        : '/customer/payment-result';

    const url = new URL(path, `${this.frontendUrl}/`);

    url.searchParams.set('status', status);

    if (orderId !== undefined) {
      url.searchParams.set('order', String(orderId));
      url.searchParams.set('orderId', String(orderId));
    }

    if (paymentId !== undefined) {
      url.searchParams.set('paymentId', String(paymentId));
    }

    return url.toString();
  }

  async create(createPaymentDto: CreatePaymentDto) {
    const { orderId, amount, method, transactionId } = createPaymentDto;

    const numericOrderId = Number(orderId);
    const requestedAmount = Number(amount);
    const normalizedMethod = String(method).toUpperCase();

    if (!Number.isInteger(numericOrderId) || numericOrderId <= 0) {
      throw new BadRequestException('Invalid order ID');
    }

    if (!Number.isFinite(requestedAmount) || requestedAmount <= 0) {
      throw new BadRequestException('Invalid payment amount');
    }

    const order = await this.prisma.order.findUnique({
      where: { id: numericOrderId },
      include: { payment: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.payment) {
      throw new BadRequestException(
        'Payment already exists for this order',
      );
    }

    if (requestedAmount !== Number(order.totalAmount)) {
      throw new BadRequestException(
        `Payment amount must be ${order.totalAmount}`,
      );
    }

    if (
      this.onlineMethods.includes(normalizedMethod) &&
      (requestedAmount < 10 || requestedAmount > 500000)
    ) {
      throw new BadRequestException(
        'Online payment amount must be between ৳10 and ৳500000',
      );
    }

    return this.prisma.payment.create({
      data: {
        orderId: numericOrderId,
        amount: requestedAmount,
        method: normalizedMethod as any,
        status: 'PENDING',
        transactionId: transactionId?.trim() || undefined,
      },
      include: this.paymentInclude,
    });
  }

  async initiate(paymentId: number, source?: string) {
    if (!Number.isInteger(paymentId) || paymentId <= 0) {
      throw new BadRequestException('Invalid payment ID');
    }

    if (!this.sslStoreId || !this.sslStorePassword) {
      this.logger.error(
        'SSLCOMMERZ credentials are missing from environment variables',
      );

      throw new BadRequestException(
        'SSLCOMMERZ credentials are not configured. Check Render environment variables.',
      );
    }

    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        order: {
          include: { table: true },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== 'PENDING') {
      throw new BadRequestException(
        `Payment cannot be initiated. Current status: ${payment.status}`,
      );
    }

    const normalizedMethod = String(payment.method).toUpperCase();

    if (!this.onlineMethods.includes(normalizedMethod)) {
      throw new BadRequestException(
        `Payment method is ${payment.method}. Select an online payment method before initiating SSLCOMMERZ.`,
      );
    }

    const amount = Number(payment.amount);

    if (!Number.isFinite(amount) || amount < 10 || amount > 500000) {
      throw new BadRequestException(
        'SSLCOMMERZ payment amount must be between ৳10 and ৳500000',
      );
    }

    // Determine which panel initiated the payment.
    const requestedSource =
      source?.trim().toLowerCase() === 'waiter'
        ? 'waiter'
        : 'customer';

    const expectedPrefix =
      requestedSource === 'waiter' ? 'DRS-W-' : 'DRS-C-';

    // Reuse the transaction ID only if its prefix matches the source.
    // Otherwise, create and save a correctly prefixed transaction ID.
    let tranId = payment.transactionId?.trim() || '';

    if (!tranId.startsWith(expectedPrefix)) {
      tranId =
        `${expectedPrefix}${payment.orderId}-${payment.id}-${Date.now()}`;

      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { transactionId: tranId },
      });

      this.logger.log(
        `Payment ${payment.id}: transaction ID assigned for ${requestedSource}`,
      );
    }

    const params = new URLSearchParams();

    params.set('store_id', this.sslStoreId);
    params.set('store_passwd', this.sslStorePassword);
    params.set('total_amount', amount.toFixed(2));
    params.set('currency', 'BDT');
    params.set('tran_id', tranId);

    params.set('success_url', `${this.backendUrl}/payments/success`);
    params.set('fail_url', `${this.backendUrl}/payments/fail`);
    params.set('cancel_url', `${this.backendUrl}/payments/cancel`);
    params.set('ipn_url', `${this.backendUrl}/payments/ipn`);

    params.set(
      'cus_name',
      payment.order.customerName?.trim() || 'Restaurant Customer',
    );
    params.set('cus_email', 'customer@example.com');
    params.set('cus_add1', 'Dhaka');
    params.set('cus_city', 'Dhaka');
    params.set('cus_postcode', '1207');
    params.set('cus_country', 'Bangladesh');
    params.set('cus_phone', '01700000000');

    params.set('product_name', `Restaurant Order #${payment.orderId}`);
    params.set('product_category', 'Restaurant');
    params.set('product_profile', 'general');
    params.set('shipping_method', 'NO');

    let response: Response;

    try {
      response = await fetch(
        `${this.sslBaseUrl}/gwprocess/v4/api.php`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString(),
          signal: AbortSignal.timeout(20000),
        },
      );
    } catch (error) {
      this.logger.error(
        'SSLCOMMERZ connection failed',
        error instanceof Error ? error.stack : String(error),
      );

      throw new BadRequestException(
        'Unable to connect to SSLCOMMERZ. Please try again.',
      );
    }

    const responseText = await response.text();

    let result: Record<string, any>;

    try {
      result = JSON.parse(responseText);
    } catch {
      this.logger.error(
        `Invalid SSLCOMMERZ response. HTTP ${response.status}; response: ${responseText.slice(0, 500)}`,
      );

      throw new BadRequestException(
        'Invalid response received from SSLCOMMERZ',
      );
    }

    if (!response.ok || !result?.GatewayPageURL) {
      const reason =
        result?.failedreason ||
        result?.error ||
        result?.message ||
        `HTTP ${response.status}`;

      this.logger.error(
        `SSLCOMMERZ initiation failed. HTTP ${response.status}; reason: ${reason}`,
      );

      throw new BadRequestException(
        `SSLCOMMERZ initiation failed: ${reason}`,
      );
    }

    this.logger.log(
      `Payment ${payment.id} initiated for ${requestedSource}. Mode: ${this.sslIsLive ? 'LIVE' : 'SANDBOX'}`,
    );

    return {
      success: true,
      paymentId: payment.id,
      orderId: payment.orderId,
      transactionId: tranId,
      source: requestedSource,
      gatewayPageURL: result.GatewayPageURL,
      sessionKey: result.sessionkey || null,
    };
  }

  private async validateTransaction(valId: string) {
    if (!this.sslStoreId || !this.sslStorePassword) {
      throw new BadRequestException(
        'SSLCOMMERZ credentials are not configured',
      );
    }

    const url = new URL(
      `${this.sslBaseUrl}/validator/api/validationserverAPI.php`,
    );

    url.searchParams.set('val_id', valId);
    url.searchParams.set('store_id', this.sslStoreId);
    url.searchParams.set('store_passwd', this.sslStorePassword);
    url.searchParams.set('format', 'json');

    let response: Response;

    try {
      response = await fetch(url.toString(), {
        signal: AbortSignal.timeout(20000),
      });
    } catch {
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
    } catch {
      throw new BadRequestException(
        'Invalid SSLCOMMERZ validation response',
      );
    }
  }

  async success(body: Record<string, any>): Promise<string> {
    const tranId = String(body?.tran_id || '');
    const valId = String(body?.val_id || '');

    if (!tranId || !valId) {
      return this.buildFrontendRedirect('failed');
    }

    const payment = await this.prisma.payment.findFirst({
      where: { transactionId: tranId },
      include: { order: true },
    });

    if (!payment) {
      return this.buildFrontendRedirect('failed');
    }

    const source = this.getPaymentSource(tranId);

    if (payment.status === 'PAID') {
      return this.buildFrontendRedirect(
        'success',
        payment.orderId,
        payment.id,
        source,
      );
    }

    const validation = await this.validateTransaction(valId);

    const validationStatus = String(
      validation?.status || '',
    ).toUpperCase();

    if (
      validationStatus !== 'VALID' &&
      validationStatus !== 'VALIDATED'
    ) {
      return this.buildFrontendRedirect(
        'failed',
        payment.orderId,
        payment.id,
        source,
      );
    }

    if (String(validation?.tran_id) !== payment.transactionId) {
      throw new BadRequestException('Transaction ID mismatch');
    }

    if (Number(validation?.amount) !== Number(payment.amount)) {
      throw new BadRequestException('Payment amount mismatch');
    }

    if (
      validation?.currency &&
      String(validation.currency).toUpperCase() !== 'BDT'
    ) {
      throw new BadRequestException('Payment currency mismatch');
    }

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'PAID' },
    });

    return this.buildFrontendRedirect(
      'success',
      payment.orderId,
      payment.id,
      source,
    );
  }

  async fail(body: Record<string, any>): Promise<string> {
    return this.handleUnsuccessfulCallback(body, 'failed');
  }

  async cancel(body: Record<string, any>): Promise<string> {
    return this.handleUnsuccessfulCallback(body, 'cancelled');
  }

  private async handleUnsuccessfulCallback(
    body: Record<string, any>,
    status: 'failed' | 'cancelled',
  ): Promise<string> {
    const tranId = String(body?.tran_id || '');

    if (!tranId) {
      return this.buildFrontendRedirect(status);
    }

    const payment = await this.prisma.payment.findFirst({
      where: { transactionId: tranId },
    });

    if (!payment) {
      return this.buildFrontendRedirect(status);
    }

    const source = this.getPaymentSource(tranId);

    if (payment.status === 'PENDING') {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' },
      });
    }

    return this.buildFrontendRedirect(
      status,
      payment.orderId,
      payment.id,
      source,
    );
  }

  async ipn(body: Record<string, any>) {
    const tranId = String(body?.tran_id || '');
    const valId = String(body?.val_id || '');

    if (!tranId) {
      return { success: false, message: 'Transaction ID missing' };
    }

    const payment = await this.prisma.payment.findFirst({
      where: { transactionId: tranId },
    });

    if (!payment) {
      return { success: false, message: 'Payment not found' };
    }

    if (payment.status === 'PAID') {
      return { success: true, status: 'PAID' };
    }

    if (!valId) {
      return { success: true, status: 'PENDING' };
    }

    const validation = await this.validateTransaction(valId);

    const validStatus = ['VALID', 'VALIDATED'].includes(
      String(validation?.status || '').toUpperCase(),
    );

    const validAmount =
      Number.isFinite(Number(validation?.amount)) &&
      Number(validation.amount) === Number(payment.amount);

    const validTransaction =
      String(validation?.tran_id || '') === payment.transactionId;

    const validCurrency =
      !validation?.currency ||
      String(validation.currency).toUpperCase() === 'BDT';

    if (
      validStatus &&
      validAmount &&
      validTransaction &&
      validCurrency
    ) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'PAID' },
      });

      return { success: true, status: 'PAID' };
    }

    return { success: true, status: 'PENDING' };
  }

  async pay(id: number, payPaymentDto: PayPaymentDto) {
    const { method, transactionId } = payPaymentDto;

    const payment = await this.prisma.payment.findUnique({
      where: { id },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status === 'PAID') {
      throw new BadRequestException('Payment already completed');
    }

    if (payment.status !== 'PENDING') {
      throw new BadRequestException(
        `Payment cannot be completed. Current status: ${payment.status}`,
      );
    }

    if (
      String(payment.method).toUpperCase() !== 'CASH' ||
      String(method).toUpperCase() !== 'CASH'
    ) {
      throw new BadRequestException(
        'Only CASH payments can be manually completed by the cashier',
      );
    }

    return this.prisma.payment.update({
      where: { id },
      data: {
        status: 'PAID',
        method: 'CASH',
        ...(transactionId !== undefined
          ? { transactionId: transactionId.trim() || undefined }
          : {}),
      },
      include: this.paymentInclude,
    });
  }

  async findAll() {
    return this.prisma.payment.findMany({
      orderBy: { id: 'desc' },
      include: this.paymentInclude,
    });
  }

  async findOne(id: number) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: this.paymentInclude,
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  async findByOrderId(orderId: number) {
    const payment = await this.prisma.payment.findUnique({
      where: { orderId },
      include: this.paymentInclude,
    });

    if (!payment) {
      throw new NotFoundException(
        'Payment not found for this order',
      );
    }

    return payment;
  }
}