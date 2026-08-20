export class CreateMenuItemDto {
  name!: string;
  description?: string;
  price!: number;
  image?: string;
  foodType!: "INSTANT" | "COOKED";
  categoryId!: number;
  isAvailable?: boolean;
}