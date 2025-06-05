import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TagsService } from './tags.service';
import { TagsController } from './tags.controller';
import { PrismaModule } from '../prisma/prisma.module';

/**
 * Tags module
 * Handles all tag-related functionality including CRUD operations
 * and project-tag associations
 */
@Module({
  imports: [
    PrismaModule,
    // Import JwtModule for JWT authentication
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [TagsController],
  providers: [TagsService],
  exports: [TagsService], // Export service so other modules can use it
})
export class TagsModule {}
