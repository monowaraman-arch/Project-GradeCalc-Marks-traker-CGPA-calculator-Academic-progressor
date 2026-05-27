# GradeCalc
 
**Grade Smarter - Track Marks, Calculate CGPA, and Manage Academic Progress**

GradeCalc is a student grade calculator web application built with Next.js. It helps students manage courses, enter marks, calculate grades, track current semester CGPA, estimate all-time CGPA, and export academic reports.

The app stores data in the browser using localStorage, so it can run as a simple frontend website without a separate backend or database.

## Features

### Dashboard

- Shows total courses, total credits, current semester CGPA, and all-time CGPA.
- Displays warnings when courses are not ready to be included in CGPA.
- Allows users to enter previous CGPA and completed credits for all-time CGPA calculation.
- Shows a summary table of all courses.

### Course Management

- Add, edit, and delete courses.
- Store course code, title, credit hours, faculty name, and semester.
- View course details individually.
- Supports both marks-based calculation and manual demo grade mode.

### Marks and Components

- Add custom grading components such as attendance, quizzes, assignments, midterm, and final exam.
- Set percentage weight for each component.
- Add multiple mark items under each component.
- Enter obtained marks and total marks for each item.
- Detects missing marks, invalid marks, and component weight issues.

### Calculation Rules

Each course component can use a different calculation rule:

- Direct Entry: calculates score from total obtained marks and total possible marks.
- Sum: sums all item marks and divides by total possible marks.
- Average: averages individual item percentages.
- Best N of M: counts only the best selected number of scores.
- Drop Lowest: removes the lowest score before calculating the average.

### Demo Grade Mode

- Allows users to select an expected letter grade instead of entering full marks.
- Uses the selected grade point directly for CGPA calculation.
- Keeps saved marks available if the user later switches back to marks-based calculation.

### Grading System

- Customize grade rules.
- Add, edit, and delete letter grades.
- Configure percentage ranges, descriptions, and grade points.
- Shows validation messages for overlapping, missing, or unusual grade ranges.

### Report Page

- Generates a semester grade report.
- Shows course results, grade points, weighted grade points, and CGPA summary.
- Supports printing the report.
- Supports downloading the report as a CSV file.

### Data Management

- Export all app data as a JSON backup.
- Import data from a previous JSON backup.
- Reset the app to default sample data.
- Clear all courses and start fresh.

### Responsive Interface

- Works on desktop and mobile screens.
- Includes a desktop navigation bar and mobile slide-out menu.
- Uses reusable UI components for cards, tables, dialogs, buttons, inputs, and alerts.

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Radix UI / shadcn-style components
- Lucide React icons
- Browser localStorage for persistence

## Project Structure

```text
app/                  Application routes and pages
components/           Reusable UI and feature components
components/ui/        Shared UI primitives
hooks/                App state and custom hooks
lib/                  Types, storage, calculations, and utilities
public/               Static assets and icons
styles/               Additional global styles
```

## How to Run the Website Locally

### 1. Install Node.js

Install Node.js if it is not already installed. A recent LTS version is recommended.

### 2. Install Dependencies

From the project folder, run:

```bash
npm install
```

### 3. Start the Development Server

Run:

```bash
npm run dev
```

If you are using Windows PowerShell and see an error about `npm.ps1` or running scripts being disabled, use this command instead:

```bash
npm.cmd run dev
```

You can also run the same command through Command Prompt:

```bash
cmd /c npm run dev
```

### 4. Open the Website

Open this URL in your browser:

```text
http://localhost:3000
```

If port `3000` is already in use, Next.js will show another available local URL in the terminal.

## Build for Production

To create a production build, run:

```bash
npm run build
```

To start the production server after building:

```bash
npm run start
```

## Available Scripts

```bash
npm run dev      # Start the local development server
npm run build    # Create a production build
npm run start    # Start the production server
npm run lint     # Run linting, if ESLint is installed/configured
```

## Notes

- Data is saved only in the browser where the app is used.
- Clearing browser storage may remove saved courses and settings.
- Use the export feature to keep a backup of important grade data.
- The app uses Google-hosted fonts through Next.js, so production builds may need internet access the first time fonts are fetched.
