import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seeding...');

  // Nettoyer la base de données dans le bon ordre (respecter les foreign keys)
  await prisma.enrollment.deleteMany();
  await prisma.course.deleteMany();
  await prisma.instructor.deleteMany();
  await prisma.student.deleteMany();

  console.log('✓ Base nettoyée');

  // Créer les formateurs
  const instructors = await Promise.all([
    prisma.instructor.create({
      data: {
        name: 'Jean Dupont',
        email: 'jean.dupont@ecole.fr',
        specialty: 'Développement Web',
      },
    }),
    prisma.instructor.create({
      data: {
        name: 'Marie Martin',
        email: 'marie.martin@ecole.fr',
        specialty: 'Data Science',
      },
    }),
    prisma.instructor.create({
      data: {
        name: 'Pierre Durand',
        email: 'pierre.durand@ecole.fr',
        specialty: 'Intelligence Artificielle',
      },
    }),
  ]);

  console.log(`✓ ${instructors.length} formateurs créés`);

  // Créer les cours
  const courses = await Promise.all([
    prisma.course.create({
      data: {
        title: 'Introduction à React',
        price: 299,
        durationHours: 20,
        instructorId: instructors[0].id,
      },
    }),
    prisma.course.create({
      data: {
        title: 'Node.js Avancé',
        price: 399,
        durationHours: 25,
        instructorId: instructors[0].id,
      },
    }),
    prisma.course.create({
      data: {
        title: 'Python pour Data Science',
        price: 349,
        durationHours: 30,
        instructorId: instructors[1].id,
      },
    }),
    prisma.course.create({
      data: {
        title: 'Machine Learning avec TensorFlow',
        price: 499,
        durationHours: 40,
        instructorId: instructors[2].id,
      },
    }),
    prisma.course.create({
      data: {
        title: 'Deep Learning Fondamentaux',
        price: 449,
        durationHours: 35,
        instructorId: instructors[2].id,
      },
    }),
  ]);

  console.log(`✓ ${courses.length} cours créés`);

  // Créer les étudiants
  const hashedPassword = await bcrypt.hash('password123', 10);
  const students = await Promise.all([
    prisma.student.create({
      data: {
        name: 'Alice Bernard',
        email: 'alice@email.com',
        phone: '0612345678',
        password: hashedPassword,
        enrolledAt: new Date(),
      },
    }),
    prisma.student.create({
      data: {
        name: 'Bob Petit',
        email: 'bob@email.com',
        phone: '0623456789',
        password: hashedPassword,
        enrolledAt: new Date(),
      },
    }),
    prisma.student.create({
      data: {
        name: 'Claire Dubois',
        email: 'claire@email.com',
        phone: '0634567890',
        password: hashedPassword,
        enrolledAt: new Date(),
      },
    }),
    prisma.student.create({
      data: {
        name: 'David Leroy',
        email: 'david@email.com',
        phone: '0645678901',
        password: hashedPassword,
        enrolledAt: new Date(),
      },
    }),
  ]);

  console.log(`✓ ${students.length} étudiants créés`);

  // Créer les inscriptions
  await Promise.all([
    prisma.enrollment.create({
      data: {
        studentId: students[0].id,
        courseId: courses[0].id,
        status: 'active',
        paymentStatus: 'paid',
      },
    }),
    prisma.enrollment.create({
      data: {
        studentId: students[0].id,
        courseId: courses[1].id,
        status: 'pending',
        paymentStatus: 'unpaid',
      },
    }),
    prisma.enrollment.create({
      data: {
        studentId: students[1].id,
        courseId: courses[2].id,
        status: 'active',
        paymentStatus: 'paid',
      },
    }),
    prisma.enrollment.create({
      data: {
        studentId: students[1].id,
        courseId: courses[0].id,
        status: 'completed',
        paymentStatus: 'paid',
      },
    }),
    prisma.enrollment.create({
      data: {
        studentId: students[2].id,
        courseId: courses[3].id,
        status: 'pending',
        paymentStatus: 'unpaid',
      },
    }),
    prisma.enrollment.create({
      data: {
        studentId: students[3].id,
        courseId: courses[4].id,
        status: 'active',
        paymentStatus: 'paid',
      },
    }),
  ]);

  console.log('✓ 6 inscriptions créées');
  console.log('🎉 Seeding terminé avec succès !');
  console.log('\n📝 Informations de connexion :');
  students.forEach(s => {
    console.log(`   - ${s.email} / password123`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });