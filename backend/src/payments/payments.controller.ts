import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
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

  // ==========================================
  // Create Payment
  // ==========================================
  @Post()
  create(
    @Body() createPaymentDto: CreatePaymentDto,
  ) {
    return this.paymentsService.create(
      createPaymentDto,
    );
  }

  // ==========================================
  // Initiate SSLCOMMERZ Payment
  // ==========================================
  @Post(':id/initiate')
  initiate(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.paymentsService.initiate(id);
  }

  // ==========================================
  // SSLCOMMERZ SUCCESS CALLBACK
  // ==========================================
  @Post('success')
  async success(
    @Body() body: Record<string, any>,
    @Res() res: Response,
  ) {
    const redirectUrl =
      await this.paymentsService.success(body);

    return res.redirect(302, redirectUrl);
  }

  // ==========================================
  // SSLCOMMERZ FAIL CALLBACK
  // ==========================================
  @Post('fail')
  async fail(
    @Body() body: Record<string, any>,
    @Res() res: Response,
  ) {
    const redirectUrl =
      await this.paymentsService.fail(body);

    return res.redirect(302, redirectUrl);
  }

  // ==========================================
  // SSLCOMMERZ CANCEL CALLBACK
  // ==========================================
  @Post('cancel')
  async cancel(
    @Body() body: Record<string, any>,
    @Res() res: Response,
  ) {
    const redirectUrl =
      await this.paymentsService.cancel(body);

    return res.redirect(302, redirectUrl);
  }

  // ==========================================
  // SSLCOMMERZ IPN
  // ==========================================
  @Post('ipn')
  ipn(
    @Body() body: Record<string, any>,
  ) {
    return this.paymentsService.ipn(body);
  }

  // ==========================================
  // Cashier: Mark Payment as PAID
  // ==========================================
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

  // ==========================================
  // Get All Payments
  // ==========================================
  @Get()
  findAll() {
    return this.paymentsService.findAll();
  }

  // ==========================================
  // Get Payment By Order
  // ==========================================
  @Get('order/:orderId')
  findByOrderId(
    @Param('orderId', ParseIntPipe) orderId: number,
  ) {
    return this.paymentsService.findByOrderId(
      orderId,
    );
  }

  // ==========================================
  // Get Payment By ID
  // ==========================================
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.paymentsService.findOne(id);
  }
}