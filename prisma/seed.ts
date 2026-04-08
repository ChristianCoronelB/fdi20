import { PrismaClient, UserRole, ActivityType, ActivityStatus, ProjectStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...\n');

  // ==================== USUARIOS ====================
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const participantPassword = await bcrypt.hash('test123', 10);

  // Usuario Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@fabricaideas.com' },
    update: {},
    create: {
      email: 'admin@fabricaideas.com',
      name: 'Administrador',
      password: hashedPassword,
      role: UserRole.ADMIN,
      points: 0,
      level: 1,
      isActive: true,
    },
  });

  // Usuario Participante de prueba
  const participant = await prisma.user.upsert({
    where: { email: 'participante@test.com' },
    update: {},
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

  // Usuario Organizador
  const organizer = await prisma.user.upsert({
    where: { email: 'organizador@fabricaideas.com' },
    update: {},
    create: {
      email: 'organizador@fabricaideas.com',
      name: 'María Organizadora',
      password: hashedPassword,
      role: UserRole.ORGANIZER,
      points: 50,
      level: 2,
      isActive: true,
    },
  });

  // Usuarios adicionales para ranking
  const additionalUsers = await Promise.all([
    prisma.user.upsert({
      where: { email: 'ana.garcia@email.com' },
      update: {},
      create: {
        email: 'ana.garcia@email.com',
        name: 'Ana García',
        password: participantPassword,
        role: UserRole.PARTICIPANT,
        points: 120,
        level: 3,
        isActive: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'carlos.lopez@email.com' },
      update: {},
      create: {
        email: 'carlos.lopez@email.com',
        name: 'Carlos López',
        password: participantPassword,
        role: UserRole.PARTICIPANT,
        points: 85,
        level: 2,
        isActive: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'laura.martinez@email.com' },
      update: {},
      create: {
        email: 'laura.martinez@email.com',
        name: 'Laura Martínez',
        password: participantPassword,
        role: UserRole.PARTICIPANT,
        points: 65,
        level: 2,
        isActive: true,
      },
    }),
  ]);

  console.log('✅ Usuarios creados:');
  console.log('   Admin: admin@fabricaideas.com / admin123');
  console.log('   Participante: participante@test.com / test123');
  console.log('   Organizador: organizador@fabricaideas.com / admin123\n');

  // ==================== EVENTO ====================
  const event = await prisma.event.upsert({
    where: { slug: 'fabrica-ideas-2025' },
    update: {},
    create: {
      name: 'Fábrica de Ideas 2025',
      slug: 'fabrica-ideas-2025',
      description: 'El evento de innovación y tecnología más grande del año. Talleres, conferencias, networking y mucho más.',
      startDate: new Date('2025-03-15T09:00:00'),
      endDate: new Date('2025-03-16T18:00:00'),
      location: 'Centro de Convenciones Metropolitano',
      address: 'Av. Principal 123, Ciudad',
      latitude: -0.1807,
      longitude: -78.4678,
      isActive: true,
      votingEnabled: true,
      qrEnabled: true,
      mapsEnabled: true,
      gamificationEnabled: true,
      creatorId: admin.id,
    },
  });

  console.log('✅ Evento creado:', event.name, '\n');

  // ==================== SALAS ====================
  const rooms = await Promise.all([
    prisma.room.upsert({
      where: { id: 'room-auditorio' },
      update: {},
      create: {
        id: 'room-auditorio',
        eventId: event.id,
        name: 'Auditorio Principal',
        description: 'Auditorio principal con capacidad para 500 personas',
        capacity: 500,
        building: 'Edificio Central',
        floor: 'Planta Baja',
        color: '#3B82F6',
        latitude: -0.1807,
        longitude: -78.4678,
        isActive: true,
      },
    }),
    prisma.room.upsert({
      where: { id: 'room-taller-a' },
      update: {},
      create: {
        id: 'room-taller-a',
        eventId: event.id,
        name: 'Sala de Talleres A',
        description: 'Sala equipada para talleres prácticos',
        capacity: 50,
        building: 'Edificio Central',
        floor: 'Piso 1',
        color: '#10B981',
        latitude: -0.1808,
        longitude: -78.4679,
        isActive: true,
      },
    }),
    prisma.room.upsert({
      where: { id: 'room-taller-b' },
      update: {},
      create: {
        id: 'room-taller-b',
        eventId: event.id,
        name: 'Sala de Talleres B',
        description: 'Sala para talleres de tecnología',
        capacity: 50,
        building: 'Edificio Central',
        floor: 'Piso 1',
        color: '#F59E0B',
        latitude: -0.1809,
        longitude: -78.4680,
        isActive: true,
      },
    }),
  ]);

  console.log('✅ Salas creadas:', rooms.map(r => r.name).join(', '), '\n');

  // ==================== SPEAKERS ====================
  const speakers = await Promise.all([
    prisma.speaker.upsert({
      where: { id: 'speaker-1' },
      update: {},
      create: {
        id: 'speaker-1',
        eventId: event.id,
        name: 'Dra. María García',
        title: 'Directora de Innovación',
        company: 'TechCorp International',
        bio: 'Experta en transformación digital con más de 15 años de experiencia.',
        email: 'maria.garcia@techcorp.com',
        isActive: true,
      },
    }),
    prisma.speaker.upsert({
      where: { id: 'speaker-2' },
      update: {},
      create: {
        id: 'speaker-2',
        eventId: event.id,
        name: 'Ing. Carlos López',
        title: 'CTO',
        company: 'StartupHub',
        bio: 'Desarrollador y emprendedor tecnológico.',
        email: 'carlos.lopez@startuphub.com',
        isActive: true,
      },
    }),
  ]);

  console.log('✅ Speakers creados:', speakers.map(s => s.name).join(', '), '\n');

  // ==================== ACTIVIDADES ====================
  const activities = await Promise.all([
    prisma.activity.upsert({
      where: { id: 'activity-1' },
      update: {},
      create: {
        id: 'activity-1',
        eventId: event.id,
        roomId: rooms[0].id,
        speakerId: speakers[0].id,
        title: 'Inauguración y Conferencia Magistral',
        description: 'Apertura del evento con conferencia sobre tendencias de innovación 2025',
        type: ActivityType.KEYNOTE,
        status: ActivityStatus.SCHEDULED,
        startTime: new Date('2025-03-15T09:00:00'),
        endTime: new Date('2025-03-15T10:30:00'),
        maxCapacity: 500,
        currentAttendance: 0,
        color: '#3B82F6',
        isActive: true,
      },
    }),
    prisma.activity.upsert({
      where: { id: 'activity-2' },
      update: {},
      create: {
        id: 'activity-2',
        eventId: event.id,
        roomId: rooms[1].id,
        speakerId: speakers[1].id,
        title: 'Taller de Design Thinking',
        description: 'Aprende las técnicas de design thinking para resolver problemas complejos',
        type: ActivityType.WORKSHOP,
        status: ActivityStatus.SCHEDULED,
        startTime: new Date('2025-03-15T11:00:00'),
        endTime: new Date('2025-03-15T13:00:00'),
        maxCapacity: 30,
        currentAttendance: 0,
        color: '#10B981',
        isActive: true,
      },
    }),
    prisma.activity.upsert({
      where: { id: 'activity-3' },
      update: {},
      create: {
        id: 'activity-3',
        eventId: event.id,
        roomId: rooms[2].id,
        title: 'Networking y Coffee Break',
        description: 'Espacio para conectar con otros emprendedores y mentores',
        type: ActivityType.NETWORKING,
        status: ActivityStatus.SCHEDULED,
        startTime: new Date('2025-03-15T15:00:00'),
        endTime: new Date('2025-03-15T16:00:00'),
        maxCapacity: 100,
        currentAttendance: 0,
        color: '#F59E0B',
        isActive: true,
      },
    }),
    prisma.activity.upsert({
      where: { id: 'activity-4' },
      update: {},
      create: {
        id: 'activity-4',
        eventId: event.id,
        roomId: rooms[0].id,
        speakerId: speakers[0].id,
        title: 'Panel: El Futuro de la IA',
        description: 'Panel de discusión sobre el impacto de la inteligencia artificial en los negocios',
        type: ActivityType.PANEL,
        status: ActivityStatus.SCHEDULED,
        startTime: new Date('2025-03-15T16:30:00'),
        endTime: new Date('2025-03-15T18:00:00'),
        maxCapacity: 400,
        currentAttendance: 0,
        color: '#8B5CF6',
        isActive: true,
      },
    }),
  ]);

  console.log('✅ Actividades creadas:', activities.map(a => a.title).join(', '), '\n');

  // ==================== PROYECTOS ====================
  const projects = await Promise.all([
    prisma.project.upsert({
      where: { id: 'project-1' },
      update: {},
      create: {
        id: 'project-1',
        eventId: event.id,
        roomId: rooms[1].id,
        name: 'EcoTrack',
        team: 'Ana García, Pedro Ruiz, Luis Mendoza',
        category: 'Sostenibilidad',
        description: 'App para monitorear la huella de carbono personal y empresarial',
        status: ProjectStatus.APPROVED,
        totalVotes: 45,
        averageScore: 4.5,
        rank: 1,
        isActive: true,
      },
    }),
    prisma.project.upsert({
      where: { id: 'project-2' },
      update: {},
      create: {
        id: 'project-2',
        eventId: event.id,
        roomId: rooms[1].id,
        name: 'MediConnect',
        team: 'Carlos López, Sofía Torres',
        category: 'Salud',
        description: 'Plataforma de telemedicina con IA para diagnóstico preventivo',
        status: ProjectStatus.APPROVED,
        totalVotes: 38,
        averageScore: 4.2,
        rank: 2,
        isActive: true,
      },
    }),
    prisma.project.upsert({
      where: { id: 'project-3' },
      update: {},
      create: {
        id: 'project-3',
        eventId: event.id,
        roomId: rooms[2].id,
        name: 'LearnAI',
        team: 'María Organizadora, Daniel Vargas',
        category: 'Educación',
        description: 'Sistema de aprendizaje adaptativo con inteligencia artificial',
        status: ProjectStatus.APPROVED,
        totalVotes: 32,
        averageScore: 4.0,
        rank: 3,
        isActive: true,
      },
    }),
  ]);

  console.log('✅ Proyectos creados:', projects.map(p => p.name).join(', '), '\n');

  // ==================== LOGROS ====================
  const achievements = await Promise.all([
    prisma.achievement.upsert({
      where: { id: 'achievement-first-attendance' },
      update: {},
      create: {
        id: 'achievement-first-attendance',
        name: 'Primera Asistencia',
        description: 'Asiste a tu primera actividad del evento',
        icon: 'calendar-check',
        points: 10,
        category: 'asistencia',
        requirement: 'attendance:>=1',
        isActive: true,
      },
    }),
    prisma.achievement.upsert({
      where: { id: 'achievement-active-participant' },
      update: {},
      create: {
        id: 'achievement-active-participant',
        name: 'Participante Activo',
        description: 'Asiste a al menos 3 actividades del evento',
        icon: 'users',
        points: 25,
        category: 'asistencia',
        requirement: 'attendance:>=3',
        isActive: true,
      },
    }),
    prisma.achievement.upsert({
      where: { id: 'achievement-voter' },
      update: {},
      create: {
        id: 'achievement-voter',
        name: 'Votante',
        description: 'Vota por tu primer proyecto',
        icon: 'thumbs-up',
        points: 5,
        category: 'votacion',
        requirement: 'votes:>=1',
        isActive: true,
      },
    }),
    prisma.achievement.upsert({
      where: { id: 'achievement-points-100' },
      update: {},
      create: {
        id: 'achievement-points-100',
        name: '100 Puntos',
        description: 'Alcanza los 100 puntos de experiencia',
        icon: 'star',
        points: 20,
        category: 'gamificacion',
        requirement: 'points:>=100',
        isActive: true,
      },
    }),
  ]);

  console.log('✅ Logros creados:', achievements.map(a => a.name).join(', '), '\n');

  // ==================== REGISTROS DE PRUEBA ====================
  // Registrar al participante en algunas actividades
  const registrations = await Promise.all([
    prisma.$executeRaw`
      INSERT OR IGNORE INTO activity_registrations (id, userId, activityId, reminderSet, registeredAt, createdAt)
      VALUES ('reg-1', ${participant.id}, 'activity-1', 0, datetime('now'), datetime('now'))
    `,
    prisma.$executeRaw`
      INSERT OR IGNORE INTO activity_registrations (id, userId, activityId, reminderSet, registeredAt, createdAt)
      VALUES ('reg-2', ${participant.id}, 'activity-2', 0, datetime('now'), datetime('now'))
    `,
    prisma.$executeRaw`
      INSERT OR IGNORE INTO activity_registrations (id, userId, activityId, reminderSet, registeredAt, createdAt)
      VALUES ('reg-3', ${participant.id}, 'activity-3', 0, datetime('now'), datetime('now'))
    `,
  ]);

  console.log('✅ Registros de prueba creados para el participante\n');

  // ==================== RESUMEN ====================
  console.log('═══════════════════════════════════════════════════');
  console.log('🎉 ¡Base de datos poblada exitosamente!');
  console.log('═══════════════════════════════════════════════════');
  console.log('\n📋 CUENTAS DE PRUEBA:');
  console.log('┌─────────────────────────────────────────────────┐');
  console.log('│ Admin: admin@fabricaideas.com / admin123        │');
  console.log('│ Participante: participante@test.com / test123   │');
  console.log('│ Organizador: organizador@fabricaideas.com / a...│');
  console.log('└─────────────────────────────────────────────────┘');
  console.log('\n📊 DATOS CREADOS:');
  console.log(`   • ${await prisma.user.count()} usuarios`);
  console.log(`   • ${await prisma.event.count()} eventos`);
  console.log(`   • ${await prisma.room.count()} salas`);
  console.log(`   • ${await prisma.activity.count()} actividades`);
  console.log(`   • ${await prisma.project.count()} proyectos`);
  console.log(`   • ${await prisma.achievement.count()} logros`);
  console.log('\n═══════════════════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
