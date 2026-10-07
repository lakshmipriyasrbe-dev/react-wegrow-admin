from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routers.auth import router as auth_router
from app.routers.dashboard import router as dashboard_router
from app.routers.modules import (
    companies_router, users_router, roles_router, staff_router, courses_router,
    enrollments_router, payments_router, enquiries_router,
    attendance_router, leaves_router, payroll_router,
    expenses_router, tasks_router, feedback_router,
    events_router, questions_router, reports_router, campaigns_router
)
from app.database.session import Base, engine
import app.models # Register all models with Base

try:
    Base.metadata.create_all(bind=engine)
    from app.database.session import SessionLocal
    from app.models.user import TCUser
    from app.models.company import TCCompany
    from app.models.role import TCRole
    from app.core.security import get_password_hash
    with SessionLocal() as db:
        if db.query(TCUser).filter(TCUser.username == "admin", TCUser.deleted == 0).count() == 0:
            admin_user = TCUser(
                user_id="ADM001",
                name="Director Admin",
                username="admin",
                password=get_password_hash("admin123"),
                role="admin",
                role_id="1",
                company_id="1"
            )
            db.add(admin_user)
            db.commit()
            print("[STARTUP] Default admin user initialized in PostgreSQL (admin/admin123).")

        # Seed companies if empty
        if db.query(TCCompany).filter(TCCompany.deleted == 0).count() == 0:
            c1 = TCCompany(company_id="CMP0001", company_name="WeGrow Skill Campus", company_email="info@wegrow.edu", company_mobile="9876543210", branch="Sivakasi", gst="33AAAAA0000A1Z5", company_address="123 Main Road, Sivakasi")
            c2 = TCCompany(company_id="CMP0002", company_name="WeGrow Skill Campus", company_email="srivilliputhur@wegrow.edu", company_mobile="9876501234", branch="Srivilliputhur", gst="33AAAAA0000A1Z5", company_address="45 Bypass Road, Srivilliputhur")
            db.add_all([c1, c2])
            db.commit()
            print("[STARTUP] Initial companies seeded in database.")
except Exception as e:
    print(f"[STARTUP NOTICE] Table initialization error: {e}")

app = FastAPI(
    title="WeGrow Institutional ERP & Management API",
    description="Unified Enterprise ERP & Learning Management System Backend REST APIs",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(auth_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")
app.include_router(companies_router, prefix="/api")
app.include_router(users_router, prefix="/api")
app.include_router(roles_router, prefix="/api")
app.include_router(staff_router, prefix="/api")
app.include_router(courses_router, prefix="/api")
app.include_router(enrollments_router, prefix="/api")
app.include_router(payments_router, prefix="/api")
app.include_router(enquiries_router, prefix="/api")
app.include_router(attendance_router, prefix="/api")
app.include_router(leaves_router, prefix="/api")
app.include_router(payroll_router, prefix="/api")
app.include_router(expenses_router, prefix="/api")
app.include_router(tasks_router, prefix="/api")
app.include_router(feedback_router, prefix="/api")
app.include_router(events_router, prefix="/api")
app.include_router(questions_router, prefix="/api")
app.include_router(reports_router, prefix="/api")
app.include_router(reports_router)
app.include_router(campaigns_router, prefix="/api")

@app.get("/health")
def health_check():
    return {"status": "ok", "app": "WeGrow ERP API", "version": "2.0.0"}
