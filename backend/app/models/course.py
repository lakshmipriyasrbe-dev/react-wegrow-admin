from sqlalchemy import Column, Integer, BigInteger, String, Text, DateTime, Date, Numeric, func
from app.database.session import Base

class TCCourse(Base):
    __tablename__ = "tc_course"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    created_date_time = Column(DateTime, default=func.now())
    updated_date_time = Column(DateTime, default=func.now(), onupdate=func.now())
    company_id = Column(Text, nullable=True)
    course_id = Column(Text, nullable=True)
    course_name = Column(Text, nullable=True)
    course_duration = Column(Text, nullable=True)
    course_fee = Column(Text, nullable=True)
    duration = Column(Text, nullable=True) # Alias
    fees = Column(Numeric(12, 2), default=0.00) # Alias
    tutorial_videos = Column(Text, nullable=True)
    syllabus_files = Column(Text, nullable=True)
    syllabus = Column(Text, nullable=True)
    status = Column(Text, default="Active")
    deleted = Column(Integer, default=0, index=True)

class TCCourseEnquiry(Base):
    __tablename__ = "tc_course_enquiry"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    created_date_time = Column(DateTime, default=func.now())
    updated_date_time = Column(DateTime, default=func.now(), onupdate=func.now())
    enquiry_id = Column(Text, nullable=True)
    student_name = Column(Text, nullable=True)
    mobile_number = Column(Text, nullable=True)
    email = Column(Text, nullable=True)
    course_id = Column(Text, nullable=True)
    enquiry_date = Column(Date, nullable=True)
    enquiry_type = Column(Text, nullable=True)
    assigned_staff_id = Column(Text, nullable=True)
    status = Column(Text, default="Interested")
    remarks = Column(Text, nullable=True)
    deleted = Column(Integer, default=0, index=True)

class TCEnquiryFollowup(Base):
    __tablename__ = "tc_enquiry_followup"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    created_date_time = Column(DateTime, default=func.now())
    updated_date_time = Column(DateTime, default=func.now())
    enquiry_id = Column(Text, nullable=True)
    followup_date = Column(Date, nullable=True)
    next_followup_date = Column(Date, nullable=True)
    remarks = Column(Text, nullable=True)
    status = Column(Text, default="Pending")
    staff_id = Column(Text, nullable=True)
    deleted = Column(Integer, default=0)

class TCCourseClosure(Base):
    __tablename__ = "tc_course_closure"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    created_date_time = Column(DateTime, default=func.now())
    updated_date_time = Column(DateTime, default=func.now())
    closure_id = Column(Text, nullable=True)
    closure_date = Column(Date, nullable=True)
    course_type = Column(Text, nullable=True)
    student_id = Column(Text, nullable=True)
    student_name = Column(Text, nullable=True)
    course_id = Column(Text, nullable=True)
    remarks = Column(Text, nullable=True)
    deleted = Column(Integer, default=0)

class TCPamphletRegistration(Base):
    __tablename__ = "tc_pamphlet_registration"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    created_date_time = Column(DateTime, default=func.now())
    updated_date_time = Column(DateTime, default=func.now())
    registration_id = Column(Text, nullable=True)
    student_name = Column(Text, nullable=True)
    mobile_number = Column(Text, nullable=True)
    email = Column(Text, nullable=True)
    college_name = Column(Text, nullable=True)
    department = Column(Text, nullable=True)
    year_of_study = Column(Text, nullable=True)
    course_interest = Column(Text, nullable=True)
    reference_source = Column(Text, nullable=True)
    status = Column(Text, default="New")
    deleted = Column(Integer, default=0)

class TCOffer(Base):
    __tablename__ = "tc_offer"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    created_date_time = Column(DateTime, default=func.now())
    updated_date_time = Column(DateTime, default=func.now())
    offer_id = Column(Text, nullable=True)
    student_id = Column(Text, nullable=True)
    student_name = Column(Text, nullable=True)
    company_name = Column(Text, nullable=True)
    designation = Column(Text, nullable=True)
    package_amount = Column(Numeric(12, 2), default=0.00)
    joining_date = Column(Date, nullable=True)
    offer_letter_doc = Column(Text, nullable=True)
    deleted = Column(Integer, default=0)
