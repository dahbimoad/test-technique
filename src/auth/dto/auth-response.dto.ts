export class AuthResponseDto {
    access_token: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  }
  
  export class SignupResponseDto {
    message: string;
    user: {
      id: string;
      name: string;
      email: string;
      createdAt: Date;
    };
  }