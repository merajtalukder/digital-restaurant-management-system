import { TableStatus } from '@prisma/client';

export class UpdateTableDto {
  tableNumber?: number;
  capacity?: number;
  status?: TableStatus;
}