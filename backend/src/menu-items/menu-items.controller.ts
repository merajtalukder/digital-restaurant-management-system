import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';

import { MenuItemsService } from './menu-items.service';
import { CreateMenuItemDto } from './create-menu-item.dto';
import { UpdateMenuItemDto } from './update-menu-item.dto';

@Controller('menu-items')
export class MenuItemsController {
  constructor(
    private readonly menuItemsService: MenuItemsService,
  ) {}

  // CREATE
  @Post()
  create(@Body() data: CreateMenuItemDto) {
    return this.menuItemsService.create(data);
  }

  // GET ALL
  @Get()
  findAll() {
    return this.menuItemsService.findAll();
  }

  // GET ONE
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.menuItemsService.findOne(Number(id));
  }

  // UPDATE
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() data: UpdateMenuItemDto,
  ) {
    return this.menuItemsService.update(Number(id), data);
  }

  // DELETE
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.menuItemsService.remove(Number(id));
  }
}