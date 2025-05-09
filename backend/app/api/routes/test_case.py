from fastapi import APIRouter, HTTPException, Depends
from typing import List
from sqlmodel import select

from app.api.deps import SessionDep
from models import TestCase
from utils.logger import log
from utils.db import get_db
from app.api.models.machine import  TestCaseResponse

router = APIRouter()


@router.get("/", response_model=List[TestCaseResponse], summary="获取测试用例列表")
async def get_test_cases(db: SessionDep):
    """
    获取测试用例列表
    
    - **skip**: 跳过的记录数
    - **limit**: 返回的最大记录数
    
    返回:
    - 测试用例列表
    """
    try:
        test_cases = db.exec(select(TestCase)).all()
        return test_cases
    except Exception as e:
        log.exception(f"获取测试用例列表时发生异常: {str(e)}")
        raise HTTPException(status_code=500, detail=f"获取测试用例列表失败: {str(e)}")
