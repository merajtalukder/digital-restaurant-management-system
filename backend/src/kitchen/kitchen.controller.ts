import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';

import { KitchenService } from './kitchen.service';

@Controller('kitchen')
export class KitchenController {
  constructor(
    private readonly kitchenService: KitchenService,
  ) {}

  // GET /kitchen

  @Get()
  findAll() {
    return this.kitchenService.findAll();
  }

  // GET /kitchen/:id

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.kitchenService.findOne(id);
  }

  // PATCH /kitchen/:id/status

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    data: {
      status:
        | 'PENDING'
        | 'PREPARING'
        | 'READY'
        | 'SERVED'
        | 'COMPLETED'
        | 'CANCELLED';
    },
  ) {
    return this.kitchenService.updateStatus(
      id,
      data.status,
    );
  }
}