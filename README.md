# 📂 Collaborative Project Management API

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)](https://www.prisma.io/)
[![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)](https://jwt.io/)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![API Documentation](https://img.shields.io/badge/API-Documented-green)](./docs/API.md)
[![Architecture](https://img.shields.io/badge/Architecture-Documented-blue)](./docs/ARCHITECTURE.md)

A robust, secure, and scalable REST API built with NestJS for managing collaborative projects with role-based access control, JWT authentication, and comprehensive authorization patterns.

## 🎯 **Project Overview**

This application implements a complete project management system where users can:
- **Create and manage projects** with full CRUD operations
- **Collaborate with team members** through role-based permissions
- **Manage tasks** within projects (database schema ready, API structure prepared)
- **Secure authentication** with JWT tokens and bcrypt password hashing
- **Fine-grained authorization** with Owner/Contributor/Viewer roles

## 🏗️ **System Architecture**

### **Design Patterns Implemented**
- **Repository Pattern** - Prisma ORM with clean data access layer
- **Module Pattern** - Clean separation of concerns with NestJS modules
- **DTO Pattern** - Request/response validation with class-validator
- **Service Layer Pattern** - Business logic separation from controllers

### **Key Features**
- 🔐 **JWT Authentication** with secure token management
- 🛡️ **Role-Based Authorization** (Owner, Contributor, Viewer)
- 📊 **Database Relations** with Prisma ORM
- 🔍 **Input Validation** with class-validator and DTOs
- 📋 **API Documentation** with Swagger/OpenAPI
- 🌱 **Database Seeding** with realistic test data

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

### **Installation & Setup**

```bash
# Clone the repository
git clone https://github.com/dahbimoad/test-technique.git
cd test-technique

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your database credentials

# Setup database
npx prisma generate
npx prisma migrate dev

# Seed database with test data
npm run db:seed

# Start development server
npm run start:dev
```

### **🔑 Test Credentials**
All users have password: `password123`

**Project Owners:**
- `alice@example.com` - E-commerce Platform
- `bob@example.com` - Mobile Banking App  
- `charlie@example.com` - Healthcare Management System
- `diana@example.com` - Social Media Analytics
- `ethan@example.com` - AI-Powered Chatbot

## 📋 **API Endpoints Overview**

### **Authentication Endpoints**
```http
POST /auth/signup     # Create new user account
POST /auth/login      # Authenticate and get JWT token
```

### **User Endpoints** 
```http
GET /users/me         # Get current user profile (requires JWT)
```

### **Project Endpoints**
```http
GET /projects                # List user's projects (requires JWT)
POST /projects               # Create new project (requires JWT)
POST /projects/:id/invite    # Invite user to project (Owner only)
DELETE /projects/:id         # Delete project (Owner only)
```

### **Task Endpoints**
```http
POST /projects/:projectId/tasks    # Create task (Contributors+) 
GET /projects/:projectId/tasks     # List project tasks (Members only) 
PATCH /tasks/:id                   # Update task (Contributors+) 
DELETE /tasks/:id                  # Delete task (Contributors+) 
```

## 🔐 **Authentication & Authorization**

### **JWT Authentication Flow**
1. **Registration/Login** → Receive JWT token
2. **Include token** in `Authorization: Bearer <token>` header
3. **Access protected endpoints** with valid token

### **🔑 Role-Based Permission Matrix**

| **Operation** | **Endpoint** | **👑 Owner** | **👨‍💻 Contributor** | **👁️ Viewer** | **🚫 Non-Member** |
|---------------|--------------|:------------:|:-------------------:|:-------------:|:----------------:|
| **🔓 Authentication** |
| Sign Up | `POST /auth/signup` | ✅ | ✅ | ✅ | ✅ |
| Login | `POST /auth/login` | ✅ | ✅ | ✅ | ✅ |
| Get Profile | `GET /users/me` | ✅ | ✅ | ✅ | ❌ |
| **📂 Project Management** |
| Create Project | `POST /projects` | ✅ | ✅ | ✅ | ❌ |
| List My Projects | `GET /projects` | ✅ | ✅ | ✅ | ❌ |
| View Project Details | `GET /projects/:id` | ✅ | ✅ | ✅ | ❌ |
| Update Project | `PATCH /projects/:id` | ✅ | ❌ | ❌ | ❌ |
| Delete Project | `DELETE /projects/:id` | ✅ | ❌ | ❌ | ❌ |
| **👥 Team Management** |
| Invite Users | `POST /projects/:id/invite` | ✅ | ✅ | ❌ | ❌ |
| View Members | `GET /projects/:id/members` | ✅ | ✅ | ✅ | ❌ |
| **📋 Task Management** **(Structure Ready)** |
| Create Task | `POST /projects/:id/tasks` | ✅ | ✅ | ❌ | ❌ |
| View Tasks | `GET /projects/:id/tasks` | ✅ | ✅ | ✅ | ❌ |
| Update Task | `PATCH /tasks/:id` | ✅ | ✅ | ❌ | ❌ |
| Delete Task | `DELETE /tasks/:id` | ✅ | ✅ | ❌ | ❌ |



### **🔒 Security Features**
- 🔒 **Password Hashing**: bcrypt with salt rounds (10)
- 🎟️ **JWT Tokens**: Secure authentication with 24h expiration
- 🛡️ **Authorization Guards**: Role-based access control 
- ✅ **Input Validation**: Comprehensive DTO validation with class-validator
- 🚫 **CORS Protection**: Configurable cross-origin policies
- 🔍 **Parameter Validation**: Project ownership and membership verification

## 📊 **Database Schema**

```prisma
model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  password  String   // bcrypt hashed
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  ownedProjects Project[]    @relation("ProjectOwner")
  memberships   Membership[]
  assignedTasks Task[]       @relation("TaskAssignee")
}

model Project {
  id          String   @id @default(cuid())
  name        String
  description String
  createdAt   DateTime @default(now())
  ownerId     String

  // Relations
  owner       User         @relation("ProjectOwner", fields: [ownerId], references: [id])
  memberships Membership[]
  tasks       Task[]
}

model Membership {
  id        String @id @default(cuid())
  userId    String
  projectId String
  role      Role   @default(VIEWER)

  // Relations
  user    User    @relation(fields: [userId], references: [id])
  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  @@unique([userId, projectId])
}

model Task {
  id           String     @id @default(cuid())
  title        String
  description  String
  status       TaskStatus @default(TODO)
  projectId    String
  assignedToId String?
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  // Relations
  project    Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  assignedTo User?   @relation("TaskAssignee", fields: [assignedToId], references: [id])
}

enum Role {
  OWNER
  CONTRIBUTOR
  VIEWER
}

enum TaskStatus {
  TODO
  DOING
  DONE
}
```

## 📖 **Documentation**

- **📚 [Complete API Documentation](./docs/API.md)** - Detailed endpoint examples
- **🏗️ [System Architecture](./docs/ARCHITECTURE.md)** - Design patterns and structure

### **Interactive API Documentation**
```bash
# Start server and visit
http://localhost:3000/api/docs
```

## 🛠️ **Development Commands**

```bash
# Development
npm run start:dev        # Start with hot reload
npm run start:debug      # Start with debug mode

# Database
npm run db:seed          # Seed database with test data  
npm run db:reset         # Reset and reseed database
npx prisma studio        # Database GUI

# Code Quality
npm run lint             # ESLint check
npm run format           # Prettier formatting
npm run test             # Unit tests
npm run test:e2e         # End-to-end tests
npm run test:cov         # Test coverage

# Production
npm run build            # Build for production
npm run start:prod       # Start production server
```

## 🎯 **Project Structure**

```
src/
├── app.module.ts            # Root application module
├── main.ts                  # Application entry point
├── auth/                    # Authentication module
│   ├── decorators/          # Custom decorators (@GetUser)
│   │   └── get-user.decorator.ts
│   ├── dto/                 # Request/response DTOs
│   │   ├── auth-response.dto.ts
│   │   ├── login.dto.ts
│   │   ├── signup.dto.ts
│   │   └── index.ts
│   ├── guards/              # JWT authentication guard
│   │   └── jwt-auth.guard.ts
│   ├── auth.controller.ts   # Auth HTTP endpoints
│   ├── auth.service.ts      # Auth business logic
│   ├── auth.module.ts       # Auth module configuration
│   └── auth.*.spec.ts       # Unit tests
├── projects/                # Project management module
│   ├── dto/                 # Project DTOs
│   │   ├── create-project.dto.ts
│   │   ├── invite-user.dto.ts
│   │   ├── project-response.dto.ts
│   │   ├── update-project.dto.ts
│   │   └── index.ts
│   ├── guards/              # Authorization guards
│   │   └── project-auth.guard.ts
│   ├── projects.controller.ts # Project HTTP endpoints
│   ├── projects.service.ts   # Project business logic
│   └── projects.module.ts    # Project module configuration
├── tasks/                   # Task module (structure ready)
│   ├── dto/                 # Task DTOs (defined but not implemented)
│   │   ├── create-task.dto.ts
│   │   ├── task-response.dto.ts
│   │   ├── update-task.dto.ts
│   │   └── index.ts
│   ├── tasks.service.ts     # Task service (empty file)
│   └── tasks.module.ts      # Task module (basic structure)
├── users/                   # User management module
│   ├── users.controller.ts  # User HTTP endpoints
│   └── users.module.ts      # User module configuration
└── prisma/                  # Database service
    ├── prisma.service.ts    # Prisma client wrapper
    └── prisma.module.ts     # Prisma module configuration

prisma/
├── schema.prisma            # Database schema definition
├── seed.ts                  # Database seeding script
└── migrations/              # Database migration files

docs/
├── API.md                   # Complete API documentation
└── ARCHITECTURE.md          # System architecture documentation
```


## 🚀 **Technology Stack**

- **Framework**: NestJS (Node.js)
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: JWT + bcrypt
- **Validation**: class-validator + class-transformer
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest + Supertest
