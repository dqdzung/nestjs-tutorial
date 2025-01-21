import { Injectable } from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class UsersService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll(role?: UserRole) {
    if (role) return this.databaseService.user.findMany({ where: { role } });
    return this.databaseService.user.findMany({
      omit: { password: true },
    });
  }

  async findOne(id: number) {
    return this.databaseService.user.findUnique({
      where: { id },
      omit: { password: true },
    });
  }

  async update(id: number, updateUserDto: Prisma.UserUpdateInput) {
    const data = { ...updateUserDto };
    if (data?.password) delete data.password;
    return this.databaseService.user.update({
      where: { id },
      data,
      omit: { password: true },
    });
  }

  async remove(id: number) {
    return this.databaseService.user.delete({
      where: { id },
      omit: { password: true },
    });
  }
}
