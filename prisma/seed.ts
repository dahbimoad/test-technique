import { PrismaClient, Role, TaskStatus, User, Project, Membership, Task, Tag, ProjectTag } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');
  // Clear existing data
  await prisma.task.deleteMany();
  await prisma.projectTag.deleteMany();
  await prisma.tag.deleteMany();
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

  // Create Tags
  console.log('🏷️ Creating tags...');
  const tags = await Promise.all([
    // Technology Tags
    prisma.tag.create({
      data: {
        name: 'frontend',
        color: '#3B82F6',
        description: 'Frontend development related tasks',
        createdById: users[0].id, // Alice
      },
    }),
    prisma.tag.create({
      data: {
        name: 'backend',
        color: '#10B981',
        description: 'Backend development and API work',
        createdById: users[0].id, // Alice
      },
    }),
    prisma.tag.create({
      data: {
        name: 'database',
        color: '#8B5CF6',
        description: 'Database design and optimization',
        createdById: users[1].id, // Bob
      },
    }),
    prisma.tag.create({
      data: {
        name: 'mobile',
        color: '#F59E0B',
        description: 'Mobile app development',
        createdById: users[1].id, // Bob
      },
    }),
    // Priority Tags
    prisma.tag.create({
      data: {
        name: 'urgent',
        color: '#EF4444',
        description: 'High priority tasks that need immediate attention',
        createdById: users[2].id, // Charlie
      },
    }),
    prisma.tag.create({
      data: {
        name: 'low-priority',
        color: '#6B7280',
        description: 'Tasks that can be completed when time permits',
        createdById: users[2].id, // Charlie
      },
    }),
    // Feature Tags
    prisma.tag.create({
      data: {
        name: 'security',
        color: '#DC2626',
        description: 'Security-related features and improvements',
        createdById: users[3].id, // Diana
      },
    }),
    prisma.tag.create({
      data: {
        name: 'ui-ux',
        color: '#EC4899',
        description: 'User interface and user experience',
        createdById: users[3].id, // Diana
      },
    }),
    prisma.tag.create({
      data: {
        name: 'api',
        color: '#06B6D4',
        description: 'API development and integration',
        createdById: users[4].id, // Ethan
      },
    }),
    prisma.tag.create({
      data: {
        name: 'testing',
        color: '#84CC16',
        description: 'Testing and quality assurance',
        createdById: users[4].id, // Ethan
      },
    }),
    // Business Tags
    prisma.tag.create({
      data: {
        name: 'mvp',
        color: '#F97316',
        description: 'Minimum Viable Product features',
        createdById: users[5].id, // Fiona
      },
    }),
    prisma.tag.create({
      data: {
        name: 'enhancement',
        color: '#A855F7',
        description: 'Feature enhancements and improvements',
        createdById: users[5].id, // Fiona
      },
    }),
  ]);

  console.log(`✅ Created ${tags.length} tags`);

  // Create Project-Tag associations
  console.log('🔗 Creating project-tag associations...');
  const projectTags: ProjectTag[] = [];

  // E-commerce Platform (Project 0) - Frontend focused
  const eCommerceTagIds = tags.filter(tag => 
    ['frontend', 'backend', 'ui-ux', 'api', 'urgent', 'mvp'].includes(tag.name)
  ).map(tag => tag.id);
  
  for (const tagId of eCommerceTagIds) {
    const projectTag = await prisma.projectTag.create({
      data: {
        projectId: projects[0].id,
        tagId: tagId,
      },
    });
    projectTags.push(projectTag);
  }

  // Mobile Banking App (Project 1) - Security focused
  const bankingTagIds = tags.filter(tag => 
    ['mobile', 'security', 'backend', 'testing', 'urgent'].includes(tag.name)
  ).map(tag => tag.id);
  
  for (const tagId of bankingTagIds) {
    const projectTag = await prisma.projectTag.create({
      data: {
        projectId: projects[1].id,
        tagId: tagId,
      },
    });
    projectTags.push(projectTag);
  }

  // Healthcare Management System (Project 2) - Database focused
  const healthcareTagIds = tags.filter(tag => 
    ['database', 'backend', 'security', 'api', 'enhancement'].includes(tag.name)
  ).map(tag => tag.id);
  
  for (const tagId of healthcareTagIds) {
    const projectTag = await prisma.projectTag.create({
      data: {
        projectId: projects[2].id,
        tagId: tagId,
      },
    });
    projectTags.push(projectTag);
  }

  // Social Media Analytics (Project 3) - Analytics focused
  const analyticsTagIds = tags.filter(tag => 
    ['frontend', 'database', 'api', 'ui-ux', 'low-priority'].includes(tag.name)
  ).map(tag => tag.id);
  
  for (const tagId of analyticsTagIds) {
    const projectTag = await prisma.projectTag.create({
      data: {
        projectId: projects[3].id,
        tagId: tagId,
      },
    });
    projectTags.push(projectTag);
  }

  // AI-Powered Chatbot (Project 4) - AI/ML focused
  const aiTagIds = tags.filter(tag => 
    ['backend', 'api', 'testing', 'mvp', 'enhancement'].includes(tag.name)
  ).map(tag => tag.id);
  
  for (const tagId of aiTagIds) {
    const projectTag = await prisma.projectTag.create({
      data: {
        projectId: projects[4].id,
        tagId: tagId,
      },
    });
    projectTags.push(projectTag);
  }

  console.log(`✅ Created ${projectTags.length} project-tag associations`);

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
  console.log(`🏷️ Tags: ${tags.length}`);
  console.log(`🔗 Project-Tag Associations: ${projectTags.length}`);
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

  console.log('\n🏷️ Tags Distribution per Project:');
  for (const project of projects) {
    const projectTagAssociations = projectTags.filter((pt: ProjectTag) => pt.projectId === project.id);
    const projectTagNames = projectTagAssociations.map(pt => {
      const tag = tags.find(t => t.id === pt.tagId);
      return tag ? tag.name : 'unknown';
    });
    console.log(`📂 ${project.name}: [${projectTagNames.join(', ')}]`);
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