import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { AuthModule } from '../auth/auth.module'; // Import AuthModule to use JwtAuthGuard

@Module({
  imports: [AuthModule], // Import AuthModule which provides JwtAuthGuard
  controllers: [UsersController]
})
export class UsersModule {}
