import os
import sys
from datetime import datetime
from loguru import logger

# 创建日志目录
LOG_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "logs")
os.makedirs(LOG_DIR, exist_ok=True)

# 日志文件路径
log_file_path = os.path.join(LOG_DIR, f"{datetime.now().strftime('%Y-%m-%d')}.log")

# 配置日志
logger.remove()  # 移除默认配置
logger.add(sys.stderr, level="INFO")  # 添加标准错误输出
logger.add(
    log_file_path,
    rotation="00:00",  # 每天0点创建新文件
    retention="30 days",  # 保留30天
    level="DEBUG",
    encoding="utf-8",
    enqueue=True,
    backtrace=True,
    diagnose=True,
)

# 导出logger实例
log = logger 