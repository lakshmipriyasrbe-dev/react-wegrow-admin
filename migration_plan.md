# WeGrow ERP - Migration Plan (PHP/MySQL to React/FastAPI/PostgreSQL)

## 1. Executive Summary
This document defines the complete architecture, module breakdown, database mappings, business logic specifications, and implementation status for migrating the legacy WeGrow Skill Campus ERP (`http://localhost/priya/adminv1/`) to a modern decoupled stack:
- **Frontend**: React 18, Vite, React Router v6, Axios, Custom CSS & Tailwind UI Design Tokens (styled after the institutional ERP theme).
- **Backend**: Python 3.10+, FastAPI, Pydantic v2, SQLAlchemy 2.0 (Async/Sync), Alembic.
- **Database**: PostgreSQL 14+ (Converted from MariaDB/MySQL `training_center_db`).

---

## 2. Architecture Comparison

| Aspect | Legacy System (PHP) | New System (React + FastAPI + PostgreSQL) |
| :--- | :--- | :--- |
| **Architecture** | Monolithic PHP with direct SQL queries | Clean Decoupled Client-Server REST API |
| **Frontend** | Server-rendered HTML + jQuery + AJAX | React 18 SPA with React Router & Axios |
| **UI Aesthetics** | Legacy Bootstrap/AdminLTE mix | Modern Enterprise Dark/Light Glassmorphism Theme (Plus Jakarta Sans) |
| **Backend** | Procedural/OOP PHP with PDO | High-performance FastAPI with Pydantic & Dependency Injection |
| **ORM / Data Layer** | Custom SQL queries / Basic_Functions | SQLAlchemy 2.0 Declarative Models & Repository Pattern |
| **Database** | MySQL / MariaDB (`training_center_db`) | PostgreSQL 14+ with strict types, indexes, and constraints |
| **Authentication** | PHP `$_SESSION` cookie-based | Secure JWT (JSON Web Tokens) with RBAC & bcrypt hashing |
| **Reports** | Custom PHP loops & raw tables | Dynamic REST endpoints with Excel/CSV & PDF export capability |
| **Integrations** | Hard-coded PHP WhatsApp API calls | Modular FastAPI Service with environment variable secrets |

---

## 3. Module Mapping & Status Table

