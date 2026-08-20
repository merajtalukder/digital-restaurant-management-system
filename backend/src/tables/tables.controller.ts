import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';

import { TablesService } from './tables.service';
import { CreateTableDto } from './create-table.dto';
import { UpdateTableDto } from './update-table.dto';

@Controller('tables')
export class TablesController {
  constructor(
    private readonly tablesService: TablesService,
  ) {}

  @Post()
  create(@Body() data: CreateTableDto) {
    return this.tablesService.create(data);
  }

  @Get()
  findAll() {
    return this.tablesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tablesService.findOne(Number(id));
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() data: UpdateTableDto,
  ) {
    return this.tablesService.update(
      Number(id),
      data,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tablesService.remove(
      Number(id),
    );
  }
}