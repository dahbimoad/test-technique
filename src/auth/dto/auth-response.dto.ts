import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT access token for authentication',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  access_token: string;

  @ApiProperty({
    description: 'User information',
    example: {
      id: 'clx1y2z3a4b5c6d7e8f9g0h1',
      name: 'John Doe',
      email: 'john.doe@example.com'
    }
  })
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export class SignupResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'User registered successfully'
  })
  message: string;

  @ApiProperty({
    description: 'Created user information',
    example: {
      id: 'clx1y2z3a4b5c6d7e8f9g0h1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      createdAt: '2025-05-31T10:30:00.000Z'
    }
  })
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
  };
}