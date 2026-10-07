from sqlalchemy import Column, Integer, BigInteger, String, Text, DateTime, Date, Numeric, func
from app.database.session import Base

class TCPayment(Base):
    __tablename__ = "tc_payment"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    created_date_time = Column(DateTime, default=func.now())
    updated_date_time = Column(DateTime, default=func.now(), onupdate=func.now())
    receipt_id = Column(Text, nullable=True)
    receipt_no = Column(Text, nullable=True)
    receipt_date = Column(Date, nullable=True)
    course_type = Column(Text, default="Training")
    student_id = Column(Text, nullable=True, index=True)
    student_name = Column(Text, nullable=True)
    course_id = Column(Text, nullable=True)
    payment_mode_id = Column(Text, nullable=True)
    bank_id = Column(Text, nullable=True)
    amount = Column(Numeric(12, 2), default=0.00)
    gst_percent = Column(Numeric(5, 2), default=0.00)
    gst_amount = Column(Numeric(12, 2), default=0.00)
    total_amount = Column(Numeric(12, 2), default=0.00)
    payment_reference = Column(Text, nullable=True)
    remarks = Column(Text, nullable=True)
    deleted = Column(Integer, default=0, index=True)

class TCInstallment(Base):
    __tablename__ = "tc_installments"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    created_date_time = Column(DateTime, default=func.now())
    updated_date_time = Column(DateTime, default=func.now(), onupdate=func.now())
    installment_id = Column(Text, nullable=True)
    course_type = Column(Text, default="Training")
    student_id = Column(Text, nullable=True, index=True)
    student_name = Column(Text, nullable=True)
    installment_no = Column(Integer, default=1)
    due_date = Column(Date, nullable=True)
    installment_amount = Column(Numeric(12, 2), default=0.00)
    paid_amount = Column(Numeric(12, 2), default=0.00)
    balance_amount = Column(Numeric(12, 2), default=0.00)
    status = Column(Text, default="Pending")
    deleted = Column(Integer, default=0, index=True)

class TCInstallmentFollowupAssign(Base):
    __tablename__ = "tc_installment_followup_assign"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    created_date_time = Column(DateTime, default=func.now())
    updated_date_time = Column(DateTime, default=func.now())
    assign_id = Column(Text, nullable=True)
    student_id = Column(Text, nullable=True)
    staff_id = Column(Text, nullable=True)
    assigned_date = Column(Date, nullable=True)
    deleted = Column(Integer, default=0)

class TCInstallmentFollowupHistory(Base):
    __tablename__ = "tc_installment_followup_history"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    created_date_time = Column(DateTime, default=func.now())
    updated_date_time = Column(DateTime, default=func.now())
    followup_id = Column(Text, nullable=True)
    student_id = Column(Text, nullable=True)
    staff_id = Column(Text, nullable=True)
    followup_date = Column(Date, nullable=True)
    next_followup_date = Column(Date, nullable=True)
    remarks = Column(Text, nullable=True)
    status = Column(Text, default="Pending")
    deleted = Column(Integer, default=0)

class TCInstallmentReminderHistory(Base):
    __tablename__ = "tc_installment_reminder_history"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    created_date_time = Column(DateTime, default=func.now())
    reminder_id = Column(Text, nullable=True)
    student_id = Column(Text, nullable=True)
    installment_id = Column(Text, nullable=True)
    reminder_type = Column(Text, default="WhatsApp")
    status = Column(Text, default="Sent")
    deleted = Column(Integer, default=0)
