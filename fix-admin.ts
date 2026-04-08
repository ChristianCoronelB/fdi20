import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Verificando base de datos...\n');
  
  // Ver todos los usuarios
  const users = await prisma.user.findMany();
  console.log('📋 Usuarios en la base de datos:', users.length);
  
  for (const u of users) {
    console.log(`   - ${u.email} (${u.role})`);
  }
  
  console.log('\n🔄 Creando/actualizando usuario admin...\n');
  
  // Generar hash NUEVO de la contraseña
  const hashedPassword = await bcrypt.hash('admin123', 10);
  console.log('📝 Nuevo hash generado:', hashedPassword);
  
  // Eliminar usuario existente si hay
  try {
    await prisma.user.delete({
      where: { email: 'admin@fabricadeideas.com' }
    });
    console.log('🗑️ Usuario anterior eliminado');
  } catch (e) {
    console.log('ℹ️ No había usuario anterior');
  }
  
  // Crear usuario nuevo con hash correcto
  const admin = await prisma.user.create({
    data: {
      email: 'admin@fabricadeideas.com',
      password: hashedPassword,
      name: 'Administrador',
      role: 'ADMIN',
      points: 0,
      level: 1,
      isActive: true,
    },
  });

  console.log('\n✅ Usuario creado correctamente:');
  console.log('   ID:', admin.id);
  console.log('   Email:', admin.email);
  console.log('   Nombre:', admin.name);
  console.log('   Rol:', admin.role);
  console.log('   Activo:', admin.isActive);
  
  // Verificar que el hash funciona
  const isValid = await bcrypt.compare('admin123', admin.password);
  console.log('\n🔍 Verificación del hash:', isValid ? '✅ CORRECTO' : '❌ ERROR');
  
  if (isValid) {
    console.log('\n🎉 ¡TODO LISTO! Ahora puedes iniciar sesión con:');
    console.log('   📧 Email: admin@fabricadeideas.com');
    console.log('   🔑 Password: admin123');
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
