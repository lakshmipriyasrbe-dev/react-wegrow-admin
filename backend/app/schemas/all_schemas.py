import re
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Any
from datetime import datetime, date
from decimal import Decimal

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

class TokenData(BaseModel):
    user_id: Optional[str] = None   
    role: Optional[str] = None

class LoginRequest(BaseModel):
    username: str
    password: str

# Generic Base Schema
class BaseSchema(BaseModel):
    class Config:
        from_attributes = True

# Company Schemas with Validation
class CompanyCreate(BaseModel):
    company_name: str
    company_email: str
    company_mobile: str
    gst: str
    branch: str
    company_address: str
    logo_image: Optional[str] = ""

    @field_validator("company_name")
    @classmethod
    def validate_company_name(cls, v: str) -> str:
        cleaned = v.strip()
        if not cleaned:
            raise ValueError("Company Name is required")
        if not re.match(r"^[a-zA-Z][a-zA-Z0-9\s@&.,'-]*$", cleaned):
            raise ValueError("Company Name must start with a letter (e.g. We Grow @ Sivakasi)")
        if len(cleaned) < 2:
            raise ValueError("Company Name must be at least 2 characters long")
        return cleaned

    @field_validator("company_email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        cleaned = v.strip()
        if not cleaned:
            raise ValueError("Company email is required")
        if not re.match(r"^[\w\.-]+@[\w\.-]+\.\w+$", cleaned):
            raise ValueError("Please enter a valid email address (e.g., info@company.com)")
        return cleaned.lower()

    @field_validator("company_mobile")
    @classmethod
    def validate_mobile(cls, v: str) -> str:
        cleaned = v.strip()
        if not cleaned:
            raise ValueError("Mobile number is required")
        if not re.match(r"^[0-9]{10}$", cleaned):
            raise ValueError("Mobile number must be exactly 10 digits")
        return cleaned

    @field_validator("gst")
    @classmethod
    def validate_gst(cls, v: str) -> str:
        cleaned = v.strip().upper()
        if not cleaned:
            raise ValueError("GST number is required")
        if not re.match(r"^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$", cleaned):
            raise ValueError("Please enter a valid 15-character GSTIN (e.g., 33AAAAA0000A1Z5)")
        return cleaned

    @field_validator("branch")
    @classmethod
    def validate_branch(cls, v: str) -> str:
        cleaned = v.strip()
        if not cleaned:
            raise ValueError("Please select a branch")
        return cleaned

    @field_validator("company_address")
    @classmethod
    def validate_address(cls, v: str) -> str:
        cleaned = v.strip()
        if not cleaned or len(cleaned) < 3:
            raise ValueError("Please enter complete company address")
        return cleaned

class CompanyUpdate(BaseModel):
    company_name: Optional[str] = None
    company_email: Optional[str] = None
    company_mobile: Optional[str] = None
    gst: Optional[str] = None
    branch: Optional[str] = None
    company_address: Optional[str] = None
    logo_image: Optional[str] = None

    @field_validator("company_name")
    @classmethod
    def validate_company_name(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            cleaned = v.strip()
            if not cleaned:
                raise ValueError("Company Name cannot be empty")
            if not re.match(r"^[a-zA-Z][a-zA-Z0-9\s@&.,'-]*$", cleaned):
                raise ValueError("Company Name must start with a letter (e.g. We Grow @ Sivakasi)")
            return cleaned
        return v

    @field_validator("company_email")
    @classmethod
    def validate_email(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            cleaned = v.strip()
            if not cleaned:
                raise ValueError("Email cannot be empty")
            if not re.match(r"^[\w\.-]+@[\w\.-]+\.\w+$", cleaned):
                raise ValueError("Please enter a valid email address")
            return cleaned.lower()
        return v

    @field_validator("company_mobile")
    @classmethod
    def validate_mobile(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            cleaned = v.strip()
            if not re.match(r"^[0-9]{10}$", cleaned):
                raise ValueError("Mobile number must be exactly 10 digits")
            return cleaned
        return v

    @field_validator("gst")
    @classmethod
    def validate_gst(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            cleaned = v.strip().upper()
            if not re.match(r"^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$", cleaned):
                raise ValueError("Please enter a valid 15-character GSTIN (e.g., 33AAAAA0000A1Z5)")
            return cleaned
        return v

class CompanyOut(BaseSchema):
    id: int
    company_id: Optional[str] = None
    company_name: str
    company_email: Optional[str] = None
    company_mobile: Optional[str] = None
    company_address: Optional[str] = None
    gst: Optional[str] = None
    branch: Optional[str] = None
    logo_image: Optional[str] = None


# User Schemas
class UserCreate(BaseModel):
    name: Optional[str] = None
    user_name: Optional[str] = None
    mobile: Optional[str] = None
    mobile_number: Optional[str] = None
    role: Optional[str] = None
    role_id: Optional[Any] = None
    username: str
    password: str
    status: Optional[str] = "Active"
    company_id: Optional[Any] = "1"

class UserUpdate(BaseModel):
    name: Optional[str] = None
    user_name: Optional[str] = None
    mobile: Optional[str] = None
    mobile_number: Optional[str] = None
    role: Optional[str] = None
    role_id: Optional[Any] = None
    username: Optional[str] = None
    password: Optional[str] = None
    status: Optional[str] = None
    company_id: Optional[Any] = None

class UserOut(BaseSchema):
    id: int
    user_id: Optional[str] = None
    name: Optional[str] = None
    user_name: Optional[str] = None
    mobile: Optional[str] = None
    mobile_number: Optional[str] = None
    role_id: Optional[Any] = None
    role: Optional[str] = None
    username: Optional[str] = None
    status: Optional[str] = None
    company_id: Optional[str] = None

# Role Schemas
class RoleCreate(BaseModel):
    role_name: str
    description: Optional[str] = None
    permissions: Optional[Any] = None

class RoleUpdate(BaseModel):
    role_name: Optional[str] = None
    description: Optional[str] = None
    permissions: Optional[Any] = None

class RolePermissionUpdate(BaseModel):
    page_name: str
    can_add: int = 0
    can_edit: int = 0
    can_view: int = 1
    can_delete: int = 0

# Staff Schemas
class StaffCreate(BaseModel):
    staff_name: str
    staff_number: Optional[str] = None
    role_id: Optional[Any] = None
    course_id: Optional[str] = None
    salary: Optional[Decimal] = Decimal("0.00")
    username: Optional[str] = None
    password: Optional[str] = None
    address: Optional[str] = None
    doj: Optional[date] = None
    status: Optional[str] = "Active"
    status_notes: Optional[str] = None

class StaffUpdate(BaseModel):
    staff_name: Optional[str] = None
    staff_number: Optional[str] = None
    role_id: Optional[Any] = None
    course_id: Optional[str] = None
    salary: Optional[Decimal] = None
    username: Optional[str] = None
    password: Optional[str] = None
    address: Optional[str] = None
    doj: Optional[date] = None
    status: Optional[str] = None
    status_notes: Optional[str] = None

# Course Schemas
class CourseCreate(BaseModel):
    course_name: str
    duration: Optional[str] = None
    course_duration: Optional[str] = None
    fees: Optional[Any] = Decimal("0.00")
    course_fee: Optional[Any] = Decimal("0.00")
    syllabus: Optional[str] = None
    syllabus_files: Optional[Any] = None
    tutorial_videos: Optional[Any] = None
    status: Optional[str] = "Active"

class CourseUpdate(BaseModel):
    course_name: Optional[str] = None
    duration: Optional[str] = None
    course_duration: Optional[str] = None
    fees: Optional[Any] = None
    course_fee: Optional[Any] = None
    syllabus: Optional[str] = None
    syllabus_files: Optional[Any] = None
    tutorial_videos: Optional[Any] = None
    status: Optional[str] = None

# Enrollment Schemas
class EnrollmentCreate(BaseModel):
    student_name: str
    father_spouse_name: Optional[str] = None
    address: Optional[str] = None
    mobile_number: Optional[str] = None
    parent_contact_no: Optional[str] = None
    course_id: Optional[str] = None
    duration: Optional[str] = None
    from_time: Optional[str] = None
    to_time: Optional[str] = None
    staff_id: Optional[str] = None
    fees_type: Optional[str] = "One Time"
    fees_amount: Decimal = Decimal("0.00")
    paid_amount: Decimal = Decimal("0.00")
    dob: Optional[date] = None
    doj: Optional[date] = None
    blood_group: Optional[str] = None
    num_installments: Optional[int] = 1

# Payment / Receipt Schemas
class PaymentCreate(BaseModel):
    student_id: str
    student_name: Optional[str] = None
    course_type: Optional[str] = "Training"
    course_id: Optional[str] = None
    payment_mode_id: Optional[str] = None
    bank_id: Optional[str] = None
    amount: Decimal
    gst_percent: Optional[Decimal] = Decimal("0.00")
    payment_reference: Optional[str] = None
    remarks: Optional[str] = None
    receipt_date: Optional[date] = None

# Attendance Schemas
class AttendanceMark(BaseModel):
    staff_id: str
    attendance_date: date
    in_time: Optional[str] = None
    out_time: Optional[str] = None
    attendance_status: str = "Present"
    remarks: Optional[str] = None

class StudentAttendanceMark(BaseModel):
    student_id: str
    course_id: Optional[str] = None
    attendance_date: date
    attendance_status: str = "Present"
    course_type: Optional[str] = "Training"

# Leave Schemas
class LeaveApply(BaseModel):
    staff_id: str
    leave_type: str
    from_date: date
    to_date: date
    total_days: Decimal = Decimal("1.0")
    reason: Optional[str] = None

class LeaveApprove(BaseModel):
    status: str # Approved / Rejected
    remarks: Optional[str] = None

# Expense Schemas
class ExpenseCreate(BaseModel):
    expense_date: date
    expense_category_id: str
    staff_id: Optional[str] = None
    payment_mode_id: Optional[str] = None
    bank_id: Optional[str] = None
    amount: Decimal
    description: Optional[str] = None

# Payroll Schemas
class PayrollGenerate(BaseModel):
    staff_id: str
    month_year: str
    basic_salary: Decimal
    allowance: Optional[Decimal] = Decimal("0.00")
    deduction: Optional[Decimal] = Decimal("0.00")
    payment_mode_id: Optional[str] = None
    bank_id: Optional[str] = None

# Feedback Schemas
class FeedbackCreate(BaseModel):
    student_id: str
    student_name: Optional[str] = None
    staff_id: Optional[str] = None
    course_id: Optional[str] = None
    feedback_type: str = "Trainer"
    priority: str = "Medium"
    rating: int = 5
    subject: str
    description: str

class FeedbackReview(BaseModel):
    status: str = "Resolved"
    resolution_remarks: str

# Task Schemas
class TaskCreate(BaseModel):
    assigned_to: str
    title: str
    description: Optional[str] = None
    priority: str = "Medium"
    due_date: Optional[date] = None

# Event Schemas
class EventCreate(BaseModel):
    event_name: str
    category_id: Optional[str] = None
    venue: Optional[str] = None
    event_date: Optional[date] = None
    from_time: Optional[str] = None
    to_time: Optional[str] = None
    organizer: Optional[str] = None
    status: Optional[str] = "Upcoming"

# WhatsApp Campaign
class WhatsAppCampaign(BaseModel):
    template_name: str
    target_group: str # 'enquiries', 'students', 'all'
    custom_message: Optional[str] = None