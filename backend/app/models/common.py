from sqlalchemy import Column, Integer, BigInteger, String, Text, DateTime, Date, Numeric, func
from app.database.session import Base

class TCExpenseCategory(Base):
    __tablename__ = "tc_expense_category"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    created_date_time = Column(DateTime, default=func.now())
    updated_date_time = Column(DateTime, default=func.now(), onupdate=func.now())
    expense_category_id = Column(Text, nullable=True)
    expense_category_name = Column(Text, nullable=True)
    deleted = Column(Integer, default=0, index=True)

class TCExpenseEntry(Base):
    __tablename__ = "tc_expense_entry"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    created_date_time = Column(DateTime, default=func.now())
    updated_date_time = Column(DateTime, default=func.now(), onupdate=func.now())
    expense_id = Column(Text, nullable=True)
    expense_date = Column(Date, nullable=True)
    expense_category_id = Column(Text, nullable=True)
    staff_id = Column(Text, nullable=True)
    payment_mode_id = Column(Text, nullable=True)
    bank_id = Column(Text, nullable=True)
    amount = Column(Numeric(12, 2), default=0.00)
    description = Column(Text, nullable=True)
    bill_copy = Column(Text, nullable=True)
    deleted = Column(Integer, default=0, index=True)

class TCPayroll(Base):
    __tablename__ = "tc_payroll"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    created_date_time = Column(DateTime, default=func.now())
    updated_date_time = Column(DateTime, default=func.now(), onupdate=func.now())
    payroll_id = Column(Text, nullable=True)
    staff_id = Column(Text, nullable=True, index=True)
    month_year = Column(Text, nullable=True)
    basic_salary = Column(Numeric(12, 2), default=0.00)
    allowance = Column(Numeric(12, 2), default=0.00)
    deduction = Column(Numeric(12, 2), default=0.00)
    net_salary = Column(Numeric(12, 2), default=0.00)
    paid_date = Column(Date, nullable=True)
    payment_mode_id = Column(Text, nullable=True)
    bank_id = Column(Text, nullable=True)
    status = Column(Text, default="Paid")
    deleted = Column(Integer, default=0, index=True)

class TCEventCategory(Base):
    __tablename__ = "tc_event_category"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    created_date_time = Column(DateTime, default=func.now())
    updated_date_time = Column(DateTime, default=func.now())
    category_id = Column(Text, nullable=True)
    category_name = Column(Text, nullable=True)
    deleted = Column(Integer, default=0)

class TCEvent(Base):
    __tablename__ = "tc_event"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    created_date_time = Column(DateTime, default=func.now())
    updated_date_time = Column(DateTime, default=func.now(), onupdate=func.now())
    event_id = Column(Text, nullable=True)
    event_name = Column(Text, nullable=True)
    category_id = Column(Text, nullable=True)
    venue = Column(Text, nullable=True)
    event_date = Column(Date, nullable=True)
    from_time = Column(Text, nullable=True)
    to_time = Column(Text, nullable=True)
    organizer = Column(Text, nullable=True)
    status = Column(Text, default="Upcoming")
    document = Column(Text, nullable=True)
    deleted = Column(Integer, default=0, index=True)

class TCTask(Base):
    __tablename__ = "tc_tasks"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    created_date_time = Column(DateTime, default=func.now())
    updated_date_time = Column(DateTime, default=func.now(), onupdate=func.now())
    task_id = Column(Text, nullable=True)
    assigned_by = Column(Text, nullable=True)
    assigned_to = Column(Text, nullable=True)
    title = Column(Text, nullable=True)
    description = Column(Text, nullable=True)
    priority = Column(Text, default="Medium")
    status = Column(Text, default="Pending")
    due_date = Column(Date, nullable=True)
    deleted = Column(Integer, default=0, index=True)

class TCTaskComment(Base):
    __tablename__ = "tc_task_comments"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    created_date_time = Column(DateTime, default=func.now())
    task_id = Column(Text, nullable=True)
    user_id = Column(Text, nullable=True)
    comment = Column(Text, nullable=True)
    deleted = Column(Integer, default=0)

class TCQuestion(Base):
    __tablename__ = "tc_questions"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    created_date_time = Column(DateTime, default=func.now())
    updated_date_time = Column(DateTime, default=func.now())
    question_id = Column(Text, nullable=True)
    course_id = Column(Text, nullable=True)
    topic = Column(Text, nullable=True)
    question_text = Column(Text, nullable=True)
    option_a = Column(Text, nullable=True)
    option_b = Column(Text, nullable=True)
    option_c = Column(Text, nullable=True)
    option_d = Column(Text, nullable=True)
    correct_option = Column(Text, nullable=True)
    marks = Column(Integer, default=1)
    deleted = Column(Integer, default=0, index=True)

class TCQuestionSet(Base):
    __tablename__ = "tc_question_sets"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    created_date_time = Column(DateTime, default=func.now())
    updated_date_time = Column(DateTime, default=func.now())
    set_id = Column(Text, nullable=True)
    set_name = Column(Text, nullable=True)
    course_id = Column(Text, nullable=True)
    total_questions = Column(Integer, default=0)
    duration_minutes = Column(Integer, default=30)
    deleted = Column(Integer, default=0)

class TCTestAttempt(Base):
    __tablename__ = "tc_test_attempts"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    created_date_time = Column(DateTime, default=func.now())
    updated_date_time = Column(DateTime, default=func.now())
    attempt_id = Column(Text, nullable=True)
    test_id = Column(Text, nullable=True)
    student_id = Column(Text, nullable=True)
    course_id = Column(Text, nullable=True)
    total_questions = Column(Integer, default=0)
    correct_answers = Column(Integer, default=0)
    wrong_answers = Column(Integer, default=0)
    score_percentage = Column(Numeric(5, 2), default=0.00)
    status = Column(Text, default="Completed")
    deleted = Column(Integer, default=0)

class TCTestAnswer(Base):
    __tablename__ = "tc_test_answers"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    created_date_time = Column(DateTime, default=func.now())
    updated_date_time = Column(DateTime, default=func.now())
    attempt_id = Column(Text, nullable=True)
    question_id = Column(Integer, nullable=True)
    selected_option = Column(Text, nullable=True)
    is_correct = Column(Integer, default=0)
    deleted = Column(Integer, default=0)
