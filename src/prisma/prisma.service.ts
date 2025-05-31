import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  
  constructor() {
    super({
      // Configuration optionnelle
      log: ['query', 'info', 'warn', 'error'], // Logs des requêtes (utile en dev)
    });
  }

  async onModuleInit() {
    // Se connecter à la base de données quand le module démarre
    await this.$connect();
    console.log('✅ Connected to database');
  }

  async onModuleDestroy() {
    // Se déconnecter quand l'application s'arrête
    await this.$disconnect();
    console.log('❌ Disconnected from database');
  }

  // Méthode utile pour nettoyer la DB en développement/test
  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') return;
    
    const models = Reflect.ownKeys(this).filter(key => key[0] !== '_') as string[];
    
    return Promise.all(models.map((modelKey) => this[modelKey].deleteMany()));
  }
}