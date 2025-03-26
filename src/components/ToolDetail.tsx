import React, { useState } from 'react';
import { Tabs, Form, Input, Button, Table, Tag, Typography, Space, Modal, message } from 'antd';
import { PlayCircleOutlined, EditOutlined, DeleteOutlined, HistoryOutlined } from '@ant-design/icons';
import { TestTool } from '../types/tools';
import { executeTool, deleteTool } from '../api/toolsApi';
import EditToolModal from './EditToolModal';

const { TextArea } = Input;
const { Title, Text } = Typography;

interface ToolDetailProps {
  tool: TestTool;
  onToolDeleted?: () => void;
}

const ToolDetail: React.FC<ToolDetailProps> = ({ tool, onToolDeleted }) => {
  const [activeTab, setActiveTab] = useState('1');
  const [executionResult, setExecutionResult] = useState<string | null>(null);
  const [executing, setExecuting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [currentTool, setCurrentTool] = useState<TestTool>(tool);
  const [form] = Form.useForm();

  const handleExecuteTool = async () => {
    try {
      const values = await form.validateFields();
      setExecuting(true);
      setExecutionResult(null);
      
      // 调用API执行工具
      const result = await executeTool(currentTool.id, values);
      setExecutionResult(result.output || '执行成功，但没有输出结果');
      message.success('工具执行成功');
    } catch (error) {
      if (error instanceof Error) {
        setExecutionResult(`执行错误: ${error.message}`);
        message.error('工具执行失败');
      }
    } finally {
      setExecuting(false);
    }
  };

  const handleDelete = () => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除工具 "${currentTool.name}" 吗？此操作不可恢复。`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          setDeleting(true);
          await deleteTool(currentTool.id);
          message.success('删除成功');
          if (onToolDeleted) {
            onToolDeleted();
          }
        } catch (error) {
          if (error instanceof Error) {
            message.error(`删除失败: ${error.message}`);
          } else {
            message.error('删除失败');
          }
        } finally {
          setDeleting(false);
        }
      },
    });
  };

  const showEditModal = () => {
    setIsEditModalVisible(true);
  };

  const handleEditSuccess = (updatedTool: TestTool) => {
    setCurrentTool(updatedTool);
    message.success('工具更新成功');
  };

  const parameterColumns = [
    {
      title: '参数名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => <Tag>{type}</Tag>,
    },
    {
      title: '必填',
      dataIndex: 'required',
      key: 'required',
      render: (required: boolean) => (required ? <Tag color="red">是</Tag> : <Tag color="green">否</Tag>),
    },
    {
      title: '默认值',
      dataIndex: 'default',
      key: 'default',
      render: (value: any) => (value !== undefined ? String(value) : '-'),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
  ];

  // 定义 Tabs 的 items
  const tabItems = [
    {
      key: '1',
      label: '基本信息',
      children: (
        <div className="tool-info">
          <div className="info-item">
            <Text strong>工具ID:</Text>
            <Text>{currentTool.id}</Text>
          </div>
          <div className="info-item">
            <Text strong>版本:</Text>
            <Text>{currentTool.version}</Text>
          </div>
          <div className="info-item">
            <Text strong>状态:</Text>
            <Tag color={
              currentTool.status === 'active' ? 'green' : 
              currentTool.status === 'inactive' ? 'orange' : 'red'
            }>
              {currentTool.status}
            </Tag>
          </div>
          <div className="info-item">
            <Text strong>分类:</Text>
            <Tag color="blue">{currentTool.category}</Tag>
          </div>
          {currentTool.path && (
            <div className="info-item">
              <Text strong>路径:</Text>
              <Text>{currentTool.path}</Text>
            </div>
          )}
          {currentTool.command && (
            <div className="info-item">
              <Text strong>命令:</Text>
              <Text code>{currentTool.command}</Text>
            </div>
          )}
          {currentTool.lastRun && (
            <div className="info-item">
              <Text strong>上次运行:</Text>
              <Text>{currentTool.lastRun}</Text>
            </div>
          )}
          {currentTool.tags && currentTool.tags.length > 0 && (
            <div className="info-item">
              <Text strong>标签:</Text>
              <div>
                {currentTool.tags.map(tag => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      key: '2',
      label: '参数',
      children: (
        (currentTool.parameters && currentTool.parameters.length > 0) ? (
          <Table 
            dataSource={currentTool.parameters} 
            columns={parameterColumns} 
            rowKey="name"
            pagination={false}
            size="small"
          />
        ) : (
          <Text>该工具没有参数</Text>
        )
      ),
    },
    {
      key: '3',
      label: '执行',
      children: (
        <>
          <Form 
            form={form} 
            layout="vertical"
            onFinish={handleExecuteTool}
          >
            {currentTool.parameters && currentTool.parameters.map(param => (
              <Form.Item
                key={param.name}
                name={param.name}
                label={`${param.name}${param.description ? ` (${param.description})` : ''}`}
                rules={[{ required: param.required, message: `请输入${param.name}` }]}
                initialValue={param.default}
              >
                {param.type === 'string' && param.description?.includes('多行') ? (
                  <TextArea rows={4} placeholder={`请输入${param.name}`} />
                ) : (
                  <Input placeholder={`请输入${param.name}`} />
                )}
              </Form.Item>
            ))}
            
            <Form.Item>
              <Button 
                type="primary" 
                icon={<PlayCircleOutlined />} 
                htmlType="submit" 
                loading={executing}
              >
                执行工具
              </Button>
            </Form.Item>
          </Form>
          
          {executionResult && (
            <div className="execution-result">
              <Title level={5}>执行结果</Title>
              <div className="result-content">
                <pre>{executionResult}</pre>
              </div>
            </div>
          )}
        </>
      ),
    },
    {
      key: '4',
      label: <span><HistoryOutlined /> 执行历史</span>,
      children: <Text>暂无执行历史记录</Text>,
    },
  ];

  return (
    <div className="tool-detail">
      <div className="tool-header">
        <div>
          <Title level={4}>{currentTool.name}</Title>
          <Text type="secondary">{currentTool.description}</Text>
        </div>
        <Space>
          <Button type="primary" icon={<PlayCircleOutlined />} onClick={() => setActiveTab('3')}>
            执行
          </Button>
          <Button icon={<EditOutlined />} onClick={showEditModal}>
            编辑
          </Button>
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            onClick={handleDelete}
            loading={deleting}
          >
            删除
          </Button>
        </Space>
      </div>

      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        items={tabItems}
      />

      {/* 编辑工具的模态框 */}
      <EditToolModal 
        visible={isEditModalVisible}
        tool={currentTool}
        onClose={() => setIsEditModalVisible(false)}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
};

export default ToolDetail; 