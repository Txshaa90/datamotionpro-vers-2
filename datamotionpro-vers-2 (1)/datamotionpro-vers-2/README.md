# DataMotionPro V2

A modern, scalable data management platform built with Next.js, PostgreSQL, and Stripe. This is a complete rewrite with proper architecture, self-hosted database, and production-ready features.

## 🏗️ Architecture

- **Frontend**: Next.js 14 with App Router, React 18, TailwindCSS
- **Backend**: Next.js API Routes with TypeScript
- **Database**: Self-hosted PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with JWT sessions
- **Payments**: Stripe for subscription management
- **Storage**: S3-compatible storage (optional)

## ✨ Features

### Core Features
- **Workspaces**: Organize data into separate workspaces for different projects
- **Tables & Columns**: Create custom tables with flexible column types (text, number, date, boolean)
- **Rows & Cells**: Full CRUD operations with pagination support
- **CSV Import**: Bulk import data from CSV files with automatic column mapping
- **Role-Based Access**: Workspace-level permissions (owner, member)

### Authentication & Security
- Email/password authentication with bcrypt hashing
- JWT-based sessions for stateless authentication
- Protected API routes with middleware
- Secure password requirements (min 8 characters)

### Subscription Management
- **Free Plan**: 1 workspace, 3 tables, 100 rows per table
- **Basic Plan**: 5 workspaces, 20 tables, 10,000 rows per table
- **Pro Plan**: Unlimited workspaces, tables, and rows
- Stripe Checkout integration
- Webhook handling for subscription updates

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL 14+ database
- Stripe account (for payments)

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up PostgreSQL Database

Create a new PostgreSQL database:

```sql
CREATE DATABASE datamotionpro_v2;
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required environment variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/datamotionpro_v2?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_ID_BASIC="price_..."
STRIPE_PRICE_ID_PRO="price_..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 4. Set Up Database Schema

Run Prisma migrations to create database tables:

```bash
npm run db:generate
npm run db:push
```

To view your database in Prisma Studio:

```bash
npm run db:studio
```

### 5. Configure Stripe

1. Create products and prices in your Stripe Dashboard
2. Copy the price IDs to your `.env` file
3. Set up webhook endpoint at `/api/stripe/webhook`
4. Add webhook events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
datamotionpro-v2/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── workspaces/    # Workspace CRUD
│   │   │   ├── tables/        # Table & row operations
│   │   │   └── stripe/        # Payment integration
│   │   ├── auth/              # Auth pages (signin, signup)
│   │   ├── dashboard/         # Protected dashboard pages
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Landing page
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   │   ├── dashboard-layout.tsx
│   │   └── providers.tsx
│   ├── lib/                   # Utilities
│   │   ├── auth.ts            # NextAuth configuration
│   │   ├── prisma.ts          # Prisma client
│   │   ├── stripe.ts          # Stripe client
│   │   └── utils.ts           # Helper functions
│   └── types/                 # TypeScript types
├── .env.example               # Environment template
├── package.json
├── tsconfig.json
└── README.md
```

