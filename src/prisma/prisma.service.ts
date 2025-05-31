import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  
   constructor(private readonly configService: ConfigService) {
    super({
      // Use ConfigService for database configuration
      datasources: {
        db: {
          url: configService.get<string>('DATABASE_URL'),
        },
      },
      // Conditional logging based on environment
      log: configService.get<string>('NODE_ENV') === 'development' 
        ? ['query', 'info', 'warn', 'error'] 
        : ['warn', 'error'],
    });
  }

  async onModuleInit() {
    // Connect to database when module starts
    await this.$connect();
    const env = this.configService.get<string>('NODE_ENV') || 'development';
    console.log(`✅ Connected to database (${env})`);
  }

  async onModuleDestroy() {
    // Disconnect from database when module is destroyed
    await this.$disconnect();
    console.log('❌ Disconnected from database');
  }

  // Method to clean the database in development/test
  async cleanDatabase() {
    const env = this.configService.get<string>('NODE_ENV');
    
    if (env === 'production') {
      throw new Error('Cannot clean database in production environment');
    }
    
    // Get all model names dynamically
    const models = Reflect.ownKeys(this).filter(key => key[0] !== '_') as string[];
    
    // Delete all records from all tables
    return Promise.all(models.map((modelKey) => this[modelKey].deleteMany()));
  }
  async isHealthy(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}