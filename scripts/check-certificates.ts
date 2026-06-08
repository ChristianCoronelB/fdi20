import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Check certificates
  const certificates = await prisma.certificate.findMany({
    include: { user: { select: { name: true } } }
  });
  
  console.log('Certificados:', certificates.length);
  certificates.forEach(c => {
    console.log(`- ${c.code} | ${c.type} | ${c.user.name} | ${c.title}`);
  });
  
  // Check attendances
  const attendances = await prisma.$queryRaw`
    SELECT u.name, COUNT(*) as count
    FROM attendances a
    JOIN users u ON a.userId = u.id
    WHERE a.checkInTime IS NOT NULL AND a.checkOutTime IS NOT NULL
    GROUP BY a.userId, u.name
  `;
  
  console.log('\nAsistencias completas por usuario:');
  (attendances as any[]).forEach((a: any) => {
    console.log(`- ${a.name}: ${a.count} asistencias`);
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
