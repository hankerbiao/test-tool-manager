import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Select, Checkbox, Spin, App, Card } from 'antd';
import { TestTool, AgentVersion, TestCase } from '../types';
import { api } from '../services/api';
import { validateMachineConnection } from '../utils/toolUtils';

// 常量
const { Option } = Select;
const { TextArea } = Input;

// 编辑工具弹窗组件接口
interface EditToolModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (tool: TestTool) => void;
  tool: TestTool | null;
}

// 机器信息接口
interface MachineInfo {
  ip: string;
  username: string;
  password?: string;
}

/**
 * 编辑工具的模态框组件
 */
const EditToolModal: React.FC<EditToolModalProps> = ({ open, onClose, onSuccess, tool }) => {
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
    if (open && tool) {
      // 打开弹窗时重置状态并加载数据
      resetState();
      loadData();
      
      // 预填充表单数据
      form.setFieldsValue({
        name: tool.name,
        description: tool.description,
        testType: tool.category,
        agentVersion: agentVersions.find(v => v.name === tool.version)?.id || '',
        ip: '192.168.1.102', // 模拟数据
        username: 'user3', // 模拟数据
        password: '********' // 模拟密码
      });
      
      // 模拟机器信息已验证
      setValidated(true);
      setMachineInfo({
        ip: '192.168.1.102',
        username: 'user3',
        password: '********'
      });
      
      // 模拟已选择的测试用例
      setTimeout(() => {
        const mockSelectedCases = ['1', '2', '3'];
        setSelectedCases(mockSelectedCases);
        form.setFieldsValue({ testCases: mockSelectedCases });
      }, 500);
    }
  }, [open, tool, form]);

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
   * 更新工具
   */
  const updateTool = async () => {
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

      // 模拟API调用
      setLoading(true);
      
      // 如果没有tool，退出
      if (!tool) {
        message.error('无法更新，工具数据缺失');
        return;
      }
      
      // 创建更新后的工具对象
      const updatedTool: TestTool = {
        ...tool,
        name: values.name,
        description: values.description,
        status: tool.status,
        version: agentVersions.find(v => v.id === values.agentVersion)?.name || tool.version,
        category: values.testType || tool.category,
        path: `/usr/local/bin/${values.name.toLowerCase().replace(/\s+/g, '-')}`,
      };

      // 等待一秒模拟API调用
      setTimeout(() => {
        message.success(`工具 "${values.name}" 更新成功！`);
        onSuccess(updatedTool);
        resetState();
        onClose();
        setLoading(false);
      }, 1000);
    } catch (error) {
      if (error instanceof Error && 'errorFields' in error) {
        console.error('表单验证失败:', error);
      } else {
        message.error('更新工具失败');
        console.error('更新工具错误:', error);
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
      onClick={updateTool}
      disabled={!validated || selectedCases.length === 0}
      loading={loading}
    >
      更新工具
    </Button>
  ];

  return (
    <Modal
      title="编辑工具"
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
            >
              <Input placeholder="请输入机器IP" />
            </Form.Item>
            
            <div className="flex gap-4">
              <Form.Item
                name="username"
                label="用户名"
                rules={[{ required: true, message: '请输入用户名' }]}
                className="flex-1"
              >
                <Input placeholder="请输入用户名" />
              </Form.Item>
              <Form.Item
                name="password"
                label="密码"
                rules={[{ required: true, message: '请输入密码' }]}
                className="flex-1"
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

export default EditToolModal; 