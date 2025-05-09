from fastapi import APIRouter, HTTPException, Depends, Query, Path
from typing import List
from sqlmodel import select

from app.api.deps import SessionDep
from models import Machine, AgentVersion
from utils.logger import log
from app.api.models.machine import (
    MachineConnection, MachineConnectionResponse,
    MachineCreate, MachineUpdate, MachineResponse
)
from app.api.services.machine import MachineService

router = APIRouter()


@router.post("/validate-machine", response_model=MachineConnectionResponse, summary="检查机器连接")
async def check_machine_connection(data: MachineConnection):
    """
    检查机器连接状态
    
    - **username**: 用户名
    - **password**: 密码
    - **ip**: IP地址
    
    返回:
    - **status**: 连接状态
    - **message**: 连接信息
    """
    log.info(f"接收到机器连接检查请求: {data.ip}")
    try:
        result = await MachineService.check_connection(data)
        return result
    except Exception as e:
        log.exception(f"处理机器连接检查请求时发生异常: {str(e)}")
        raise HTTPException(status_code=500, detail=f"服务器内部错误: {str(e)}")


@router.post("/", response_model=dict, summary="创建机器信息")
async def create_machine(
        machine: MachineCreate,
        db: SessionDep
):
    """
    创建新的机器信息并自动部署代理
    
    - **name**: 机器名称
    - **description**: 机器描述（可选）
    - **test_type**: 测试类型
    - **agent_version_id**: 代理版本ID
    - **ip**: IP地址
    - **username**: 用户名
    - **password**: 密码
    - **test_case_ids**: 测试用例ID列表（可选）
    
    返回:
    - 机器信息和部署结果
    """
    log.info(f"接收到创建机器信息请求: {machine.name}")
    try:
        result = await MachineService.create_machine(db, machine)
        db_machine = result["machine"]
        
        # 查询代理版本信息
        agent_version_query = select(AgentVersion).where(AgentVersion.id == db_machine.agent_version_id)
        agent_version = db.exec(agent_version_query).first()
        
        # 返回创建成功的信息，即使代理部署失败
        response = {
            "status": True,
            "message": "机器信息创建成功",
            "data": {
                "machine_id": db_machine.id,
                "name": db_machine.name,
                "ip": db_machine.ip,
                "test_type": db_machine.test_type,
                "agent_version": {
                    "id": agent_version.id if agent_version else None,
                    "name": agent_version.name if agent_version else None,
                    "description": agent_version.description if agent_version else None
                }
            }
        }
        
        # 如果部署失败，添加失败信息，但仍返回200状态码
        if result["deploy_result"] and not result["deploy_result"]["success"]:
            deploy_message = result["deploy_result"]["message"]
            log.warning(f"机器创建成功但代理部署失败: {deploy_message}")
            response["deploy_status"] = False
            response["deploy_message"] = f"nc_agent部署失败，请人工检查: {deploy_message}"
        else:
            response["deploy_status"] = True
            response["deploy_message"] = "nc_agent部署成功"
        
        return response
    except Exception as e:
        log.exception(f"创建机器信息时发生异常: {str(e)}")
        raise HTTPException(status_code=500, detail=f"创建机器信息失败: {str(e)}")


@router.get("/", response_model=dict, summary="获取机器列表")
async def get_machines(
        db: SessionDep
):
    """
    获取机器信息列表
    
    返回:
    - 机器信息列表
    """
    try:
        query = select(Machine)
        machines = db.exec(query).all()
        
        # 获取所有机器关联的代理版本ID
        agent_version_ids = [machine.agent_version_id for machine in machines]
        # 查询所有相关的代理版本
        agent_versions_query = select(AgentVersion).where(AgentVersion.id.in_(agent_version_ids))
        agent_versions = {av.id: av for av in db.exec(agent_versions_query).all()}
        # 构建响应
        machines_data = []
        for machine in machines:
            agent_version = agent_versions.get(machine.agent_version_id)
            machines_data.append({
                "id": machine.id,
                "name": machine.name,
                "description": machine.description,
                "test_type": machine.test_type,
                "ip": machine.ip,
                "created_at": machine.created_at,
                "updated_at": machine.updated_at,
                "agent_version": {
                    "id": agent_version.id if agent_version else None,
                    "name": agent_version.name if agent_version else None,
                    "description": agent_version.description if agent_version else None
                }
            })
        
        response = {
            "status": True,
            "message": "获取机器列表成功",
            "data": machines_data,
            "total": len(machines_data)
        }
        
        return response
    except Exception as e:
        log.exception(f"获取机器列表时发生异常: {str(e)}")
        raise HTTPException(status_code=500, detail=f"获取机器列表失败: {str(e)}")


