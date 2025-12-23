Project Specification: Online Exam Platform (Windows Local)
1. Project Context & Deployment
Project Name: Local Online Exam System

Purpose: Web-based examination platform for internal use.

Target Deployment: Windows Server / Windows 10/11 (Local LAN).

Base URL: http://192.168.50.53

Port: 3000 (Node.js default).

Environment: Node.js LTS on Windows.

2. Tech Stack & Constraints
Framework: Next.js 14+ (App Router).

Language: TypeScript.

Styling: Tailwind CSS + shadcn/ui.

Database:

Option A (Recommended): PostgreSQL for Windows.

Option B (Simple): SQLite.

ORM: Prisma.

Auth: NextAuth.js (Database Strategy).

File Handling (Windows Specific):

Use Node.js path module strictly for cross-platform compatibility.

Storage: Local disk (e.g., project root public/uploads).

Word to PDF Conversion: If implemented server-side, must point to local LibreOffice executable.

3. Data Model (Prisma Schema Reference)
AI should assume the following schema structure for logic generation:


enum Role {
  ADMIN   // Teacher
  STUDENT
}

enum QuestionType {
  SINGLE_CHOICE
  MULTIPLE_CHOICE
  TRUE_FALSE
  SHORT_ANSWER
}

model User {
  id        String   @id @default(cuid())
  username  String   @unique
  password  String   // Hashed
  name      String
  role      Role     @default(STUDENT)
  exams     ExamSubmission[]
}

model Exam {
  id          String   @id @default(cuid())
  title       String
  filePath    String   // Relative path to the PDF/Word file (e.g., /uploads/test.pdf)
  duration    Int      // Minutes
  totalScore  Int
  createdAt   DateTime @default(now())
  
  // The answer sheet structure defined by the teacher
  questions   Question[] 
  submissions ExamSubmission[]
}

model Question {
  id          String       @id @default(cuid())
  examId      String
  exam        Exam         @relation(fields: [examId], references: [id])
  order       Int
  type        QuestionType
  points      Int
  content     String?      // Optional text content
  correctAnswer String?    // For auto-grading
}

model ExamSubmission {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  examId      String
  exam        Exam     @relation(fields: [examId], references: [id])
  status      String   // PENDING, SUBMITTED, GRADED
  score       Int?
  submittedAt DateTime @default(now())
  answers     StudentAnswer[]
}

model StudentAnswer {
  id           String         @id @default(cuid())
  submissionId String
  submission   ExamSubmission @relation(fields: [submissionId], references: [id])
  questionId   String
  question     Question       @relation(fields: [questionId], references: [id])
  answerValue  String         // Student's answer
  isCorrect    Boolean?       // Auto-graded
  scoreObtained Int?
  teacherComment String?
}
4. Application Architecture
4.1. Teacher Dashboard (/dashboard)
File Upload Logic:

Receive FormData.

Save file using fs.writeFileSync.

Important: Sanitize filenames to remove Windows illegal characters (< > : " / \ | ? *).

Store relative path in DB.

4.2. Student Portal (/exam)
PDF Viewer: Use react-pdf.

Note for AI: Ensure pdf.worker.min.js configuration is compatible with local Windows network serving.

5. Implementation Details for AI Generation (Windows Specific)
Path Normalization:

Always use path.join() and path.resolve().

Environment Variables:

Load .env using standard Next.js support.

Network Access:

Ensure the Next.js server binds to 0.0.0.0 (not just localhost) to be accessible via 192.168.50.53.

6. Windows Deployment Instructions (For AI to generate setup scripts)
Startup Script: Use package.json script: "start": "next start -H 0.0.0.0 -p 3000".

Firewall: Open TCP Port 3000 on Windows Defender Firewall for inbound traffic.

7. Environment Variables (.env.local)

# Database
DATABASE_URL="postgresql://postgres:admin123@localhost:5432/exam_db"

# Auth
# MUST match the LAN IP for authentication to work on other devices
NEXTAUTH_URL="http://192.168.50.53:3000"
NEXTAUTH_SECRET="[GENERATE_RANDOM_STRING]"

# Windows Specific Config
UPLOAD_DIR="./public/uploads"

8. Detailed Functional Modules (Instruction for AI)
8.1. Authentication Flow
Roles: Admin (Teacher), Student.

Logic: * On login, check user.role.

If ADMIN, redirect to /dashboard/overview.

If STUDENT, redirect to /exam.

8.2. Exam Creation & Paper Upload (Teacher)
Path: /dashboard/exams/create

Process:

Metadata: Input Title, Duration, and Total Score.

File Upload: Upload .pdf or .docx. Save to public/uploads/.

Answer Sheet Config: * Dynamic form to add questions.

Each question must have a type (Select, Text, etc.), points, and correctAnswer (for auto-grading).

The system associates these "slots" with the uploaded file.

8.3. Exam Taking Interface (Student)
Path: /exam/[examId]/take

UI Layout: * Left Side (File Viewer): Display the uploaded PDF/Word content. Students read questions from here.

Right Side (Digital Answer Sheet): A scrollable form containing the "slots" defined by the teacher.

Features:

Auto-Save: Sync current answers to localStorage or StudentAnswer table every 60 seconds.

Timer: Display remaining time. Auto-submit when time hits 0.

8.4. Grading & Dashboard (Teacher)
Auto-Grading: Upon student submission, compare answerValue with correctAnswer for SINGLE_CHOICE and TRUE_FALSE. Update isCorrect and scoreObtained automatically.

Manual Grading: * Teacher views SHORT_ANSWER questions.

Inputs scoreObtained and optional teacherComment.

Analytics: Show a bar chart of score distributions using Recharts or similar.

8.5. Windows Specific Operations
Path Handling: When AI generates file-saving code, it must use path.join(process.cwd(), 'public', 'uploads').

Access: Use 0.0.0.0 as host in the start script to ensure the server is discoverable at 192.168.50.53.