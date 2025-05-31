import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResponseDto, LoginDto,SignupDto } from './dto';
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
        description: 'Authenticate user with email and password to receive JWT access token'
    })
    @ApiBody({ 
        type: LoginDto,
        description: 'User login credentials'
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
                email: 'john.doe@example.com'
            }
        }
    })
     @ApiResponse({ 
        status: 401, 
        description: 'Invalid credentials - email or password incorrect',
        example: {
            statusCode: 401,
            message: 'Invalid credentials',
            error: 'Unauthorized'
        }
    })
    @ApiResponse({ 
        status: 400, 
        description: 'Bad request - validation failed',
        example: {
            statusCode: 400,
            message: ['Please provide a valid email address', 'Password is required'],
            error: 'Bad Request'
        }
    })
    login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }
    @Post('signup')
    signup(@Body() signupDto: SignupDto) {
        return this.authService.signup(signupDto);
    }
}
