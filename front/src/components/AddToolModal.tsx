import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Select, Checkbox, Spin, App, Card } from 'antd';
import { TestTool, AgentVersion, TestCase } from '../types';
import { api } from '../services/api';
import { validateMachineConnection } from '../utils/toolUtils';

// 常量
const { Option } = Select;
const { TextArea } = Input;

interface AddToolModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (tool: TestTool) => void;
}

interface MachineInfo {
  ip: string;
  username: string;
  password?: string;
}

/**
 * 添加新工具的模态框组件
 */
const AddToolModal: React.FC<AddToolModalProps> = ({ open, onClose, onSuccess }) => {
  const { message } = App.useApp();
  
  // 表单实例
  const [form] = Form.useForm();
  
  // 状态管理
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validated, setValidated] = useState(false);
  const [machineInfo, setMachineInfo] = useState<MachineInfo | null>(null);
  const [selectedCases, setSelectedCases] = useState<string[]>([]);
  
  // 数据
  const [agentVersions, setAgentVersions] = useState<AgentVersion[]>([]);
  const [testCases, setTestCases] = useState<TestCase[]>([]);

  // 初始化和重置
  useEffect(() => {
    if (open) {
      // 打开弹窗时重置状态
      resetState();
      // 加载数据
      loadData();
    }
  }, [open]);

  /**
   * 重置所有状态和表单
   */
  const resetState = () => {
    setValidated(false);
    setMachineInfo(null);
    setSelectedCases([]);
    form.resetFields();
  };

  /**
   * 加载代理版本和测试用例数据
   */
  const loadData = async () => {
    try {
      setLoading(true);
      const [versions, cases] = await Promise.all([
        api.getAgentVersions(),
        api.getTestCases()
      ]);
      setAgentVersions(versions);
      setTestCases(cases);
    } catch (error) {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 校验远程机器连接
   */
  const validateMachine = async () => {
    // 获取机器信息表单值
    const values = form.getFieldsValue(['ip', 'username', 'password']);
    
    setValidating(true);
    try {
      const result = await validateMachineConnection(values, api, message);
      setValidated(result.validated);
      setMachineInfo(result.machineInfo);
    } finally {
      setValidating(false);
    }
  };

  /**
   * 处理测试用例选择变更
   */
  const handleCaseChange = (checkedValues: string[]) => {
    setSelectedCases(checkedValues);
    form.setFieldsValue({ testCases: checkedValues });
  };

  /**
   * 创建工具
   */
  const createTool = async () => {
    try {
      // 验证表单
      const values = await form.validateFields();
      
      if (!machineInfo || !machineInfo.password) {
        message.error('机器信息未验证或验证失败');
        return;
      }
      
      if (!values.testCases || values.testCases.length === 0) {
        message.error('请至少选择一个测试用例');
        return;
      }

      // 设置加载状态
      setLoading(true);
      
      try {
        // 调用API创建新工具
        const result = await api.createProject({
          name: values.name,
          description: values.description,
          testType: values.testType,
          machine: {
            ip: machineInfo.ip,
            username: machineInfo.username,
            password: machineInfo.password
          },
          agentVersionId: values.agentVersion,
          testCaseIds: values.testCases
        });
        
        // 创建成功提示
        message.success(`工具 "${values.name}" 创建成功！`);
        
        // 将API返回结果转换为前端所需格式
        const newTool: TestTool = {
          id: result.id?.toString() || '',
          name: result.name || '',
          description: result.description || '',
          status: 'active',
          version: result.agent_version?.name || '',
          category: result.test_type || values.testType,
          createdAt: result.created_at || new Date().toISOString(),
          updatedAt: result.updated_at || new Date().toISOString(),
          author: ''
        };
        
        onSuccess(newTool);
        resetState();
        onClose();
      } catch (error) {
        console.error('创建工具错误:', error);
        message.error(error instanceof Error ? `创建工具失败: ${error.message}` : '创建工具失败，请检查网络或服务状态');
      }
    } catch (error) {
      if (error instanceof Error && 'errorFields' in error) {
        console.error('表单验证失败:', error);
      } else {
        message.error('创建工具失败');
        console.error('创建工具错误:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  // 弹窗底部按钮
  const modalFooter = [
    <Button key="cancel" onClick={onClose}>
      取消
    </Button>,
    <Button
      key="submit"
      type="primary"
      onClick={createTool}
      disabled={!validated || selectedCases.length === 0}
      loading={loading}
    >
      添加工具
    </Button>
  ];

  return (
    <Modal
      title="添加新测试项"
      open={open}
      onCancel={onClose}
      width={700}
      footer={modalFooter}
      destroyOnClose
    >
      <Spin spinning={loading}>
        <Form 
          form={form} 
          layout="vertical"
          initialValues={{ testCases: [] }}
        >
          <Card title="基本信息" className="mb-4">
            <Form.Item
              name="name"
              label="项目名称"
              rules={[{ required: true, message: '请输入项目名称' }]}
            >
              <Input placeholder="请输入项目名称" />
            </Form.Item>
            
            <Form.Item
              name="description"
              label="项目描述"
              rules={[{ required: false, message: '请输入项目描述' }]}
            >
              <TextArea 
                placeholder="请输入项目描述" 
                autoSize={{ minRows: 2, maxRows: 6 }}
              />
            </Form.Item>
            
            <Form.Item
              name="testType"
              label="测试类型"
              rules={[{ required: true, message: '请选择测试类型' }]}
            >
              <Select placeholder="请选择测试类型">
                <Option value="performance">性能测试</Option>
                <Option value="stress">压力测试</Option>
                <Option value="diagnostic">诊断工具</Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="agentVersion"
              label="代理版本"
              rules={[{ required: true, message: '请选择代理版本' }]}
            >
              <Select placeholder="请选择代理版本">
                {agentVersions.map(version => (
                  <Option key={version.id} value={version.id}>
                    {version.name} - {version.description}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Card>

          <Card title="机器信息" className="mb-4">
            <Form.Item
              name="ip"
              label="机器 IP"
              rules={[{ required: true, message: '请输入机器IP' }]}
              // 设置默认值
              initialValue="10.17.51.24"
            >
              <Input placeholder="请输入机器IP" />
            </Form.Item>
            
            <div className="flex gap-4">
              <Form.Item
                name="username"
                label="用户名"
                rules={[{ required: true, message: '请输入用户名' }]}
                className="flex-1"
                initialValue="root"
              >
                <Input placeholder="请输入用户名" />
              </Form.Item>
              <Form.Item
                name="password"
                label="密码"
                rules={[{ required: true, message: '请输入密码' }]}
                className="flex-1"
                initialValue="nettrixtest"
              >
                <Input.Password placeholder="请输入密码" />
              </Form.Item>
            </div>
            
            <Form.Item>
              <Button 
                type="primary" 
                onClick={validateMachine}
                loading={validating}
              >
                验证连接
              </Button>
              {validated && <span className="ml-2 text-green-500">✓ 连接成功</span>}
            </Form.Item>
          </Card>

          <Card title="测试用例">
            <div className="mb-4">选择测试用例：</div>
            <Form.Item
              name="testCases"
              rules={[{ required: true, message: '请至少选择一个测试用例' }]}
            >
              <Checkbox.Group 
                className="flex flex-col gap-2" 
                onChange={handleCaseChange}
                value={selectedCases}
              >
                {testCases.map(testCase => (
                  <Checkbox key={testCase.id} value={testCase.id}>
                    {testCase.name} - {testCase.description}
                  </Checkbox>
                ))}
              </Checkbox.Group>
            </Form.Item>
          </Card>
        </Form>
      </Spin>
    </Modal>
  );
};

export default AddToolModal; 