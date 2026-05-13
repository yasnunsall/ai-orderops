from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Order

router = APIRouter(prefix="/shipments", tags=["shipments"])


@router.get("/delayed")
def get_delayed_shipments(db: Session = Depends(get_db)):
    orders = db.query(Order).filter(Order.delay_risk == True).all()
    return [
        {
            "order_id": o.order_id,
            "customer_name": o.customer_name,
            "product_name": o.product_name,
            "quantity": o.quantity,
            "order_status": o.order_status,
            "cargo_company": o.cargo_company,
            "tracking_number": o.tracking_number,
            "tracking_status": o.tracking_status,
            "estimated_delivery_date": o.estimated_delivery_date,
            "delay_risk": o.delay_risk,
        }
        for o in orders
    ]
