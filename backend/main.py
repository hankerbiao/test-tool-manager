from app import create_app
import uvicorn
from utils.logger import log

# 创建 FastAPI 应用并绑定 lifespan
app = create_app()

if __name__ == "__main__":
    port = 8000
    log.info(f"启动服务器在端口 {port}")
    uvicorn.run(app="main:app", host="0.0.0.0", port=port, reload=True)
