# Evalora - Learning Assessment & Automated MCQ Grading System

**"Assess Smarter. Grade Faster."**

---

## Overview

Evalora is a modern web-based learning assessment platform designed to streamline the creation, administration, and grading of Multiple Choice Question (MCQ) examinations. The platform provides instant automated grading, detailed performance analytics, and a secure testing environment for academic institutions.

Built with React.js on the frontend and Node.js/Express with PostgreSQL on the backend, Evalora delivers a premium user experience with a warm, professional design that prioritizes usability and accessibility.

---

## How It Works

### For Students

1. **Registration & Login**
   - Create an account with your full name, matricule number, username, and password
   - Upload an optional profile picture to personalize your experience
   - Login with your matricule number and password

2. **Browse Available Assessments**
   - View all published assessments on your dashboard
   - Each assessment card displays the number of questions, duration, passing score, and remaining attempts
   - Search and filter assessments by title or description

3. **Take an Assessment**
   - Read the instructions carefully and acknowledge them before starting
   - Answer questions one at a time with a visible countdown timer
   - Navigate between questions using Previous/Next buttons or the quick navigation grid
   - Use keyboard shortcuts (Arrow keys for navigation, A/B/C/D for answer selection)
   - Submit when complete or let the timer auto-submit when time expires

4. **Instant Results & Review**
   - Receive your score immediately after submission
   - View detailed results showing correct, incorrect, and unanswered questions
   - Review answers with explanations (explanations are revealed after all attempts are exhausted to prevent cheating)
   - Track your performance over time with visual charts and statistics

5. **Progress Tracking**
   - Monitor your assessment history in the "My Results" section
   - View performance trends with interactive line charts
   - See your highest, lowest, and average scores at a glance

### For Instructors (Admin Panel)

1. **Assessment Management**
   - Create MCQ assessments with custom titles, descriptions, durations, and passing scores
   - Set maximum attempt limits per assessment
   - Publish or unpublish assessments to control student access
   - Edit assessments at any time (automatically resets attempts for fairness)

2. **Question Management**
   - Add individual questions with four options (A, B, C, D) and correct answers
   - Provide detailed explanations for each question to reinforce learning
   - Bulk import questions via CSV upload for faster setup
   - Edit or delete questions as needed

3. **Student Management**
   - View all registered students with their assessment statistics
   - Search students by name, matricule number, or username
   - View detailed student progress including performance charts and attempt history
   - Delete student accounts when necessary

4. **Results & Grading**
   - View all student submissions with scores and pass/fail status
   - Inspect detailed submission results showing each answer
   - Automated grading engine compares responses against answer keys

5. **Analytics & Reporting**
   - View platform statistics including total assessments, students, and pass rates
   - Analyze average scores per assessment with bar charts
   - Monitor pass/fail distribution with pie charts
   - Track submission trends over time with line charts
   - Identify most frequently missed questions for curriculum improvement
   - Generate downloadable PDF reports for students, assessments, or entire classes

6. **Attempt Management**
   - Reset all attempts for an assessment to allow students to retake
   - Attempts are automatically reset when an assessment is updated and republished
   - Set attempt limits to control how many times students can take each assessment

---

## Key Features

### Automated Grading System
- Instant scoring upon submission
- No manual grading required
- Detailed answer review with correct/incorrect indicators
- Explanations revealed after all attempts are used to prevent answer sharing

### Anti-Cheating Measures
- **Tab Switch Detection**: The system monitors when students leave the assessment tab
- **Violation Counter**: Students are warned after each tab switch
- **Auto-Submission**: After 3 tab switch violations, the assessment is automatically submitted
- **Hidden Corrections**: Correct answers and explanations are locked until all attempts are exhausted, preventing students from using review answers on retakes

### Timed Assessments
- Configurable countdown timer for each assessment
- Visual progress bar showing completion percentage
- Auto-submission when time expires
- Timer changes color (amber/red) when time is running low

### Attempt Management
- Configurable maximum attempts per assessment
- Attempt counter displayed on assessment cards
- Students cannot exceed the attempt limit
- "Take Another" button only appears if attempts remain
- Admins can reset all attempts with one click

### Bulk Question Import
- Downloadable CSV template for question creation
- Parse CSV files with proper handling of commas and quotes
- Validation of required fields and correct answer format
- Detailed import results showing successful and failed rows

### Responsive Design
- Mobile-friendly interface with hamburger menu navigation
- Responsive card layouts that adapt to screen size
- Floating navigation buttons on mobile for easy quiz navigation
- Touch-friendly answer selection

### Performance Analytics
- Interactive charts using Recharts library
- Bar charts for average scores per assessment
- Pie charts for pass/fail distribution
- Line charts for submission trends and individual performance
- Most missed questions identification

### PDF Report Generation
- Student performance reports with attempt history
- Assessment summary reports with all student results
- Class performance reports with comprehensive statistics

### Profile Management
- Upload profile pictures (circular display)
- Update full name and username
- Change password with current password verification

---

## User Interface

Evalora features a warm, professional design with:
- Warm cream background for reduced eye strain
- Terracotta and sage green accents for a natural, academic feel
- Clean card-based layouts with subtle shadows
- Fixed sidebar navigation for easy access to all sections
- Collapsible sidebar for more screen space
- Consistent typography and spacing throughout
- Smooth animations and transitions
- Accessible color contrast for readability

---

## Security Features

- **JWT Authentication**: Secure token-based authentication for all users
- **Password Hashing**: All passwords are hashed using bcrypt before storage
- **Protected Routes**: API endpoints are protected with authentication middleware
- **Token Expiration**: Automatic logout on token expiry
- **Attempt Limits**: Prevents unlimited assessment retakes
- **Anti-Cheating**: Tab switch detection and violation tracking
- **Hidden Corrections**: Explanations locked until attempts exhausted

---

## Technology Stack

**Frontend:**
- React.js with Vite
- Tailwind CSS for styling
- React Router DOM for navigation
- Axios for API communication
- Recharts for data visualization
- Lucide React for icons
- React Hot Toast for notifications

**Backend:**
- Node.js with Express.js
- PostgreSQL database
- JWT for authentication
- Bcrypt for password hashing
- PDFKit for report generation
- Multer for file uploads

**Deployment:**
- Frontend: Vercel
- Backend: Railway
- Database: Railway PostgreSQL

---

## Accessibility

- Keyboard navigation support during assessments
- Clear visual feedback for all actions
- High contrast text for readability
- Responsive design for all device sizes
- Toast notifications for important actions
- Modal confirmations for destructive actions

---

## Support

For technical support or feature requests, please contact your system administrator or the development team.

---

**Evalora - Assess Smarter. Grade Faster.**