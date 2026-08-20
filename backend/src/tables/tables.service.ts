import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateTableDto } from './create-table.dto';
import { UpdateTableDto } from './update-table.dto';

@Injectable()
export class TablesService {
  constructor(
    private prisma: PrismaService,
  ) {}

  // CREATE
  async create(data: CreateTableDto) {
    return this.prisma.restaurantTable.create({
      data: {
        tableNumber: Number(data.tableNumber),
        capacity: Number(data.capacity),
        status: data.status ?? 'AVAILABLE',
      },
    });
  }

  // GET ALL
  async findAll() {
    return this.prisma.restaurantTable.findMany({
      orderBy: {
        tableNumber: 'asc',
      },
    });
  }

  // GET ONE
  async findOne(id: number) {
    return this.prisma.restaurantTable.findUnique({
      where: {
        id,
      },
    });
  }

  // UPDATE
  async update(id: number, data: UpdateTableDto) {
    return this.prisma.restaurantTable.update({
      where: {
        id,
      },
      data: {
        ...(data.tableNumber !== undefined && {
          tableNumber: Number(data.tableNumber),
        }),

        ...(data.capacity !== undefined && {
          capacity: Number(data.capacity),
        }),

        ...(data.status !== undefined && {
          status: data.status,
        }),
      },
    });
  }

  // DELETE
  async remove(id: number) {
    return this.prisma.restaurantTable.delete({
      where: {
        id,
      },
    });
  }
}