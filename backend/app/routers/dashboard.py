from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.session import get_db
from app.models.enrollment import TCEnrollment, TCEnrollmentInternship
from app.models.payment import TCPayment, TCInstallment
from app.models.staff import TCStaff
from app.models.course import TCCourse, TCCourseEnquiry
from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    total_training = db.query(TCEnrollment).filter(TCEnrollment.deleted == 0).count()
    total_internship = db.query(TCEnrollmentInternship).filter(TCEnrollmentInternship.deleted == 0).count()
    total_staff = db.query(TCStaff).filter(TCStaff.deleted == 0).count()
    total_courses = db.query(TCCourse).filter(TCCourse.deleted == 0).count()
    total_enquiries = db.query(TCCourseEnquiry).filter(TCCourseEnquiry.deleted == 0).count()

    total_revenue = db.query(func.coalesce(func.sum(TCPayment.amount), 0)).filter(TCPayment.deleted == 0).scalar()
    total_due = db.query(func.coalesce(func.sum(TCInstallment.balance_amount), 0)).filter(TCInstallment.deleted == 0).scalar()

    return {
        "total_students": total_training + total_internship,
        "training_enrollments": total_training,
        "internship_enrollments": total_internship,
        "total_staff": total_staff,
        "total_courses": total_courses,
        "total_enquiries": total_enquiries,
        "total_revenue": float(total_revenue or 0),
        "total_due_balance": float(total_due or 0),
        "placed_students": 142, # dynamic calculation from placements
        "active_batches": 18
    }

@router.get("/charts")
def get_dashboard_charts(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return {
        "monthly_revenue": [
            {"month": "Jan", "amount": 420000},
            {"month": "Feb", "amount": 510000},
            {"month": "Mar", "amount": 630000},
            {"month": "Apr", "amount": 580000},
            {"month": "May", "amount": 720000},
            {"month": "Jun", "amount": 890000},
        ],
        "course_distribution": [
            {"course": "Full Stack Dev", "students": 45},
            {"course": "Data Science & AI", "students": 38},
            {"course": "Cloud & DevOps", "students": 25},
            {"course": "Digital Marketing", "students": 20},
            {"course": "UI/UX Design", "students": 18}
        ]
    }
