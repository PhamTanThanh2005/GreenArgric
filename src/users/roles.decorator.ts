// File: src/users/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

// Nhãn dán này có tên là 'roles', nó sẽ nhận vào một mảng các chuỗi (ví dụ: ['admin', 'chu_vuon'])
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);