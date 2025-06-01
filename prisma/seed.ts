import { PrismaClient, Role, TaskStatus, User, Project, Membership, Task } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  await prisma.task.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // Hash password for all users
  const hashedPassword = await bcrypt.hash('password123', 10);
  // Create Users
  console.log('👥 Creating users...');
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        password: hashedPassword,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Bob Smith',
        email: 'bob@example.com',
        password: hashedPassword,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Charlie Brown',
        email: 'charlie@example.com',
        password: hashedPassword,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Diana Prince',
        email: 'diana@example.com',
        password: hashedPassword,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Ethan Hunt',
        email: 'ethan@example.com',
        password: hashedPassword,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Fiona Gallagher',
        email: 'fiona@example.com',
        password: hashedPassword,
      },
    }),
    prisma.user.create({
      data: {
        name: 'George Miller',
        email: 'george@example.com',
        password: hashedPassword,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Hannah Davis',
        email: 'hannah@example.com',
        password: hashedPassword,
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);
  // Create Projects
  console.log('📂 Creating projects...');
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        name: 'E-commerce Platform',
        description: 'Building a modern e-commerce platform with React and Node.js',
        ownerId: users[0].id, // Alice
      },
    }),
    prisma.project.create({
      data: {
        name: 'Mobile Banking App',
        description: 'Secure mobile banking application with biometric authentication',
        ownerId: users[1].id, // Bob
      },
    }),
    prisma.project.create({
      data: {
        name: 'Healthcare Management System',
        description: 'Comprehensive healthcare management system for hospitals',
        ownerId: users[2].id, // Charlie
      },
    }),
    prisma.project.create({
      data: {
        name: 'Social Media Analytics',
        description: 'Real-time social media analytics dashboard',
        ownerId: users[3].id, // Diana
      },
    }),
    prisma.project.create({
      data: {
        name: 'AI-Powered Chatbot',
        description: 'Intelligent customer service chatbot using machine learning',
        ownerId: users[4].id, // Ethan
      },
    }),
  ]);

  console.log(`✅ Created ${projects.length} projects`);
  // Create Memberships (Each project will have all three role types)
  console.log('👥 Creating project memberships...');
  const memberships: Membership[] = [];

  for (let i = 0; i < projects.length; i++) {
    const project = projects[i];
    const availableUsers = users.filter(user => user.id !== project.ownerId);
    
    // Owner membership (automatic)
    const ownerMembership = await prisma.membership.create({
      data: {
        userId: project.ownerId,
        projectId: project.id,
        role: Role.OWNER,
      },
    });
    memberships.push(ownerMembership);    // Add exactly 2 contributors per project
    for (let j = 0; j < 2 && j < availableUsers.length; j++) {
      const contributorMembership = await prisma.membership.create({
        data: {
          userId: availableUsers[j].id,
          projectId: project.id,
          role: Role.CONTRIBUTOR,
        },
      });
      memberships.push(contributorMembership);
    }

    // Add exactly 2 viewers per project (starting from index 2)
    for (let j = 2; j < 4 && j < availableUsers.length; j++) {
      const viewerMembership = await prisma.membership.create({
        data: {
          userId: availableUsers[j].id,
          projectId: project.id,
          role: Role.VIEWER,
        },
      });
      memberships.push(viewerMembership);
    }
  }

  console.log(`✅ Created ${memberships.length} project memberships`);

  // Create Tasks
  console.log('📋 Creating tasks...');
  const taskTemplates = [
    {
      title: 'Setup project repository',
      description: 'Initialize Git repository and setup basic project structure',
      status: TaskStatus.DONE,
    },
    {
      title: 'Design database schema',
      description: 'Create and document the database schema with all entities',
      status: TaskStatus.DONE,
    },
    {
      title: 'Implement user authentication',
      description: 'Develop JWT-based authentication system with login/signup',
      status: TaskStatus.DOING,
    },
    {
      title: 'Create API documentation',
      description: 'Write comprehensive API documentation using Swagger',
      status: TaskStatus.TODO,
    },
    {
      title: 'Implement user interface',
      description: 'Develop responsive user interface components',
      status: TaskStatus.DOING,
    },
    {
      title: 'Write unit tests',
      description: 'Create comprehensive unit tests for all services',
      status: TaskStatus.TODO,
    },
    {
      title: 'Setup CI/CD pipeline',
      description: 'Configure continuous integration and deployment',
      status: TaskStatus.TODO,
    },
    {
      title: 'Performance optimization',
      description: 'Optimize application performance and database queries',
      status: TaskStatus.TODO,
    },
    {
      title: 'Security audit',
      description: 'Conduct security review and implement fixes',
      status: TaskStatus.TODO,
    },
    {
      title: 'Deploy to production',
      description: 'Deploy application to production environment',
      status: TaskStatus.TODO,
    },
  ];
  const tasks: Task[] = [];
  for (const project of projects) {
    // Get contributors and owner for this project
    const projectMemberships = memberships.filter((m: Membership) => m.projectId === project.id);
    const contributorsAndOwners = projectMemberships.filter(
      (m: Membership) => m.role === Role.CONTRIBUTOR || m.role === Role.OWNER
    );    // Create 2 tasks per project
    for (let i = 0; i < 2; i++) {
      const template = taskTemplates[i % taskTemplates.length];
      const assignedMember = contributorsAndOwners[Math.floor(Math.random() * contributorsAndOwners.length)];
      
      const newTask = await prisma.task.create({
        data: {
          title: `${template.title} - ${project.name}`,
          description: template.description,
          status: template.status,
          projectId: project.id,
          assignedToId: Math.random() > 0.3 ? assignedMember.userId : null, // 70% chance of being assigned
        },
      });
      tasks.push(newTask);
    }
  }

  console.log(`✅ Created ${tasks.length} tasks`);

  // Summary
  console.log('\n📊 Seeding Summary:');
  console.log(`👥 Users: ${users.length}`);
  console.log(`📂 Projects: ${projects.length}`);
  console.log(`🔗 Memberships: ${memberships.length}`);
  console.log(`📋 Tasks: ${tasks.length}`);
  
  console.log('\n🔑 Test Credentials (password: password123):');
  users.slice(0, 5).forEach((user, index) => {
    console.log(`${index + 1}. ${user.name} - ${user.email}`);
  });  console.log('\n🎯 Role Distribution per Project:');
  for (const project of projects) {
    const projectMemberships = memberships.filter((m: Membership) => m.projectId === project.id);
    const roleCount = {
      OWNER: projectMemberships.filter((m: Membership) => m.role === Role.OWNER).length,
      CONTRIBUTOR: projectMemberships.filter((m: Membership) => m.role === Role.CONTRIBUTOR).length,
      VIEWER: projectMemberships.filter((m: Membership) => m.role === Role.VIEWER).length,
    };
    console.log(`📂 ${project.name}: Owner(${roleCount.OWNER}) | Contributors(${roleCount.CONTRIBUTOR}) | Viewers(${roleCount.VIEWER})`);
  }

  console.log('\n🌱 Database seeding completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error during seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });