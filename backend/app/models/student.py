from sqlalchemy import Column, Integer, BigInteger, String, Text, DateTime, Date, Numeric, func
from app.database.session import Base

class TCStudentAttendance(Base):
    __tablename__ = "tc_student_attendance"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    created_date_time = Column(DateTime, default=func.now())
    updated_date_time = Column(DateTime, default=func.now())
    attendance_id = Column(Text, nullable=True)
    attendance_date = Column(Date, nullable=True)
    course_type = Column(Text, default="Training")
    student_id = Column(Text, nullable=True, index=True)
    course_id = Column(Text, nullable=True)
    staff_id = Column(Text, nullable=True)
    attendance_status = Column(Text, default="Present")
    deleted = Column(Integer, default=0, index=True)

class TCStudentDailyReport(Base):
    __tablename__ = "tc_student_daily_reports"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    created_date_time = Column(DateTime, default=func.now())
    updated_date_time = Column(DateTime, default=func.now())
    report_id = Column(Text, nullable=True)
    student_id = Column(Text, nullable=True, index=True)
    student_name = Column(Text, nullable=True)
    course_id = Column(Text, nullable=True)
    staff_id = Column(Text, nullable=True)
    report_date = Column(Date, nullable=True)
    topic_covered = Column(Text, nullable=True)
    tasks_completed = Column(Text, nullable=True)
    doubt_queries = Column(Text, nullable=True)
    trainer_remarks = Column(Text, nullable=True)
    status = Column(Text, default="Submitted")
    deleted = Column(Integer, default=0)

class TCStudentReport(Base):
    __tablename__ = "tc_student_reports"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    created_date_time = Column(DateTime, default=func.now())
    report_id = Column(Text, nullable=True)
    student_id = Column(Text, nullable=True)
    task_id = Column(Text, nullable=True)
    submission_notes = Column(Text, nullable=True)
    file_path = Column(Text, nullable=True)
    deleted = Column(Integer, default=0)

class TCStudentTask(Base):
    __tablename__ = "tc_student_tasks"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    created_date_time = Column(DateTime, default=func.now())
    updated_date_time = Column(DateTime, default=func.now())
    task_id = Column(Text, nullable=True)
    student_id = Column(Text, nullable=True, index=True)
    course_id = Column(Text, nullable=True)
    staff_id = Column(Text, nullable=True)
    task_title = Column(Text, nullable=True)
    task_description = Column(Text, nullable=True)
    due_date = Column(Date, nullable=True)
    status = Column(Text, default="Pending")
    marks = Column(Numeric(5, 2), default=0.00)
    trainer_feedback = Column(Text, nullable=True)
    deleted = Column(Integer, default=0)

class TCStudentPerformance(Base):
    __tablename__ = "tc_student_performance"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    created_date_time = Column(DateTime, default=func.now())
    updated_date_time = Column(DateTime, default=func.now())
    perf_id = Column(Text, nullable=True)
    student_id = Column(Text, nullable=True, index=True)
    course_id = Column(Text, nullable=True)
    staff_id = Column(Text, nullable=True)
    month_year = Column(Text, nullable=True)
    theory_score = Column(Numeric(5, 2), default=0.00)
    practical_score = Column(Numeric(5, 2), default=0.00)
    overall_rating = Column(Text, nullable=True)
    remarks = Column(Text, nullable=True)
    deleted = Column(Integer, default=0)

class TCStudentFeedback(Base):
    __tablename__ = "tc_student_feedback"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    created_date_time = Column(DateTime, default=func.now())
    updated_date_time = Column(DateTime, default=func.now(), onupdate=func.now())
    feedback_id = Column(Text, nullable=True)
    student_id = Column(Text, nullable=True, index=True)
    student_name = Column(Text, nullable=True)
    staff_id = Column(Text, nullable=True)
    course_id = Column(Text, nullable=True)
    feedback_type = Column(Text, default="Trainer")
    priority = Column(Text, default="Medium")
    rating = Column(Integer, default=5)
    subject = Column(Text, nullable=True)
    description = Column(Text, nullable=True)
    status = Column(Text, default="Pending")
    resolution_remarks = Column(Text, nullable=True)
    reviewed_by = Column(Text, nullable=True)
    reviewed_date = Column(DateTime, nullable=True)
    deleted = Column(Integer, default=0, index=True)
