
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../database/prisma.service';
import { CreateOrderDto } from './create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  // CREATE ORDER
  async create(data: CreateOrderDto) {
    if (!data.items || data.items.length === 0) {
      throw new BadRequestException(
        'Order must contain at least one item.',
      );
    }

    const tableId = Number(data.tableId);

    if (!Number.isInteger(tableId) || tableId <= 0) {
      throw new BadRequestException('Invalid table ID.');
    }

    const table = await this.prisma.restaurantTable.findUnique({
      where: { id: tableId },
    });

    if (!table) {
      throw new BadRequestException('Restaurant table not found.');
    }

    let validWaiterId: number | undefined;

    if (data.orderType === 'WAITER') {
      if (data.waiterId === undefined || data.waiterId === null) {
        throw new BadRequestException(
          'Waiter ID is required for waiter orders.',
        );
      }

      const waiterId = Number(data.waiterId);

      if (!Number.isInteger(waiterId) || waiterId <= 0) {
        throw new BadRequestException('Invalid waiter ID.');
      }

      const waiter = await this.prisma.user.findUnique({
        where: { id: waiterId },
      });

      if (!waiter) {
        throw new BadRequestException('Waiter not found.');
      }

      if (waiter.role !== 'WAITER') {
        throw new BadRequestException(
          'Selected user is not a waiter.',
        );
      }

      validWaiterId = waiterId;
    }

    const menuItemIds = data.items.map((item) =>
      Number(item.menuItemId),
    );

    if (
      menuItemIds.some(
        (id) => !Number.isInteger(id) || id <= 0,
      )
    ) {
      throw new BadRequestException('Invalid menu item ID.');
    }

    const menuItems = await this.prisma.menuItem.findMany({
      where: {
        id: { in: [...new Set(menuItemIds)] },
      },
    });

    if (menuItems.length !== new Set(menuItemIds).size) {
      throw new BadRequestException(
        'One or more menu items not found.',
      );
    }

    let totalAmount = 0;

    const orderItems = data.items.map((item) => {
      const menuItem = menuItems.find(
        (menu) => menu.id === Number(item.menuItemId),
      );

      if (!menuItem) {
        throw new BadRequestException('Menu item not found.');
      }

      const quantity = Number(item.quantity);

      if (!Number.isInteger(quantity) || quantity <= 0) {
        throw new BadRequestException(
          'Quantity must be a positive whole number.',
        );
      }

      const unitPrice = Number(menuItem.price);
      const subtotal = unitPrice * quantity;

      totalAmount += subtotal;

      const specialInstructions =
        typeof item.specialInstructions === 'string'
          ? item.specialInstructions.trim() || null
          : null;

      return {
        menuItemId: Number(item.menuItemId),
        quantity,
        unitPrice,
        subtotal,
        specialInstructions,
      };
    });

    const orderNumber = `ORD-${Date.now()}`;

    /*
     * Use a batch transaction instead of an interactive
     * transaction callback. Both operations are committed
     * together, or neither operation is committed.
     *
     * Payment creation is intentionally not performed here.
     */
    const [order] = await this.prisma.$transaction([
      this.prisma.order.create({
        data: {
          orderNumber,
          ...(data.customerName !== undefined
            ? { customerName: data.customerName }
            : {}),
          orderType: data.orderType,
          tableId,
          totalAmount,
          ...(validWaiterId !== undefined
            ? { waiterId: validWaiterId }
            : {}),
          orderItems: {
            create: orderItems,
          },
        },
        include: {
          table: true,
          waiter: true,
          orderItems: {
            include: {
              menuItem: true,
            },
          },
          payment: true,
        },
      }),

      this.prisma.restaurantTable.update({
        where: { id: tableId },
        data: { status: 'OCCUPIED' },
      }),
    ]);

    return order;
  }

  // GET ALL ORDERS
  async findAll() {
    return this.prisma.order.findMany({
      include: {
        table: true,
        waiter: true,
        orderItems: {
          include: {
            menuItem: true,
          },
        },
        payment: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // GET ONE ORDER
  async findOne(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        table: true,
        waiter: true,
        orderItems: {
          include: {
            menuItem: true,
          },
        },
        payment: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found.');
    }

    return order;
  }

  // UPDATE ORDER / ADD ITEMS
  async update(id: number, data: any) {
    const existingOrder = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      throw new NotFoundException('Order not found.');
    }

    if (data.items && data.items.length > 0) {
      let additionalAmount = 0;

      const orderItems = await Promise.all(
        data.items.map(async (item: any) => {
          const menuItem = await this.prisma.menuItem.findUnique({
            where: {
              id: Number(item.menuItemId),
            },
          });

          if (!menuItem) {
            throw new BadRequestException('Menu item not found.');
          }

          const quantity = Number(item.quantity);

          if (!Number.isInteger(quantity) || quantity <= 0) {
            throw new BadRequestException(
              'Quantity must be a positive whole number.',
            );
          }

          const unitPrice = Number(menuItem.price);
          const subtotal = unitPrice * quantity;

          additionalAmount += subtotal;

          const specialInstructions =
            typeof item.specialInstructions === 'string'
              ? item.specialInstructions.trim() || null
              : null;

          return {
            orderId: id,
            menuItemId: Number(item.menuItemId),
            quantity,
            unitPrice,
            subtotal,
            specialInstructions,
          };
        }),
      );

      const newTotal =
        Number(existingOrder.totalAmount) + additionalAmount;

      /*
       * Keep item insertion and total update in one transaction.
       * Payment amount is updated separately if a payment exists.
       */
      await this.prisma.$transaction([
        this.prisma.orderItem.createMany({
          data: orderItems,
        }),

        this.prisma.order.update({
          where: { id },
          data: {
            totalAmount: newTotal,
          },
        }),
      ]);

      const updatedOrder = await this.prisma.order.findUnique({
        where: { id },
        include: {
          table: true,
          waiter: true,
          orderItems: {
            include: {
              menuItem: true,
            },
          },
          payment: true,
        },
      });

      if (!updatedOrder) {
        throw new NotFoundException('Order not found.');
      }

      if (updatedOrder.payment) {
        await this.prisma.payment.update({
          where: {
            id: updatedOrder.payment.id,
          },
          data: {
            amount: updatedOrder.totalAmount,
          },
        });
      }

      return this.findOne(id);
    }

    return this.prisma.order.update({
      where: { id },
      data: {
        ...(data.customerName !== undefined && {
          customerName: data.customerName,
        }),
        ...(data.orderType !== undefined && {
          orderType: data.orderType,
        }),
        ...(data.status !== undefined && {
          status: data.status,
        }),
        ...(data.tableId !== undefined && {
          tableId: Number(data.tableId),
        }),
        ...(data.waiterId !== undefined && {
          waiterId:
            data.waiterId === null
              ? null
              : Number(data.waiterId),
        }),
      },
      include: {
        table: true,
        waiter: true,
        orderItems: {
          include: {
            menuItem: true,
          },
        },
        payment: true,
      },
    });
  }

  // DELETE ORDER
  async remove(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException('Order not found.');
    }

    // Delete dependent records and the order atomically.
    await this.prisma.$transaction([
      this.prisma.payment.deleteMany({
        where: { orderId: id },
      }),

      this.prisma.orderItem.deleteMany({
        where: { orderId: id },
      }),

      this.prisma.order.delete({
        where: { id },
      }),
    ]);

    return {
      message: 'Order deleted successfully.',
      orderId: id,
    };
  }
}
