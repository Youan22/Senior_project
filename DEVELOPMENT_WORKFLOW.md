# ServiceMatch Development Workflow

## 🛠️ Development Environment

### Prerequisites

- Node.js 18+
- PostgreSQL 13+
- npm or yarn

### Local Development Setup

```bash
# 1. Clone and setup
git clone <repository-url>
cd ServiceMatch

# 2. Install dependencies
npm run install:all

# 3. Setup environment
cp .env.example .env
# Edit .env with your database credentials

# 4. Setup database
npm run db:migrate
npm run db:seed

# 5. Start development servers
npm run dev
```

## 📁 Project Structure

```
ServiceMatch/
├── client/                 # Next.js frontend
│   ├── components/         # Reusable components
│   ├── pages/             # Next.js pages
│   ├── styles/            # CSS and Tailwind
│   └── package.json
├── server/                # Node.js backend
│   ├── routes/            # API routes
│   ├── migrations/        # Database migrations
│   ├── middleware/        # Auth middleware
│   └── package.json
├── .env                   # Environment variables
└── package.json          # Root package.json
```

## 🔧 Development Commands

### Backend (Server)

```bash
cd server
npm run dev          # Start with nodemon
npm run migrate      # Run migrations
npm run seed         # Seed database
npm test            # Run tests
```

### Frontend (Client)

```bash
cd client
npm run dev         # Start Next.js dev server
npm run build       # Build for production
npm run lint        # Run ESLint
npm run lint:css    # Run Stylelint
```

### Full Stack

```bash
# From root directory
npm run dev         # Start both servers
npm run install:all # Install all dependencies
```

## 🧪 Testing Workflow

### 1. Test User Registration

```bash
# Visit: http://localhost:3000/auth/register
# Register as both customer and professional
```

### 2. Test Job Posting

```bash
# Login as customer
# Visit: http://localhost:3000/customer/dashboard
# Click "Post New Job"
```

### 3. Test Messaging System

```bash
# Visit: http://localhost:3000/test-messaging
# Or use the messaging buttons in dashboards
```

### 4. Test Real-time Features

```bash
# Open multiple browser tabs
# Login as different users
# Test real-time messaging
```

## 🐛 Debugging

### Common Issues

#### Database Connection

```bash
# Check PostgreSQL is running
brew services start postgresql

# Check database exists
psql -d servicematch_dev -c "\dt"
```

#### Port Conflicts

```bash
# Backend (5000)
lsof -ti:5000 | xargs kill -9

# Frontend (3000)
lsof -ti:3000 | xargs kill -9
```

#### Environment Variables

```bash
# Check .env file exists
ls -la .env

# Verify variables are loaded
node -e "console.log(process.env.JWT_SECRET)"
```

### Debug Tools

#### Backend Debugging

```javascript
// Add to server/index.js
console.log("Environment:", process.env.NODE_ENV);
console.log("Database:", process.env.DB_NAME);
console.log("JWT Secret:", process.env.JWT_SECRET ? "Set" : "Missing");
```

#### Frontend Debugging

```javascript
// Add to any React component
console.log("User:", user);
console.log("Token:", localStorage.getItem("token"));
```

## 📊 Database Management

### Migrations

```bash
# Create new migration
cd server
npx knex migrate:make migration_name

# Run migrations
npm run migrate

# Rollback last migration
npx knex migrate:rollback
```

### Seeding

```bash
# Seed database with test data
npm run seed

# Reset database
npm run db:reset
```

## 🚀 Deployment Preparation

### Environment Variables

```env
# Production
NODE_ENV=production
JWT_SECRET=your_production_secret
DB_HOST=your_production_db_host
DB_NAME=servicematch_prod
CLIENT_URL=https://your-domain.com
```

### Build Process

```bash
# Build frontend
cd client && npm run build

# Start production server
cd server && npm start
```

## 📝 Code Standards

### Backend (Node.js/Express)

- Use async/await for database operations
- Validate all inputs with Joi
- Use proper error handling
- Follow RESTful API conventions

### Frontend (React/Next.js)

- Use TypeScript for type safety
- Follow React hooks patterns
- Use Tailwind CSS for styling
- Implement proper error boundaries

### Database

- Use UUIDs for primary keys
- Add proper indexes
- Use foreign key constraints
- Follow naming conventions

## 🔄 Git Workflow

### Branch Naming

```
feature/messaging-system
bugfix/login-redirect
hotfix/database-connection
```

### Commit Messages

```
feat: add real-time messaging system
fix: resolve login redirect issue
docs: update setup guide
test: add messaging system tests
```

## 📚 Documentation

### API Documentation

- All endpoints documented in route files
- Use JSDoc comments for functions
- Include request/response examples

### Component Documentation

- Document props and usage
- Include examples in comments
- Use TypeScript interfaces

## 🎯 Next Steps

### Priority 1: Video Upload System

- AWS S3 integration
- Video processing pipeline
- Thumbnail generation
- Video streaming

### Priority 2: Payment Integration

- Stripe integration
- Match fee processing
- Transaction history
- Refund handling

### Priority 3: Enhanced Features

- Push notifications
- Email notifications
- Advanced matching algorithm
- Analytics dashboard

















