import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Obtener configuración
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (key) {
      // Obtener una configuración específica
      const config = await db.appConfig.findUnique({
        where: { key }
      });
      return NextResponse.json({ success: true, data: config });
    }

    // Obtener todas las configuraciones
    const configs = await db.appConfig.findMany();
    
    // Convertir a objeto para fácil acceso
    const configMap: Record<string, string> = {};
    configs.forEach(config => {
      configMap[config.key] = config.value;
    });

    return NextResponse.json({ 
      success: true, 
      data: {
        timezone: configMap.timezone || 'America/Guayaquil',
        footerText: configMap.footerText || '© 2024 Fábrica de Ideas - Plataforma de Gestión de Eventos',
        ...configMap
      }
    });
  } catch (error) {
    console.error('Error fetching app config:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener la configuración' },
      { status: 500 }
    );
  }
}

// POST - Crear o actualizar configuración
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value, description } = body;

    if (!key || value === undefined) {
      return NextResponse.json(
        { success: false, error: 'Key y value son requeridos' },
        { status: 400 }
      );
    }

    // Upsert - crear o actualizar
    const config = await db.appConfig.upsert({
      where: { key },
      update: { value, description },
      create: { key, value, description }
    });

    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    console.error('Error saving app config:', error);
    return NextResponse.json(
      { success: false, error: 'Error al guardar la configuración' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar múltiples configuraciones
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { configs } = body;

    if (!configs || typeof configs !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Se requiere un objeto de configuraciones' },
        { status: 400 }
      );
    }

    // Actualizar cada configuración
    const updates = [];
    for (const [key, value] of Object.entries(configs)) {
      updates.push(
        db.appConfig.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) }
        })
      );
    }

    await Promise.all(updates);

    return NextResponse.json({ 
      success: true, 
      message: 'Configuración actualizada correctamente' 
    });
  } catch (error) {
    console.error('Error updating app config:', error);
    return NextResponse.json(
      { success: false, error: 'Error al actualizar la configuración' },
      { status: 500 }
    );
  }
}
