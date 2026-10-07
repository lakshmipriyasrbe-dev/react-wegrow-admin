# WeGrow ERP - Migration Checklist

## Core Infrastructure
- [x] Old PHP and MariaDB files analyzed completely (`priya/adminv1`)
- [x] All 43 database tables mapped and converted to PostgreSQL DDL (`db.txt` and `database/schema/db.sql`)
- [x] MySQL to PostgreSQL automated migration utility implemented (`database/migration/migrate_mysql_to_postgres.py`)
- [x] FastAPI backend foundation created with SQLAlchemy 2.0 and Pydantic v2
- [x] React 18 + Vite frontend initialized with modular architecture
- [x] UI design system integrated with Plus Jakarta Sans & JetBrains Mono typography matching `index.html`

## Module-by-Module Verification
- [x] **Authentication & Session**: Login, token verification, current user profile, logout
- [x] **Dashboard**: Financial overview, student counts, enrollment trends, recent activity
- [x] **Role & Permissions**: Dynamic role-based access control matrix
- [x] **User Management**: Admin accounts, status toggles, branch assignment
- [x] **Staff Management**: Trainer directory, salary records, designation, qualification
- [x] **Course Management**: Course curriculum, fees structure, duration
- [x] **Enquiry & Follow-up**: Admission enquiries, lead pipeline, follow-up scheduler
- [x] **Student Enrollment**: Training and Internship admissions with automated installments
- [x] **Fee Receipts & Accounting**: Payment collection, receipt generation, balance adjustment
- [x] **Installment Reminders**: Due date notifications, payment reminder history
- [x] **Attendance System**: Staff and Student daily attendance logs
- [x] **Leave Management**: Leave application and manager approval workflow
- [x] **Payroll Management**: Monthly salary computation, deductions, payslips
- [x] **Expenses & Banking**: Expense categorization, vendor payments, bank accounts
- [x] **Task & Progress Logs**: Student assignments, daily learning logs, trainer remarks
- [x] **Feedback Review**: Student ratings, grievance reporting, management resolution
- [x] **Question Bank & Tests**: Online MCQ tests, automated grading, score history
- [x] **Events Management**: Campus workshops, webinars, guest lectures
- [x] **Placement & Offers**: Job placement tracking, salary package records, offer letters
- [x] **Reports Module**: Comprehensive analytics and Excel/CSV data exports
- [x] **WhatsApp Integration**: Secure backend campaign dispatcher
