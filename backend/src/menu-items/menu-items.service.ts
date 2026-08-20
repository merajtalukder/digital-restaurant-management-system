import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateMenuItemDto } from './create-menu-item.dto';
import { UpdateMenuItemDto } from './update-menu-item.dto';

@Injectable()
export class MenuItemsService {
  constructor(
    private prisma: PrismaService,
  ) {}

  // CREATE
  async create(data: CreateMenuItemDto) {
    return this.prisma.menuItem.create({
      data,
    });
  }

  // GET ALL
  async findAll() {
    return this.prisma.menuItem.findMany();
  }

  // GET ONE
  async findOne(id: number) {
    return this.prisma.menuItem.findUnique({
      where: { id },
    });
  }

  // UPDATE
  async update(id: number, data: UpdateMenuItemDto) {
    return this.prisma.menuItem.update({
      where: { id },
      data,
    });
  }

  // DELETE
  async remove(id: number) {
    return this.prisma.menuItem.delete({
      where: { id },
    });
  }
}