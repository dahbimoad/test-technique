import { Controller, Get } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  @Get('me')
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Retrieve authenticated user information',
  })
  @ApiResponse({
    status: 200,
    description: 'Current user profile retrieved successfully',
    example: {
      id: 'clx1y2z3a4b5c6d7e8f9g0h1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      createdAt: '2025-05-31T10:30:00.000Z',
      updatedAt: '2025-05-31T10:30:00.000Z',
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
    example: {
      statusCode: 401,
      message: 'Invalid token',
      error: 'Unauthorized',
    },
  })
  getMe(@GetUser() user: User) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
