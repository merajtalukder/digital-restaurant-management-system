import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../database/prisma.service';

@Injectable()
export class KitchenService {
  constructor(
    private prisma: PrismaService,
  ) {}

  // =========================
  // GET KITCHEN ORDERS
  // =========================

  async findAll() {
    return this.prisma.order.findMany({
      where: {
        status: {
          in: [
            'PENDING',
            'PREPARING',
            'READY',
          ],
        },
      },

      include: {
        table: true,

        orderItems: {
          include: {
            menuItem: true,
          },
        },
      },

      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  // =========================
  // GET ONE KITCHEN ORDER
  // =========================

  async findOne(id: number) {
    const order =
      await this.prisma.order.findUnique({
        where: {
          id,
        },

        include: {
          table: true,

          orderItems: {
            include: {
              menuItem: true,
            },
          },
        },
      });

    if (!order) {
      throw new NotFoundException(
        'Order not found.',
      );
    }

    return order;
  }

  // =========================
  // UPDATE KITCHEN STATUS
  // =========================

  async updateStatus(
    id: number,
    status: any,
  ) {
    const order =
      await this.prisma.order.findUnique({
        where: {
          id,
        },
      });

    if (!order) {
      throw new NotFoundException(
        'Order not found.',
      );
    }

    return this.prisma.order.update({
      where: {
        id,
      },

      data: {
        status,
      },

      include: {
        table: true,

        orderItems: {
          include: {
            menuItem: true,
          },
        },
      },
    });
  }
}