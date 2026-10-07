from sqlalchemy import Column, Integer, BigInteger, String, Text, DateTime, Numeric, func
from app.database.session import Base

class TCCompany(Base):
    __tablename__ = "tc_company"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    created_date_time = Column(DateTime, default=func.now())
    updated_date_time = Column(DateTime, default=func.now(), onupdate=func.now())
    company_id = Column(Text, nullable=True)
    company_name = Column(Text, nullable=True)
    company_email = Column(Text, nullable=True)
    company_mobile = Column(Text, nullable=True)
    company_address = Column(Text, nullable=True)
    gst = Column(Text, nullable=True)
    branch = Column(Text, nullable=True)
    logo_image = Column(Text, nullable=True)
    deleted = Column(Integer, default=0, index=True)

class TCBank(Base):
    __tablename__ = "tc_bank"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    created_date_time = Column(DateTime, default=func.now())
    updated_date_time = Column(DateTime, default=func.now(), onupdate=func.now())
    bank_id = Column(Text, nullable=True)
    bank_name = Column(Text, nullable=True)
    account_name = Column(Text, nullable=True)
    account_number = Column(Text, nullable=True)
    ifsc_code = Column(Text, nullable=True)
    payment_modes = Column(Text, nullable=True)
    branch = Column(Text, nullable=True)
    deleted = Column(Integer, default=0, index=True)

class TCPaymentMode(Base):
    __tablename__ = "tc_payment_mode"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    created_date_time = Column(DateTime, default=func.now())
    updated_date_time = Column(DateTime, default=func.now(), onupdate=func.now())
    payment_mode_id = Column(Text, nullable=True)
    payment_mode_name = Column(Text, nullable=True)
    deleted = Column(Integer, default=0, index=True)
