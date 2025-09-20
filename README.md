# SachivJi 🇮🇳

**Your trusted financial guide for rural India**

SachivJi is a comprehensive financial literacy and government services platform designed specifically for rural and economically disadvantaged communities in India. The platform helps users navigate government schemes, get personalized financial advice, take educational quizzes, and share service experiences.

## ✨ Features

### 🏛️ Government Scheme Finder
- **Smart Matching**: Find relevant government schemes based on age, gender, state, and category
- **Eligibility Checker**: Automated eligibility verification for various welfare programs
- **Detailed Information**: Comprehensive scheme details, benefits, and application processes

### 💰 AI-Powered Financial Advisor
- **Personal Finance Chat**: Interactive AI chatbot for budgeting, savings, and investment advice
- **Contextual Suggestions**: Smart suggestions based on conversation history
- **India-Specific Guidance**: Tailored advice for Indian financial ecosystem

### 🧠 Financial Literacy Quiz
- **AI-Generated Questions**: Dynamic quiz questions using Google Gemini AI
- **Progressive Difficulty**: Adaptive questions based on user performance
- **Points & Achievements**: Gamified learning with leaderboards and streaks
- **Cultural Context**: Questions relevant to Indian financial scenarios

### 📝 Service Review System
- **Community Reviews**: Rate and review government service experiences
- **Quality Tracking**: Help improve service delivery through user feedback
- **Transparency**: Document service quality and corruption issues

### 🎤 Voice Navigation
- **Hands-Free Navigation**: Voice commands for easy app navigation
- **Multilingual Support**: Works in both English and Hindi
- **Accessibility**: Designed for users with limited literacy

### 🌐 Responsive Design
- **Mobile-First**: Optimized for smartphones and basic devices
- **Desktop Compatible**: Full desktop experience with enhanced layouts
- **Offline-Ready**: Progressive Web App features for low connectivity areas

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 5.4.19
- **UI Library**: Radix UI + shadcn/ui components
- **Styling**: Tailwind CSS with custom theme
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router DOM v6
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: SQLite with async/await patterns
- **Authentication**: JWT-based authentication
- **AI Integration**: Google Gemini AI for chat and quiz generation
- **API**: RESTful API with comprehensive validation
- **Security**: Helmet, CORS, input sanitization

