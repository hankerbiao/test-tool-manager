from typing import List, Optional
from sqlmodel import Session, select
from utils.logger import log
from models.machine import TestCase


class TestCaseService:
    """测试用例服务"""

    @staticmethod
    async def get_test_cases(db: Session, skip: int = 0, limit: int = 100) -> List[TestCase]:
        """
        获取测试用例列表
        :param db: 数据库会话
        :param skip: 跳过数量
        :param limit: 限制数量
        :return: 测试用例列表
        """
        log.info(f"获取测试用例列表: skip={skip}, limit={limit}")
        query = select(TestCase).offset(skip).limit(limit)
        return db.exec(query).all()
    
    @staticmethod
    async def get_test_case(db: Session, test_case_id: int) -> Optional[TestCase]:
        """
        获取测试用例
        :param db: 数据库会话
        :param test_case_id: 测试用例ID
        :return: 测试用例
        """
        log.info(f"获取测试用例: id={test_case_id}")
        query = select(TestCase).where(TestCase.id == test_case_id)
        return db.exec(query).first()
