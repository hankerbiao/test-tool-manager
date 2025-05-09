from sqlmodel import select

from fastapi import APIRouter, HTTPException
from typing import List

from app.api.deps import SessionDep
from models import AgentVersion
from utils.logger import log
from app.api.models.machine import  AgentVersionResponse


router = APIRouter()


@router.get("/", response_model=List[AgentVersionResponse], summary="获取代理版本列表")
async def get_agent_versions(
db: SessionDep,
):
    """
    获取代理版本列表
    
    - **skip**: 跳过的记录数
    - **limit**: 返回的最大记录数
    
    返回:
    - 代理版本列表
    """
    try:
        log.info(f"获取代理版本列表")
        agent_versions= db.exec(select(AgentVersion)).all()
        return agent_versions
    except Exception as e:
        log.exception(f"获取代理版本列表时发生异常: {str(e)}")
        raise HTTPException(status_code=500, detail=f"获取代理版本列表失败: {str(e)}")

