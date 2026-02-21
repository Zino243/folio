# Portlify

Plataforma SaaS para crear portafolios profesionales gratuitos con opción de expandir funcionalidades mediante pagos únicos.

## Características

- **Múltiples Portfolios**: Crea portfolios separados para diferentes audiencias (desarrolladores, diseñadores, freelancers)
- **Configuración Instantánea**: Sin complejidad. Añade proyectos, personaliza tu tema y publica en minutos
- **Páginas Públicas con SEO**: URL limpia y compartible, optimizada para que reclutadores y clientes te encuentren
- **Gestión de Contenido**: Proyectos, blog, experiencias laborales, estudios, tecnologías, soft skills, certificaciones y FAQs
- **Tema Claro/Oscuro**: Soporte para ambos temas
- **Pagos Únicos**: Expande tu plan adquiriendo proyectos o posts adicionales

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Estilos**: Tailwind CSS, Radix UI
- **Backend/Auth**: Supabase
- **Pagos**: Stripe
- **Despliegue**: Compatible con Vercel

## Estructura del Proyecto

```
app/
├── [username]/              # Páginas públicas de portafolios
│   ├── page.tsx            # Página principal del usuario
│   ├── [projectSlug]/      # Página de proyecto individual
│   └── blog/[slug]/        # Página de blog/post
├── dashboard/              # Panel de administración
│   ├── portfolios/         # Gestión de portafolios
│   ├── profile/            # Perfil del usuario
│   └── settings/           # Configuración
├── api/stripe/             # Endpoints de Stripe
├── login/                  # Página de inicio de sesión
└── register/               # Página de registro
components/
├── dashboard/              # Componentes del panel admin
├── landing/                # Componentes de la landing page
├── public/                 # Componentes de páginas públicas
└── ui/                     # Componentes UI (shadcn/ui)
lib/
├── supabase/               # Cliente y servidor de Supabase
└── stripe.ts               # Configuración de Stripe
```

## Requisitos Previos

- Node.js 18+
- pnpm (o npm/yarn)
- Cuenta de Supabase
- Cuenta de Stripe (para pagos)

## Instalación

1. Clonar el repositorio:
```bash
git clone <repo-url>
cd portlify
```

2. Instalar dependencias:
```bash
pnpm install
```

3. Configurar variables de entorno:
```bash
cp .env.local.example .env.local
```

4. Configurar Supabase:
   - Crear un proyecto en [Supabase](https://supabase.com)
   - Ejecutar las migraciones del schema de base de datos
   - Configurar autenticación (email/password, etc.)

5. Configurar Stripe:
   - Crear cuenta en [Stripe](https://stripe.com)
   - Obtener claves API y configurar webhook

6. Ejecutar el servidor de desarrollo:
```bash
pnpm dev
```

## Variables de Entorno

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_BASE_URL=http://localhost:3000
STRIPE_WEBHOOK_SECRET=your_webhook_secret
```

## Scripts

```bash
pnpm dev      # Iniciar servidor de desarrollo
pnpm build    # Construir para producción
pnpm start    # Iniciar servidor de producción
pnpm lint     # Ejecutar linter
```

## Schema de Base de Datos (Sugerido)

El proyecto está diseñado para trabajar con Supabase. Aquí están las tablas principales recomendadas:

- **users**: Usuarios autenticados
- **portfolios**: Portafolios del usuario
- **projects**: Proyectos dentro de un portafolio
- **posts**: Posts/blog del portafolio
- **experiencias**: Experiencia laboral
- **estudios**: Estudios académicos
- **tecnologías**: Tecnologías/conocimientos
- **softskills**: Habilidades blandas
- **certificaciones**: Certificaciones
- **faqs**: Preguntas frecuentes

## Licencia

MIT
