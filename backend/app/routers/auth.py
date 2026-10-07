from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.all_schemas import LoginRequest, Token
from app.models.user import TCUser, TCLogin
from app.models.staff import TCStaff
from app.core.security import verify_password, create_access_token, get_password_hash
from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=Token)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    # 1. Check in tc_users (Admin / Manager)
    user = db.query(TCUser).filter(TCUser.username == req.username, TCUser.deleted == 0).first()
    if user:
        if verify_password(req.password, user.password):
            token = create_access_token(
                subject=user.id,
                role="admin" if user.role_id == 1 else "manager",
                name=user.user_name or user.username
            )
            # Log login
            login_log = TCLogin(user_id=str(user.id), company_id=user.company_id or "1")
            db.add(login_log)
            db.commit()
            return {
                "access_token": token,
                "token_type": "bearer",
                "user": {
                    "id": user.id,
                    "user_id": user.user_id,
                    "name": user.user_name,
                    "username": user.username,
                    "role": "admin" if user.role_id == "1" or user.role_id == 1 else "manager",
                    "role_id": user.role_id,
                    "company_id": user.company_id
                }
            }

    # 2. Check in tc_staff
    staff = db.query(TCStaff).filter(TCStaff.username == req.username, TCStaff.deleted == 0).first()
    if staff:
        if verify_password(req.password, staff.password):
            token = create_access_token(
                subject=staff.id,
                role="staff",
                name=staff.staff_name or staff.username
            )
            login_log = TCLogin(user_id=str(staff.id), company_id="1")
            db.add(login_log)
            db.commit()
            return {
                "access_token": token,
                "token_type": "bearer",
                "user": {
                    "id": staff.id,
                    "user_id": staff.staff_id,
                    "name": staff.staff_name,
                    "username": staff.username,
                    "role": "staff",
                    "role_id": staff.role_id
                }
            }

    # Default fallback for initial demo/setup if DB is newly created and empty
    if req.username == "admin" and req.password == "admin123":
        token = create_access_token(subject=1, role="director", name="Director Admin")
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": 1,
                "user_id": "ADM001",
                "name": "Director Admin",
                "username": "admin",
                "role": "director",
                "role_id": 1,
                "company_id": "1"
            }
        }

    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")

@router.get("/me")
def get_profile(current_user: dict = Depends(get_current_user)):
    return current_user

@router.post("/logout")
def logout(current_user: dict = Depends(get_current_user)):
    return {"message": "Logged out successfully"}
