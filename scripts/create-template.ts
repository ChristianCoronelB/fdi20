import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Check if template exists
  const existing = await prisma.certificateTemplate.findFirst({
    where: { type: 'attendance', isActive: true }
  });
  
  if (existing) {
    console.log('Plantilla existente:', existing);
    return;
  }
  
  // Create default template
  const template = await prisma.certificateTemplate.create({
    data: {
      name: 'Plantilla por Defecto',
      type: 'attendance',
      headerText: 'CERTIFICADO DE PARTICIPACIÓN',
      bodyText: 'Se certifica que',
      participantLabel: 'ha participado activamente en',
      eventLabel: 'evento',
      organizationName: 'Fábrica de Ideas',
      primaryColor: '#059669',
      secondaryColor: '#0d9488',
      textColor: '#1f2937',
      borderColor: '#059669',
      borderWidth: 4,
      showQrCode: true,
      showCode: true,
      showDate: true,
      showActivities: true,
      isActive: true,
      isDefault: true,
    }
  });
  
  console.log('Plantilla creada:', template);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
