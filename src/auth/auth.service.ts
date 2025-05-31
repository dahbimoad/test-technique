import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto, SignupDto } from './dto';
import * as bcrypt from 'bcrypt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {
    
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) {}


    async signup(signupDto: SignupDto) {
        // Check if user already exists
        const existingUser = await this.prisma.user.findUnique({
            where: { email: signupDto.email },
        });

        if (existingUser) {
            throw new ConflictException('Email already registered');
        }

        // Hash password with bcrypt
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(signupDto.password, saltRounds);

        // Create user in database
        const user = await this.prisma.user.create({
            data: {
                name: signupDto.name,
                email: signupDto.email,
                password: hashedPassword,
            },
        });

        // Return user data without password
        return {
            message: 'User registered successfully',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
            },
        };
    }
    
    
    




    
    async login(loginDto: LoginDto) {
        // Find user by email
        const user = await this.prisma.user.findUnique({
            where: { email: loginDto.email },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Verify password with bcrypt
        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Generate JWT token
        const access_token = await this.generateAccessToken(user.id, user.email);


        return {
            access_token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        };
    }



    private async generateAccessToken(userId: string, email: string): Promise<string> {
        const payload = { 
            sub: userId, 
            email: email,
        };
        
        return await this.jwtService.signAsync(payload);
    }
    p

}
