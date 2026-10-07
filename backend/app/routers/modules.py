from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date
from decimal import Decimal
from app.services.pdf_reports import generate_staff_list_pdf
from app.database.session import get_db
from app.models.user import TCUser
from app.models.role import TCRole, TCRolePermission
from app.models.staff import TCStaff
from app.models.course import TCCourse, TCCourseEnquiry, TCEnquiryFollowup
from app.models.enrollment import TCEnrollment, TCEnrollmentInternship
from app.models.payment import TCPayment, TCInstallment
from app.models.staff import TCAttendance, TCStaffLeaveRequest
from app.models.student import TCStudentAttendance, TCStudentFeedback, TCStudentTask
from app.models.common import TCExpenseEntry, TCExpenseCategory, TCPayroll, TCEvent, TCQuestion
from app.models.company import TCBank, TCPaymentMode, TCCompany
from app.dependencies.auth import get_current_user
from app.core.security import get_password_hash
from app.schemas.all_schemas import (
    CompanyCreate, CompanyUpdate, RoleCreate, RoleUpdate, UserCreate, UserUpdate
)

def generate_custom_id(last_insert_id: int) -> str:
    """
    Generates ID matching legacy PHP format:
    $custom_id_value = date("dmYhis") . "_" . str_pad($last_insert_id, 2, "0", STR_PAD_LEFT);
    Example: 05102026051745_01
    """
    return f"{datetime.now().strftime('%d%m%Y%I%M%S')}_{last_insert_id:02d}"

# Companies Router
companies_router = APIRouter(prefix="/companies", tags=["Companies"])

