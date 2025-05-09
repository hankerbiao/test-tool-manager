from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel, Session
from utils.logger import log
import os


# 数据库URL
DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///machines.db")

# 创建数据库引擎
engine = create_engine(DATABASE_URL, echo=False)

# 创建会话工厂
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def create_db_and_tables():
    """创建所有表"""

    log.info("创建数据库表...")
    SQLModel.metadata.create_all(engine)
    log.info("数据库表创建完成")


def get_db():
    """获取数据库会话"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

