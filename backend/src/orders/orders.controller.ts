import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { OrdersService } from './orders.service';
import { CreateOrderDto } from './create-order.dto';

@Controller('orders')
export class OrdersController {

  constructor(
    private readonly ordersService: OrdersService,
  ) {}


  // =========================
  // CREATE NEW ORDER
  // =========================

  @Post()
  create(
    @Body() data: CreateOrderDto,
  ) {

    return this.ordersService.create(
      data,
    );

  }


  // =========================
  // GET ALL ORDERS
  // =========================

  @Get()
  findAll() {

    return this.ordersService.findAll();

  }


  // =========================
  // GET SINGLE ORDER
  // =========================

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {

    return this.ordersService.findOne(
      id,
    );

  }


  // =========================
  // UPDATE ORDER
  // ADD ITEM TO EXISTING ORDER
  // =========================

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    data: any,
  ) {

    return this.ordersService.update(
      id,
      data,
    );

  }


  // =========================
  // DELETE ORDER
  // =========================

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe)
    id: number,
  ) {

    return this.ordersService.remove(
      id,
    );

  }

}