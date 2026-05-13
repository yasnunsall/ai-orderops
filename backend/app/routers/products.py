from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import Product

router = APIRouter(prefix="/products", tags=["products"])


def _enrich(p: Product) -> dict:
    is_critical = p.stock_quantity <= p.critical_stock_threshold
    days_left = (
        round(p.stock_quantity / p.average_daily_sales, 1)
        if p.average_daily_sales > 0
        else None
    )
    return {
        "id": p.id,
        "product_name": p.product_name,
        "stock_quantity": p.stock_quantity,
        "critical_stock_threshold": p.critical_stock_threshold,
        "average_daily_sales": p.average_daily_sales,
        "supplier_name": p.supplier_name,
        "unit_price": p.unit_price,
        "is_critical": is_critical,
        "days_until_stockout": days_left,
    }


@router.get("/critical")
def get_critical_products(db: Session = Depends(get_db)):
    products = db.query(Product).filter(
        Product.stock_quantity <= Product.critical_stock_threshold
    ).all()
    return [_enrich(p) for p in products]


@router.get("/")
def get_products(db: Session = Depends(get_db)):
    products = db.query(Product).all()
    return [_enrich(p) for p in products]