@companies_router.get("")
def list_companies(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return db.query(TCCompany).filter(TCCompany.deleted == 0).order_by(TCCompany.id.asc()).all()

@companies_router.post("")
def create_company(payload: CompanyCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    comp = TCCompany(
        company_name=payload.company_name,
        company_email=payload.company_email,
        company_mobile=payload.company_mobile,
        company_address=payload.company_address,
        gst=payload.gst,
        branch=payload.branch,
        logo_image=payload.logo_image or ""
    )
    db.add(comp)
    db.commit()
    db.refresh(comp)
    comp.company_id = generate_custom_id(comp.id)
    db.commit()
    return comp

@companies_router.put("/{identifier}")
def update_company(identifier: str, payload: CompanyUpdate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    is_num = identifier.isdigit()
    comp = db.query(TCCompany).filter(
        (TCCompany.company_id == identifier) | (TCCompany.id == int(identifier) if is_num else False),
        TCCompany.deleted == 0
    ).first()
    if not comp:
        raise HTTPException(status_code=404, detail="Company not found")
    if payload.company_name is not None:
        comp.company_name = payload.company_name
    if payload.company_email is not None:
        comp.company_email = payload.company_email
    if payload.company_mobile is not None:
        comp.company_mobile = payload.company_mobile
    if payload.company_address is not None:
        comp.company_address = payload.company_address
    if payload.gst is not None:
        comp.gst = payload.gst
    if payload.branch is not None:
        comp.branch = payload.branch
    if payload.logo_image is not None and payload.logo_image:
        comp.logo_image = payload.logo_image
    db.commit()
    db.refresh(comp)
    return comp

@companies_router.delete("/{identifier}")
def delete_company(identifier: str, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    is_num = identifier.isdigit()
    comp = db.query(TCCompany).filter(
        (TCCompany.company_id == identifier) | (TCCompany.id == int(identifier) if is_num else False)
    ).first()
    if comp:
        comp.deleted = 1
        db.commit()
    return {"message": "Company deleted"}

# Users Router
users_router = APIRouter(prefix="/users", tags=["Users"])

@users_router.get("")
def list_users(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    users = db.query(TCUser).filter(TCUser.deleted == 0).order_by(TCUser.id.asc()).all()
    roles = {str(r.role_id): r.role_name for r in db.query(TCRole).filter(TCRole.deleted == 0).all()}
    for r in db.query(TCRole).filter(TCRole.deleted == 0).all():
        roles[str(r.id)] = r.role_name

    result = []
    for u in users:
        u_role = u.role or roles.get(str(u.role_id), "Staff")
        result.append({
            "id": u.id,
            "user_id": u.user_id,
            "name": u.name or u.username or "",
            "username": u.username or "",
            "mobile": u.mobile or "",
            "role": u_role,
            "role_id": u.role_id or "",
            "company_id": u.company_id or "1"
        })
    return result

@users_router.get("/{identifier}")
def get_user(identifier: str, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    is_num = identifier.isdigit()
    user = db.query(TCUser).filter(
        (TCUser.user_id == identifier) | (TCUser.id == int(identifier) if is_num else False),
        TCUser.deleted == 0
    ).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": user.id,
        "user_id": user.user_id,
        "name": user.name or "",
        "username": user.username or "",
        "mobile": user.mobile or "",
        "role": user.role or "staff",
        "role_id": user.role_id or "",
        "company_id": user.company_id or "1"
    }

@users_router.post("")
def create_user(payload: UserCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    user_name = payload.name or payload.user_name or payload.username
    user_mobile = payload.mobile or payload.mobile_number

    # Check uniqueness of username or mobile
    filter_cond = (TCUser.username == payload.username)
    if user_mobile:
        filter_cond = filter_cond | (TCUser.mobile == user_mobile)

    existing = db.query(TCUser).filter(
        filter_cond,
        TCUser.deleted == 0
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username or Mobile already exists")

    # Resolve role name
    role_name = payload.role or "staff"
    if payload.role_id:
        role_obj = db.query(TCRole).filter(
            (TCRole.role_id == str(payload.role_id)) | (TCRole.id == int(payload.role_id) if str(payload.role_id).isdigit() else False),
            TCRole.deleted == 0
        ).first()
        if role_obj and role_obj.role_name:
            role_name = role_obj.role_name

    user = TCUser(
        name=user_name,
        username=payload.username,
        mobile=user_mobile,
        role=role_name,
        role_id=str(payload.role_id) if payload.role_id else None,
        company_id=str(payload.company_id or "1"),
        password=get_password_hash(payload.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    user.user_id = generate_custom_id(user.id)
    user.unique_number = user.user_id
    user.custom_id = user.user_id
    db.commit()
    return user

@users_router.put("/{identifier}")
def update_user(identifier: str, payload: UserUpdate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    is_num = identifier.isdigit()
    user = db.query(TCUser).filter(
        (TCUser.user_id == identifier) | (TCUser.id == int(identifier) if is_num else False),
        TCUser.deleted == 0
    ).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    target_name = payload.name if payload.name is not None else payload.user_name
    target_mobile = payload.mobile if payload.mobile is not None else payload.mobile_number
    target_username = payload.username if payload.username is not None else user.username
    check_mobile = target_mobile if target_mobile is not None else user.mobile

    if target_username or check_mobile:
        dup_cond = (TCUser.username == target_username)
        if check_mobile:
            dup_cond = dup_cond | (TCUser.mobile == check_mobile)
        dup = db.query(TCUser).filter(
            dup_cond,
            TCUser.id != user.id,
            TCUser.deleted == 0
        ).first()
        if dup:
            raise HTTPException(status_code=400, detail="Username or Mobile already exists")

    if target_name is not None:
        user.name = target_name
    if target_mobile is not None:
        user.mobile = target_mobile
    if payload.username is not None:
        user.username = payload.username
    if payload.role_id is not None:
        user.role_id = str(payload.role_id)
        role_obj = db.query(TCRole).filter(
            (TCRole.role_id == str(payload.role_id)) | (TCRole.id == int(payload.role_id) if str(payload.role_id).isdigit() else False),
            TCRole.deleted == 0
        ).first()
        if role_obj and role_obj.role_name:
            user.role = role_obj.role_name
    elif payload.role is not None:
        user.role = payload.role
    if payload.company_id is not None:
        user.company_id = str(payload.company_id)
    if payload.password is not None and payload.password.strip():
        user.password = get_password_hash(payload.password.strip())

    db.commit()
    db.refresh(user)
    return user

@users_router.delete("/{identifier}")
def delete_user(identifier: str, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    is_num = identifier.isdigit()
    user = db.query(TCUser).filter(
        (TCUser.user_id == identifier) | (TCUser.id == int(identifier) if is_num else False)
    ).first()
    if user:
        user.deleted = 1
        db.commit()
    return {"message": "User deleted"}

# Roles Router
roles_router = APIRouter(prefix="/roles", tags=["Roles"])

@roles_router.get("")
def list_roles(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return db.query(TCRole).filter(TCRole.deleted == 0).order_by(TCRole.id.asc()).all()

@roles_router.post("")
def create_role(payload: RoleCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    role = TCRole(
        role_name=payload.role_name,
        description=payload.description or ""
    )
    db.add(role)
    db.commit()
    db.refresh(role)
    role.role_id = generate_custom_id(role.id)
    db.commit()

    if isinstance(payload.permissions, dict):
        for comp_id, pages in payload.permissions.items():
            if isinstance(pages, dict):
                for page_key, acts in pages.items():
                    if isinstance(acts, dict) and any(acts.values()):
                        action_list = [k for k, v in acts.items() if v]
                        p = TCRolePermission(
                            role_id=role.role_id,
                            company_id=str(comp_id),
                            permission_page=page_key,
                            permission_action=",".join(action_list),
                            deleted=0
                        )
                        db.add(p)
        db.commit()
    db.refresh(role)
    return role

@roles_router.put("/{identifier}")
def update_role(identifier: str, payload: RoleUpdate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    is_num = identifier.isdigit()
    role = db.query(TCRole).filter(
        (TCRole.role_id == identifier) | (TCRole.id == int(identifier) if is_num else False),
        TCRole.deleted == 0
    ).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    if payload.role_name is not None:
        role.role_name = payload.role_name
    if payload.description is not None:
        role.description = payload.description
    db.commit()

    if isinstance(payload.permissions, dict):
        # Retrieve all existing permissions for this role
        existing_perms = db.query(TCRolePermission).filter(
            (TCRolePermission.role_id == role.role_id) | (TCRolePermission.role_id == str(role.id))
        ).all()
        
        # Map existing records by (company_id, permission_page)
        perm_map = {(str(p.company_id), str(p.permission_page)): p for p in existing_perms}
        processed_keys = set()

        for comp_id, pages in payload.permissions.items():
            if isinstance(pages, dict):
                for page_key, acts in pages.items():
                    key = (str(comp_id), str(page_key))
                    processed_keys.add(key)
                    action_list = [k for k, v in acts.items() if v] if isinstance(acts, dict) else []

                    if action_list:
                        # Active permissions selected -> Set deleted = 0
                        if key in perm_map:
                            p = perm_map[key]
                            p.role_id = role.role_id
                            p.permission_action = ",".join(action_list)
                            p.deleted = 0
                        else:
                            new_p = TCRolePermission(
                                role_id=role.role_id,
                                company_id=str(comp_id),
                                permission_page=str(page_key),
                                permission_action=",".join(action_list),
                                deleted=0
                            )
                            db.add(new_p)
                    else:
                        # Permission unselected/removed -> Soft delete (deleted = 1)
                        if key in perm_map:
                            perm_map[key].deleted = 1

        # Mark any other omitted pages as deleted = 1
        for key, p in perm_map.items():
            if key not in processed_keys:
                p.deleted = 1

        db.commit()
    db.refresh(role)
    return role

@roles_router.delete("/{identifier}")
def delete_role(identifier: str, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    is_num = identifier.isdigit()
    role = db.query(TCRole).filter(
        (TCRole.role_id == identifier) | (TCRole.id == int(identifier) if is_num else False)
    ).first()
    if role:
        role.deleted = 1
        # Soft delete associated permissions
        db.query(TCRolePermission).filter(
            (TCRolePermission.role_id == role.role_id) | (TCRolePermission.role_id == str(role.id))
        ).update({"deleted": 1}, synchronize_session=False)
        db.commit()
    return {"message": "Role deleted"}

@roles_router.get("/{identifier}/permissions")
def get_role_permissions(identifier: str, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    is_num = identifier.isdigit()
    role = db.query(TCRole).filter(
        (TCRole.role_id == identifier) | (TCRole.id == int(identifier) if is_num else False)
    ).first()

    role_ids = [identifier]
    if role:
        if role.role_id:
            role_ids.append(role.role_id)
        role_ids.append(str(role.id))

    perms = db.query(TCRolePermission).filter(
        TCRolePermission.role_id.in_(role_ids),
        TCRolePermission.deleted == 0
    ).all()

    result = []
    for p in perms:
        actions = (p.permission_action or "").split(",")
        result.append({
            "id": p.id,
            "company_id": p.company_id,
            "role_id": p.role_id,
            "permission_page": p.permission_page,
            "permission_action": p.permission_action,
            "can_add": 1 if "add" in actions else 0,
            "can_edit": 1 if "edit" in actions else 0,
            "can_view": 1 if "view" in actions else 0,
            "can_delete": 1 if "delete" in actions else 0,
        })
    return result


# Staff Router
staff_router = APIRouter(prefix="/staff", tags=["Staff"])

@staff_router.get("")
def list_staff(status: Optional[str] = None, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    query = db.query(TCStaff).filter(TCStaff.deleted == 0)
    if status:
        if status.lower() == "active":
            query = query.filter(TCStaff.status.ilike("Active"))
        elif status.lower() == "inactive":
            query = query.filter(TCStaff.status != "Active")
        else:
            query = query.filter(TCStaff.status.ilike(status))
    staff_records = query.order_by(TCStaff.id.desc()).all()
    
    # Map roles
    roles_list = db.query(TCRole).filter(TCRole.deleted == 0).all()
    roles_map = {}
    for r in roles_list:
        roles_map[str(r.id)] = r.role_name
        if r.role_id:
            roles_map[str(r.role_id)] = r.role_name

    result = []
    for s in staff_records:
        role_title = roles_map.get(str(s.role_id), "staff") if s.role_id else "staff"
        if not s.role_id or role_title == "staff":
            if s.course_id and "enroll" in str(s.course_id).lower():
                role_title = "incharger - enrollment"
            elif s.course_id and "telecall" in str(s.course_id).lower():
                role_title = "telecaller"

        result.append({
            "id": s.id,
            "staff_id": s.staff_id or f"ST{s.id:03d}",
            "staff_name": s.staff_name or "",
            "name": s.staff_name or "",
            "staff_number": s.staff_number or "",
            "number": s.staff_number or "",
            "role_id": s.role_id or 4,
            "role": role_title,
            "role_name": role_title,
            "course_id": s.course_id or "",
            "course": s.course_id or "",
            "salary": float(s.salary) if s.salary is not None else 0.0,
            "username": s.username or "",
            "address": s.address or "",
            "doj": s.doj.isoformat() if s.doj else None,
            "status": s.status or "Active",
            "status_notes": s.status_notes or ""
        })
    return result

@staff_router.get("/{identifier}")
def get_staff(identifier: str, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    is_num = identifier.isdigit()
    staff = db.query(TCStaff).filter(
        (TCStaff.staff_id == identifier) | (TCStaff.id == int(identifier) if is_num else False),
        TCStaff.deleted == 0
    ).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")

    role_obj = db.query(TCRole).filter(
        (TCRole.role_id == str(staff.role_id)) | (TCRole.id == int(staff.role_id) if str(staff.role_id).isdigit() else False),
        TCRole.deleted == 0
    ).first() if staff.role_id else None

    return {
        "id": staff.id,
        "staff_id": staff.staff_id or f"ST{staff.id:03d}",
        "staff_name": staff.staff_name or "",
        "name": staff.staff_name or "",
        "staff_number": staff.staff_number or "",
        "number": staff.staff_number or "",
        "role_id": staff.role_id or 4,
        "role": role_obj.role_name if role_obj else "staff",
        "course_id": staff.course_id or "",
        "course": staff.course_id or "",
        "salary": float(staff.salary) if staff.salary is not None else 0.0,
        "username": staff.username or "",
        "address": staff.address or "",
        "doj": staff.doj.isoformat() if staff.doj else None,
        "status": staff.status or "Active",
        "status_notes": staff.status_notes or ""
    }

@staff_router.post("")
def create_staff(data: dict, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    staff_name = data.get("staff_name") or data.get("name")
    staff_number = data.get("staff_number") or data.get("number")
    raw_salary = data.get("salary")
    salary_val = Decimal(str(raw_salary)) if raw_salary not in [None, ""] else Decimal("0.00")
    
    doj_val = None
    if data.get("doj"):
        try:
            doj_val = datetime.strptime(str(data.get("doj")), "%Y-%m-%d").date()
        except Exception:
            doj_val = date.today()

    staff = TCStaff(
        staff_name=staff_name,
        staff_number=staff_number,
        role_id=data.get("role_id") if data.get("role_id") else None,
        course_id=data.get("course_id") or data.get("course"),
        salary=salary_val,
        username=data.get("username"),
        password=get_password_hash(data.get("password", "123456")),
        address=data.get("address"),
        doj=doj_val or date.today(),
        status=data.get("status") or "Active",
        status_notes=data.get("status_notes") or data.get("reason")
    )
    db.add(staff)
    db.commit()
    db.refresh(staff)
    if not staff.staff_id:
        staff.staff_id = f"ST{staff.id:03d}"
        db.commit()
    return staff

@staff_router.put("/{identifier}")
def update_staff(identifier: str, data: dict, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    is_num = identifier.isdigit()
    staff = db.query(TCStaff).filter(
        (TCStaff.staff_id == identifier) | (TCStaff.id == int(identifier) if is_num else False),
        TCStaff.deleted == 0
    ).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")

    if "staff_name" in data or "name" in data:
        staff.staff_name = data.get("staff_name") or data.get("name")
    if "staff_number" in data or "number" in data:
        staff.staff_number = data.get("staff_number") or data.get("number")
    if "role_id" in data:
        staff.role_id = data.get("role_id")
    if "course_id" in data or "course" in data:
        staff.course_id = data.get("course_id") or data.get("course")
    if "salary" in data:
        raw_salary = data.get("salary")
        staff.salary = Decimal(str(raw_salary)) if raw_salary not in [None, ""] else Decimal("0.00")
    if "username" in data:
        staff.username = data.get("username")
    if "password" in data and data.get("password") and data.get("password").strip():
        staff.password = get_password_hash(data.get("password").strip())
    if "address" in data:
        staff.address = data.get("address")
    if "doj" in data and data.get("doj"):
        try:
            staff.doj = datetime.strptime(str(data.get("doj")), "%Y-%m-%d").date()
        except Exception:
            pass
    if "status" in data:
        staff.status = data.get("status")
    if "status_notes" in data or "reason" in data:
        staff.status_notes = data.get("status_notes") or data.get("reason")

    db.commit()
    db.refresh(staff)
    return staff

@staff_router.delete("/{identifier}")
def delete_staff(identifier: str, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    is_num = identifier.isdigit()
    staff = db.query(TCStaff).filter(
        (TCStaff.staff_id == identifier) | (TCStaff.id == int(identifier) if is_num else False)
    ).first()
    if staff:
        staff.deleted = 1
        db.commit()
    return {"message": "Staff deleted successfully"}

# Courses Router
courses_router = APIRouter(prefix="/courses", tags=["Courses"])

@courses_router.get("")
def list_courses(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    courses = db.query(TCCourse).filter(TCCourse.deleted == 0).order_by(TCCourse.id.desc()).all()
    result = []
    for c in courses:
        # Parse videos
        vids = []
        if c.tutorial_videos:
            try:
                import json
                vids = json.loads(c.tutorial_videos) if isinstance(c.tutorial_videos, str) else c.tutorial_videos
            except Exception:
                vids = []

        # Parse syllabus files
        files = []
        if c.syllabus_files:
            try:
                import json
                files = json.loads(c.syllabus_files) if isinstance(c.syllabus_files, str) else c.syllabus_files
            except Exception:
                files = [c.syllabus_files] if c.syllabus_files else []

        dur = c.course_duration or c.duration or ""
        fee_val = c.course_fee if c.course_fee is not None else (c.fees if c.fees is not None else 0.0)
        try:
            fee_num = float(fee_val)
        except Exception:
            fee_num = 0.0

        result.append({
            "id": c.id,
            "course_id": c.course_id or f"CRS{c.id:03d}",
            "course_name": c.course_name or "",
            "duration": dur,
            "course_duration": dur,
            "fees": fee_num,
            "course_fee": fee_num,
            "tutorial_videos": vids if isinstance(vids, list) else [],
            "syllabus_files": files if isinstance(files, list) else [],
            "status": c.status or "Active"
        })
    return result

@courses_router.get("/{identifier}")
def get_course(identifier: str, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    is_num = identifier.isdigit()
    c = db.query(TCCourse).filter(
        (TCCourse.course_id == identifier) | (TCCourse.id == int(identifier) if is_num else False),
        TCCourse.deleted == 0
    ).first()
    if not c:
        raise HTTPException(status_code=404, detail="Course not found")

    import json
    vids = []
    if c.tutorial_videos:
        try:
            vids = json.loads(c.tutorial_videos) if isinstance(c.tutorial_videos, str) else c.tutorial_videos
        except Exception:
            vids = []

    files = []
    if c.syllabus_files:
        try:
            files = json.loads(c.syllabus_files) if isinstance(c.syllabus_files, str) else c.syllabus_files
        except Exception:
            files = [c.syllabus_files] if c.syllabus_files else []

    dur = c.course_duration or c.duration or ""
    fee_val = c.course_fee if c.course_fee is not None else (c.fees if c.fees is not None else 0.0)
    try:
        fee_num = float(fee_val)
    except Exception:
        fee_num = 0.0

    return {
        "id": c.id,
        "course_id": c.course_id or f"CRS{c.id:03d}",
        "course_name": c.course_name or "",
        "duration": dur,
        "course_duration": dur,
        "fees": fee_num,
        "course_fee": fee_num,
        "tutorial_videos": vids if isinstance(vids, list) else [],
        "syllabus_files": files if isinstance(files, list) else [],
        "status": c.status or "Active"
    }

@courses_router.post("")
def create_course(data: dict, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    import json
    vids = data.get("tutorial_videos", [])
    vids_json = json.dumps(vids) if isinstance(vids, (list, dict)) else (str(vids) if vids else "[]")

    files = data.get("syllabus_files", [])
    files_json = json.dumps(files) if isinstance(files, (list, dict)) else (str(files) if files else "[]")

    dur = data.get("duration") or data.get("course_duration") or ""
    fee = data.get("fees") or data.get("course_fee") or 0

    course = TCCourse(
        course_name=data.get("course_name"),
        course_duration=str(dur),
        duration=str(dur),
        course_fee=str(fee),
        fees=Decimal(str(fee)) if str(fee).replace('.', '', 1).isdigit() else Decimal("0.00"),
        tutorial_videos=vids_json,
        syllabus_files=files_json,
        status=data.get("status") or "Active"
    )
    db.add(course)
    db.commit()
    db.refresh(course)
    course.course_id = f"CRS{course.id:03d}"
    db.commit()
    return course

@courses_router.put("/{identifier}")
def update_course(identifier: str, data: dict, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    import json
    is_num = identifier.isdigit()
    course = db.query(TCCourse).filter(
        (TCCourse.course_id == identifier) | (TCCourse.id == int(identifier) if is_num else False),
        TCCourse.deleted == 0
    ).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    if "course_name" in data:
        course.course_name = data.get("course_name")
    if "duration" in data or "course_duration" in data:
        dur = str(data.get("duration") or data.get("course_duration") or "")
        course.duration = dur
        course.course_duration = dur
    if "fees" in data or "course_fee" in data:
        fee = str(data.get("fees") or data.get("course_fee") or 0)
        course.course_fee = fee
        if fee.replace('.', '', 1).isdigit():
            course.fees = Decimal(fee)
    if "tutorial_videos" in data:
        vids = data.get("tutorial_videos")
        course.tutorial_videos = json.dumps(vids) if isinstance(vids, (list, dict)) else str(vids or "[]")
    if "syllabus_files" in data:
        files = data.get("syllabus_files")
        course.syllabus_files = json.dumps(files) if isinstance(files, (list, dict)) else str(files or "[]")
    if "status" in data:
        course.status = data.get("status")

    db.commit()
    db.refresh(course)
    return course

@courses_router.delete("/{identifier}")
def delete_course(identifier: str, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    is_num = identifier.isdigit()
    course = db.query(TCCourse).filter(
        (TCCourse.course_id == identifier) | (TCCourse.id == int(identifier) if is_num else False)
    ).first()
    if course:
        course.deleted = 1
        db.commit()
    return {"message": "Course deleted successfully"}

# Enrollments Router
enrollments_router = APIRouter(prefix="/enrollments", tags=["Enrollments"])

@enrollments_router.get("")
def list_enrollments(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return db.query(TCEnrollment).filter(TCEnrollment.deleted == 0).order_by(TCEnrollment.id.desc()).all()

@enrollments_router.post("")
def create_enrollment(data: dict, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    fees = Decimal(str(data.get("fees_amount", 0)))
    paid = Decimal(str(data.get("paid_amount", 0)))
    bal = fees - paid
    
    enr = TCEnrollment(
        student_name=data.get("student_name"),
        father_spouse_name=data.get("father_spouse_name"),
        address=data.get("address"),
        mobile_number=data.get("mobile_number"),
        parent_contact_no=data.get("parent_contact_no"),
        course_id=data.get("course_id"),
        duration=data.get("duration"),
        from_time=data.get("from_time"),
        to_time=data.get("to_time"),
        staff_id=data.get("staff_id"),
        fees_type=data.get("fees_type", "One Time"),
        fees_amount=fees,
        paid_amount=paid,
        balance_amount=bal,
        dob=data.get("dob"),
        doj=data.get("doj") or date.today(),
        blood_group=data.get("blood_group")
    )
    db.add(enr)
    db.commit()
    db.refresh(enr)
    enr.student_id = f"WG{date.today().strftime('%y')}{enr.id:04d}"
    enr.enrollment_id = f"ENR{enr.id:05d}"

    # Auto generate installments if balance exists
    if bal > 0:
        num_inst = int(data.get("num_installments", 2))
        inst_amt = bal / num_inst
        for i in range(1, num_inst + 1):
            inst = TCInstallment(
                course_type="Training",
                student_id=enr.student_id,
                student_name=enr.student_name,
                installment_no=i,
                installment_amount=inst_amt,
                paid_amount=0,
                balance_amount=inst_amt,
                status="Pending"
            )
            db.add(inst)

    db.commit()
    return enr

# Payments Router
payments_router = APIRouter(prefix="/payments", tags=["Payments"])

@payments_router.get("")
def list_payments(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return db.query(TCPayment).filter(TCPayment.deleted == 0).order_by(TCPayment.id.desc()).all()

@payments_router.post("")
def create_payment(data: dict, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    amount = Decimal(str(data.get("amount", 0)))
    gst = Decimal(str(data.get("gst_percent", 0)))
    gst_amt = (amount * gst) / Decimal(100)
    total = amount + gst_amt

    pay = TCPayment(
        receipt_date=data.get("receipt_date") or date.today(),
        course_type=data.get("course_type", "Training"),
        student_id=data.get("student_id"),
        student_name=data.get("student_name"),
        course_id=data.get("course_id"),
        payment_mode_id=data.get("payment_mode_id"),
        bank_id=data.get("bank_id"),
        amount=amount,
        gst_percent=gst,
        gst_amount=gst_amt,
        total_amount=total,
        payment_reference=data.get("payment_reference"),
        remarks=data.get("remarks")
    )
    db.add(pay)
    db.commit()
    db.refresh(pay)
    pay.receipt_no = f"WG-REC-{pay.id:05d}"
    pay.receipt_id = f"REC{pay.id:05d}"

    # Update student enrollment balance
    enr = db.query(TCEnrollment).filter(TCEnrollment.student_id == pay.student_id).first()
    if enr:
        enr.paid_amount = (enr.paid_amount or Decimal(0)) + amount
        enr.balance_amount = max(Decimal(0), (enr.fees_amount or Decimal(0)) - enr.paid_amount)

    db.commit()
    return pay

# Enquiries Router
enquiries_router = APIRouter(prefix="/enquiries", tags=["Enquiries"])

@enquiries_router.get("")
def list_enquiries(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return db.query(TCCourseEnquiry).filter(TCCourseEnquiry.deleted == 0).order_by(TCCourseEnquiry.id.desc()).all()

# Attendance Router
attendance_router = APIRouter(prefix="/attendance", tags=["Attendance"])

@attendance_router.get("/staff")
def list_staff_attendance(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return db.query(TCAttendance).filter(TCAttendance.deleted == 0).order_by(TCAttendance.id.desc()).limit(100).all()

@attendance_router.get("/students")
def list_student_attendance(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return db.query(TCStudentAttendance).filter(TCStudentAttendance.deleted == 0).order_by(TCStudentAttendance.id.desc()).limit(100).all()

# Leaves Router
leaves_router = APIRouter(prefix="/leaves", tags=["Leaves"])

@leaves_router.get("")
def list_leaves(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return db.query(TCStaffLeaveRequest).filter(TCStaffLeaveRequest.deleted == 0).order_by(TCStaffLeaveRequest.id.desc()).all()

# Payroll Router
payroll_router = APIRouter(prefix="/payroll", tags=["Payroll"])

@payroll_router.get("")
def list_payroll(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return db.query(TCPayroll).filter(TCPayroll.deleted == 0).order_by(TCPayroll.id.desc()).all()

# Expenses Router
expenses_router = APIRouter(prefix="/expenses", tags=["Expenses"])

@expenses_router.get("")
def list_expenses(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return db.query(TCExpenseEntry).filter(TCExpenseEntry.deleted == 0).order_by(TCExpenseEntry.id.desc()).all()

@expenses_router.get("/categories")
def list_expense_categories(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return db.query(TCExpenseCategory).filter(TCExpenseCategory.deleted == 0).all()

@expenses_router.get("/banks")
def list_banks(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return db.query(TCBank).filter(TCBank.deleted == 0).all()

@expenses_router.get("/payment-modes")
def list_payment_modes(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return db.query(TCPaymentMode).filter(TCPaymentMode.deleted == 0).all()

# Tasks Router
tasks_router = APIRouter(prefix="/tasks", tags=["Tasks"])

@tasks_router.get("")
def list_tasks(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return db.query(TCStudentTask).filter(TCStudentTask.deleted == 0).order_by(TCStudentTask.id.desc()).all()

# Feedback Router
feedback_router = APIRouter(prefix="/feedback", tags=["Feedback"])

@feedback_router.get("")
def list_feedback(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return db.query(TCStudentFeedback).filter(TCStudentFeedback.deleted == 0).order_by(TCStudentFeedback.id.desc()).all()

# Events Router
events_router = APIRouter(prefix="/events", tags=["Events"])

@events_router.get("")
def list_events(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return db.query(TCEvent).filter(TCEvent.deleted == 0).order_by(TCEvent.id.desc()).all()

# Questions Router
questions_router = APIRouter(prefix="/questions", tags=["Questions"])

@questions_router.get("")
def list_questions(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return db.query(TCQuestion).filter(TCQuestion.deleted == 0).order_by(TCQuestion.id.desc()).all()

# Reports Router
reports_router = APIRouter(prefix="/reports", tags=["Reports"])

@reports_router.get("/summary")
def get_reports_summary(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return {
        "enrollments_count": db.query(TCEnrollment).filter(TCEnrollment.deleted == 0).count(),
        "payments_count": db.query(TCPayment).filter(TCPayment.deleted == 0).count(),
        "expenses_count": db.query(TCExpenseEntry).filter(TCExpenseEntry.deleted == 0).count(),
        "staff_count": db.query(TCStaff).filter(TCStaff.deleted == 0).count(),
    }

@reports_router.get("/rpt_staff_list.php")
@reports_router.get("/rpt_staff_list")
def rpt_staff_list_pdf(
    search: Optional[str] = "",
    current_status: Optional[str] = "Active",
    salary_filter: Optional[str] = "without_salary",
    db: Session = Depends(get_db)
):
    query = db.query(TCStaff).filter(TCStaff.deleted == 0)
    
    if current_status and current_status.lower() != "all":
        query = query.filter(TCStaff.status.ilike(current_status))
        
    records = query.order_by(TCStaff.id.asc()).all()
    
    # Map roles
    roles_list = db.query(TCRole).filter(TCRole.deleted == 0).all()
    roles_map = {}
    for r in roles_list:
        roles_map[str(r.id)] = r.role_name
        if r.role_id:
            roles_map[str(r.role_id)] = r.role_name

    staff_data = []
    for s in records:
        role_title = roles_map.get(str(s.role_id), "staff") if s.role_id else "staff"
        if not s.role_id or role_title == "staff":
            if s.course_id and "enroll" in str(s.course_id).lower():
                role_title = "incharger - enrollment"
            elif s.course_id and "telecall" in str(s.course_id).lower():
                role_title = "telecaller"

        st_id = s.staff_id or f"ST{s.id:03d}"
        s_name = s.staff_name or ""
        s_num = s.staff_number or ""
        s_user = s.username or ""
        
        # Apply search filter if present
        if search:
            q = search.lower().strip()
            if (q not in st_id.lower() and 
                q not in s_name.lower() and 
                q not in s_num.lower() and 
                q not in role_title.lower() and 
                q not in s_user.lower()):
                continue

        staff_data.append({
            "id": s.id,
            "staff_id": st_id,
            "staff_name": s_name,
            "staff_number": s_num,
            "role": role_title,
            "salary": float(s.salary) if s.salary is not None else 0.0,
            "username": s_user,
            "doj": s.doj.isoformat() if s.doj else "",
            "status": s.status or "Active"
        })

    pdf_bytes = generate_staff_list_pdf(
        staff_records=staff_data,
        current_status=current_status or "Active",
        salary_filter=salary_filter or "without_salary",
        search_query=search or ""
    )
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"inline; filename=rpt_staff_list_{current_status}_{datetime.now().strftime('%Y%m%d')}.pdf"
        }
    )

# Campaigns Router
campaigns_router = APIRouter(prefix="/campaigns", tags=["Campaigns"])

@campaigns_router.post("/send")
def send_whatsapp_campaign(data: dict, current_user: dict = Depends(get_current_user)):
    return {
        "status": "success",
        "message": f"WhatsApp broadcast initiated for template '{data.get('template_name', 'default')}'",
        "recipients_count": 48
    }
