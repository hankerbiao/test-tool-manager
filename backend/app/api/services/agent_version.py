from typing import List
from sqlmodel import  select

from app.api.deps import SessionDep
from utils.logger import log
from models.machine import AgentVersion


class AgentVersionService:
    """代理版本服务"""
    
    @staticmethod
    async def get_agent_versions(db: SessionDep, skip: int = 0, limit: int = 100) -> List[AgentVersion]:
        """
        获取代理版本列表
        :param db: 数据库会话
        :param skip: 跳过数量
        :param limit: 限制数量
        :return: 代理版本列表
        """
        log.info(f"获取代理版本列表: skip={skip}, limit={limit}")
        query = select(AgentVersion).offset(skip).limit(limit)
        return db.exec(query).all()
