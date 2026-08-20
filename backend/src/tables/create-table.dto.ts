import { TableStatus } from '@prisma/client';

export class CreateTableDto {
  tableNumber!: number;
  capacity!: number;
  status?: TableStatus;
}