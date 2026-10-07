from sqlalchemy import Column, Integer, BigInteger, String, Text, DateTime, func
from app.database.session import Base

class TCRole(Base):
    __tablename__ = "tc_roles"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    created_date_time = Column(DateTime, default=func.now())
    updated_date_time = Column(DateTime, default=func.now(), onupdate=func.now())
    company_id = Column(Text, nullable=True)
    role_id = Column(Text, nullable=True)
    role_name = Column(Text, nullable=True)
    description = Column(Text, nullable=True)
    deleted = Column(Integer, default=0, index=True)

class TCRolePermission(Base):
    __tablename__ = "tc_role_permissions"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    created_date_time = Column(DateTime, default=func.now())
    updated_date_time = Column(DateTime, default=func.now(), onupdate=func.now())
    company_id = Column(String(100), nullable=True)
    role_id = Column(String(100), nullable=True)
    permission_page = Column(String(100), nullable=True)
    permission_action = Column(Text, nullable=True)
    deleted = Column(Integer, default=0, index=True)
