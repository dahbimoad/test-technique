import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResponseDto, LoginDto, SignupDto, SignupResponseDto } from './dto';
import { HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User login',
    description:
      'Authenticate user with email and password to receive JWT access token',
  })
  @ApiBody({
    type: LoginDto,
    description: 'User login credentials',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful - returns JWT token and user data',
    type: AuthResponseDto,
    example: {
      access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      user: {
        id: 'clx1y2z3a4b5c6d7e8f9g0h1',
        name: 'John Doe',
        email: 'john.doe@example.com',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials - email or password incorrect',
    example: {
      statusCode: 401,
      message: 'Invalid credentials',
      error: 'Unauthorized',
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
    example: {
      statusCode: 400,
      message: ['Please provide a valid email address', 'Password is required'],
      error: 'Bad Request',
    },
  })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
  @Post('signup')
  @ApiOperation({
    summary: 'User registration',
    description: 'Create a new user account with hashed password using bcrypt',
  })
  @ApiBody({
    type: SignupDto,
    description: 'User registration data',
  })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    type: SignupResponseDto,
    example: {
      message: 'User registered successfully',
      user: {
        id: 'clx1y2z3a4b5c6d7e8f9g0h1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        createdAt: '2025-05-31T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Email already registered - conflict error',
    example: {
      statusCode: 409,
      message: 'Email already registered',
      error: 'Conflict',
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
    example: {
      statusCode: 400,
      message: [
        'Name must be at least 2 characters long',
        'Please provide a valid email address',
        'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      ],
      error: 'Bad Request',
    },
  })
  signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }
}
