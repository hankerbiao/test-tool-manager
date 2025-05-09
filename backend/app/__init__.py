from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.api import api_route
from utils.db import create_db_and_tables  # Assuming this is your DB initialization function
from utils.logger import log  # Assuming this is your logger

# Define lifespan event handler
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup event
    log.info("应用启动，初始化数据库...")
    create_db_and_tables()
    yield
    # Shutdown event (optional)
    log.info("应用关闭")

# Factory function to create FastAPI app
def create_app():
    app = FastAPI(lifespan=lifespan)

    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # List of allowed origins
        allow_credentials=True,
        allow_methods=["*"],  # List of allowed methods
        allow_headers=["*"],  # List of allowed headers
    )

    # Include API router
    app.include_router(api_route, prefix='/api/v1')

    return app