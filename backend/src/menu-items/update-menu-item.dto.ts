export class UpdateMenuItemDto {
  name?: string;
  description?: string;
  price?: number;
  image?: string;
  foodType?: "INSTANT" | "COOKED";
  categoryId?: number;
  isAvailable?: boolean;
}