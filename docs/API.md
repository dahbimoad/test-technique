# 📋 API Documentation

Project Management API for collaborative project management system.

## 🔐 Authentication

### **POST /auth/login**
Authenticate user with email and password to receive JWT access token.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123"
}
```

**Request Body Schema (LoginDto):**
- `email` (string, required): User email address (case insensitive)
- `password` (string, required): User password

**Responses:**
- `200`: Login successful - returns JWT token and user data
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "clx1y2z3a4b5c6d7e8f9g0h1",
      "name": "John Doe", 
      "email": "john.doe@example.com"
    }
  }
  ```
- `400`: Bad request - validation failed
  ```json
  {
    "statusCode": 400,
    "message": ["Please provide a valid email address", "Password is required"],
    "error": "Bad Request"
  }
  ```
- `401`: Invalid credentials - email or password incorrect
  ```json
  {
    "statusCode": 401,
    "message": "Invalid credentials",
    "error": "Unauthorized"
  }
  ```

### **POST /auth/signup**
Create a new user account with hashed password using bcrypt.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com", 
  "password": "SecurePass123"
}
```

**Request Body Schema (SignupDto):**
- `name` (string, required): User full name (2-50 characters)
- `email` (string, required): User email address (case insensitive) 
- `password` (string, required): User password (6-100 characters, must contain uppercase, lowercase, and number)

**Responses:**
- `201`: User successfully registered
  ```json
  {
    "message": "User registered successfully",
    "user": {
      "id": "clx1y2z3a4b5c6d7e8f9g0h1",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "createdAt": "2025-05-31T10:30:00.000Z"
    }
  }
  ```
- `400`: Bad request - validation failed
  ```json
  {
    "statusCode": 400,
    "message": [
      "Name must be at least 2 characters long",
      "Please provide a valid email address",
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ],
    "error": "Bad Request"
  }
  ```
- `409`: Email already registered - conflict error
  ```json
  {
    "statusCode": 409,
    "message": "Email already registered",
    "error": "Conflict"
  }
  ```

## 👤 Users

### **GET /users/me**
Retrieve authenticated user information.

**Headers:**
- `Authorization`: Bearer {jwt_token}

**Responses:**
- `200`: Current user profile retrieved successfully
  ```json
  {
    "id": "clx1y2z3a4b5c6d7e8f9g0h1",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "createdAt": "2025-05-31T10:30:00.000Z",
    "updatedAt": "2025-05-31T10:30:00.000Z"
  }
  ```
- `401`: Unauthorized - invalid or missing token
  ```json
  {
    "statusCode": 401,
    "message": "Invalid token",
    "error": "Unauthorized"
  }
  ```

## 📂 Projects

### **POST /projects**
Creates a new project with the authenticated user as the owner. The user automatically gets OWNER role with full permissions.

**Headers:**
- `Authorization`: Bearer {jwt_token}

**Request Body:**
```json
{
  "name": "E-commerce Platform",
  "description": "A modern e-commerce platform built with NestJS and React"
}
```

**Request Body Schema (CreateProjectDto):**
- `name` (string, required): Project name (3-100 characters)
- `description` (string, required): Project description (10-500 characters)

**Responses:**
- `201`: Project created successfully - returns project details with user role
  ```json
  {
    "id": "clx1y2z3a4b5c6d7e8f9g0h1",
    "name": "E-commerce Platform",
    "description": "Modern e-commerce solution with React and Node.js",
    "createdAt": "2025-05-31T10:30:00.000Z",
    "owner": {
      "id": "clx1y2z3a4b5c6d7e8f9g0h2",
      "name": "John Doe",
      "email": "john.doe@example.com"
    },
    "userRole": "OWNER",
    "memberCount": 1
  }
  ```
- `400`: Bad request - validation failed
  ```json
  {
    "statusCode": 400,
    "message": [
      "Name must be at least 3 characters long",
      "Description is required"
    ],
    "error": "Bad Request"
  }
  ```
- `401`: Unauthorized - Invalid or missing JWT token
  ```json
  {
    "statusCode": 401,
    "message": "Unauthorized",
    "error": "Unauthorized"
  }
  ```

### **GET /projects**
Retrieves all projects where the authenticated user is owner or member with their respective roles.

**Headers:**
- `Authorization`: Bearer {jwt_token}

**Responses:**
- `200`: Projects retrieved successfully - returns array of projects with user roles
  ```json
  [
    {
      "id": "clx1y2z3a4b5c6d7e8f9g0h1",
      "name": "E-commerce Platform",
      "description": "Modern e-commerce solution",
      "createdAt": "2025-05-31T10:30:00.000Z",
      "owner": {
        "id": "clx1y2z3a4b5c6d7e8f9g0h2",
        "name": "John Doe",
        "email": "john.doe@example.com"
      },
      "userRole": "OWNER",
      "memberCount": 3
    },
    {
      "id": "clx1y2z3a4b5c6d7e8f9g0h3",
      "name": "Mobile App",
      "description": "React Native mobile application",
      "createdAt": "2025-05-30T15:20:00.000Z",
      "owner": {
        "id": "clx1y2z3a4b5c6d7e8f9g0h4",
        "name": "Jane Smith",
        "email": "jane.smith@example.com"
      },
      "userRole": "CONTRIBUTOR",
      "memberCount": 2
    }
  ]
  ```
- `401`: Unauthorized - Invalid or missing JWT token
  ```json
  {
    "statusCode": 401,
    "message": "Unauthorized",
    "error": "Unauthorized"
  }
  ```

### **GET /projects/{id}**
Retrieves detailed information about a specific project. User must be owner or member to access.

**Headers:**
- `Authorization`: Bearer {jwt_token}

**Parameters:**
- `id` (path, required): Unique project identifier

**Responses:**
- `200`: Project retrieved successfully - returns project details with user role
  ```json
  {
    "id": "clx1y2z3a4b5c6d7e8f9g0h1",
    "name": "E-commerce Platform",
    "description": "Modern e-commerce solution with React and Node.js",
    "createdAt": "2025-05-31T10:30:00.000Z",
    "owner": {
      "id": "clx1y2z3a4b5c6d7e8f9g0h2",
      "name": "John Doe",
      "email": "john.doe@example.com"
    },
    "userRole": "CONTRIBUTOR",
    "memberCount": 5
  }
  ```
- `401`: Unauthorized - Invalid or missing JWT token
  ```json
  {
    "statusCode": 401,
    "message": "Unauthorized",
    "error": "Unauthorized"
  }
  ```
- `403`: Forbidden - User is not a member of this project
  ```json
  {
    "statusCode": 403,
    "message": "You are not a member of this project",
    "error": "Forbidden"
  }
  ```
- `404`: Project not found
  ```json
  {
    "statusCode": 404,
    "message": "Project not found",
    "error": "Not Found"
  }
  ```

### **PATCH /projects/{id}**
Updates project information (name and/or description). Only project owner has permission to update.

**Headers:**
- `Authorization`: Bearer {jwt_token}

**Parameters:**
- `id` (path, required): Unique project identifier

**Request Body:**
```json
{
  "name": "E-commerce Platform v2",
  "description": "Updated modern e-commerce solution with new features"
}
```

**Request Body Schema (UpdateProjectDto):**
- `name` (string, optional): Project name (3-100 characters)
- `description` (string, optional): Project description (10-500 characters)

**Responses:**
- `200`: Project updated successfully - returns updated project details
  ```json
  {
    "id": "clx1y2z3a4b5c6d7e8f9g0h1",
    "name": "E-commerce Platform v2",
    "description": "Updated modern e-commerce solution with new features",
    "createdAt": "2025-05-31T10:30:00.000Z",
    "owner": {
      "id": "clx1y2z3a4b5c6d7e8f9g0h2",
      "name": "John Doe",
      "email": "john.doe@example.com"
    },
    "userRole": "OWNER",
    "memberCount": 5
  }
  ```
- `400`: Bad request - validation failed
  ```json
  {
    "statusCode": 400,
    "message": [
      "Name must be at least 3 characters long"
    ],
    "error": "Bad Request"
  }
  ```
- `401`: Unauthorized - Invalid or missing JWT token
  ```json
  {
    "statusCode": 401,
    "message": "Unauthorized",
    "error": "Unauthorized"
  }
  ```
- `403`: Forbidden - Only project owner can update
  ```json
  {
    "statusCode": 403,
    "message": "Only project owner can update the project",
    "error": "Forbidden"
  }
  ```
- `404`: Project not found
  ```json
  {
    "statusCode": 404,
    "message": "Project not found",
    "error": "Not Found"
  }
  ```

### **DELETE /projects/{id}**
Deletes a project permanently. Only project owner can delete.

**Headers:**
- `Authorization`: Bearer {jwt_token}

**Parameters:**
- `id` (path, required): Project ID

**Responses:**
- `200`: Project deleted successfully
  ```json
  {
    "message": "Project \"E-commerce Platform\" deleted successfully"
  }
  ```
- `401`: Unauthorized - Invalid or missing token
- `403`: Forbidden - Only project owner can delete
- `404`: Project not found

### **POST /projects/{id}/invite**
Invites a user to join the project. Only owner and contributors can invite.

**Headers:**
- `Authorization`: Bearer {jwt_token}

**Parameters:**
- `id` (path, required): Project ID

**Request Body:**
```json
{
  "email": "jane.doe@example.com",
  "role": "CONTRIBUTOR"
}
```

**Request Body Schema (InviteUserDto):**
- `email` (string, required): Email of the user to invite
- `role` (string, required): Role to assign (OWNER, CONTRIBUTOR, VIEWER)

**Responses:**
- `201`: User invited successfully
  ```json
  {
    "message": "User invited successfully",
    "invitation": {
      "email": "jane.doe@example.com",
      "role": "CONTRIBUTOR"
    }
  }
  ```
- `400`: Invalid input data
- `401`: Unauthorized - Invalid or missing token
- `403`: Forbidden - Insufficient permissions to invite users
- `404`: Project or user not found
- `409`: Conflict - User is already a member

### **GET /projects/{id}/members**
Retrieves all members of the project with their roles.

**Headers:**
- `Authorization`: Bearer {jwt_token}

**Parameters:**
- `id` (path, required): Project ID

**Responses:**
- `200`: Project members retrieved successfully
  ```json
  {
    "members": [
      {
        "id": "clx1y2z3a4b5c6d7e8f9g0h2",
        "name": "John Doe",
        "email": "john.doe@example.com", 
        "role": "OWNER",
        "joinedAt": "2025-05-31T10:30:00.000Z"
      },
      {
        "id": "clx1y2z3a4b5c6d7e8f9g0h3",
        "name": "Jane Smith",
        "email": "jane.smith@example.com",
        "role": "CONTRIBUTOR", 
        "joinedAt": "2025-06-01T14:15:00.000Z"
      }
    ]
  }
  ```
- `401`: Unauthorized - Invalid or missing token
- `403`: Forbidden - User is not a member of this project
- `404`: Project not found

## 📋 Tasks

### **POST /projects/{id}/tasks**
Create task in project

### **GET /projects/{id}/tasks**
Get all tasks for project

### **PATCH /tasks/{id}**
Update task

### **DELETE /tasks/{id}**
Delete task

## 📋 Schemas

### **Authentication DTOs**

**LoginDto**
```typescript
{
  email: string;    // User email address (case insensitive)
  password: string; // User password
}
```

**SignupDto**
```typescript
{
  name: string;     // User full name (2-50 chars)
  email: string;    // User email address (case insensitive)
  password: string; // Password (6-100 chars, must contain uppercase, lowercase, number)
}
```

**AuthResponseDto**
```typescript
{
  access_token: string; // JWT access token
  user: {
    id: string;
    name: string;
    email: string;
  };
}
```

**SignupResponseDto**
```typescript
{
  message: string; // Success message
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
  };
}
```

### **Project DTOs**

**CreateProjectDto**
```typescript
{
  name: string;        // Project name (3-100 chars)
  description: string; // Project description (10-500 chars)
}
```

**UpdateProjectDto**
```typescript
{
  name?: string;        // Project name (3-100 chars, optional)
  description?: string; // Project description (10-500 chars, optional)
}
```

**ProjectResponseDto**
```typescript
{
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  userRole: Role;       // OWNER | CONTRIBUTOR | VIEWER
  memberCount: number;
}
```

**InviteUserDto**
```typescript
{
  email: string; // Email of user to invite
  role: Role;    // OWNER | CONTRIBUTOR | VIEWER
}
```

**InviteResponseDto**
```typescript
{
  message: string;
  invitation: {
    email: string;
    role: Role;
  };
}
```

### **Role Enum**
```typescript
enum Role {
  OWNER = "OWNER",
  CONTRIBUTOR = "CONTRIBUTOR", 
  VIEWER = "VIEWER"
}
```

### **Task DTOs**
- CreateTaskDto
- TaskResponseDto 
- UpdateTaskDto
- TaskStatus (TODO | DOING | DONE)