| Module Name | Old PHP File(s) | Old Database Table(s) | Business Logic & Calculations | New React Page | New FastAPI API | New PostgreSQL Table | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Authentication** | `index.php`, `process_login.php`, `logout.php` | `tc_users`, `tc_staff`, `tc_enrollment`, `tc_logins` | Bcrypt password check, Multi-role lookup (Admin/Staff/Student), Audit logging | `/login` | `/api/auth/login`, `/api/auth/me`, `/api/auth/logout` | `tc_users`, `tc_logins` | **MIGRATED** |
| **Dashboard** | `dashboard.php`, `director_dashboard.php` | `tc_enrollment`, `tc_payment`, `tc_staff`, `tc_tasks`, `tc_course` | Live KPI counts, Revenue totals, Balance sums, Monthly trends, Branch filters | `/dashboard` | `/api/dashboard/stats`, `/api/dashboard/charts` | Multi-table aggregations | **MIGRATED** |
| **Roles & Permissions** | `role.php`, `role_action.php`, `role_save.php` | `tc_roles`, `tc_role_permissions` | Granular Add/Edit/View/Delete permissions per module & hierarchy | `/roles` | `/api/roles`, `/api/roles/{id}/permissions` | `tc_roles`, `tc_role_permissions` | **MIGRATED** |
| **User Management** | `users.php`, `user_action.php` | `tc_users`, `tc_company` | Admin user CRUD, status toggle, company/branch association | `/users` | `/api/users`, `/api/users/{id}` | `tc_users` | **MIGRATED** |
| **Staff Management** | `staff.php`, `staff_action.php`, `my_profile.php` | `tc_staff`, `tc_roles`, `tc_course` | Staff profile, role assignment, salary tracking, branch mapping | `/staff` | `/api/staff`, `/api/staff/{id}` | `tc_staff` | **MIGRATED** |
| **Course Management** | `course.php`, `course_action.php` | `tc_course` | Course categories, fees, duration, active status | `/courses` | `/api/courses`, `/api/courses/{id}` | `tc_course` | **MIGRATED** |
| **Course Enquiries** | `course_enquiry.php`, `other_enquiry.php`, `enquiry_followup.php` | `tc_course_enquiry`, `tc_enquiry_followup` | Lead tracking, follow-up logs, status pipeline | `/enquiries` | `/api/enquiries`, `/api/enquiries/{id}/followups` | `tc_course_enquiry`, `tc_enquiry_followup` | **MIGRATED** |
| **Student Enrollment** | `enrollment.php`, `enrollment_action.php` | `tc_enrollment`, `tc_installments` | Training enrollment, fees calculation, installment auto-generation | `/enrollments` | `/api/enrollments`, `/api/enrollments/{id}` | `tc_enrollment`, `tc_installments` | **MIGRATED** |
| **Internship Enrollment** | `enrollment_internship.php`, `enrollment_internship_action.php` | `tc_enrollment_internship` | College/academic internship details, duration, stipend/fees | `/enrollments/internship` | `/api/enrollments/internship` | `tc_enrollment_internship` | **MIGRATED** |
| **Fee Receipts & Payments** | `receipt.php`, `receipt_action.php`, `rpt_receipt_a5.php` | `tc_payment`, `tc_enrollment`, `tc_installments`, `tc_bank` | Exact payment balance reduction, installment clearance, printable receipt | `/payments` | `/api/payments`, `/api/payments/{id}/receipt` | `tc_payment`, `tc_installments` | **MIGRATED** |
| **Installment Reminders** | `installment_reminders.php`, `installment_followup.php` | `tc_installments`, `tc_installment_followup_history` | Due date tracking, overdue alerts, payment follow-up logs | `/installments` | `/api/installments/reminders`, `/api/installments/followups` | `tc_installments`, `tc_installment_followup_history` | **MIGRATED** |
| **Staff Attendance** | `attendance.php`, `attendance_action.php` | `tc_attendance` | Daily check-in/out, Present/Absent/Late/Half-day marking | `/attendance/staff` | `/api/attendance/staff`, `/api/attendance/staff/bulk` | `tc_attendance` | **MIGRATED** |
| **Student Attendance** | `student_attendance.php`, `student_attendance_action.php` | `tc_student_attendance` | Batch-wise student attendance recording | `/attendance/students` | `/api/attendance/students` | `tc_student_attendance` | **MIGRATED** |
| **Leave Management** | `apply_leave.php`, `leave_approval.php`, `leave_history.php` | `tc_staff_leave_requests` | Leave requests, manager approval/rejection workflow, balance check | `/leaves` | `/api/leaves`, `/api/leaves/{id}/approve` | `tc_staff_leave_requests` | **MIGRATED** |
| **Payroll & Salary** | `payroll.php`, `payroll_action.php`, `my_payslips.php` | `tc_payroll`, `tc_staff`, `tc_attendance` | Basic salary, allowances, deductions, net salary calculation | `/payroll` | `/api/payroll`, `/api/payroll/generate` | `tc_payroll` | **MIGRATED** |
| **Expenses & Accounts** | `expense_entry.php`, `expense_category.php`, `bank.php` | `tc_expense_entry`, `tc_expense_category`, `tc_bank`, `tc_payment_mode` | Expense recording, category breakdown, bank account reconciliation | `/expenses` | `/api/expenses`, `/api/banks`, `/api/payment-modes` | `tc_expense_entry`, `tc_bank` | **MIGRATED** |
| **Tasks & Daily Logs** | `tasks.php`, `student_tasks.php`, `daily_report.php` | `tc_tasks`, `tc_student_tasks`, `tc_daily_reports`, `tc_student_daily_reports` | Task assignment, progress updates, trainer remarks, daily work logs | `/tasks` | `/api/tasks`, `/api/daily-reports` | `tc_tasks`, `tc_student_tasks`, `tc_daily_reports` | **MIGRATED** |
| **Feedback System** | `student_feedback.php`, `feedback_review.php` | `tc_student_feedback` | Rating, priority, issues description, manager review/resolution | `/feedback` | `/api/feedback`, `/api/feedback/{id}/review` | `tc_student_feedback` | **MIGRATED** |
| **Question Bank & Tests** | `questions.php`, `my_tests.php`, `my_test_screen.php` | `tc_questions`, `tc_question_sets`, `tc_test_attempts`, `tc_test_answers` | MCQs creation, automated scoring, online test runner | `/questions`, `/tests` | `/api/questions`, `/api/tests/submit` | `tc_questions`, `tc_test_attempts` | **MIGRATED** |
| **Events Management** | `event.php`, `event_category.php` | `tc_event`, `tc_event_category` | Event scheduling, venue, organizer, student participation | `/events` | `/api/events` | `tc_event`, `tc_event_category` | **MIGRATED** |
| **Placement & Offers** | `offer.php`, `offer_action.php`, `report_placement.php` | `tc_offer`, `tc_enrollment` | Offer letter generation, package details, placement tracking | `/placements` | `/api/placements`, `/api/placements/{id}` | `tc_offer` | **MIGRATED** |
| **Reports Suite** | `report_*.php` (12+ report files) | Multi-table joins | Fee collection, Course progress, GST invoice, Staff payroll, Attendance logs | `/reports` | `/api/reports/*` | Optimized aggregations | **MIGRATED** |
| **WhatsApp Campaigns** | `send_enquiry_whatsapp.php`, `campaign` | External WhatsApp Gateway | Template messaging, contact filtering, delivery logging | `/campaigns` | `/api/campaigns/send` | `tc_audit_logs` | **MIGRATED** |

---

## 4. Security & Data Integrity Rules
1. Passwords hashed using `passlib.context.CryptContext(schemes=["bcrypt"])`.
2. All financial balances (Fees, Paid, Balance, Expense, Salary) use `NUMERIC(12, 2)` to eliminate floating-point rounding errors.
3. Soft deletion (`deleted = 0` / `deleted = 1`) preserved across all operations.
4. CORS configured specifically for local Vite React frontend (`http://localhost:5173`).
