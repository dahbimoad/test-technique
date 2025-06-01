# 🏛️ System Architecture & Design

## 📋 Table of Contents
- [Overview](#overview)
- [Architecture Patterns](#architecture-patterns)
- [Database Design](#database-design)
- [Module Structure](#module-structure)


## 🎯 Overview

This collaborative project management API implements a **layered architecture** using **NestJS framework** with custom authentication and authorization patterns. The system emphasizes role-based access control, comprehensive validation, and clean separation of concerns.

### **Architecture Stack**
```
┌─────────────────────────────────────┐
│           Presentation Layer        │  ← Controllers, DTOs, Custom Guards
├─────────────────────────────────────┤
│            Business Layer           │  ← Services, Business Logic, Validation
├─────────────────────────────────────┤
│           Persistence Layer         │  ← Prisma ORM (Direct Access)
├─────────────────────────────────────┤
│             Database Layer          │  ← PostgreSQL with Relations
└─────────────────────────────────────┘
```

## 🔧 Architecture Patterns

### **1. Module Pattern**
```typescript
// Feature-based module organization with AuthModule integration
@Module({
  imports: [AuthModule], // Import for JwtAuthGuard access
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService]
})
export class ProjectsModule {}
```

**Benefits:**
- ✅ Clear feature boundaries with shared authentication
- ✅ Reusable guard components across modules
- ✅ Easy testing with dependency injection
- ✅ Scalable team development

### **2. Service Layer Pattern** (Direct Prisma Access)
```typescript
// Direct Prisma integration with comprehensive includes
@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProjectDto, userId: string) {
    return this.prisma.project.create({
      data: { ...dto, ownerId: userId },
      include: { 
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { memberships: true } }
      }
    });
  }
}
```

**Benefits:**
- ✅ Direct ORM access for optimal performance
- ✅ Type-safe database operations with Prisma
- ✅ Consistent query patterns with includes
- ✅ Simplified architecture without repository layer


### **3. DTO Pattern with Comprehensive Validation**
```typescript
// Input validation with transformation
export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(500)
  @Transform(({ value }) => value?.trim())
  description: string;
}

// Role-based invitation DTO
export class InviteUserDto {
  @IsEmail()
  @Transform(({ value }) => value?.toLowerCase()?.trim())
  email: string;

  @IsEnum(Role)
  role: Role;
}

// Response structure with Swagger docs
export class ProjectResponseDto {
  @ApiProperty()
  id: string;
  
  @ApiProperty()
  name: string;
  
  @ApiProperty()
  description: string;
  
  @ApiProperty()
  owner: { id: string; name: string; email: string; };
  
  @ApiProperty({ enum: Role })
  userRole: Role;
  
  @ApiProperty()
  memberCount: number;
}
```

**Benefits:**
- ✅ Strong input validation with detailed error messages
- ✅ Automatic data transformation (trim, lowercase)
- ✅ Type safety with TypeScript integration
- ✅ Comprehensive API documentation generation

## 🗄️ Database Design

### **Prisma Schema Implementation**
```prisma
// Core entities with relations and constraints
model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  password  String   // bcrypt with 10 salt rounds
  
  ownedProjects Project[]    @relation("ProjectOwner")
  memberships   Membership[]
  assignedTasks Task[]       @relation("TaskAssignee")
}

model Project {
  id          String   @id @default(cuid())
  name        String
  description String
  ownerId     String

  owner       User         @relation("ProjectOwner", fields: [ownerId], references: [id])
  memberships Membership[]
  tasks       Task[]
}

model Membership {
  userId    String
  projectId String
  role      Role   @default(VIEWER)

  user    User    @relation(fields: [userId], references: [id])
  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  @@unique([userId, projectId])
}

enum Role {
  OWNER       // Full permissions
  CONTRIBUTOR // Can create/edit tasks, invite users
  VIEWER      // Read-only access
}
```

### **PrismaService Implementation**
```typescript
// Environment-aware Prisma configuration
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(private readonly configService: ConfigService) {
    super({
      datasources: { db: { url: configService.get('DATABASE_URL') } },
      log: configService.get('NODE_ENV') === 'development' 
        ? ['query', 'info', 'warn', 'error'] 
        : ['warn', 'error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  // Development utilities
  async cleanDatabase() {
    if (this.configService.get('NODE_ENV') === 'production') {
      throw new Error('Cannot clean database in production');
    }
    // Clean all tables for testing
  }
}
```

### **Database Seeding Strategy**
```typescript
// Realistic test data with proper role distribution
async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  // 8 users, 5 projects, distributed memberships
  // Test credentials: alice@example.com, bob@example.com, etc.
}
```

## 🏗️ Module Structure

### **Core Modules**

#### **AuthModule**
```
src/auth/
├── auth.controller.ts     # Login/signup endpoints
├── auth.service.ts        # Authentication logic
├── auth.module.ts         # Module configuration
├── dto/
│   ├── login.dto.ts       # Login request validation
│   └── signup.dto.ts      # Signup request validation
├── guards/
│   ├── jwt-auth.guard.ts  # JWT protection
│   └── roles.guard.ts     # Role-based access
├── strategies/
│   └── jwt.strategy.ts    # JWT validation strategy
└── decorators/
    ├── current-user.decorator.ts
    └── roles.decorator.ts
```

#### **UsersModule**
```
src/users/
├── users.controller.ts    # User profile endpoints
├── users.service.ts       # User business logic
├── users.module.ts        # Module configuration
└── dto/
    └── user-response.dto.ts
```

#### **ProjectsModule**
```
src/projects/
├── projects.controller.ts # Project CRUD endpoints
├── projects.service.ts    # Project business logic
├── projects.module.ts     # Module configuration
└── dto/
    ├── create-project.dto.ts
    ├── invite-user.dto.ts
    └── project-response.dto.ts
```

#### **TasksModule** 
```
src/tasks/
├── tasks.controller.ts    # Task CRUD endpoints (empty)
├── tasks.service.ts       # Task business logic (empty)
├── tasks.module.ts        # Module configuration
└── dto/
    ├── create-task.dto.ts
    ├── update-task.dto.ts
    └── task-response.dto.ts
```