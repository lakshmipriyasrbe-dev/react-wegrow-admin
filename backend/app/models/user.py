from sqlalchemy import Column, Integer, BigInteger, String, Text, DateTime, Date, Numeric, SmallInteger, func
from app.database.session import Base

class TCUser(Base):
    __tablename__ = "tc_users"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    created_date_time = Column(DateTime, default=func.now())
    updated_date_time = Column(DateTime, default=func.now(), onupdate=func.now())
    company_id = Column(Text, nullable=True)
    user_id = Column(Text, nullable=True)
    username = Column(Text, nullable=True)
    password = Column(Text, nullable=True)
    role = Column(Text, nullable=True)
    role_id = Column(String(50), nullable=True)
    name = Column(Text, nullable=True)
    email = Column(Text, nullable=True)
    mobile = Column(Text, nullable=True)
    custom_id = Column(Text, nullable=True)
    unique_number = Column(Text, nullable=True)
    deleted = Column(Integer, default=0, index=True)

    @property
    def user_name(self):
        return self.name or self.username

    @user_name.setter
    def user_name(self, val):
        self.name = val

    @property
    def mobile_number(self):
        return self.mobile

    @mobile_number.setter
    def mobile_number(self, val):
        self.mobile = val

class TCLogin(Base):
    __tablename__ = "tc_logins"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    login_date_time = Column(DateTime, default=func.now())
    logout_date_time = Column(DateTime, nullable=True)
    company_id = Column(Text, nullable=True)
    user_id = Column(Text, nullable=True)
    deleted = Column(Integer, default=0)

class TCAuditLog(Base):
    __tablename__ = "tc_audit_logs"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    created_date_time = Column(DateTime, default=func.now())
    updated_date_time = Column(DateTime, default=func.now())
    table_name = Column(Text, nullable=True)
    record_id = Column(Text, nullable=True)
    action = Column(Text, nullable=True)
    query = Column(Text, nullable=True)
    user_id = Column(Text, nullable=True)
    deleted = Column(Integer, default=0)
