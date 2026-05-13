from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Order, Product

router = APIRouter(prefix="/summary", tags=["summary"])


@router.get("/daily")
def get_daily_summary(db: Session = Depends(get_db)):
    orders = db.query(Order).all()
    products = db.query(Product).all()

    preparing = [o for o in orders if o.order_status == "hazirlaniyor"]
    pending = [o for o in orders if o.order_status == "beklemede"]
    in_transit = [o for o in orders if o.order_status == "kargoda"]
    delivered = [o for o in orders if o.order_status == "teslim_edildi"]
    critical_products = [p for p in products if p.stock_quantity <= p.critical_stock_threshold]
    delayed = [o for o in orders if o.delay_risk]

    priority_tasks = []
    if preparing:
        priority_tasks.append(f"{len(preparing)} sipariş kargoya hazırlanmayı bekliyor")
    if critical_products:
        priority_tasks.append(f"{len(critical_products)} üründe kritik stok seviyesi")
    if delayed:
        priority_tasks.append(f"{len(delayed)} siparişte gecikme riski")
    if pending:
        priority_tasks.append(f"{len(pending)} yeni sipariş işlem bekliyor")

    return {
        "total_orders": len(orders),
        "preparing_orders": len(preparing),
        "pending_orders": len(pending),
        "in_transit_orders": len(in_transit),
        "delivered_orders": len(delivered),
        "critical_products": len(critical_products),
        "delayed_shipments": len(delayed),
        "priority_tasks": priority_tasks,
        "orders_breakdown": {
            "preparing": [
                {"order_id": o.order_id, "customer": o.customer_name, "product": o.product_name}
                for o in preparing
            ],
            "delayed": [
                {"order_id": o.order_id, "customer": o.customer_name}
                for o in delayed
            ],
            "critical_stock": [
                {
                    "product": p.product_name,
                    "stock": p.stock_quantity,
                    "threshold": p.critical_stock_threshold,
                }
                for p in critical_products
            ],
        },
    }
