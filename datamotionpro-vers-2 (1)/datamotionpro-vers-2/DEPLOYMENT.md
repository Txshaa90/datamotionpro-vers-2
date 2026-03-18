# Deployment Guide - Vercel

## 🚀 Quick Deploy to Vercel

### Step 1: Prepare Your Database

**Option A: Vercel Postgres (Recommended)**
1. Go to your Vercel dashboard
2. Create a new Postgres database
3. Copy the `DATABASE_URL` connection string

**Option B: Neon (Free PostgreSQL)**
1. Go to https://neon.tech
2. Create a free account
3. Create a new project
4. Copy the connection string

**Option C: Supabase**
1. Go to https://supabase.com
2. Create a new project
3. Get the connection string from Settings → Database

### Step 2: Update Prisma Schema for PostgreSQL

Since you're using SQLite locally, you need to switch to PostgreSQL for production.

Open `prisma/schema.prisma` and change:

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

To:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Also add back the `@db.Text` annotations:

- Line 34: `refresh_token String? @db.Text`
- Line 35: `access_token String? @db.Text`
- Line 39: `id_token String? @db.Text`
- Line 158: `value String? @db.Text`

### Step 3: Deploy to Vercel

**Option 1: Using Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

**Option 2: Using GitHub**

1. Push your code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/datamotionpro-v2.git
   git push -u origin main
   ```

2. Go to https://vercel.com
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will auto-detect Next.js

### Step 4: Configure Environment Variables in Vercel

In your Vercel project settings, add these environment variables:

```
DATABASE_URL=postgresql://user:password@host:5432/database
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-generated-secret
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**Generate a new NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### Step 5: Run Database Migrations

After deployment, you need to push your schema to the production database.

**Option A: Using Vercel CLI**
```bash
# Set your DATABASE_URL
export DATABASE_URL="your-production-database-url"

# Push schema
npx prisma db push
```

**Option B: Using Prisma Migrate (Recommended for production)**
```bash
# Create migration
npx prisma migrate dev --name init

# Deploy migration
npx prisma migrate deploy
```

### Step 6: Test Your Deployment

1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Sign up for a new account
3. Create a workspace
4. Create a table
5. Test the spreadsheet UI

---

## 🔧 Important Notes

### SQLite vs PostgreSQL

**Local Development (SQLite):**
- Fast setup
- No external dependencies
- File-based database (`dev.db`)

**Production (PostgreSQL):**
- Scalable
- Better for concurrent users
- Required for Vercel (serverless)

### Switching Between SQLite and PostgreSQL

**For Local Development:**
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

**For Production:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Database Schema Differences

When switching from SQLite to PostgreSQL, you need to:

1. Add `@db.Text` for long text fields
2. Update `DATABASE_URL` in `.env`
3. Run `npx prisma generate`
4. Run `npx prisma db push`

---

## 🐛 Troubleshooting

### Build Fails on Vercel

**Error: "Prisma Client not generated"**

Solution: Add build command in `package.json`:
```json
"scripts": {
  "build": "prisma generate && next build"
}
```

**Error: "Cannot connect to database"**

Solution: Check your `DATABASE_URL` in Vercel environment variables.

### Database Connection Issues

**Error: "SSL connection required"**

Add `?sslmode=require` to your DATABASE_URL:
```
postgresql://user:pass@host:5432/db?sslmode=require
```

### Migration Issues

**Error: "Migration failed"**

Solution: Use `prisma db push` instead of `prisma migrate` for initial deployment:
```bash
npx prisma db push --accept-data-loss
```

---

## 📊 Post-Deployment Checklist

- [ ] Database connected and schema deployed
- [ ] Environment variables configured
- [ ] Sign up works
- [ ] Sign in works
- [ ] Workspace creation works
- [ ] Table creation works
- [ ] Spreadsheet UI loads
- [ ] Cell editing works
- [ ] CSV import works (if needed)

---

## 🔐 Security Checklist

- [ ] New `NEXTAUTH_SECRET` generated (different from dev)
- [ ] Database credentials secured
- [ ] `.env` file in `.gitignore`
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] CORS configured properly

---

## 🚀 Next Steps After Deployment

1. **Custom Domain** - Add your own domain in Vercel settings
2. **Monitoring** - Set up Vercel Analytics
3. **Stripe** - Add Stripe keys when ready for payments
4. **Backups** - Set up automated database backups
5. **Testing** - Test with real users

---

## 💡 Pro Tips

1. **Use Preview Deployments** - Every git push creates a preview URL
2. **Environment Variables** - Use different values for preview vs production
3. **Database Branching** - Use Neon's branching feature for testing
4. **Logs** - Check Vercel logs for debugging
5. **Rollback** - Vercel allows instant rollback to previous deployments

---

Built with ❤️ using Next.js, Prisma, and Vercel
