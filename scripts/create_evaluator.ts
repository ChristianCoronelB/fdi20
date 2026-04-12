import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Check if evaluator already exists
  const existingEvaluator = await prisma.user.findFirst({
    where: { email: 'evaluador@fabricadeideas.com' }
  });
  
  if (existingEvaluator) {
    console.log('Evaluator user already exists:', existingEvaluator.email);
    
    // Update role to EVALUATOR if needed
    if (existingEvaluator.role !== 'EVALUATOR') {
      const updated = await prisma.user.update({
        where: { id: existingEvaluator.id },
        data: { role: 'EVALUATOR' }
      });
      console.log('Updated role to EVALUATOR:', updated.email);
    }
    return;
  }
  
  // Create evaluator user
  const hashedPassword = await bcrypt.hash('evaluador123', 10);
  
  const evaluator = await prisma.user.create({
    data: {
      email: 'evaluador@fabricadeideas.com',
      password: hashedPassword,
      name: 'María Evaluadora',
      role: 'EVALUATOR',
      points: 0,
      level: 1,
    }
  });
  
  console.log('Created evaluator user:', evaluator.email);
  console.log('Password: evaluador123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
