export class LoginDto {
  email!: string;

  password!: string;

  role!: 'ADMIN' | 'WAITER';
}