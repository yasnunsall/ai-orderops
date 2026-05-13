from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine, Base
from .seed_data import seed_database
from .routers import orders, products, shipments, summary, chat

Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    seed_database()
    yield


app = FastAPI(
    title="AI OrderOps",
    description="KOBİ'ler için Yapay Zeka Destekli Sipariş, Stok ve Kargo Operasyon Asistanı",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(orders.router)
app.include_router(products.router)
app.include_router(shipments.router)
app.include_router(summary.router)
app.include_router(chat.router)


@app.get("/")
def root():
    return {"message": "AI OrderOps API çalışıyor 🚀", "version": "1.0.0", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "healthy"}
