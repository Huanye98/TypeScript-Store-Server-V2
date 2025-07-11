export interface User {
  userId: number;
  role: "admin" | "user";
  cartId?: number;
}
