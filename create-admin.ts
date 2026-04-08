import { db } from './src/lib/db';
import * as bcrypt from 'bcryptjs';

async function createAdmin() {
  const email = 'admin@fabricadeideas.com';
  const password = 'admin123';
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await db.user.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        role: 'ADMIN',
      },
      create: {
        email,
        password: hashedPassword,
        name: 'Administrador',
        role: 'ADMIN',
        points: 0,
        level: 1,
      },
    });

    console.log('✅ Usuario administrador creado/actualizado:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Rol: ${user.role}`);
  } catch (error) {
    console.error('Error al crear usuario:', error);
  }

  process.exit(0);
}

createAdmin();
