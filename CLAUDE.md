# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production application
- `npm start` - Start production server
- `npm run lint` - Run ESLint with auto-fix

## Core Architecture

This is a Next.js 15 house points tracking system for Columbia Grammar & Preparatory School (CGPS) using the app directory structure.

### Key Technologies
- **Next.js 15** with app directory and Turbopack
- **NextUI v2** for UI components
- **Firebase Firestore** for database
- **Firebase Auth** for authentication
- **TailwindCSS** for styling
- **TypeScript** throughout

### Firebase Setup
Create a `.env` file with Firebase configuration variables. Firebase CLI is required globally:
```bash
npm install firebase -g
firebase init
```

### Data Models

**Core Entities:**
- `IndividualDocument` - Student records with points per category
- `HouseDocument` - House totals and rankings
- `PointCategory` - Dynamic point categories
- User authentication with roles: student, teacher, admin

**Collections:**
- `individuals` - Student data and points
- `houses` - House totals and metadata
- `pointCategories` - Configurable point categories
- `users` - Authentication and role management
- `futureHouseRoster` - Student roster for resets

### App Structure

**Main Routes:**
- `/` - Landing/home page
- `/dashboard` - User dashboard showing personal points
- `/admin` - Administrative interface
- `/auth` - Authentication pages
- `/spread/[houseColor]` - Dynamic house-specific pages

**Key Components:**
- `AuthProvider` - Authentication context wrapper
- `Navbar` - Main navigation with auth state
- Admin components for point management and user administration
- House leaderboards and student ranking components

### Authentication Flow
- Role-based access control (student/teacher/admin)
- Email-based role detection (emails with numbers = students)
- Admin privileges managed in Firestore

### Firebase Database Operations
Main functions in `firebase-configuration/firebaseDb.ts`:
- `fetchAllIndividuals()` - Get all student records
- `fetchAllHouses()` - Get house rankings
- `writeToIndividualData()` - Award points to students
- `writeToHouseData()` - Update house totals
- `resetDatabase()` - Reset all points for new term

### Dynamic Routing
- `[houseColor]` parameter for house-specific pages
- House colors: blue, gold, green, orange, pink, purple, red, silver