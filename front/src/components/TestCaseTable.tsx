import React from 'react';
import { Table, Tag, Space, Button, Progress, Typography } from 'antd';
import { PlayCircleOutlined, EyeOutlined, ClockCircleOutlined, LoadingOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { TestCaseExecution } from '../types';

const { Text } = Typography;

interface TestCaseTableProps {
  testCaseExecutions: TestCaseExecution[];
  loading: boolean;
  executingCaseId: string | null;
  onExecuteTestCase: (caseId: string) => void;
  onViewLogs: (record: TestCaseExecution) => void;
}

/**
 * 测试用例表格组件
 */
const TestCaseTable: React.FC<TestCaseTableProps> = ({
  testCaseExecutions,
  loading,
  executingCaseId,
  onExecuteTestCase,
  onViewLogs
}) => {
  // 渲染测试用例状态标签
  const renderStatusTag = (status: string) => {
    switch (status) {
      case 'waiting':
        return <Tag icon={<ClockCircleOutlined />} color="default">等待执行</Tag>;
      case 'running':
        return <Tag icon={<LoadingOutlined />} color="processing">执行中</Tag>;
      case 'success':
        return <Tag icon={<CheckCircleOutlined />} color="success">执行成功</Tag>;
      case 'failed':
        return <Tag icon={<CloseCircleOutlined />} color="error">执行失败</Tag>;
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  // 渲染进度条
  const renderProgressBar = (progress: number, record: TestCaseExecution) => {
    let status: "active" | "success" | "exception" | "normal" = "normal";
    
    if (record.status === 'running') {
      status = "active";
    } else if (record.status === 'success') {
      status = "success";
    } else if (record.status === 'failed') {
      status = "exception";
    }
    
    // 确保完成时进度为100%
    const displayProgress = (record.status === 'success' || record.status === 'failed') ? 100 : progress;
    
    return (
      <Progress 
        percent={displayProgress} 
        size="small" 
        status={status}
        // 当状态为成功或失败时，不显示动画效果
        strokeColor={
          record.status === 'running' 
            ? { from: '#108ee9', to: '#87d068' } 
            : undefined
        }
        format={percent => {
          // 格式化进度显示
          if (record.status === 'waiting') return '待执行';
          if (record.status === 'running') return `${percent}%`;
          if (record.status === 'success') return '完成';
          if (record.status === 'failed') return '失败';
          return `${percent}%`;
        }}
      />
    );
  };

  // 表格列定义
  const columns = [
    {
      title: '用例名称',
      dataIndex: 'name',
      key: 'name',
      width: '15%',
      render: (text: string) => <Text strong>{text}</Text>
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: '10%',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: '10%',
      render: renderStatusTag,
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      width: '15%',
      render: renderProgressBar,
    },
    {
      title: '结果',
      dataIndex: 'result',
      key: 'result',
      width: '15%',
      render: (result: string) => result || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: '20%',
      render: (_: any, record: TestCaseExecution) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<PlayCircleOutlined />}
            onClick={() => onExecuteTestCase(record.id)}
            disabled={record.status === 'running' || executingCaseId !== null}
          >
            执行
          </Button>
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => onViewLogs(record)}
            disabled={record.status === 'waiting'}
          >
            日志
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={testCaseExecutions}
      rowKey="id"
      pagination={false}
      size="small"
      scroll={{ y: 400 }}
      loading={loading}
      rowClassName={(record) => {
        if (record.status === 'running') return 'row-running';
        if (record.status === 'success') return 'row-success';
        if (record.status === 'failed') return 'row-failed';
        return '';
      }}
    />
  );
};

export default TestCaseTable; 