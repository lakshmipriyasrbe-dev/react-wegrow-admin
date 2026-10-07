from sqlalchemy import Column, Integer, BigInteger, String, Text, DateTime, Date, Numeric, func
from app.database.session import Base

class TCStaff(Base):
    __tablename__ = "tc_staff"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    created_date_time = Column(DateTime, default=func.now())
    updated_date_time = Column(DateTime, default=func.now(), onupdate=func.now())
    staff_id = Column(Text, nullable=True)
    staff_name = Column(Text, nullable=True)
    staff_number = Column(Text, nullable=True)
    role_id = Column(Integer, nullable=True)
    course_id = Column(Text, nullable=True)
    salary = Column(Numeric(12, 2), default=0.00)
    username = Column(Text, nullable=True)
    password = Column(Text, nullable=True)
    address = Column(Text, nullable=True)
    doj = Column(Date, nullable=True)
    status = Column(String(50), default="Active")
    status_notes = Column(Text, nullable=True)
    deleted = Column(Integer, default=0, index=True)

class TCStaffLeaveRequest(Base):
    __tablename__ = "tc_staff_leave_requests"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    created_date_time = Column(DateTime, default=func.now())
    updated_date_time = Column(DateTime, default=func.now(), onupdate=func.now())
    leave_id = Column(Text, nullable=True)
    staff_id = Column(Text, nullable=True)
    leave_type = Column(Text, nullable=True)
    from_date = Column(Date, nullable=True)
    to_date = Column(Date, nullable=True)
    total_days = Column(Numeric(5, 1), default=1.0)
    reason = Column(Text, nullable=True)
    status = Column(Text, default="Pending")
    remarks = Column(Text, nullable=True)
    approved_by = Column(Text, nullable=True)
    deleted = Column(Integer, default=0, index=True)

class TCAttendance(Base):
    __tablename__ = "tc_attendance"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    created_date_time = Column(DateTime, default=func.now())
    updated_date_time = Column(DateTime, default=func.now())
    attendance_id = Column(Text, nullable=True)
    attendance_date = Column(Date, nullable=True)
    staff_id = Column(Text, nullable=True)
    in_time = Column(Text, nullable=True)
    out_time = Column(Text, nullable=True)
    attendance_status = Column(Text, default="Present")
    remarks = Column(Text, nullable=True)
    deleted = Column(Integer, default=0, index=True)

class TCDailyReport(Base):
    __tablename__ = "tc_daily_reports"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    created_date_time = Column(DateTime, default=func.now())
    updated_date_time = Column(DateTime, default=func.now())
    report_id = Column(Text, nullable=True)
    staff_id = Column(Text, nullable=True)
    report_date = Column(Date, nullable=True)
    work_description = Column(Text, nullable=True)
    topics_covered = Column(Text, nullable=True)
    challenges = Column(Text, nullable=True)
    deleted = Column(Integer, default=0, index=True)
