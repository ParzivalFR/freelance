// Script pour migrer les projets hardcodés vers la base de données
// Exécuter avec: npx tsx scripts/migrate-projects.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const existingProjects = [
  {
    title: "Jazz En Barque",
    description: "Jazz En Barque est un festival en sologne qui a lieu chaque année.",
    image: "https://syuntuolmcrumibzzxrl.supabase.co/storage/v1/object/public/bucket-oasis/Images/jazz-en-barque-compress.webp",
    url: "https://jazz-en-barque.vercel.app",
    technologies: ["React", "Next.js", "Tailwind CSS"],
    category: "web",
    order: 1,
  },
  {
    title: "Stagey",
    description: "Trouve ton stage idéal Facilement et Gratuitement.",
    image: "https://syuntuolmcrumibzzxrl.supabase.co/storage/v1/object/public/bucket-oasis/Images/stagey-compress.webp",
    url: "https://stagey.fr",
    technologies: ["Next.js", "TypeScript", "Prisma", "Supabase"],
    category: "app",
    order: 2,
  },
  {
    title: "Kitilib",
    description: "Essential Tools for Developers and Designers",
    image: "https://syuntuolmcrumibzzxrl.supabase.co/storage/v1/object/public/bucket-oasis/Images/kitilib-compress.webp",
    url: "https://kitilib.com",
    technologies: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
    category: "app",
    order: 3,
  },
  {
    title: "Portfolio Personnel",
    description: "Portfolio personnel pour présenter mes projets et mes compétences.",
    image: "https://syuntuolmcrumibzzxrl.supabase.co/storage/v1/object/public/bucket-oasis/Images/portfolio-compress.webp",
    url: "https://www.gael-dev.fr",
    technologies: ["Next.js", "React", "Tailwind CSS", "Framer Motion"],
    category: "web",
    order: 4,
  },
];

async function migrateProjects() {
  console.log('🚀 Starting projects migration...');

  try {
    // Vérifier si des projets existent déjà
    const existingCount = await prisma.project.count();
    if (existingCount > 0) {
      console.log(`⚠️  ${existingCount} projects already exist. Skipping migration.`);
      return;
    }

    // Créer les projets
    for (const project of existingProjects) {
      await prisma.project.create({
        data: {
          ...project,
          isPublished: true,
        },
      });
      console.log(`✅ Migrated: ${project.title}`);
    }

    console.log('🎉 Migration completed successfully!');
    console.log(`📊 Migrated ${existingProjects.length} projects`);

  } catch (error) {
    console.error('❌ Error during migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter la migration si le script est appelé directement
if (require.main === module) {
  migrateProjects();
}

export { migrateProjects };