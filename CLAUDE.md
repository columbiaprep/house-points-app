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

## Critical Bug Fix History - Double-Counting Issue

### The Problem (Resolved 2025-10-01)
A critical double-counting bug was causing house `totalPoints` to be inflated by 1+ points.

**Root Cause:**
1. A `totalPoints` document existed in the `pointCategories` collection (it should NOT be there)
2. When `totalPoints` is treated as a regular point category, the system would:
   - Add points to the category field on the student
   - Add points to the `totalPoints` field on the student (lines 300-303 in firebaseDb.ts)
   - Add points to house `studentPoints` and house `totalPoints` in cachedFirebaseDb.ts
3. In `cachedFirebaseDb.ts` lines 141-144, the code was accumulating points to BOTH `studentPoints` AND `totalPoints` directly
4. This caused `totalPoints` to include the points twice

**Example of the bug:**
- Silver Knights had 99 actual student points + 69 bonus points = should be 168
- Database showed: studentPoints: 100, bonusPoints: 69, totalPoints: 169 (extra +1)

### The Fix
1. **Removed double-counting in cachedFirebaseDb.ts (lines 141-144):**
   - Removed code that was accumulating points directly to `totalPoints`
   - Now `totalPoints` is ONLY calculated as `studentPoints + bonusPoints` (line 175)

2. **Added RecalculateHouseTotals component:**
   - New admin UI component at `/components/Admin/RecalculateHouseTotals.tsx`
   - Added to admin panel at `/app/admin/page.tsx`
   - Allows admins to fix corrupted totals by recalculating from source data

### IMPORTANT: Prevention Rules
**⚠️ NEVER add `totalPoints` as a document in the `pointCategories` collection!**

- `totalPoints` should ONLY be a calculated/derived field
- It should equal the sum of all category points on students
- On houses, it should equal `studentPoints + bonusPoints`
- Valid point categories: academics, athletics, service, arts, etc. - but NOT totalPoints

### How `totalPoints` Should Work
**On Individual Students:**
- Each point category (academics, athletics, etc.) has its own field
- `totalPoints` = sum of all category fields
- Updated via `writeToIndividualData()` at lines 300-303 in firebaseDb.ts

**On Houses:**
- `studentPoints` = sum of all individual student points across all categories
- `bonusPoints` = points awarded to the house (not individuals), stored in subcollection
- `totalPoints` = studentPoints + bonusPoints
- Updated via `writeToHouseData()` at lines 352-355 in firebaseDb.ts

### Debugging Tools
- `debug-check.ts` - Script to verify point totals match between individuals and houses
- Admin panel "Recalculate House Totals" button - Fixes corrupted totals
- `recalculateHouseTotals()` function in firebaseDb.ts - Recalculates from source data