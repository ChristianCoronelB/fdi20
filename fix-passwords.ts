import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Actualizando contraseñas de usuarios...\n');
  
  const adminPassword = await bcrypt.hash('admin123', 10);
  const participantPassword = await bcrypt.hash('test123', 10);
  
  // Actualizar/crear usuario Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@fabricaideas.com' },
    update: { 
      password: adminPassword,
      isActive: true,
      role: UserRole.ADMIN
    },
    create: {
      email: 'admin@fabricaideas.com',
      name: 'Administrador',
      password: adminPassword,
      role: UserRole.ADMIN,
      points: 0,
      level: 1,
      isActive: true,
    },
  });
  console.log('✅ Admin actualizado:', admin.email, '- Contraseña: admin123');
  
  // Actualizar/crear usuario Organizador
  const organizer = await prisma.user.upsert({
    where: { email: 'organizador@fabricaideas.com' },
    update: { 
      password: adminPassword,
      isActive: true,
      role: UserRole.ORGANIZER
    },
    create: {
      email: 'organizador@fabricaideas.com',
      name: 'María Organizadora',
      password: adminPassword,
      role: UserRole.ORGANIZER,
      points: 50,
      level: 2,
      isActive: true,
    },
  });
  console.log('✅ Organizador actualizado:', organizer.email, '- Contraseña: admin123');
  
  // Actualizar/crear usuario Participante
  const participant = await prisma.user.upsert({
    where: { email: 'participante@test.com' },
    update: { 
      password: participantPassword,
      isActive: true,
      role: UserRole.PARTICIPANT
    },
    create: {
      email: 'participante@test.com',
      name: 'Juan Participante',
      password: participantPassword,
      role: UserRole.PARTICIPANT,
      points: 25,
      level: 1,
      isActive: true,
    },
  });
  console.log('✅ Participante actualizado:', participant.email, '- Contraseña: test123');
  
  console.log('\n═══════════════════════════════════════════════════');
  console.log('🎉 ¡Contraseñas actualizadas exitosamente!');
  console.log('═══════════════════════════════════════════════════');
  console.log('\n📋 CREDENCIALES DE ACCESO:');
  console.log('┌─────────────────────────────────────────────────┐');
  console.log('│ Admin: admin@fabricaideas.com / admin123        │');
  console.log('│ Organizador: organizador@fabricaideas.com / a...│');
  console.log('│ Participante: participante@test.com / test123   │');
  console.log('└─────────────────────────────────────────────────┘');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