## 🔌 API Routes

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/signin` - Sign in (handled by NextAuth)
- `POST /api/auth/signout` - Sign out

### Workspaces
- `GET /api/workspaces` - List user's workspaces
- `POST /api/workspaces` - Create new workspace
- `GET /api/workspaces/[id]` - Get workspace details
- `PUT /api/workspaces/[id]` - Update workspace
- `DELETE /api/workspaces/[id]` - Delete workspace

### Tables
- `GET /api/workspaces/[workspaceId]/tables` - List tables in workspace
- `POST /api/workspaces/[workspaceId]/tables` - Create new table
- `GET /api/tables/[tableId]` - Get table details
- `PUT /api/tables/[tableId]` - Update table
- `DELETE /api/tables/[tableId]` - Delete table

### Rows
- `GET /api/tables/[tableId]/rows?page=1&limit=50` - List rows (paginated)
- `POST /api/tables/[tableId]/rows` - Create new row
- `PUT /api/tables/[tableId]/rows/[rowId]` - Update row
- `DELETE /api/tables/[tableId]/rows/[rowId]` - Delete row

### Import
- `POST /api/tables/[tableId]/import` - Import CSV file

### Stripe
- `POST /api/stripe/checkout` - Create checkout session
- `POST /api/stripe/webhook` - Handle Stripe webhooks

## 🗄️ Database Schema

### Core Models
- **User**: User accounts with authentication
- **Workspace**: Organizational containers for tables
- **WorkspaceMember**: User-workspace relationships with roles
- **Table**: Data tables within workspaces
- **Column**: Table column definitions
- **Row**: Data rows
- **Cell**: Individual cell values
- **Subscription**: User subscription status

### Relationships
- Users can belong to multiple workspaces
- Workspaces contain multiple tables
- Tables have columns and rows
- Rows contain cells linked to columns

## 🎨 Frontend Pages

- `/` - Landing page
- `/auth/signin` - Sign in page
- `/auth/signup` - Sign up page
- `/dashboard` - User dashboard with workspaces
- `/dashboard/workspaces/[id]` - Workspace detail view
- `/dashboard/billing` - Subscription management

## 🔐 Security Best Practices

- Passwords hashed with bcrypt (10 rounds)
- JWT sessions with secure tokens
- API route protection with session validation
- SQL injection prevention via Prisma
- CORS and CSRF protection
- Environment variable validation

## 🚢 Deployment

### Database Setup
1. Provision a PostgreSQL database (e.g., Railway, Supabase, AWS RDS)
2. Update `DATABASE_URL` in production environment
3. Run migrations: `npm run db:push`

### Application Deployment
1. Build the application: `npm run build`
2. Deploy to Vercel, Railway, or any Node.js host
3. Set environment variables in hosting platform
4. Update `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to production URLs

### Stripe Configuration
1. Switch to live mode in Stripe Dashboard
2. Update API keys to live keys
3. Configure production webhook endpoint
4. Test payment flow thoroughly

## 📊 Monitoring & Maintenance

### Database Migrations
When updating the schema:
```bash
npm run db:migrate
```

### Database Backup
Regular backups recommended:
```bash
pg_dump datamotionpro_v2 > backup.sql
```

### Logs
Monitor application logs for errors and performance issues.

## 🔄 Migration from V1

To migrate users from your current site:

1. Keep V1 running during migration
2. Export user data from V1
3. Create migration script to import into V2 database
4. Test thoroughly with subset of users
5. Communicate migration timeline to users
6. Perform full migration during low-traffic period
7. Redirect V1 domain to V2

## 🛠️ Development

### Code Quality
```bash
npm run lint
```

### Type Checking
```bash
npx tsc --noEmit
```

### Database Studio
```bash
npm run db:studio
```

## 📝 Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXTAUTH_URL` | Application URL | Yes |
| `NEXTAUTH_SECRET` | JWT secret key | Yes |
| `STRIPE_SECRET_KEY` | Stripe secret key | Yes |
| `STRIPE_PUBLISHABLE_KEY` | Stripe public key | Yes |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | Yes |
| `STRIPE_PRICE_ID_BASIC` | Basic plan price ID | Yes |
| `STRIPE_PRICE_ID_PRO` | Pro plan price ID | Yes |
| `NEXT_PUBLIC_APP_URL` | Public app URL | Yes |
| `S3_ENDPOINT` | S3 endpoint URL | No |
| `S3_ACCESS_KEY_ID` | S3 access key | No |
| `S3_SECRET_ACCESS_KEY` | S3 secret key | No |
| `S3_BUCKET_NAME` | S3 bucket name | No |
| `S3_REGION` | S3 region | No |

## 🤝 Contributing

This is a private project. For issues or feature requests, contact the development team.

## 📄 License

Proprietary - All rights reserved.

---

Built with ❤️ using Next.js, PostgreSQL, and modern web technologies.
