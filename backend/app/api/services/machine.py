import paramiko
import socket
import os
import time
from datetime import datetime
from typing import List, Optional, Dict
from sqlmodel import Session, select
from utils.logger import log
from app.api.models.machine import (
    MachineConnection, MachineConnectionResponse,
    MachineCreate, MachineUpdate
)
from models.machine import Machine, MachineTestCase


class MachineService:
    """机器服务"""

    @staticmethod
    async def check_connection(connection_data: MachineConnection) -> MachineConnectionResponse:
        """
        检查机器连接状态
        :param connection_data: 连接信息
        :return: 连接结果
        """
        try:
            log.info(f"开始检查机器连接: {connection_data.ip}")
            
            # 创建SSH客户端
            client = paramiko.SSHClient()
            client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            
            # 尝试连接，设置超时时间为5秒
            client.connect(
                hostname=connection_data.ip,
                username=connection_data.username,
                password=connection_data.password,
                timeout=5
            )
            
            # 执行简单命令验证连接
            stdin, stdout, stderr = client.exec_command("echo 'Connection success'")
            output = stdout.read().decode().strip()
            
            # 关闭连接
            client.close()
            
            log.info(f"机器连接成功: {connection_data.ip}")
            return MachineConnectionResponse(
                success=True,
                message="连接成功"
            )
            
        except paramiko.AuthenticationException:
            log.error(f"机器连接认证失败: {connection_data.ip}")
            return MachineConnectionResponse(
                success=False,
                message="认证失败，请检查用户名和密码"
            )
            
        except socket.timeout:
            log.error(f"机器连接超时: {connection_data.ip}")
            return MachineConnectionResponse(
                success=False,
                message="连接超时，请检查IP地址和网络状态"
            )
            
        except Exception as e:
            log.exception(f"机器连接异常: {connection_data.ip}, 错误: {str(e)}")
            return MachineConnectionResponse(
                success=False,
                message=f"连接异常: {str(e)}"
            )
    
    @staticmethod
    async def create_machine(db: Session, machine_data: MachineCreate) -> dict:
        """
        创建机器信息并自动部署代理
        :param db: 数据库会话
        :param machine_data: 机器信息
        :return: 创建和部署结果
        """
        log.info(f"创建机器信息: {machine_data.name}, IP: {machine_data.ip}")
        
        # 创建机器记录
        db_machine = Machine(
            name=machine_data.name,
            description=machine_data.description,
            test_type=machine_data.test_type,
            agent_version_id=machine_data.agent_version_id,
            ip=machine_data.ip,
            username=machine_data.username,
            password=machine_data.password
        )
        print(machine_data)
        db.add(db_machine)
        db.commit()
        db.refresh(db_machine)
        
        # 添加测试用例关联
        if machine_data.test_case_ids:
            for test_case_id in machine_data.test_case_ids:
                print(test_case_id)
                link = MachineTestCase(
                    machine_id=db_machine.id,
                    test_case_id=test_case_id
                )
                db.add(link)
            
            db.commit()
            db.refresh(db_machine)
        
        # 自动部署代理
        log.info(f"自动部署代理: machine_id={db_machine.id}")
        deploy_result = await MachineService._deploy_agent_internal(db, db_machine)
        deploy_result = {"success": True, "message": "代理部署成功"}
        return {
            "machine": db_machine,
            "deploy_result": deploy_result
        }
    
    @staticmethod
    async def get_machines(db: Session) -> List[Machine]:
        """
        获取机器列表
        :param db: 数据库会话
        :param skip: 跳过数量
        :param limit: 限制数量
        :return: 机器列表
        """

    
    @staticmethod
    async def get_machine(db: Session, machine_id: int) -> Optional[Machine]:
        """
        获取机器信息
        :param db: 数据库会话
        :param machine_id: 机器ID
        :return: 机器信息
        """
        log.info(f"获取机器信息: id={machine_id}")
        query = select(Machine).where(Machine.id == machine_id)
        return db.exec(query).first()
    
    @staticmethod
    async def update_machine(db: Session, machine_id: int, machine_data: MachineUpdate) -> Optional[Machine]:
        """
        更新机器信息
        :param db: 数据库会话
        :param machine_id: 机器ID
        :param machine_data: 机器信息
        :return: 更新后的机器信息
        """
        log.info(f"更新机器信息: id={machine_id}")
        db_machine = await MachineService.get_machine(db, machine_id)
        
        if not db_machine:
            log.error(f"未找到机器: id={machine_id}")
            return None
        
        # 更新机器基本信息
        update_data = machine_data.dict(exclude_unset=True, exclude={"test_case_ids"})
        for key, value in update_data.items():
            setattr(db_machine, key, value)
        
        # 更新时间戳
        db_machine.updated_at = datetime.now()
        
        # 如果提供了测试用例ID列表，则更新关联关系
        if machine_data.test_case_ids is not None:
            # 删除现有关联
            query = select(MachineTestCase).where(MachineTestCase.machine_id == machine_id)
            existing_links = db.exec(query).all()
            for link in existing_links:
                db.delete(link)
            
            # 添加新关联
            for test_case_id in machine_data.test_case_ids:
                link = MachineTestCase(
                    machine_id=machine_id,
                    test_case_id=test_case_id
                )
                db.add(link)
        
        db.commit()
        db.refresh(db_machine)
        return db_machine
    
    @staticmethod
    async def delete_machine(db: Session, machine_id: int) -> bool:
        """
        删除机器信息
        :param db: 数据库会话
        :param machine_id: 机器ID
        :return: 是否删除成功
        """
        log.info(f"删除机器信息: id={machine_id}")
        db_machine = await MachineService.get_machine(db, machine_id)
        
        if not db_machine:
            log.error(f"未找到机器: id={machine_id}")
            return False
        
        # 删除关联关系
        query = select(MachineTestCase).where(MachineTestCase.machine_id == machine_id)
        existing_links = db.exec(query).all()
        for link in existing_links:
            db.delete(link)
        
        # 删除机器记录
        db.delete(db_machine)
        db.commit()
        return True
    
    @staticmethod
    async def deploy_agent(db: Session, machine_id: int) -> Dict[str, bool | str]:
        """
        远程部署代理
        :param db: 数据库会话
        :param machine_id: 机器ID
        :return: 部署结果
        """
        log.info(f"开始远程部署代理: machine_id={machine_id}")
        
        # 获取机器信息
        machine = await MachineService.get_machine(db, machine_id)
        if not machine:
            log.error(f"未找到机器: id={machine_id}")
            return {"success": False, "message": f"未找到ID为{machine_id}的机器"}
        
        # 调用内部部署方法
        return await MachineService._deploy_agent_internal(db, machine)

    @staticmethod
    async def _deploy_agent_internal(db: Session, machine: Machine) -> Dict[str, bool | str]:
        """
        内部使用的代理部署方法
        :param db: 数据库会话
        :param machine: 机器对象
        :return: 部署结果
        """
        try:
            # 创建SSH客户端
            client = paramiko.SSHClient()
            client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            
            # 连接到目标机器
            log.info(f"连接到目标机器: {machine.ip}")
            client.connect(
                hostname=machine.ip,
                username=machine.username,
                password=machine.password,
                timeout=10
            )
            
            # 1. 检查/opt/nc_agent目录是否存在
            log.info(f"检查/opt/nc_agent目录是否存在")
            cmd = "if [ -d /opt/nc_agent ]; then echo 'exists'; else echo 'not_exists'; fi"
            stdin, stdout, stderr = client.exec_command(cmd)
            result = stdout.read().decode().strip()
            
            if result == 'exists':
                log.info(f"目标机器上/opt/nc_agent目录已存在，检查是否有进程运行")
                
                # 检查是否有nc_agent进程运行
                cmd = "ps -ef | grep nc_agent | grep -v grep | wc -l"
                stdin, stdout, stderr = client.exec_command(cmd)
                process_count = stdout.read().decode().strip()
                
                if process_count != "0":
                    log.info(f"nc_agent进程已在运行")
                    client.close()
                    return {"success": True, "message": "目标机器上代理已存在且正在运行"}
                else:
                    log.info(f"nc_agent目录存在但进程未运行，检查日志")
                    cmd = "if [ -f /opt/nc_agent/nc_agent.log ]; then cat /opt/nc_agent/nc_agent.log | tail -n 20; else echo 'No log file'; fi"
                    stdin, stdout, stderr = client.exec_command(cmd)
                    log_content = stdout.read().decode().strip()
                    client.close()
                    return {"success": False, "message": f"目标机器上代理目录已存在但进程未运行，最近日志: {log_content}"}
            
            # 创建/opt/nc_agent目录
            log.info(f"创建/opt/nc_agent目录")
            commands = [
                "if [ -d /opt/nc_agent ]; then rm -rf /opt/nc_agent; fi",
                "mkdir -p /opt/nc_agent"
            ]
            
            for cmd in commands:
                stdin, stdout, stderr = client.exec_command(cmd)
                exit_status = stdout.channel.recv_exit_status()
                if exit_status != 0:
                    error = stderr.read().decode().strip()
                    log.error(f"执行命令失败: {cmd}, 错误: {error}")
                    client.close()
                    return {"success": False, "message": f"创建目录失败: {error}"}
            
            # 2. 上传并解压install.tar.gz
            log.info(f"上传install.tar.gz到目标机器")
            local_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))), "static/install.tar.gz")
            
            if not os.path.exists(local_path):
                log.error(f"安装包不存在: {local_path}")
                client.close()
                return {"success": False, "message": "安装包不存在"}
            
            # 使用SFTP上传文件
            sftp = client.open_sftp()
            remote_path = "/opt/nc_agent/install.tar.gz"
            sftp.put(local_path, remote_path)
            sftp.close()
            
            # 解压文件
            log.info(f"解压install.tar.gz")
            cmd = "cd /opt/nc_agent && tar -xzf install.tar.gz"
            stdin, stdout, stderr = client.exec_command(cmd)
            exit_status = stdout.channel.recv_exit_status()
            if exit_status != 0:
                error = stderr.read().decode().strip()
                log.error(f"解压安装包失败: {error}")
                client.close()
                return {"success": False, "message": f"解压安装包失败: {error}"}
            
            # 3. 后台执行nc_agent程序
            log.info(f"后台启动nc_agent程序")
            cmd = "cd /opt/nc_agent && nohup ./nc_agent > /opt/nc_agent/nc_agent.log 2>&1 &"
            stdin, stdout, stderr = client.exec_command(cmd)
            exit_status = stdout.channel.recv_exit_status()
            if exit_status != 0:
                error = stderr.read().decode().strip()
                log.error(f"启动nc_agent失败: {error}")
                client.close()
                return {"success": False, "message": f"启动nc_agent失败: {error}"}
            
            # 4. 检查nc_agent是否启动成功
            log.info(f"检查nc_agent是否启动成功")
            # 等待进程启动
            time.sleep(2)
            
            # 检查进程是否存在
            cmd = "ps -ef | grep nc_agent | grep -v grep | wc -l"
            stdin, stdout, stderr = client.exec_command(cmd)
            process_count = stdout.read().decode().strip()
            
            if process_count == "0":
                log.error("nc_agent进程未启动")
                # 检查日志文件
                cmd = "cat /opt/nc_agent/nc_agent.log"
                stdin, stdout, stderr = client.exec_command(cmd)
                log_content = stdout.read().decode().strip()
                client.close()
                return {"success": False, "message": f"nc_agent进程未启动，日志内容: {log_content}"}
            
            # 检查端口是否监听
            cmd = "netstat -tunlp | grep nc_agent | wc -l"
            stdin, stdout, stderr = client.exec_command(cmd)
            port_count = stdout.read().decode().strip()
            
            if port_count == "0":
                log.error("nc_agent端口未监听")
                client.close()
                return {"success": False, "message": "nc_agent端口未监听"}
            
            # 部署成功
            log.info(f"远程部署nc_agent成功: {machine.ip}")
            client.close()
            
            # 更新机器记录
            machine.updated_at = datetime.now()
            db.commit()
            
            return {"success": True, "message": "远程部署nc_agent成功"}
            
        except paramiko.AuthenticationException:
            log.error(f"机器连接认证失败: {machine.ip}")
            return {"success": False, "message": "认证失败，请检查用户名和密码"}
            
        except socket.timeout:
            log.error(f"机器连接超时: {machine.ip}")
            return {"success": False, "message": "连接超时，请检查IP地址和网络状态"}
            
        except Exception as e:
            log.exception(f"远程部署代理异常: {machine.ip}, 错误: {str(e)}")
            return {"success": False, "message": f"远程部署代理异常: {str(e)}"} 