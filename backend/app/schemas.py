from pydantic import BaseModel
from typing import Optional, List, Any, Dict


class OrderResponse(BaseModel):
    id: int
    order_id: str
    customer_name: str
    product_name: str
    quantity: int
    order_status: str
    cargo_company: Optional[str] = None
    tracking_number: Optional[str] = None
    tracking_status: Optional[str] = None
    estimated_delivery_date: Optional[str] = None
    delay_risk: bool = False
    created_at: Optional[str] = None

    class Config:
        from_attributes = True


class ProductResponse(BaseModel):
    id: int
    product_name: str
    stock_quantity: int
    critical_stock_threshold: int
    average_daily_sales: float
    supplier_name: Optional[str] = None
    unit_price: float
    is_critical: bool = False
    days_until_stockout: Optional[float] = None

    class Config:
        from_attributes = True


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    message: str
    intent: str
    data: Optional[Dict[str, Any]] = None


class DailySummaryResponse(BaseModel):
    total_orders: int
    preparing_orders: int
    pending_orders: int
    in_transit_orders: int
    delivered_orders: int
    critical_products: int
    delayed_shipments: int
    priority_tasks: List[str]
    orders_breakdown: Dict[str, Any]
