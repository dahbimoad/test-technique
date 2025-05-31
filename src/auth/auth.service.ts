import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto, SignupDto } from './dto';

@Injectable()
export class AuthService {
    constructor(private readonly prisma: PrismaService) {}
    login(loginDto: LoginDto) {
        return {
            data : loginDto,
            message : 'Login successful',
        };
    }
    signup(signupDto: SignupDto) {
        return {
            data : signupDto,
            message : 'Signup successful',
        };
    }
}
