import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as path from 'path';
import * as fs from 'fs';

// S'assurer que le dossier existe
const dbPath = path.join(process.cwd(), 'dev.db');
console.log(`Base de données: ${dbPath}`);

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seeding...');
  
  try {
    // Tester la connexion
    await prisma.$connect();
    console.log('✓ Connexion à la base de données établie');

    // Nettoyer la base de données dans le bon ordre
    console.log('Nettoyage des tables...');
    await prisma.enrollment.deleteMany({});
    await prisma.course.deleteMany({});
    await prisma.instructor.deleteMany({});
    await prisma.student.deleteMany({});
    console.log('✓ Base nettoyée');

    // Créer les formateurs
    console.log('Création des formateurs...');
    const instructors = await prisma.instructor.createMany({
      data: [
        {
          name: 'Jean Dupont',
          email: 'jean.dupont@ecole.fr',
          specialty: 'Développement Web',
        },
        {
          name: 'Marie Martin',
          email: 'marie.martin@ecole.fr',
          specialty: 'Data Science',
        },
        {
          name: 'Pierre Durand',
          email: 'pierre.durand@ecole.fr',
          specialty: 'Intelligence Artificielle',
        },
      ],
    });
    console.log(`✓ ${instructors.count} formateurs créés`);

    // Récupérer les formateurs créés
    const instructorList = await prisma.instructor.findMany();
    
    // Créer les cours
    console.log('Création des cours...');
    const courses = await prisma.course.createMany({
      data: [
        {
          title: 'Introduction à React',
          price: 299,
          durationHours: 20,
          instructorId: instructorList[0].id,
        },
        {
          title: 'Node.js Avancé',
          price: 399,
          durationHours: 25,
          instructorId: instructorList[0].id,
        },
        {
          title: 'Python pour Data Science',
          price: 349,
          durationHours: 30,
          instructorId: instructorList[1].id,
        },
        {
          title: 'Machine Learning avec TensorFlow',
          price: 499,
          durationHours: 40,
          instructorId: instructorList[2].id,
        },
        {
          title: 'Deep Learning Fondamentaux',
          price: 449,
          durationHours: 35,
          instructorId: instructorList[2].id,
        },
      ],
    });
    console.log(`✓ ${courses.count} cours créés`);

    // Récupérer les cours créés
    const courseList = await prisma.course.findMany();

    // Créer les étudiants
    console.log('Création des étudiants...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    const students = await prisma.student.createMany({
      data: [
        {
          name: 'Alice Bernard',
          email: 'alice@email.com',
          phone: '0612345678',
          password: hashedPassword,
          enrolledAt: new Date(),
        },
        {
          name: 'Bob Petit',
          email: 'bob@email.com',
          phone: '0623456789',
          password: hashedPassword,
          enrolledAt: new Date(),
        },
        {
          name: 'Claire Dubois',
          email: 'claire@email.com',
          phone: '0634567890',
          password: hashedPassword,
          enrolledAt: new Date(),
        },
        {
          name: 'David Leroy',
          email: 'david@email.com',
          phone: '0645678901',
          password: hashedPassword,
          enrolledAt: new Date(),
        },
      ],
    });
    console.log(`✓ ${students.count} étudiants créés`);

    // Récupérer les étudiants créés
    const studentList = await prisma.student.findMany();

    // Créer les inscriptions
    console.log('Création des inscriptions...');
    const enrollments = await prisma.enrollment.createMany({
      data: [
        {
          studentId: studentList[0].id,
          courseId: courseList[0].id,
          status: 'active',
          paymentStatus: 'paid',
        },
        {
          studentId: studentList[0].id,
          courseId: courseList[1].id,
          status: 'pending',
          paymentStatus: 'unpaid',
        },
        {
          studentId: studentList[1].id,
          courseId: courseList[2].id,
          status: 'active',
          paymentStatus: 'paid',
        },
        {
          studentId: studentList[1].id,
          courseId: courseList[0].id,
          status: 'completed',
          paymentStatus: 'paid',
        },
        {
          studentId: studentList[2].id,
          courseId: courseList[3].id,
          status: 'pending',
          paymentStatus: 'unpaid',
        },
        {
          studentId: studentList[3].id,
          courseId: courseList[4].id,
          status: 'active',
          paymentStatus: 'paid',
        },
      ],
    });
    console.log(`✓ ${enrollments.count} inscriptions créées`);

    console.log('🎉 Seeding terminé avec succès !');
    console.log('\n📝 Informations de connexion :');
    studentList.forEach(s => {
      console.log(`   - ${s.email} / password123`);
    });
    
  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });