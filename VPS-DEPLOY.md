# Despliegue en VPS - Fábrica de Ideas

## Requisitos del Servidor

- Ubuntu 20.04+ o Debian 11+
- Mínimo 2GB RAM
- 10GB espacio en disco
- Puerto 3000 disponible

## Instalación Rápida

```bash
# Clonar y ejecutar script de despliegue
git clone https://github.com/ChristianCoronelB/fdi20.git
cd fdi20
chmod +x deploy-vps.sh
./deploy-vps.sh
```

## Instalación Manual Paso a Paso

### 1. Instalar Bun
```bash
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc
```

### 2. Clonar repositorio
```bash
git clone https://github.com/ChristianCoronelB/fdi20.git
cd fdi20
```

### 3. Instalar dependencias
```bash
bun install
```

### 4. Configurar base de datos
```bash
bun run db:push
```

### 5. Compilar para producción
```bash
bun run build
```

### 6. Ejecutar servidor
```bash
bun run start
```

El servidor estará disponible en: `http://tu-ip-vps:3000`

## Usar PM2 para proceso persistente (Recomendado)

```bash
# Instalar PM2
sudo npm install -g pm2

# Iniciar aplicación
pm2 start "bun run start" --name fabrica-ideas

# Guardar configuración
pm2 save

# Configurar inicio automático
pm2 startup
```

### Comandos útiles de PM2
```bash
pm2 status              # Ver estado
pm2 logs fabrica-ideas  # Ver logs
pm2 restart fabrica-ideas  # Reiniciar
pm2 stop fabrica-ideas  # Detener
```

## Configurar Nginx (Opcional)

```bash
sudo apt install nginx

# Crear configuración
sudo nano /etc/nginx/sites-available/fabrica-ideas
```

Contenido del archivo:
```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Activar sitio
sudo ln -s /etc/nginx/sites-available/fabrica-ideas /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Configurar SSL con Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tu-dominio.com
```

## Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="tu-secreto-seguro"
NEXTAUTH_URL="https://tu-dominio.com"
```

## Credenciales por defecto
- Email: `admin@fabricadeideas.com`
- Contraseña: `admin123`

## Actualizar aplicación
```bash
cd fdi20
git pull origin main
bun install
bun run build
pm2 restart fabrica-ideas
```

## Puertos necesarios
- 3000: Aplicación Next.js
- 80: HTTP (Nginx)
- 443: HTTPS (Nginx)
