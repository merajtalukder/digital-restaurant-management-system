import { Module } from '@nestjs/common';

import { AppController } from './app.controller';

import { AppService } from './app.service';

import { PrismaModule } from './database/prisma.module';

import { UsersModule } from './users/users.module';

import { CategoriesModule } from './categories/categories.module';

import { MenuItemsModule } from './menu-items/menu-items.module';

import { TablesModule } from './tables/tables.module';

import { OrdersModule } from './orders/orders.module';

import { KitchenModule } from './kitchen/kitchen.module';

import { AuthModule } from './auth/auth.module';

import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [
    PrismaModule,

    UsersModule,

    CategoriesModule,

    MenuItemsModule,

    TablesModule,

    OrdersModule,

    KitchenModule,

    AuthModule,

    PaymentsModule,
  ],

  controllers: [
    AppController,
  ],

  providers: [
    AppService,
  ],
})
export class AppModule {}