import { Role, CourseStatus, Department } from '@prisma/client';
import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma';

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@sicodihub.ac.ke';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!';
  const adminPasswordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: adminPasswordHash,
      firstName: 'System',
      lastName: 'Administrator',
      role: Role.ADMIN,
      isActive: true,
    },
  });

  const trainerPasswordHash = await bcrypt.hash('Trainer123!', 10);
  const trainer = await prisma.user.upsert({
    where: { email: 'trainer@sicodihub.ac.ke' },
    update: {},
    create: {
      email: 'trainer@sicodihub.ac.ke',
      passwordHash: trainerPasswordHash,
      firstName: 'Jane',
      lastName: 'Trainer',
      role: Role.TRAINER,
      isActive: true,
      createdByAdminId: admin.id,
    },
  });

  const learnerPasswordHash = await bcrypt.hash('Learner123!', 10);
  const learner = await prisma.user.upsert({
    where: { email: 'learner@sicodihub.ac.ke' },
    update: {},
    create: {
      email: 'learner@sicodihub.ac.ke',
      passwordHash: learnerPasswordHash,
      firstName: 'John',
      lastName: 'Learner',
      role: Role.LEARNER,
      isActive: true,
    },
  });

  const category = await prisma.category.upsert({
    where: { slug: 'digital-skills' },
    update: {},
    create: { name: 'Digital Skills', slug: 'digital-skills' },
  });

  const course = await prisma.course.upsert({
    where: { slug: 'intro-to-digital-literacy' },
    update: {},
    create: {
      title: 'Introduction to Digital Literacy',
      slug: 'intro-to-digital-literacy',
      description:
        'Foundational digital skills course offered by the Siaya Community Digital Hub.',
      department: Department.BASIC_ICT_SKILLS,
      status: CourseStatus.PUBLISHED,
      categoryId: category.id,
      createdById: admin.id,
      trainers: {
        create: [{ trainerId: trainer.id }],
      },
      modules: {
        create: [
          {
            title: 'Getting Started',
            order: 1,
            lessons: {
              create: [
                {
                  title: 'Welcome to the Hub',
                  content: 'Overview of the Siaya Community Digital Hub Learning Platform.',
                  order: 1,
                },
                {
                  title: 'Using a Computer Safely',
                  content: 'Basics of safe and responsible computer use.',
                  videoUrl: 'https://stream.mux.com/sample-video-id',
                  order: 2,
                },
              ],
            },
          },
        ],
      },
    },
    include: { modules: { include: { lessons: true } } },
  });

  await prisma.enrollment.upsert({
    where: { learnerId_courseId: { learnerId: learner.id, courseId: course.id } },
    update: {},
    create: { learnerId: learner.id, courseId: course.id },
  });

  console.log('Seed complete:', { admin: admin.email, trainer: trainer.email, learner: learner.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
