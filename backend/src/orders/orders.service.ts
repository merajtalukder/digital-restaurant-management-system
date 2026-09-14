import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../database/prisma.service';
import { CreateOrderDto } from './create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
  ) {}

  // =========================
  // CREATE ORDER
  // =========================

  async create(data: CreateOrderDto) {
    // =========================
    // VALIDATE ORDER ITEMS
    // =========================

    if (!data.items || data.items.length === 0) {
      throw new BadRequestException(
        'Order must contain at least one item.',
      );
    }

    // =========================
    // CHECK TABLE
    // =========================

    const table =
      await this.prisma.restaurantTable.findUnique({
        where: {
          id: Number(data.tableId),
        },
      });

    if (!table) {
      throw new BadRequestException(
        'Restaurant table not found.',
      );
    }

    // =========================
    // CHECK WAITER
    // ONLY FOR WAITER ORDER
    // =========================

    let validWaiterId: number | undefined =
      undefined;

    if (data.orderType === 'WAITER') {
      if (
        data.waiterId === undefined ||
        data.waiterId === null
      ) {
        throw new BadRequestException(
          'Waiter ID is required for waiter orders.',
        );
      }

      const waiterId = Number(data.waiterId);

      if (isNaN(waiterId)) {
        throw new BadRequestException(
          'Invalid waiter ID.',
        );
      }

      const waiter =
        await this.prisma.user.findUnique({
          where: {
            id: waiterId,
          },
        });

      if (!waiter) {
        throw new BadRequestException(
          'Waiter not found.',
        );
      }

      if (waiter.role !== 'WAITER') {
        throw new BadRequestException(
          'Selected user is not a waiter.',
        );
      }

      validWaiterId = waiterId;
    }

    // =========================
    // GET MENU ITEMS
    // =========================

    const menuItemIds = data.items.map(
      (item) => Number(item.menuItemId),
    );

    const menuItems =
      await this.prisma.menuItem.findMany({
        where: {
          id: {
            in: menuItemIds,
          },
        },
      });

    if (
      menuItems.length !== menuItemIds.length
    ) {
      throw new BadRequestException(
        'One or more menu items not found.',
      );
    }

    // =========================
    // CALCULATE TOTAL
    // =========================

    let totalAmount = 0;

    const orderItems = data.items.map(
      (item) => {
        const menuItem =
          menuItems.find(
            (menu) =>
              menu.id === Number(
                item.menuItemId,
              ),
          );

        if (!menuItem) {
          throw new BadRequestException(
            'Menu item not found.',
          );
        }

        const quantity = Number(
          item.quantity,
        );

        if (
          isNaN(quantity) ||
          quantity <= 0
        ) {
          throw new BadRequestException(
            'Quantity must be greater than zero.',
          );
        }

        const unitPrice =
          Number(menuItem.price);

        const subtotal =
          unitPrice * quantity;

        totalAmount += subtotal;

        // =========================
        // SPECIAL INSTRUCTIONS
        // =========================

        const specialInstructions =
          typeof item.specialInstructions ===
          'string'
            ? item.specialInstructions.trim()
            : null;

        return {
          menuItemId: Number(
            item.menuItemId,
          ),
          quantity,
          unitPrice,
          subtotal,
          specialInstructions,
        };
      },
    );

    // =========================
    // GENERATE ORDER NUMBER
    // =========================

    const orderNumber =
      `ORD-${Date.now()}`;

    // =========================
    // CREATE ORDER
    // UPDATE TABLE
    // USING TRANSACTION
    //
    // IMPORTANT:
    // PAYMENT IS NOT CREATED HERE.
    // PAYMENT WILL BE CREATED ONLY
    // WHEN CUSTOMER / WAITER PAYS.
    // =========================

    return this.prisma.$transaction(
      async (tx) => {
        // =========================
        // UPDATE TABLE STATUS
        // =========================

        await tx.restaurantTable.update({
          where: {
            id: Number(data.tableId),
          },
          data: {
            status: 'OCCUPIED',
          },
        });

        // =========================
        // CREATE ORDER
        // =========================

        const order =
          await tx.order.create({
            data: {
              orderNumber,

              customerName:
                data.customerName,

              orderType:
                data.orderType,

              tableId:
                Number(data.tableId),

              totalAmount,

              ...(validWaiterId !== undefined
                ? {
                    waiterId:
                      validWaiterId,
                  }
                : {}),

              // =========================
              // ORDER ITEMS
              // =========================

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

              // Payment does NOT exist yet.
              payment: true,
            },
          });

        return order;
      },
    );
  }

  // =========================
  // GET ALL ORDERS
  // =========================

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

  // =========================
  // GET ONE ORDER
  // =========================

  async findOne(id: number) {
    const order =
      await this.prisma.order.findUnique({
        where: {
          id,
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

    if (!order) {
      throw new NotFoundException(
        'Order not found.',
      );
    }

    return order;
  }

  // =========================
  // UPDATE ORDER
  // ADD ITEM TO EXISTING ORDER
  // =========================

  async update(
    id: number,
    data: any,
  ) {
    const existingOrder =
      await this.prisma.order.findUnique({
        where: {
          id,
        },
      });

    if (!existingOrder) {
      throw new NotFoundException(
        'Order not found.',
      );
    }

    // =========================
    // ADD NEW ITEM TO SAME ORDER
    // =========================

    if (
      data.items &&
      data.items.length > 0
    ) {
      let additionalAmount = 0;

      const orderItems =
        await Promise.all(
          data.items.map(
            async (item: any) => {
              const menuItem =
                await this.prisma.menuItem.findUnique({
                  where: {
                    id: Number(
                      item.menuItemId,
                    ),
                  },
                });

              if (!menuItem) {
                throw new BadRequestException(
                  'Menu item not found.',
                );
              }

              const quantity =
                Number(item.quantity);

              if (
                isNaN(quantity) ||
                quantity <= 0
              ) {
                throw new BadRequestException(
                  'Quantity must be greater than zero.',
                );
              }

              const unitPrice =
                Number(menuItem.price);

              const subtotal =
                unitPrice * quantity;

              additionalAmount += subtotal;

              // =========================
              // SPECIAL INSTRUCTIONS
              // =========================

              const specialInstructions =
                typeof item.specialInstructions ===
                'string'
                  ? item.specialInstructions.trim()
                  : null;

              return {
                orderId: id,

                menuItemId:
                  Number(
                    item.menuItemId,
                  ),

                quantity,

                unitPrice,

                subtotal,

                specialInstructions,
              };
            },
          ),
        );

      // =========================
      // CREATE NEW ORDER ITEMS
      // =========================

      await this.prisma.orderItem.createMany({
        data: orderItems,
      });

      // =========================
      // UPDATE ORDER TOTAL
      // =========================

      const updatedOrder =
        await this.prisma.order.update({
          where: {
            id,
          },

          data: {
            totalAmount:
              Number(
                existingOrder.totalAmount,
              ) +
              additionalAmount,
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

      // =========================
      // IMPORTANT
      //
      // PAYMENT MAY NOT EXIST YET.
      //
      // If payment already exists,
      // update its amount.
      // Otherwise do nothing.
      // =========================

      if (updatedOrder.payment) {
        await this.prisma.payment.update({
          where: {
            id: updatedOrder.payment.id,
          },

          data: {
            amount:
              updatedOrder.totalAmount,
          },
        });
      }

      // =========================
      // RETURN UPDATED ORDER
      // =========================

      return this.prisma.order.findUnique({
        where: {
          id,
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

    // =========================
    // NORMAL UPDATE
    // =========================

    return this.prisma.order.update({
      where: {
        id,
      },

      data: {
        ...(data.customerName !==
          undefined && {
          customerName:
            data.customerName,
        }),

        ...(data.orderType !==
          undefined && {
          orderType:
            data.orderType,
        }),

        ...(data.status !==
          undefined && {
          status:
            data.status,
        }),

        ...(data.tableId !==
          undefined && {
          tableId:
            Number(data.tableId),
        }),

        ...(data.waiterId !==
          undefined && {
          waiterId:
            Number(data.waiterId),
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

  // =========================
  // DELETE ORDER
  // =========================

  async remove(id: number) {
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

    await this.prisma.$transaction(
      async (tx) => {
        // =========================
        // DELETE PAYMENT IF EXISTS
        // =========================

        await tx.payment.deleteMany({
          where: {
            orderId: id,
          },
        });

        // =========================
        // DELETE ORDER ITEMS
        // =========================

        await tx.orderItem.deleteMany({
          where: {
            orderId: id,
          },
        });

        // =========================
        // DELETE ORDER
        // =========================

        await tx.order.delete({
          where: {
            id,
          },
        });
      },
    );

    return {
      message:
        'Order deleted successfully.',

      orderId: id,
    };
  }
}