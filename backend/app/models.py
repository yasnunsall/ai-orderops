from sqlalchemy import Column, Integer, String, Boolean, Float
from .database import Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(String, unique=True, index=True)
    customer_name = Column(String, nullable=False)
    product_name = Column(String, nullable=False)
    quantity = Column(Integer, default=1)
    order_status = Column(String, nullable=False)  # teslim_edildi | kargoda | hazirlaniyor | beklemede
    cargo_company = Column(String, nullable=True)
    tracking_number = Column(String, nullable=True)
    tracking_status = Column(String, nullable=True)
    estimated_delivery_date = Column(String, nullable=True)
    delay_risk = Column(Boolean, default=False)
    created_at = Column(String, nullable=True)


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    product_name = Column(String, unique=True, nullable=False)
    stock_quantity = Column(Integer, default=0)
    critical_stock_threshold = Column(Integer, default=10)
    average_daily_sales = Column(Float, default=1.0)
    supplier_name = Column(String, nullable=True)
    unit_price = Column(Float, default=0.0)
