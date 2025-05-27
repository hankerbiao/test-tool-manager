/**
 * 工具相关的辅助函数
 */

// 获取工具状态对应的颜色
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'active':
      return 'green';
    case 'inactive':
      return 'gray';
    case 'deprecated':
      return 'red';
    case 'success':
      return 'green';
    case 'failed':
      return 'red';
    case 'aborted':
      return 'orange';
    default:
      return 'default';
  }
};

// 获取工具状态对应的文本
export const getStatusText = (status: string): string => {
  switch (status) {
    case 'active':
      return '活跃';
    case 'inactive':
      return '不活跃';
    case 'deprecated':
      return '已弃用';
    case 'success':
      return '成功';
    case 'failed':
      return '失败';
    case 'aborted':
      return '中止';
    default:
      return status;
  }
};

// 获取工具分类对应的文本
export const getCategoryText = (category: string): string => {
  switch (category) {
    case 'performance':
      return '性能测试';
    case 'stress':
      return '压力测试';
    case 'diagnostic':
      return '诊断工具';
    default:
      return category;
  }
};

/**
 * 校验远程机器连接
 * @param params 验证参数
 * @param apiService API服务
 * @param messageApi 消息组件
 * @returns 验证结果和机器信息
 */
export const validateMachineConnection = async (
  params: { ip: string; username: string; password: string },
  apiService: {
    validateMachine: (data: { username: string; password: string; ip: string }) => 
      Promise<{ success: boolean; message: string }>
  },
  messageApi: {
    error: (content: string) => void;
    success: (content: string) => void;
  }
): Promise<{
  validated: boolean;
  machineInfo: { ip: string; username: string; password: string } | null;
}> => {
  // 验证必填字段
  if (!params.ip || !params.username || !params.password) {
    messageApi.error('请填写完整的机器信息');
    return { validated: false, machineInfo: null };
  }
  
  try {
    const result = await apiService.validateMachine({
      ip: params.ip,
      username: params.username,
      password: params.password
    });
    
    if (result.success) {
      messageApi.success('连接成功');
      return {
        validated: true,
        machineInfo: {
          ip: params.ip,
          username: params.username,
          password: params.password
        }
      };
    } else {
      messageApi.error(result.message || '连接失败');
      return { validated: false, machineInfo: null };
    }
  } catch (error) {
    console.error('验证失败:', error);
    messageApi.error('验证过程发生错误');
    return { validated: false, machineInfo: null };
  }
}; 