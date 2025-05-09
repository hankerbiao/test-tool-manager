from fastapi import APIRouter
from app.api.routes import machine, agent_version, test_case

api_route = APIRouter()
api_route.include_router(machine.router, prefix="/machines", tags=["机器管理"])
api_route.include_router(agent_version.router, prefix="/agent-versions", tags=["代理版本管理"])
api_route.include_router(test_case.router, prefix="/test-cases", tags=["测试用例管理"])
