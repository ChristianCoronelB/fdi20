import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Verificando usuarios en la base de datos...\n');
  
  const users = await prisma.user.findMany({ 
    select: { email: true, name: true, role: true } 
  });
  
  if (users.length === 0) {
    console.log('❌ No hay usuarios en la base de datos.');
    console.log('📝 Creando usuarios de prueba...\n');
    
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const participantPassword = await bcrypt.hash('test123', 10);
    
    // Crear usuario Admin
    const admin = await prisma.user.create({
      data: {
        email: 'admin@fabricaideas.com',
        name: 'Administrador',
        password: hashedPassword,
        role: UserRole.ADMIN,
        points: 0,
        level: 1,
        isActive: true,
      },
    });
    console.log('✅ Admin creado:', admin.email);
    
    // Crear usuario Organizador
    const organizer = await prisma.user.create({
      data: {
        email: 'organizador@fabricaideas.com',
        name: 'María Organizadora',
        password: hashedPassword,
        role: UserRole.ORGANIZER,
        points: 50,
        level: 2,
        isActive: true,
      },
    });
    console.log('✅ Organizador creado:', organizer.email);
    
    // Crear usuario Participante
    const participant = await prisma.user.create({
      data: {
        email: 'participante@test.com',
        name: 'Juan Participante',
        password: participantPassword,
        role: UserRole.PARTICIPANT,
        points: 25,
        level: 1,
        isActive: true,
      },
    });
    console.log('✅ Participante creado:', participant.email);
    
    console.log('\n═══════════════════════════════════════════════════');
    console.log('🎉 ¡Usuarios creados exitosamente!');
    console.log('═══════════════════════════════════════════════════');
  } else {
    console.log('✅ Usuarios encontrados en la base de datos:');
    users.forEach(u => console.log(`   - ${u.email} (${u.role})`));
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
