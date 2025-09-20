# Claude.md

> Operator: Claude
> Purpose: Serve as project assistant to manage `todo.md` and `changelog.md` based on the app's evolving features.

---

## Project Overview

SachivJi is designed for rural and economically disadvantaged people in India to navigate government services more effectively. The core features are:

1. **Government Scheme Recommendations**:
   - Users answer demographic questions (age, gender, state, category)
   - App suggests relevant government schemes based on eligibility criteria
   - **Status**: ✅ Frontend UI complete with mock data

2. **Financial Advice Chatbot**:
   - Interactive chat providing personalized financial advice
   - Covers income, savings, loans, and expense management
   - **Status**: ✅ Frontend UI complete with conversation flow

3. **Review System for Public Services**:
   - Users review government service experiences and rate 0-10
   - Document corruption, required documents, and service quality
   - **Status**: ✅ Frontend UI complete with review forms and display

---

## Tech Stack

### Frontend (✅ Complete)
- **Framework**: React 18.3.1 + TypeScript
- **Build Tool**: Vite 5.4.19
- **UI Library**: Radix UI + shadcn/ui components
- **Styling**: Tailwind CSS with custom theme for government services
- **State Management**: TanStack Query (React Query) + React hooks
- **Routing**: React Router DOM v6
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Development**: ESLint, TypeScript, SWC

### Backend (🔴 Not Started)
- **Target**: Node.js + Express/Fastify
- **Database**: SQLite (planned)
- **Auth**: Email/password authentication
- **API**: RESTful API for schemes, chat, reviews

### Development Commands
```bash
cd frontend/
npm run dev      # Start development server
npm run build    # Production build
npm run lint     # Code linting
npm run preview  # Preview production build
```

---

## Current Implementation Status

### Frontend Structure
```
frontend/src/
├── components/
│   ├── ui/           # shadcn/ui components (50+ components)
│   ├── Layout.tsx    # Main app layout with bottom navigation
│   └── BottomNavigation.tsx  # Mobile-first navigation
├── pages/
│   ├── Login.tsx     # Authentication (UI only)
│   ├── Signup.tsx    # Registration (UI only)
│   ├── Schemes.tsx   # Government scheme finder
│   ├── Chatbot.tsx   # Financial advice chat
│   ├── Reviews.tsx   # Service review system
│   └── Profile.tsx   # User profile management
├── hooks/            # Custom React hooks
├── lib/              # Utilities and configurations
└── App.tsx           # Main app with routing
```

### Features Ready for Backend Integration
1. **Schemes Page**: Form collection → API endpoint needed for scheme matching
2. **Chatbot**: Chat interface → AI/rule-based response API needed
3. **Reviews**: Review submission/display → CRUD API for reviews needed
4. **Auth**: Login/signup forms → Authentication API needed

### Next Major Milestones
- 🎯 **Backend API Development** (P0 - Critical)
- 🎯 **Database Schema & Models** (P0 - Critical)
- 🎯 **Authentication System** (P1 - High)
- 🎯 **Government Scheme Database** (P1 - High)
- 🎯 **AI/NLP for Financial Chat** (P2 - Normal)

---

## Standing Orders for Claude

1. **Manage `todo.md`**  
   - Maintain all tasks related to the three core features above.
   - Use statuses (`backlog | ready | in-progress | blocked | review | done`) and priorities (`P0 | P1 | P2 | P3`).
   - Ensure sections like “Now / Next / Later” remain up-to-date.

2. **Manage `changelog.md`**  
   - Record all notable changes using [Keep a Changelog] style.
   - Add entries for new features (like the scheme recommender, chatbot, and review system), changes, and fixes.

3. **Daily Updates**  
   - Reconcile new commits or merged PRs into `todo.md` and `changelog.md`.
   - Keep high-priority tasks in the “Next” lane and note any blocked items.

---

## Operating Guidelines

- **Precision**: Don’t invent tasks. Propose them in a “Suggested” section and await approval before adding them to the backlog.
- **Link PRs/Commits**: Always include references to PR numbers and commit SHAs in both `todo.md` and `changelog.md`.
- **On Request**: When maintainers ask to sync tasks or prepare a release, update both files and summarize the changes.
