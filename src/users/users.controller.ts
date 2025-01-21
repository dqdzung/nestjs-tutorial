import {
  Controller,
  Get,
  // Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  Ip,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Prisma, UserRole } from '@prisma/client';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { MyLoggerService } from 'src/my-logger/my-logger.service';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@SkipThrottle()
@Controller('users')
export class UserController {
  constructor(private readonly usersService: UsersService) {}
  private readonly logger = new MyLoggerService(UserController.name);

  @SkipThrottle({ default: false })
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiQuery({ enum: UserRole, required: false, name: 'role' })
  findAll(@Ip() ip: string, @Query('role') role?: UserRole) {
    this.logger.log(`Request for ALL Users\t${ip}`, UserController.name);
    return this.usersService.findAll(role);
  }

  @Throttle({ short: { ttl: 1000, limit: 1 } })
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: Prisma.UserUpdateInput,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
