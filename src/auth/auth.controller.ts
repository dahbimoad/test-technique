import { Controller, Post } from '@nestjs/common';

@Controller('auth')
export class AuthController {
    @Post('login')
    login() {
        return {
            message: 'Login successful',
        };
    }
    @Post('signup')
    signup() {
        return {
            message: 'Signup successful',
        };
    }
}
