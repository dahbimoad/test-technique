import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto, SignupDto } from './dto';
import * as bcrypt from 'bcrypt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthResponseDto, SignupResponseDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(signupDto: SignupDto): Promise<SignupResponseDto> {
    const { name, email, password } = signupDto;

    // Normalize email to lowercase for consistent storage
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists with normalized email
    const existingUser = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash password with bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user with normalized email and trimmed name
    const user = await this.prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
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

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Convert email to lowercase for case-insensitive lookup
    const normalizedEmail = email.toLowerCase().trim();

    // Find user by normalized email
    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
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

  private async generateAccessToken(
    userId: string,
    email: string,
  ): Promise<string> {
    const payload = {
      sub: userId,
      email: email,
    };

    return await this.jwtService.signAsync(payload);
  }
}
