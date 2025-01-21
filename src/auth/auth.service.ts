import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from 'src/database/database.service';
import { AuthEntity } from './entity/auth.entity';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export const roundsOfHashing = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly databaseService: DatabaseService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string): Promise<AuthEntity> {
    const user = await this.databaseService.user.findUnique({
      where: { email },
    });

    if (!user) throw new NotFoundException('User or password invalid');

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid)
      throw new UnauthorizedException('User or password invalid');

    return {
      accessToken: this.jwtService.sign({ id: user.id, email: user.email }),
      // refreshToken: this.jwtService.sign({ id: user.id }),
    };
  }

  async register(email: string, password: string) {
    const user = await this.databaseService.user.findUnique({
      where: { email },
    });

    if (user) throw new ConflictException('Email has already been registered');

    const hashedPassword = await bcrypt.hash(password, roundsOfHashing);

    return this.databaseService.user.create({
      data: { email, password: hashedPassword } as Prisma.UserCreateInput,
      omit: { password: true },
    });
  }
}