@router.get("/{machine_id}", response_model=dict, summary="获取单个机器信息")
async def get_machine(
        db: SessionDep,
        machine_id: int = Path(..., ge=1, description="机器ID"),
):
    """
    获取单个机器的详细信息
    
    - **machine_id**: 机器ID
    
    返回:
    - 机器详细信息
    """
    log.info(f"接收到获取机器信息请求: id={machine_id}")
    try:
        machine = await MachineService.get_machine(db, machine_id)
        if not machine:
            raise HTTPException(status_code=404, detail=f"未找到ID为{machine_id}的机器")
        
        # 查询代理版本信息
        agent_version_query = select(AgentVersion).where(AgentVersion.id == machine.agent_version_id)
        agent_version = db.exec(agent_version_query).first()
        
        # 构建响应
        response = {
            "status": True,
            "message": "获取机器信息成功",
            "data": {
                "id": machine.id,
                "name": machine.name,
                "description": machine.description,
                "test_type": machine.test_type,
                "ip": machine.ip,
                "username": machine.username,
                "password": machine.password,
                "created_at": machine.created_at,
                "updated_at": machine.updated_at,
                "agent_version": {
                    "id": agent_version.id if agent_version else None,
                    "name": agent_version.name if agent_version else None,
                    "description": agent_version.description if agent_version else None
                },
                "test_cases": [
                    {
                        "id": test_case.id,
                        "name": test_case.name,
                        "description": test_case.description,
                        "type": test_case.type
                    } for test_case in machine.test_cases
                ] if machine.test_cases else []
            }
        }
        
        return response
    except HTTPException:
        raise
    except Exception as e:
        log.exception(f"获取机器信息时发生异常: {str(e)}")
        raise HTTPException(status_code=500, detail=f"获取机器信息失败: {str(e)}")


@router.put("/{machine_id}", response_model=MachineResponse, summary="更新机器信息")
async def update_machine(
        db: SessionDep,
        machine_data: MachineUpdate,
        machine_id: int = Path(..., ge=1, description="机器ID"),
):
    """
    更新机器信息
    
    - **machine_id**: 机器ID
    - **machine_data**: 需要更新的机器信息
    
    返回:
    - 更新后的机器信息
    """
    log.info(f"接收到更新机器信息请求: id={machine_id}")
    try:
        updated_machine = await MachineService.update_machine(db, machine_id, machine_data)
        if not updated_machine:
            raise HTTPException(status_code=404, detail=f"未找到ID为{machine_id}的机器")
        return updated_machine
    except HTTPException:
        raise
    except Exception as e:
        log.exception(f"更新机器信息时发生异常: {str(e)}")
        raise HTTPException(status_code=500, detail=f"更新机器信息失败: {str(e)}")


@router.delete("/{machine_id}", response_model=dict, summary="删除机器信息")
async def delete_machine(
        db: SessionDep,
        machine_id: int = Path(..., ge=1, description="机器ID"),
):
    """
    删除机器信息
    
    - **machine_id**: 机器ID
    
    返回:
    - 删除操作结果
    """
    log.info(f"接收到删除机器信息请求: id={machine_id}")
    try:
        success = await MachineService.delete_machine(db, machine_id)
        if not success:
            raise HTTPException(status_code=404, detail=f"未找到ID为{machine_id}的机器")
        return {"status": True, "message": f"成功删除ID为{machine_id}的机器"}
    except HTTPException:
        raise
    except Exception as e:
        log.exception(f"删除机器信息时发生异常: {str(e)}")
        raise HTTPException(status_code=500, detail=f"删除机器信息失败: {str(e)}")


@router.post("/{machine_id}/deploy", response_model=dict, summary="远程部署代理")
async def deploy_agent(
        db: SessionDep,
        machine_id: int = Path(..., ge=1, description="机器ID"),
):
    """
    远程部署代理到指定机器
    
    - **machine_id**: 机器ID
    
    部署步骤:
    1. 将安装包上传到目标机器的/opt/nc_agent目录
    2. 解压安装包
    3. 启动nc_agent程序
    4. 检查nc_agent是否成功运行
    
    返回:
    - 部署操作结果
    """
    log.info(f"接收到远程部署代理请求: machine_id={machine_id}")
    try:
        result = await MachineService.deploy_agent(db, machine_id)
        return {
            "status": result["success"],
            "message": result["message"],
            "machine_id": machine_id
        }
    except Exception as e:
        log.exception(f"远程部署代理时发生异常: {str(e)}")
        raise HTTPException(status_code=500, detail=f"远程部署代理失败: {str(e)}")
