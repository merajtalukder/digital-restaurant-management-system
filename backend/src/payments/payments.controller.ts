import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';

import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PayPaymentDto } from './dto/pay-payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
  ) {}

  // Create a payment
  @Post()
  create(
    @Body() createPaymentDto: CreatePaymentDto,
  ) {
    return this.paymentsService.create(
      createPaymentDto,
    );
  }

  // Initiate SSLCOMMERZ payment
  // Customer: POST /payments/:id/initiate?source=customer
  // Waiter:   POST /payments/:id/initiate?source=waiter
  @Post(':id/initiate')
  initiate(
    @Param('id', ParseIntPipe) id: number,
    @Query('source') source?: string,
  ) {
    const normalizedSource =
      source?.trim().toLowerCase() === 'waiter'
        ? 'waiter'
        : 'customer';

    return this.paymentsService.initiate(
      id,
      normalizedSource,
    );
  }

  // SSLCOMMERZ success callback
  @Post('success')
  async success(
    @Body() body: Record<string, any>,
    @Res() res: Response,
  ) {
    const redirectUrl =
      await this.paymentsService.success(body);

    return res.redirect(302, redirectUrl);
  }

  // SSLCOMMERZ failure callback
  @Post('fail')
  async fail(
    @Body() body: Record<string, any>,
    @Res() res: Response,
  ) {
    const redirectUrl =
      await this.paymentsService.fail(body);

    return res.redirect(302, redirectUrl);
  }

  // SSLCOMMERZ cancellation callback
  @Post('cancel')
  async cancel(
    @Body() body: Record<string, any>,
    @Res() res: Response,
  ) {
    const redirectUrl =
      await this.paymentsService.cancel(body);

    return res.redirect(302, redirectUrl);
  }

  // SSLCOMMERZ Instant Payment Notification
  @Post('ipn')
  ipn(
    @Body() body: Record<string, any>,
  ) {
    return this.paymentsService.ipn(body);
  }

  // Cashier: manually complete a CASH payment
  @Patch(':id/pay')
  pay(
    @Param('id', ParseIntPipe) id: number,
    @Body() payPaymentDto: PayPaymentDto,
  ) {
    return this.paymentsService.pay(
      id,
      payPaymentDto,
    );
  }

  // Get all payments
  @Get()
  findAll() {
    return this.paymentsService.findAll();
  }

  // Get payment by order ID
  @Get('order/:orderId')
  findByOrderId(
    @Param('orderId', ParseIntPipe)
    orderId: number,
  ) {
    return this.paymentsService.findByOrderId(
      orderId,
    );
  }

  // Get payment by payment ID
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.paymentsService.findOne(id);
  }
}