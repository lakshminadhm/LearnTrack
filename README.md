   # LearnTrack

LearnTrack is a web application that helps users track their daily progress in learning technologies. It provides analytics, goal tracking, and a community platform for learners.

## Features

- 📊 **Analytics Dashboard**: Visualize learning streaks, progress, and technology breakdown
- 📝 **Daily Logs**: Track time spent learning different technologies
- 🎯 **Goal Setting**: Set and monitor learning goals with deadlines
- 👥 **Community**: Share progress and discuss with other learners
- 🔒 **Authentication**: Secure login with email/password and Google OAuth

## Tech Stack

### Frontend
- React with TypeScript
- Vite for development and building
- Tailwind CSS for styling
- Chart.js for data visualization
- React Router for navigation
- Axios for API requests

### Backend
- Node.js with Express
- TypeScript for type safety
- Supabase for PostgreSQL database and authentication
- JWT for authentication

### Project Structure
- TypeScript monorepo with shared types
- Frontend, backend, and shared packages

## Getting Started

### Prerequisites
- Node.js 14+ and npm
- Supabase account

### Environment Setup

1. Create a `.env` file in the root directory:

```
# Backend
JWT_SECRET=your_jwt_secret
PORT=3000

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

2. Create a `.env` file in the frontend directory:

```
VITE_API_URL=http://localhost:3000/api
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Installation and Development

1. Install dependencies:
```bash
npm install
```

2. Run the development servers:
```bash
# Run both frontend and backend
npm run dev

# Run only frontend
npm run dev:frontend

# Run only backend
npm run dev:backend
```

3. Access the application:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3000

### Database Setup

1. Connect to Supabase by clicking the "Connect to Supabase" button in the StackBlitz UI.
2. Apply the migrations:
```bash
npx supabase db push
```

## Deployment

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Set the following build settings:
   - Framework Preset: Vite
   - Build Command: `cd frontend && npm run build`
   - Output Directory: `frontend/dist`
3. Add environment variables:
   - `VITE_API_URL`: Your backend API URL
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

### Backend (Render)

1. Create a new Web Service in Render
2. Connect your GitHub repository
3. Use these settings:
   - Build Command: `npm install && npm run build`
   - Start Command: `node backend/dist/index.js`
4. Add all required environment variables
5. Set Auto-Deploy to Yes

## License

This project is licensed under the MIT License - see the LICENSE file for details.