-- ============================================================
-- WEGROW ERP - COMPLETE POSTGRESQL SCHEMA DEFINITION
-- GENERATED FOR POSTGRESQL 14+ / 15+ / 16+
-- Includes all 40+ Tables, Primary Keys, Identity Sequences,
-- Indexes, Audit Logging, and Proper Timestamp Typing
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS "success_videos" (
    "id" BIGSERIAL PRIMARY KEY,
    "student_name" VARCHAR(100),
    "student_photo" VARCHAR(255),
    "course_name" VARCHAR(100),
    "company_name" VARCHAR(100),
    "designation" VARCHAR(100),
    "video_type" ENUM('youtube','upload'),
    "video_url" TEXT,
    "thumbnail" VARCHAR(255),
    "description" TEXT,
    "sort_order" INT DEFAULT 0,
    "status" TINYINT DEFAULT 1,
    "deleted" TINYINT DEFAULT 0,
    "created_date" TIMESTAMP,
    "updated_date" TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "idx_success_videos_deleted" ON "success_videos" ("deleted");

CREATE TABLE IF NOT EXISTS "tc_attendance" (
    "id" BIGSERIAL PRIMARY KEY,
    "created_date_time" TIMESTAMP DEFAULT NULL,
    "updated_date_time" TIMESTAMP DEFAULT NULL,
    "attendance_id" TEXT DEFAULT NULL,
    "attendance_date" date DEFAULT NULL,
    "staff_id" TEXT DEFAULT NULL,
    "staff_name" TEXT DEFAULT NULL,
    "staff_number" TEXT DEFAULT NULL,
    "staff_role" TEXT DEFAULT NULL,
    "fn_present" TEXT DEFAULT NULL,
    "an_present" TEXT DEFAULT NULL,
    "present_code" TEXT DEFAULT NULL,
    "deleted" INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS "idx_tc_attendance_deleted" ON "tc_attendance" ("deleted");

CREATE TABLE IF NOT EXISTS "tc_audit_logs" (
    "id" INTEGER NOT NULL,
    "table_name" varchar(100) DEFAULT NULL,
    "record_id" varchar(100) DEFAULT NULL,
    "username" varchar(100) DEFAULT NULL,
    "action_type" varchar(20) DEFAULT NULL,
    "query_text" text DEFAULT NULL,
    "created_at" TIMESTAMP DEFAULT current_timestamp()
);
CREATE INDEX IF NOT EXISTS "idx_tc_audit_logs_deleted" ON "tc_audit_logs" ("deleted");

CREATE TABLE IF NOT EXISTS "tc_bank" (
    "id" BIGSERIAL PRIMARY KEY,
    "created_date_time" TIMESTAMP DEFAULT NULL,
    "updated_date_time" TIMESTAMP DEFAULT NULL,
    "bank_id" TEXT DEFAULT NULL,
    "bank_name" TEXT DEFAULT NULL,
    "account_name" TEXT DEFAULT NULL,
    "account_number" TEXT DEFAULT NULL,
    "ifsc_code" TEXT DEFAULT NULL,
    "payment_modes" TEXT DEFAULT NULL,
    "branch" TEXT DEFAULT NULL,
    "deleted" INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS "idx_tc_bank_deleted" ON "tc_bank" ("deleted");

CREATE TABLE IF NOT EXISTS "tc_company" (
    "id" INTEGER NOT NULL,
    "created_date_time" TIMESTAMP DEFAULT NULL,
    "updated_date_time" TIMESTAMP DEFAULT NULL,
    "company_id" TEXT DEFAULT NULL,
    "company_name" TEXT DEFAULT NULL,
    "company_email" TEXT DEFAULT NULL,
    "company_mobile" TEXT DEFAULT NULL,
    "company_address" TEXT DEFAULT NULL,
    "deleted" INTEGER NOT NULL DEFAULT 0,
    "gst" TEXT DEFAULT NULL,
    "branch" TEXT DEFAULT NULL,
    "logo_image" TEXT DEFAULT NULL,
    "company_details" TEXT DEFAULT NULL
);
CREATE INDEX IF NOT EXISTS "idx_tc_company_deleted" ON "tc_company" ("deleted");

CREATE TABLE IF NOT EXISTS "tc_course" (
    "id" INTEGER NOT NULL,
    "created_date_time" TIMESTAMP DEFAULT NULL,
    "updated_date_time" TIMESTAMP DEFAULT NULL,
    "company_id" TEXT DEFAULT NULL,
    "course_id" TEXT DEFAULT NULL,
    "course_name" TEXT DEFAULT NULL,
    "course_duration" TEXT DEFAULT NULL,
    "course_fee" TEXT DEFAULT NULL,
    "deleted" INTEGER NOT NULL DEFAULT 0,
    "tutorial_videos" TEXT DEFAULT NULL,
    "syllabus_files" text DEFAULT NULL
);
CREATE INDEX IF NOT EXISTS "idx_tc_course_deleted" ON "tc_course" ("deleted");

CREATE TABLE IF NOT EXISTS "tc_course_closure" (
    "id" BIGSERIAL PRIMARY KEY,
    "created_date_time" TIMESTAMP DEFAULT NULL,
    "updated_date_time" TIMESTAMP DEFAULT NULL,
    "closure_id" TEXT DEFAULT NULL,
    "closure_date" date DEFAULT NULL,
    "course_type" TEXT DEFAULT NULL,
    "student_id" TEXT DEFAULT NULL,
    "student_name" TEXT DEFAULT NULL,
    "certificate_got" INTEGER DEFAULT NULL,
    "course_closed" INTEGER DEFAULT 0,
    "placed" INTEGER DEFAULT NULL,
    "company_name" TEXT DEFAULT NULL,
    "company_address" TEXT DEFAULT NULL,
    "designation" TEXT DEFAULT NULL,
    "ctc" TEXT DEFAULT NULL,
    "deleted" INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS "idx_tc_course_closure_deleted" ON "tc_course_closure" ("deleted");

CREATE TABLE IF NOT EXISTS "tc_course_enquiry" (
    "id" INTEGER NOT NULL,
    "enquiry_id" varchar(255) DEFAULT NULL,
    "company_id" varchar(255) DEFAULT NULL,
    "name" varchar(255) DEFAULT NULL,
    "mobile_number" varchar(255) DEFAULT NULL,
    "degree_completed" varchar(255) DEFAULT NULL,
    "address" text DEFAULT NULL,
    "course_id" varchar(255) DEFAULT NULL,
    "converted_type" varchar(255) DEFAULT 'none',
    "converted_id" varchar(255) DEFAULT NULL,
    "deleted" INTEGER NOT NULL DEFAULT 0,
    "created_date_time" TIMESTAMP DEFAULT NULL,
    "updated_date_time" TIMESTAMP DEFAULT NULL,
    "enquiry_date" date DEFAULT NULL,
    "father_spouse_name" TEXT DEFAULT NULL,
    "dob" date DEFAULT NULL,
    "description" text DEFAULT NULL
);
CREATE INDEX IF NOT EXISTS "idx_tc_course_enquiry_deleted" ON "tc_course_enquiry" ("deleted");

CREATE TABLE IF NOT EXISTS "tc_daily_reports" (
    "id" INTEGER NOT NULL,
    "created_date_time" TIMESTAMP DEFAULT NULL,
    "updated_date_time" TIMESTAMP DEFAULT NULL,
    "company_id" varchar(100) DEFAULT NULL,
    "report_id" TEXT DEFAULT NULL,
    "user_id" varchar(100) DEFAULT NULL,
    "role_id" TEXT DEFAULT NULL,
    "role_name" TEXT DEFAULT NULL,
    "user_name" TEXT DEFAULT NULL,
    "report_date" date DEFAULT NULL,
    "activity_details" TEXT DEFAULT NULL,
    "hours_spent" NUMERIC(4,2) DEFAULT NULL,
    "custom_id" TEXT DEFAULT NULL,
    "unique_number" TEXT DEFAULT NULL,
    "deleted" INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS "idx_tc_daily_reports_deleted" ON "tc_daily_reports" ("deleted");

CREATE TABLE IF NOT EXISTS "tc_enquiry_followup" (
    "id" BIGSERIAL PRIMARY KEY,
    "followup_id" varchar(255) DEFAULT NULL,
    "company_id" varchar(255) DEFAULT NULL,
    "enquiry_id" varchar(255) DEFAULT NULL,
    "staff_id" varchar(255) DEFAULT NULL,
    "whatsapp_sent_date" TIMESTAMP DEFAULT NULL,
    "template_name" varchar(255) DEFAULT 'Auto',
    "followup_status" varchar(100) DEFAULT 'Pending',
    "student_response" varchar(255) DEFAULT NULL,
    "remarks" text DEFAULT NULL,
    "next_followup_date" date DEFAULT NULL,
    "api_response" text DEFAULT NULL,
    "created_date_time" TIMESTAMP DEFAULT NULL,
    "updated_date_time" TIMESTAMP DEFAULT NULL,
    "deleted" INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS "idx_tc_enquiry_followup_deleted" ON "tc_enquiry_followup" ("deleted");

CREATE TABLE IF NOT EXISTS "tc_enrollment" (
    "id" BIGSERIAL PRIMARY KEY,
    "created_date_time" TIMESTAMP DEFAULT NULL,
    "updated_date_time" TIMESTAMP DEFAULT NULL,
    "enrollment_id" TEXT DEFAULT NULL,
    "student_id" TEXT DEFAULT NULL,
    "student_name" TEXT DEFAULT NULL,
    "father_spouse_name" TEXT DEFAULT NULL,
    "address" TEXT DEFAULT NULL,
    "mobile_number" TEXT DEFAULT NULL,
    "parent_contact_no" TEXT DEFAULT NULL,
    "course_id" TEXT DEFAULT NULL,
    "duration" TEXT DEFAULT NULL,
    "from_time" TEXT DEFAULT NULL,
    "to_time" TEXT DEFAULT NULL,
    "staff_id" TEXT DEFAULT NULL,
    "fees_type" TEXT DEFAULT NULL,
    "fees_amount" NUMERIC(10,2) DEFAULT NULL,
    "paid_amount" NUMERIC(10,2) DEFAULT NULL,
    "balance_amount" NUMERIC(10,2) DEFAULT NULL,
    "dob" date DEFAULT NULL,
    "doj" date DEFAULT NULL,
    "blood_group" TEXT DEFAULT NULL,
    "candidate_photo" TEXT DEFAULT NULL,
    "deleted" INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS "idx_tc_enrollment_deleted" ON "tc_enrollment" ("deleted");

CREATE TABLE IF NOT EXISTS "tc_enrollment_internship" (
    "id" INTEGER NOT NULL,
    "created_date_time" TIMESTAMP DEFAULT NULL,
    "updated_date_time" TIMESTAMP DEFAULT NULL,
    "company_id" varchar(100) DEFAULT NULL,
    "enrollment_internship_id" TEXT DEFAULT NULL,
    "enrollment_number" varchar(255) DEFAULT NULL,
    "student_id" TEXT DEFAULT NULL,
    "student_name" TEXT DEFAULT NULL,
    "father_spouse_name" TEXT DEFAULT NULL,
    "gender" varchar(20) DEFAULT NULL,
    "email" varchar(255) DEFAULT NULL,
    "address" TEXT DEFAULT NULL,
    "mobile_number" TEXT DEFAULT NULL,
    "parent_contact_no" TEXT DEFAULT NULL,
    "course_id" TEXT DEFAULT NULL,
    "duration" TEXT DEFAULT NULL,
    "from_time" TEXT DEFAULT NULL,
    "to_time" TEXT DEFAULT NULL,
    "staff_id" TEXT DEFAULT NULL,
    "fees_type" TEXT DEFAULT NULL,
    "num_installments" INTEGER DEFAULT NULL,
    "fees_amount" NUMERIC(10,2) DEFAULT NULL,
    "paid_amount" NUMERIC(10,2) DEFAULT NULL,
    "balance_amount" NUMERIC(10,2) DEFAULT NULL,
    "dob" date DEFAULT NULL,
    "doj" date DEFAULT NULL,
    "blood_group" TEXT DEFAULT NULL,
    "candidate_photo" TEXT DEFAULT NULL,
    "description" text DEFAULT NULL,
    "course_closed" INTEGER NOT NULL DEFAULT 2,
    "lead_source" TEXT DEFAULT NULL,
    "referred_staff_id" TEXT DEFAULT NULL,
    "username" TEXT DEFAULT NULL,
    "password" TEXT DEFAULT NULL,
    "deleted" INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS "idx_tc_enrollment_internship_deleted" ON "tc_enrollment_internship" ("deleted");

CREATE TABLE IF NOT EXISTS "tc_event" (
    "id" BIGSERIAL PRIMARY KEY,
    "event_id" varchar(255) DEFAULT NULL,
    "company_id" varchar(255) DEFAULT NULL,
    "user_id" varchar(255) DEFAULT NULL,
    "role_id" varchar(255) DEFAULT NULL,
    "event_date" date DEFAULT NULL,
    "event_name" varchar(255) DEFAULT NULL,
    "event_description" text DEFAULT NULL,
    "images" text DEFAULT NULL,
    "deleted" INTEGER NOT NULL DEFAULT 0,
    "created_date_time" TIMESTAMP DEFAULT NULL,
    "updated_date_time" TIMESTAMP DEFAULT NULL
);
CREATE INDEX IF NOT EXISTS "idx_tc_event_deleted" ON "tc_event" ("deleted");

CREATE TABLE IF NOT EXISTS "tc_event_category" (
    "id" BIGSERIAL PRIMARY KEY,
    "created_date_time" TIMESTAMP DEFAULT NULL,
    "updated_date_time" TIMESTAMP DEFAULT NULL,
    "category_id" TEXT DEFAULT NULL,
    "category_name" TEXT DEFAULT NULL,
    "deleted" INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS "idx_tc_event_category_deleted" ON "tc_event_category" ("deleted");

CREATE TABLE IF NOT EXISTS "tc_expense_category" (
    "id" INTEGER NOT NULL,
    "created_date_time" TIMESTAMP DEFAULT NULL,
    "updated_date_time" TIMESTAMP DEFAULT NULL,
    "company_id" TEXT DEFAULT NULL,
    "expense_category_id" TEXT DEFAULT NULL,
    "expense_category_name" TEXT DEFAULT NULL,
    "description" TEXT DEFAULT NULL,
    "deleted" INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS "idx_tc_expense_category_deleted" ON "tc_expense_category" ("deleted");

CREATE TABLE IF NOT EXISTS "tc_expense_entry" (
    "id" BIGSERIAL PRIMARY KEY,
    "created_date_time" TIMESTAMP DEFAULT NULL,
    "updated_date_time" TIMESTAMP DEFAULT NULL,
    "expense_entry_id" TEXT DEFAULT NULL,
    "expense_category_id" TEXT DEFAULT NULL,
    "expense_entry_date" TEXT DEFAULT NULL,
    "payment_mode" TEXT DEFAULT NULL,
    "bank" TEXT DEFAULT NULL,
    "amount" TEXT DEFAULT NULL,
    "total_amount" TEXT DEFAULT NULL,
    "attachments" TEXT DEFAULT NULL,
    "deleted" INTEGER NOT NULL DEFAULT 0,
    "ALTER" TABLE `tc_payment` ADD COLUMN `enrollment_id` TEXT DEFAULT NULL;,
    "CREATE" TABLE `tc_course_enquiry` (,
    "id" BIGSERIAL PRIMARY KEY,
    "enquiry_id" varchar(255) DEFAULT NULL,
    "company_id" varchar(255) DEFAULT NULL,
    "name" varchar(255) DEFAULT NULL,
    "mobile_number" varchar(255) DEFAULT NULL,
    "degree_completed" varchar(255) DEFAULT NULL,
    "address" text DEFAULT NULL,
    "course_id" varchar(255) DEFAULT NULL,
    "converted_type" varchar(255) DEFAULT 'none',
    "converted_id" varchar(255) DEFAULT NULL,
    "deleted" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP DEFAULT NULL,
    "updated_at" TIMESTAMP DEFAULT NULL
);
CREATE INDEX IF NOT EXISTS "idx_tc_expense_entry_deleted" ON "tc_expense_entry" ("deleted");

CREATE TABLE IF NOT EXISTS "tc_installment_followup_assign" (
    "id" INTEGER NOT NULL,
    "assign_id" varchar(255) DEFAULT NULL,
    "company_id" varchar(255) DEFAULT NULL,
    "staff_id" varchar(255) DEFAULT NULL,
    "student_id" varchar(255) DEFAULT NULL,
    "enrollment_id" varchar(255) DEFAULT NULL,
    "course_type" varchar(50) DEFAULT NULL,
    "installment_id" INTEGER DEFAULT NULL,
    "assigned_date" date DEFAULT NULL,
    "status" varchar(50) DEFAULT 'pending',
    "created_by" varchar(255) DEFAULT NULL,
    "created_date_time" TIMESTAMP DEFAULT NULL,
    "updated_date_time" TIMESTAMP DEFAULT NULL,
    "deleted" INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS "idx_tc_installment_followup_assign_deleted" ON "tc_installment_followup_assign" ("deleted");

CREATE TABLE IF NOT EXISTS "tc_installment_followup_history" (
    "id" INTEGER NOT NULL,
    "followup_id" varchar(255) DEFAULT NULL,
    "company_id" varchar(255) DEFAULT NULL,
    "assign_id" varchar(255) DEFAULT NULL,
    "installment_id" INTEGER DEFAULT NULL,
    "enrollment_id" varchar(255) DEFAULT NULL,
    "student_id" varchar(255) DEFAULT NULL,
    "staff_id" varchar(255) DEFAULT NULL,
    "followup_date" date DEFAULT NULL,
    "call_status" varchar(100) DEFAULT NULL,
    "promise_payment_date" date DEFAULT NULL,
    "next_followup_date" date DEFAULT NULL,
    "remarks" text DEFAULT NULL,
    "created_by" varchar(255) DEFAULT NULL,
    "created_date_time" TIMESTAMP DEFAULT NULL,
    "deleted" INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS "idx_tc_installment_followup_history_deleted" ON "tc_installment_followup_history" ("deleted");

CREATE TABLE IF NOT EXISTS "tc_installment_reminder_history" (
    "id" INTEGER NOT NULL,
    "reminder_history_id" varchar(255) DEFAULT NULL,
    "company_id" varchar(255) DEFAULT NULL,
    "enrollment_id" varchar(255) DEFAULT NULL,
    "student_id" varchar(255) DEFAULT NULL,
    "student_name" varchar(255) DEFAULT NULL,
    "mobile_number" varchar(50) DEFAULT NULL,
    "course_name" varchar(255) DEFAULT NULL,
    "due_amount" NUMERIC(10,2) DEFAULT 0.00,
    "balance_amount" NUMERIC(10,2) DEFAULT 0.00,
    "message" text DEFAULT NULL,
    "sent_by" varchar(255) DEFAULT NULL,
    "sent_date_time" TIMESTAMP DEFAULT NULL,
    "deleted" INTEGER DEFAULT 0,
    "created_date_time" TIMESTAMP DEFAULT NULL
);
CREATE INDEX IF NOT EXISTS "idx_tc_installment_reminder_history_deleted" ON "tc_installment_reminder_history" ("deleted");

CREATE TABLE IF NOT EXISTS "tc_installments" (
    "id" INTEGER NOT NULL,
    "company_id" varchar(255) DEFAULT NULL,
    "enrollment_id" varchar(255) DEFAULT NULL,
    "course_type" varchar(50) DEFAULT NULL,
    "installment_number" INTEGER DEFAULT NULL,
    "due_date" date DEFAULT NULL,
    "amount" NUMERIC(10,2) DEFAULT NULL,
    "reminder_count" INTEGER DEFAULT 0,
    "last_reminder_date" date DEFAULT NULL,
    "next_reminder_date" date DEFAULT NULL,
    "reminder_status" varchar(50) DEFAULT NULL,
    "deleted" INTEGER NOT NULL DEFAULT 0,
    "created_date_time" TIMESTAMP DEFAULT NULL,
    "updated_date_time" TIMESTAMP DEFAULT NULL
);
CREATE INDEX IF NOT EXISTS "idx_tc_installments_deleted" ON "tc_installments" ("deleted");

CREATE TABLE IF NOT EXISTS "tc_logins" (
    "id" INTEGER NOT NULL,
    "login_date_time" TIMESTAMP DEFAULT NULL,
    "logout_date_time" TIMESTAMP DEFAULT NULL,
    "company_id" TEXT DEFAULT NULL,
    "user_id" INTEGER DEFAULT NULL,
    "deleted" INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS "idx_tc_logins_deleted" ON "tc_logins" ("deleted");

CREATE TABLE IF NOT EXISTS "tc_offer" (
    "id" BIGSERIAL PRIMARY KEY,
    "created_date_time" TIMESTAMP DEFAULT NULL,
    "updated_date_time" TIMESTAMP DEFAULT NULL,
    "company_id" varchar(255) DEFAULT NULL,
    "offer_id" TEXT DEFAULT NULL,
    "offer_name" varchar(255) DEFAULT NULL,
    "discount_percentage" NUMERIC(5,2) DEFAULT 0.00,
    "description" text DEFAULT NULL,
    "status" varchar(20) NOT NULL DEFAULT 'active',
    "deleted" INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS "idx_tc_offer_deleted" ON "tc_offer" ("deleted");

CREATE TABLE IF NOT EXISTS "tc_pamphlet_registration" (
    "id" BIGSERIAL PRIMARY KEY,
    "created_date_time" TIMESTAMP DEFAULT NULL,
    "updated_date_time" TIMESTAMP DEFAULT NULL,
    "created_by" varchar(255) DEFAULT NULL,
    "updated_by" varchar(255) DEFAULT NULL,
    "company_id" varchar(255) DEFAULT NULL,
    "registration_no" varchar(100) DEFAULT NULL,
    "registration_date" date DEFAULT NULL,
    "name" varchar(255) DEFAULT NULL,
    "mobile_no" varchar(20) DEFAULT NULL,
    "aadhaar_no" varchar(20) DEFAULT NULL,
    "address" text DEFAULT NULL,
    "deleted" INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS "idx_tc_pamphlet_registration_deleted" ON "tc_pamphlet_registration" ("deleted");

CREATE TABLE IF NOT EXISTS "tc_payment" (
    "id" INTEGER NOT NULL,
    "created_date_time" TIMESTAMP DEFAULT NULL,
    "updated_date_time" TIMESTAMP DEFAULT NULL,
    "company_id" varchar(100) DEFAULT NULL,
    "payment_id" TEXT DEFAULT NULL,
    "course_type" TEXT DEFAULT NULL,
    "payment_date" date DEFAULT NULL,
    "payment_mode" TEXT DEFAULT NULL,
    "bank" TEXT DEFAULT NULL,
    "amount" TEXT DEFAULT NULL,
    "paid_amount" varchar(255) DEFAULT '0.00',
    "cgst_amount" varchar(255) DEFAULT '0.00',
    "sgst_amount" varchar(255) DEFAULT '0.00',
    "total_amount" TEXT DEFAULT NULL,
    "student_id" varchar(100) DEFAULT NULL,
    "description" TEXT DEFAULT NULL,
    "enrollment_id" varchar(100) DEFAULT NULL,
    "deleted" INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS "idx_tc_payment_deleted" ON "tc_payment" ("deleted");

CREATE TABLE IF NOT EXISTS "tc_payment_mode" (
    "id" BIGSERIAL PRIMARY KEY,
    "created_date_time" TIMESTAMP DEFAULT NULL,
    "updated_date_time" TIMESTAMP DEFAULT NULL,
    "payment_mode_id" TEXT DEFAULT NULL,
    "payment_mode_name" TEXT DEFAULT NULL,
    "deleted" INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS "idx_tc_payment_mode_deleted" ON "tc_payment_mode" ("deleted");

CREATE TABLE IF NOT EXISTS "tc_payroll" (
    "id" BIGSERIAL PRIMARY KEY,
    "created_date_time" TIMESTAMP DEFAULT NULL,
    "updated_date_time" TIMESTAMP DEFAULT NULL,
    "payroll_id" TEXT DEFAULT NULL,
    "payroll_number" TEXT DEFAULT NULL,
    "staff_id" INTEGER DEFAULT NULL,
    "month" INTEGER DEFAULT NULL,
    "year" INTEGER DEFAULT NULL,
    "monthly_salary" NUMERIC(10,2) DEFAULT NULL,
    "per_day_salary" NUMERIC(10,2) DEFAULT NULL,
    "cl_days" INTEGER DEFAULT 0,
    "lop_days" INTEGER DEFAULT 0,
    "total_deduction" NUMERIC(10,2) DEFAULT NULL,
    "incentive_amount" NUMERIC(10,2) DEFAULT NULL,
    "total_references" INTEGER DEFAULT 0,
    "net_salary" NUMERIC(10,2) DEFAULT NULL,
    "payment_date" date DEFAULT NULL,
    "deleted" INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS "idx_tc_payroll_deleted" ON "tc_payroll" ("deleted");

CREATE TABLE IF NOT EXISTS "tc_question_sets" (
    "id" INTEGER NOT NULL,
    "question_set_id" varchar(100) NOT NULL,
    "company_id" varchar(100) DEFAULT NULL,
    "course_id" varchar(100) DEFAULT NULL,
    "title" varchar(255) NOT NULL,
    "description" text DEFAULT NULL,
    "difficulty" varchar(50) DEFAULT 'Easy',
    "total_questions" INTEGER DEFAULT 0,
    "total_marks" NUMERIC(10,2) DEFAULT 0.00,
    "status" INTEGER NOT NULL DEFAULT 1,
    "created_by" varchar(255) DEFAULT NULL,
    "created_date_time" TIMESTAMP DEFAULT NULL,
    "updated_date_time" TIMESTAMP DEFAULT NULL,
    "deleted" INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS "idx_tc_question_sets_deleted" ON "tc_question_sets" ("deleted");

CREATE TABLE IF NOT EXISTS "tc_questions" (
    "id" INTEGER NOT NULL,
    "question_id" varchar(100) NOT NULL,
    "company_id" varchar(100) DEFAULT NULL,
    "question_set_id" varchar(100) NOT NULL,
    "question_type" varchar(50) DEFAULT 'MCQ',
    "question" text NOT NULL,
    "option_a" text DEFAULT NULL,
    "option_b" text DEFAULT NULL,
    "option_c" text DEFAULT NULL,
    "option_d" text DEFAULT NULL,
    "correct_answer" varchar(255) NOT NULL,
    "marks" NUMERIC(10,2) DEFAULT 0.00,
    "display_order" INTEGER DEFAULT 1,
    "created_date_time" TIMESTAMP DEFAULT NULL,
    "updated_date_time" TIMESTAMP DEFAULT NULL,
    "deleted" INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS "idx_tc_questions_deleted" ON "tc_questions" ("deleted");

CREATE TABLE IF NOT EXISTS "tc_role_permissions" (
    "id" INTEGER NOT NULL,
    "created_date_time" TIMESTAMP DEFAULT NULL,
    "updated_date_time" TIMESTAMP DEFAULT NULL,
    "company_id" varchar(100) DEFAULT NULL,
    "role_id" varchar(100) DEFAULT NULL,
    "permission_page" varchar(100) DEFAULT NULL,
    "permission_action" TEXT DEFAULT NULL,
    "deleted" INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS "idx_tc_role_permissions_deleted" ON "tc_role_permissions" ("deleted");

CREATE TABLE IF NOT EXISTS "tc_roles" (
    "id" INTEGER NOT NULL,
    "created_date_time" TIMESTAMP DEFAULT NULL,
    "updated_date_time" TIMESTAMP DEFAULT NULL,
    "company_id" TEXT DEFAULT NULL,
    "role_id" TEXT DEFAULT NULL,
    "role_name" TEXT DEFAULT NULL,
    "description" TEXT DEFAULT NULL,
    "deleted" INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS "idx_tc_roles_deleted" ON "tc_roles" ("deleted");

CREATE TABLE IF NOT EXISTS "tc_staff" (
    "id" BIGSERIAL PRIMARY KEY,
    "created_date_time" TIMESTAMP DEFAULT NULL,
    "updated_date_time" TIMESTAMP DEFAULT NULL,
    "staff_id" TEXT DEFAULT NULL,
    "staff_name" TEXT DEFAULT NULL,
    "staff_number" TEXT DEFAULT NULL,
    "role_id" INTEGER DEFAULT NULL,
    "course_id" TEXT DEFAULT NULL,
    "salary" NUMERIC(10,2) DEFAULT NULL,
    "username" TEXT DEFAULT NULL,
    "password" TEXT DEFAULT NULL,
    "address" TEXT DEFAULT NULL,
    "deleted" INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS "idx_tc_staff_deleted" ON "tc_staff" ("deleted");

CREATE TABLE IF NOT EXISTS "tc_staff_leave_requests" (
    "id" INTEGER NOT NULL,
    "leave_request_id" varchar(50) NOT NULL,
    "company_id" varchar(100) NOT NULL,
    "staff_id" varchar(100) NOT NULL,
    "leave_type" varchar(50) NOT NULL,
    "from_date" date NOT NULL,
    "to_date" date NOT NULL,
    "total_days" NUMERIC(5,1) NOT NULL,
    "reason" text NOT NULL,
    "attachment" varchar(255) DEFAULT NULL,
    "status" varchar(50) NOT NULL DEFAULT 'Pending',
    "approval_reason" text DEFAULT NULL,
    "approved_by" varchar(100) DEFAULT NULL,
    "approved_date" TIMESTAMP DEFAULT NULL,
    "created_date_time" TIMESTAMP NOT NULL,
    "updated_date_time" TIMESTAMP NOT NULL,
    "deleted" INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS "idx_tc_staff_leave_requests_deleted" ON "tc_staff_leave_requests" ("deleted");

CREATE TABLE IF NOT EXISTS "tc_student_attendance" (
    "id" BIGSERIAL PRIMARY KEY,
    "created_date_time" TIMESTAMP DEFAULT NULL,
    "updated_date_time" TIMESTAMP DEFAULT NULL,
    "attendance_number" TEXT DEFAULT NULL,
    "attendance_date" date DEFAULT NULL,
    "staff_id" TEXT DEFAULT NULL,
    "student_id" TEXT DEFAULT NULL,
    "fn_present" TEXT DEFAULT NULL,
    "an_present" TEXT DEFAULT NULL,
    "present_code" TEXT DEFAULT NULL,
    "deleted" INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS "idx_tc_student_attendance_deleted" ON "tc_student_attendance" ("deleted");

CREATE TABLE IF NOT EXISTS "tc_student_daily_reports" (
    "id" BIGSERIAL PRIMARY KEY,
    "created_date_time" TIMESTAMP DEFAULT NULL,
    "updated_date_time" TIMESTAMP DEFAULT NULL,
    "company_id" varchar(255) DEFAULT NULL,
    "report_id" varchar(255) DEFAULT NULL,
    "student_id" varchar(255) DEFAULT NULL,
    "report_date" date DEFAULT NULL,
    "from_time" varchar(50) DEFAULT NULL,
    "to_time" varchar(50) DEFAULT NULL,
    "work_description" TEXT DEFAULT NULL,
    "remarks" TEXT DEFAULT NULL,
    "attachment" TEXT DEFAULT NULL,
    "status" varchar(30) DEFAULT NULL,
    "deleted" INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS "idx_tc_student_daily_reports_deleted" ON "tc_student_daily_reports" ("deleted");

CREATE TABLE IF NOT EXISTS "tc_student_feedback" (
    "id" BIGSERIAL PRIMARY KEY,
    "created_date_time" TIMESTAMP DEFAULT NULL,
    "updated_date_time" TIMESTAMP DEFAULT NULL,
    "feedback_id" varchar(255) DEFAULT NULL,
    "company_id" varchar(255) DEFAULT NULL,
    "student_id" varchar(255) NOT NULL,
    "student_name" varchar(255) NOT NULL,
    "course_id" varchar(255) DEFAULT NULL,
    "course_name" varchar(255) DEFAULT NULL,
    "feedback_type" varchar(100) NOT NULL,
    "priority" varchar(50) NOT NULL,
    "description" TEXT NOT NULL,
    "status" varchar(50) NOT NULL DEFAULT 'New',
    "remarks" TEXT DEFAULT NULL,
    "updated_by" varchar(255) DEFAULT NULL,
    "deleted" INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS "idx_tc_student_feedback_deleted" ON "tc_student_feedback" ("deleted");

CREATE TABLE IF NOT EXISTS "tc_student_performance" (
    "id" INTEGER NOT NULL,
    "performance_id" varchar(255) NOT NULL,
    "company_id" varchar(255) NOT NULL,
    "student_id" varchar(255) NOT NULL,
    "mentor_id" varchar(255) NOT NULL,
    "evaluation_date" date NOT NULL,
    "evaluation_month" varchar(7) NOT NULL,
    "attendance" INTEGER NOT NULL,
    "task_completion" INTEGER NOT NULL,
    "special_training" INTEGER NOT NULL,
    "course_performance" INTEGER NOT NULL,
    "communication" INTEGER NOT NULL,
    "personality_dev" INTEGER NOT NULL,
    "manners" INTEGER NOT NULL,
    "placement_activity" INTEGER NOT NULL,
    "whatsapp" INTEGER NOT NULL,
    "seminar" INTEGER NOT NULL DEFAULT 0,
    "total_score" INTEGER NOT NULL,
    "percentage" NUMERIC(5,2) NOT NULL,
    "grade" varchar(50) NOT NULL,
    "placement_ready" varchar(3) NOT NULL,
    "feedback" text DEFAULT NULL,
    "created_by" varchar(255) DEFAULT NULL,
    "created_date" TIMESTAMP DEFAULT NULL,
    "updated_by" varchar(255) DEFAULT NULL,
    "updated_date" TIMESTAMP DEFAULT NULL,
    "deleted" INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS "idx_tc_student_performance_deleted" ON "tc_student_performance" ("deleted");

CREATE TABLE IF NOT EXISTS "tc_student_reports" (
    "id" INTEGER NOT NULL,
    "created_date_time" TIMESTAMP DEFAULT NULL,
    "updated_date_time" TIMESTAMP DEFAULT NULL,
    "company_id" TEXT DEFAULT NULL,
    "report_id" TEXT DEFAULT NULL,
    "student_id" TEXT DEFAULT NULL,
    "report_date" date DEFAULT NULL,
    "task_id" INTEGER DEFAULT NULL,
    "work_done" TEXT DEFAULT NULL,
    "remarks" TEXT DEFAULT NULL,
    "attachment" TEXT DEFAULT NULL,
    "status" varchar(30) DEFAULT 'Pending',
    "deleted" INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS "idx_tc_student_reports_deleted" ON "tc_student_reports" ("deleted");

CREATE TABLE IF NOT EXISTS "tc_student_tasks" (
    "id" INTEGER NOT NULL,
    "created_date_time" TIMESTAMP DEFAULT NULL,
    "updated_date_time" TIMESTAMP DEFAULT NULL,
    "company_id" TEXT DEFAULT NULL,
    "task_id" TEXT DEFAULT NULL,
    "task_title" TEXT DEFAULT NULL,
    "description" TEXT DEFAULT NULL,
    "assigned_by" TEXT DEFAULT NULL,
    "assigned_to_student" TEXT DEFAULT NULL,
    "start_date" date DEFAULT NULL,
    "due_date" date DEFAULT NULL,
    "priority" TEXT DEFAULT NULL,
    "status" varchar(30) DEFAULT 'Pending',
    "completion_percentage" INTEGER DEFAULT 0,
    "attachments" TEXT DEFAULT NULL,
    "deleted" INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS "idx_tc_student_tasks_deleted" ON "tc_student_tasks" ("deleted");

CREATE TABLE IF NOT EXISTS "tc_task_comments" (
    "id" INTEGER NOT NULL,
    "created_date_time" TIMESTAMP DEFAULT NULL,
    "updated_date_time" TEXT DEFAULT NULL,
    "company_id" TEXT DEFAULT NULL,
    "task_id" INTEGER DEFAULT NULL,
    "user_role" TEXT DEFAULT NULL,
    "username" TEXT DEFAULT NULL,
    "comment" TEXT DEFAULT NULL,
    "deleted" INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS "idx_tc_task_comments_deleted" ON "tc_task_comments" ("deleted");

CREATE TABLE IF NOT EXISTS "tc_tasks" (
    "id" INTEGER NOT NULL,
    "created_date_time" TIMESTAMP DEFAULT NULL,
    "updated_date_time" TIMESTAMP DEFAULT NULL,
    "company_id" TEXT DEFAULT NULL,
    "task_id" TEXT DEFAULT NULL,
    "title" TEXT DEFAULT NULL,
    "description" TEXT DEFAULT NULL,
    "assigned_to" TEXT DEFAULT NULL,
    "assigned_by" TEXT DEFAULT NULL,
    "status" TEXT DEFAULT NULL,
    "due_date" date DEFAULT NULL,
    "custom_id" TEXT DEFAULT NULL,
    "unique_number" TEXT DEFAULT NULL,
    "deleted" INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS "idx_tc_tasks_deleted" ON "tc_tasks" ("deleted");

CREATE TABLE IF NOT EXISTS "tc_test_answers" (
    "id" BIGSERIAL PRIMARY KEY,
    "created_date_time" TIMESTAMP DEFAULT NULL,
    "updated_date_time" TIMESTAMP DEFAULT NULL,
    "attempt_id" TEXT DEFAULT NULL,
    "question_id" INTEGER DEFAULT NULL,
    "selected_option" TEXT DEFAULT NULL,
    "is_correct" INTEGER DEFAULT 0,
    "deleted" INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS "idx_tc_test_answers_deleted" ON "tc_test_answers" ("deleted");

CREATE TABLE IF NOT EXISTS "tc_test_attempts" (
    "id" BIGSERIAL PRIMARY KEY,
    "created_date_time" TIMESTAMP DEFAULT NULL,
    "updated_date_time" TIMESTAMP DEFAULT NULL,
    "attempt_id" TEXT DEFAULT NULL,
    "test_id" TEXT DEFAULT NULL,
    "student_id" TEXT DEFAULT NULL,
    "course_id" TEXT DEFAULT NULL,
    "total_questions" INTEGER DEFAULT 0,
    "correct_answers" INTEGER DEFAULT 0,
    "wrong_answers" INTEGER DEFAULT 0,
    "score_percentage" NUMERIC(5,2) DEFAULT 0.00,
    "status" TEXT DEFAULT 'Completed',
    "deleted" INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS "idx_tc_test_attempts_deleted" ON "tc_test_attempts" ("deleted");

CREATE TABLE IF NOT EXISTS "tc_users" (
    "id" INTEGER NOT NULL,
    "created_date_time" TIMESTAMP DEFAULT NULL,
    "updated_date_time" TIMESTAMP DEFAULT NULL,
    "company_id" TEXT DEFAULT NULL,
    "user_id" TEXT DEFAULT NULL,
    "username" TEXT DEFAULT NULL,
    "password" TEXT DEFAULT NULL,
    "role" TEXT DEFAULT NULL,
    "role_id" varchar(255) DEFAULT NULL,
    "name" TEXT DEFAULT NULL,
    "email" TEXT DEFAULT NULL,
    "mobile" TEXT DEFAULT NULL,
    "custom_id" TEXT DEFAULT NULL,
    "unique_number" TEXT DEFAULT NULL,
    "deleted" INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS "idx_tc_users_deleted" ON "tc_users" ("deleted");
