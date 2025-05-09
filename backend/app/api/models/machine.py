from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


# 基础连接检查模型
class MachineConnection(BaseModel):
    """
    机器连接检查请求模型
    """
    username: str = Field(..., description="用户名")
    password: str = Field(..., description="密码")
    ip: str = Field(..., description="IP地址")


class MachineConnectionResponse(BaseModel):
    """
    机器连接检查响应模型
    """
    success: bool = Field(..., description="连接状态")
    message: str = Field(..., description="连接信息")


# 代理版本 API 模型
class AgentVersionBase(BaseModel):
    """代理版本基础信息"""
    name: str = Field(..., description="版本名称")
    description: Optional[str] = Field(None, description="版本描述")


class AgentVersionCreate(AgentVersionBase):
    """创建代理版本请求模型"""
    pass


class AgentVersionUpdate(BaseModel):
    """更新代理版本请求模型"""
    name: Optional[str] = Field(None, description="版本名称")
    description: Optional[str] = Field(None, description="版本描述")


class AgentVersionResponse(AgentVersionBase):
    """代理版本响应模型"""
    id: int
    created_at: datetime
    updated_at: datetime




# 测试用例 API 模型
class TestCaseBase(BaseModel):
    """测试用例基础信息"""
    name: str = Field(..., description="测试用例名称")
    description: Optional[str] = Field(None, description="测试用例描述")
    type: Optional[str] = Field(None, description="测试用例类型")


class TestCaseCreate(TestCaseBase):
    """创建测试用例请求模型"""
    pass


class TestCaseUpdate(BaseModel):
    """更新测试用例请求模型"""
    name: Optional[str] = Field(None, description="测试用例名称")
    description: Optional[str] = Field(None, description="测试用例描述")


class TestCaseResponse(TestCaseBase):
    """测试用例响应模型"""
    id: int
    created_at: datetime
    updated_at: datetime


# 机器信息 API 模型
class MachineBase(BaseModel):
    """机器基础信息"""
    name: str = Field(..., description="机器名称")
    description: Optional[str] = Field(None, description="机器描述")
    test_type: str = Field(..., description="测试类型")
    agent_version_id: int = Field(..., description="代理版本ID")
    ip: str = Field(..., description="IP地址")
    username: str = Field(..., description="用户名")
    password: str = Field(..., description="密码")


class MachineCreate(MachineBase):
    """创建机器请求模型"""
    test_case_ids: Optional[List[int]] = Field(default=[], description="测试用例ID列表")


class MachineUpdate(BaseModel):
    """更新机器请求模型"""
    name: Optional[str] = Field(None, description="机器名称")
    description: Optional[str] = Field(None, description="机器描述")
    test_type: Optional[str] = Field(None, description="测试类型")
    agent_version_id: Optional[int] = Field(None, description="代理版本ID")
    ip: Optional[str] = Field(None, description="IP地址")
    username: Optional[str] = Field(None, description="用户名")
    password: Optional[str] = Field(None, description="密码")
    test_case_ids: Optional[List[int]] = Field(None, description="测试用例ID列表")


class MachineResponse(MachineBase):
    """机器响应模型"""
    id: int
    created_at: datetime
    updated_at: datetime
    agent_version: AgentVersionResponse
    test_cases: List[TestCaseResponse] = []