### Development Tools
- **Code Quality**: ESLint, TypeScript
- **Version Control**: Git with structured commits
- **Package Management**: npm

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Git
- Google Gemini API key (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/SachivJi.git
   cd SachivJi
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install

   # Create environment file
   cp .env.example .env
   # Add your GEMINI_API_KEY to .env file

   # Start backend server
   npm start
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install

   # Start development server
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5001

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# AI Service
GEMINI_API_KEY=your_gemini_api_key_here

# Database
DB_PATH=./database/sachivji.db

# Security
JWT_SECRET=your_secure_jwt_secret_here
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get user profile
- `POST /api/auth/logout` - User logout

### Chat Endpoints
- `POST /api/chat/send` - Send message to AI advisor
- `GET /api/chat/shortcuts` - Get contextual shortcuts
- `GET /api/chat/conversations` - Get user conversations
- `GET /api/chat/conversations/:id` - Get specific conversation
- `DELETE /api/chat/conversations/:id` - Delete conversation

### Quiz Endpoints
- `GET /api/quiz/questions` - Get quiz questions (AI-generated or database)
- `POST /api/quiz/submit` - Submit quiz results
- `GET /api/quiz/history` - Get user quiz history
- `GET /api/quiz/stats` - Get user quiz statistics
- `GET /api/quiz/leaderboard` - Get quiz leaderboard

### Health Check
- `GET /api/health` - API health status

## 🎤 Voice Commands

### Navigation Commands
- "Go to schemes" - Navigate to government schemes page
- "Go to financial advisor" - Open financial chatbot
- "Go to quiz" - Navigate to quiz page
- "Go to reviews" - Open service reviews page
- "Go to profile" - Navigate to profile page
- "Go home" - Return to home page

### Schemes Page Commands
- "I am [age] years old" - Set your age
- "I am male/female" - Set your gender
- "I am from [state]" - Set your state
- "Submit form" - Find matching schemes
- "Clear form" - Reset the form

### General Commands
- "Help" - Get voice commands help
- "Scroll up/down" - Page navigation
- "Go back" - Previous page
- "Refresh" - Reload page
- "Read page" - Read content aloud

## 🏗️ Project Structure

```
SachivJi/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities and API client
│   │   └── contexts/       # React contexts
│   ├── public/             # Static assets
│   └── package.json
├── backend/                 # Node.js backend API
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── models/         # Data models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Express middleware
│   │   ├── services/       # Business logic
│   │   └── config/         # Configuration files
│   ├── database/           # SQLite database
│   └── package.json
├── CLAUDE.md              # Project documentation for AI assistant
└── README.md              # This file
```

## 🌟 Key Features in Detail

### Government Scheme Finder
The scheme finder uses a comprehensive form to collect user demographics and matches them against a database of government welfare programs. Users can filter by category, state, and eligibility criteria.

### AI Financial Advisor
Powered by Google Gemini AI, the financial advisor provides:
- Personalized budgeting advice
- Investment recommendations for rural contexts
- Loan and credit guidance
- Government scheme suggestions
- Tax planning assistance

### Financial Literacy Quiz
The quiz system features:
- AI-generated questions with cultural relevance
- Progressive difficulty based on performance
- Points and achievement system
- Leaderboards for community engagement
- Detailed explanations for learning

### Voice Navigation
Advanced voice features include:
- Web Speech API integration
- Multilingual command recognition
- Text-to-speech feedback
- Page-specific voice shortcuts
- Accessibility-focused design

## 🔧 Development

### Frontend Development
```bash
cd frontend
npm run dev      # Start development server
npm run build    # Production build
npm run lint     # Code linting
npm run preview  # Preview production build
```

### Backend Development
```bash
cd backend
npm start        # Start server
npm run dev      # Development with auto-reload
npm test         # Run tests (when available)
```

### Database Management
The SQLite database is automatically initialized with the required schema. To reset or seed data:

```bash
# From backend directory
node -e "require('./src/models/Quiz.js').Quiz.seedQuestions()"
```

## 🚀 Deployment

### Frontend Deployment (Netlify/Vercel)
1. Build the project: `npm run build`
2. Deploy the `dist` folder
3. Configure environment variables for API endpoints

### Backend Deployment (Railway/Heroku)
1. Set environment variables
2. Ensure database persistence
3. Configure CORS for production domain

### Environment Setup
- Set `NODE_ENV=production`
- Configure production API endpoints
- Set up proper CORS origins
- Enable HTTPS for voice features

## 🤝 Contributing

We welcome contributions to make SachivJi better for rural India!

### Getting Started
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Add tests if applicable
5. Commit with descriptive messages
6. Push to your fork
7. Create a Pull Request

### Code Style
- Follow existing TypeScript/JavaScript patterns
- Use meaningful variable and function names
- Add comments for complex logic
- Maintain responsive design principles
- Ensure accessibility compliance

### Reporting Issues
- Use GitHub Issues for bug reports
- Include detailed reproduction steps
- Provide browser/device information
- Attach screenshots if helpful

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Rural Communities**: For inspiring this project
- **Government of India**: For welfare scheme data
- **Google Gemini AI**: For AI-powered features
- **Open Source Community**: For the amazing tools and libraries

## 📞 Support

For support, feature requests, or questions:
- 📧 Email: [your-email@example.com]
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/SachivJi/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/your-username/SachivJi/discussions)

---

**Made with ❤️ for rural India 🇮🇳**

*Empowering communities through technology and financial literacy*