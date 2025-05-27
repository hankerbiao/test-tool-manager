import { useState, useEffect } from 'react';
import { Modal, Tabs, Table, Tag, Row, Col, Typography, Button, App, Spin, Empty, Progress, Badge, Divider, Card, Timeline, Collapse } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, FileTextOutlined, BarChartOutlined, CodeOutlined, DownloadOutlined } from '@ant-design/icons';
import { Project, TestResult, PerformanceData } from '../types';
import { api } from '../services/api';

interface ProjectDetailProps {
  open: boolean;
  onClose: () => void;
  project?: Project;
}

// 扩展TestResult类型以包含可能的额外字段
interface EnhancedTestResult extends TestResult {
  type?: string;
  progress?: number;
}

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

// 空状态组件
const EmptyState = () => (
  <div className="py-16 flex flex-col items-center justify-center">
    <div className="mb-3">
      <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 20V45C50 47.7614 47.7614 50 45 50H15C12.2386 50 10 47.7614 10 45V15C10 12.2386 12.2386 10 15 10H40" stroke="#D9D9D9" strokeWidth="2" />
        <path d="M30 30H30.01" stroke="#D9D9D9" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
    <Text type="secondary">暂无数据</Text>
  </div>
);

// 测试用例类型组件
interface TestCaseTypeProps {
  type: string;
  count: number;
  completed: number;
}

const TestCaseType = ({ type, count, completed }: TestCaseTypeProps) => {
  const percent = Math.round((completed / (count || 1)) * 100);
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <Text strong>{type}</Text>
        <Text type="secondary">{completed}/{count}</Text>
      </div>
      <Progress percent={percent} size="small" status={percent === 100 ? "success" : "active"} />
    </div>
  );
};

// 模拟性能数据图表组件
const PerformanceChart = ({ data }: { data: any }) => {
  // 这里应该使用实际的图表库，如Recharts或ECharts
  return (
    <div className="bg-gray-50 p-4 rounded mb-4">
      <div className="flex items-center mb-4">
        <BarChartOutlined className="mr-2 text-blue-500" />
        <Text strong>磁盘性能指标</Text>
      </div>
      <div className="h-60 flex items-center justify-center border border-dashed border-gray-300 bg-white rounded">
        <Text type="secondary">这里将显示性能图表</Text>
      </div>
    </div>
  );
};

// 测试执行日志组件
const TestExecutionLogs = ({ result }: { result: EnhancedTestResult }) => {
  return (
    <Card className="mb-4">
      <div className="flex items-center mb-4">
        <CodeOutlined className="mr-2 text-blue-500" />
        <Text strong>执行日志</Text>
        <Button size="small" type="text" icon={<DownloadOutlined />} className="ml-auto">
          下载日志
        </Button>
      </div>
      <div className="h-60 overflow-auto bg-gray-50 p-3 rounded">
        <pre className="whitespace-pre-wrap font-mono text-sm">{result.logs || '暂无执行日志'}</pre>
      </div>
    </Card>
  );
};

// 测试执行时间线组件
const TestExecutionTimeline = ({ result }: { result: EnhancedTestResult }) => {
  // 模拟测试执行的时间线数据
  const timelineItems = [
    { time: '10:05:30', status: 'success', content: '开始执行测试' },
    { time: '10:05:32', status: 'success', content: '初始化测试环境' },
    { time: '10:05:35', status: 'success', content: '加载测试数据' },
    { time: '10:05:40', status: 'success', content: '执行测试操作' },
    { time: '10:05:50', status: result.status === 'passed' ? 'success' : 'error', content: '验证测试结果' },
    { time: '10:05:55', status: result.status === 'passed' ? 'success' : 'error', content: '测试完成' }
  ];

  return (
    <Card className="mb-4">
      <div className="flex items-center mb-4">
        <ClockCircleOutlined className="mr-2 text-blue-500" />
        <Text strong>执行时间线</Text>
      </div>
      <Timeline
        items={timelineItems.map(item => ({
          color: item.status === 'success' ? 'green' : 'red',
          children: (
            <div>
              <Text type="secondary" className="mr-2">{item.time}</Text>
              <Text>{item.content}</Text>
            </div>
          )
        }))}
      />
    </Card>
  );
};

const ProjectDetail = ({ open, onClose, project }: ProjectDetailProps) => {
  const { message } = App.useApp();
  const [testResults, setTestResults] = useState<EnhancedTestResult[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('测试结果');
  const [selectedResult, setSelectedResult] = useState<EnhancedTestResult | null>(null);
  
  // 测试用例类型统计
  const [caseTypes, setCaseTypes] = useState<{
    type: string;
    count: number;
    completed: number;
  }[]>([
    { type: '基础功能测试', count: 8, completed: 6 },
    { type: '性能测试', count: 5, completed: 2 },
    { type: '兼容性测试', count: 3, completed: 3 },
    { type: '安全测试', count: 2, completed: 0 }
  ]);

  useEffect(() => {
    if (project && open) {
      loadData();
    }
  }, [project, open]);

  useEffect(() => {
    // 当测试结果加载完成后，默认选择第一个结果
    if (testResults.length > 0 && !selectedResult) {
      setSelectedResult(testResults[0]);
    }
  }, [testResults]);

  const loadData = async () => {
    if (!project) return;

    try {
      setLoading(true);
      const [results, performance] = await Promise.all([
        api.getTestResults(project.id),
        api.getPerformanceData(project.id)
      ]);
      
      // 将基本测试结果扩展为增强版本，添加模拟的type和progress字段
      const enhancedResults: EnhancedTestResult[] = results.map((result, index) => ({
        ...result,
        type: index % 4 === 0 ? '基础功能测试' : 
              index % 4 === 1 ? '性能测试' :
              index % 4 === 2 ? '兼容性测试' : '安全测试',
        progress: result.status === 'passed' ? 100 : Math.floor(Math.random() * 90) + 10
      }));
      
      setTestResults(enhancedResults);
      setPerformanceData(performance);
      
      // 在实际应用中，这里应该从API获取测试用例类型统计数据
      // 现在使用模拟数据
    } catch (error) {
      console.error('Failed to load data:', error);
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const testResultColumns = [
    {
      title: '测试用例',
      dataIndex: 'caseName',
      key: 'caseName',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Badge color={
          type === '基础功能测试' ? 'blue' : 
          type === '性能测试' ? 'orange' : 
          type === '兼容性测试' ? 'green' : 
          type === '安全测试' ? 'red' : 'default'
        } text={type || '未知类型'} />
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={
          status === 'passed' ? 'success' : 
          status === 'failed' ? 'error' : 
          'default'
        }>
          {
            status === 'passed' ? '通过' : 
            status === 'failed' ? '失败' : 
            '等待中'
          }
        </Tag>
      ),
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number, record: EnhancedTestResult) => {
        // 根据TestResult的status类型来确定进度条状态
        if (record.status === 'passed') {
          return <Progress percent={100} size="small" status="success" />;
        } else if (record.status === 'failed') {
          return <Progress percent={record.progress || 50} size="small" status="exception" />;
        } else {
          // 默认状态，用于等待中或其他状态
          return <Progress percent={record.progress || 0} size="small" status="active" />;
        }
      },
    },
    {
      title: '执行时间',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration: number) => (duration ? `${duration}秒` : '-'),
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: EnhancedTestResult) => (
        <Button 
          type="link" 
          onClick={() => {
            setSelectedResult(record);
            setActiveTab('执行详情');
          }}
        >
          查看详情
        </Button>
      ),
    }
  ];

  // 测试日志展开面板
  const expandedRowRender = (record: EnhancedTestResult) => {
    return (
      <div className="p-3 bg-gray-50 rounded">
        <pre className="whitespace-pre-wrap font-mono text-sm">{record.logs}</pre>
      </div>
    );
  };

  if (!project) return null;

  const getStatusTag = () => {
    let color = 'default';
    let text = '等待中';
    
    switch (project.status) {
      case 'running':
        color = 'processing';
        text = '运行中';
        break;
      case 'completed':
        color = 'success';
        text = '已完成';
        break;
      case 'failed':
        color = 'error';
        text = '失败';
        break;
    }
    
    return <Tag color={color}>{text}</Tag>;
  };

  // 计算总体测试进度
  const calculateOverallProgress = () => {
    const totalCases = caseTypes.reduce((sum, type) => sum + type.count, 0);
    const completedCases = caseTypes.reduce((sum, type) => sum + type.completed, 0);
    return Math.round((completedCases / (totalCases || 1)) * 100);
  };

  // 渲染测试用例详情
  const renderTestDetail = () => {
    if (!selectedResult) {
      return <EmptyState />;
    }

    // 确定测试类型的颜色
    const getTypeColor = (type?: string) => {
      if (!type) return 'default';
      return type === '基础功能测试' ? 'blue' :
             type === '性能测试' ? 'orange' :
             type === '兼容性测试' ? 'green' :
             type === '安全测试' ? 'red' : 'default';
    };

    return (
      <div className="p-4">
        <Row gutter={24}>
          <Col span={24}>
            <Card className="mb-4">
              <div className="flex items-start">
                <div className="flex-1">
                  <Title level={4}>{selectedResult.caseName}</Title>
                  <div className="mb-2">
                    <Badge 
                      color={getTypeColor(selectedResult.type)} 
                      text={selectedResult.type || '未知类型'} 
                      className="mr-4" 
                    />
                    <Tag color={selectedResult.status === 'passed' ? 'success' : 'error'}>
                      {selectedResult.status === 'passed' ? '通过' : '失败'}
                    </Tag>
                  </div>
                  <Paragraph type="secondary" className="mt-2">
                    测试开始时间: {selectedResult.startTime} | 
                    执行时长: {selectedResult.duration}秒 | 
                    执行结束时间: {selectedResult.endTime}
                  </Paragraph>
                </div>
                <div>
                  <Progress 
                    type="circle" 
                    percent={selectedResult.status === 'passed' ? 100 : (selectedResult.progress || 0)} 
                    status={selectedResult.status === 'passed' ? 'success' : 'exception'} 
                    width={80} 
                  />
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={12}>
            <TestExecutionTimeline result={selectedResult} />
          </Col>
          <Col span={12}>
            <TestExecutionLogs result={selectedResult} />
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={24}>
            <PerformanceChart data={performanceData} />
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={24}>
            <Card>
              <Title level={5} className="mb-4">测试详细结果</Title>
              <Collapse defaultActiveKey={['1']}>
                <Panel header="测试环境信息" key="1">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Text strong>操作系统:</Text> <Text>Ubuntu 20.04 LTS</Text>
                    </div>
                    <div>
                      <Text strong>磁盘型号:</Text> <Text>Samsung SSD 980 PRO</Text>
                    </div>
                    <div>
                      <Text strong>文件系统:</Text> <Text>ext4</Text>
                    </div>
                    <div>
                      <Text strong>测试工具版本:</Text> <Text>v2.1.5</Text>
                    </div>
                  </div>
                </Panel>
                <Panel header="测试参数配置" key="2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Text strong>块大小:</Text> <Text>4K</Text>
                    </div>
                    <div>
                      <Text strong>队列深度:</Text> <Text>32</Text>
                    </div>
                    <div>
                      <Text strong>读写模式:</Text> <Text>随机读</Text>
                    </div>
                    <div>
                      <Text strong>测试文件大小:</Text> <Text>10GB</Text>
                    </div>
                    <div>
                      <Text strong>测试时间:</Text> <Text>60秒</Text>
                    </div>
                  </div>
                </Panel>
                <Panel header="错误信息" key="3">
                  {selectedResult.status === 'failed' ? (
                    <div className="bg-red-50 p-3 rounded border border-red-200">
                      <Text type="danger">错误: 磁盘性能未达到预期指标，读取速度低于阈值100MB/s</Text>
                    </div>
                  ) : (
                    <Text type="secondary">无错误信息</Text>
                  )}
                </Panel>
              </Collapse>
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  return (
    <Modal
      title={`项目详情：${project.name}`}
      open={open}
      onCancel={onClose}
      width={1200}
      closable={true}
      closeIcon={<span className="text-gray-400 hover:text-gray-600">×</span>}
      footer={[
        <Button key="close" onClick={onClose} className="px-6">
          关闭
        </Button>
      ]}
      bodyStyle={{ padding: 0 }}
    >
      {/* 项目基本信息 */}
      <table className="w-full border-collapse text-sm">
        <tbody>
          <tr>
            <td className="py-4 px-4 bg-gray-50 font-medium w-[15%]">项目名称</td>
            <td className="py-4 px-4 w-[35%]">{project.name}</td>
            <td className="py-4 px-4 bg-gray-50 font-medium w-[15%]">状态</td>
            <td className="py-4 px-4 w-[35%]">{getStatusTag()}</td>
          </tr>
          <tr>
            <td className="py-4 px-4 bg-gray-50 font-medium">创建时间</td>
            <td className="py-4 px-4">{project.createTime}</td>
            <td className="py-4 px-4 bg-gray-50 font-medium">测试机器</td>
            <td className="py-4 px-4">{project.machine.ip} ({project.machine.username})</td>
          </tr>
          <tr>
            <td className="py-4 px-4 bg-gray-50 font-medium">代理版本</td>
            <td className="py-4 px-4">v{project.agentVersion}</td>
            <td className="py-4 px-4 bg-gray-50 font-medium">进度</td>
            <td className="py-4 px-4">
              <Progress percent={project.progress} status={
                project.status === 'completed' ? 'success' : 
                project.status === 'failed' ? 'exception' : 'active'
              } />
            </td>
          </tr>
        </tbody>
      </table>

      {/* 测试统计数据 */}
      <div className="border-t border-gray-100">
        <Row>
          <Col span={8} className="p-6 border-r border-gray-100">
            <div className="flex flex-col items-center">
              <div className="flex items-center mb-1">
                <ClockCircleOutlined className="text-gray-500 mr-2" />
                <Title level={3} className="m-0">{project.totalCases}</Title>
              </div>
              <Text type="secondary">测试总数</Text>
            </div>
          </Col>
          <Col span={8} className="p-6 border-r border-gray-100">
            <div className="flex flex-col items-center">
              <div className="flex items-center mb-1">
                <CheckCircleOutlined className="text-green-500 mr-2" />
                <Title level={3} className="m-0 text-green-500">{project.passedCases}</Title>
              </div>
              <Text type="secondary">通过数量</Text>
            </div>
          </Col>
          <Col span={8} className="p-6">
            <div className="flex flex-col items-center">
              <div className="flex items-center mb-1">
                <CloseCircleOutlined className="text-red-500 mr-2" />
                <Title level={3} className="m-0 text-red-500">{project.failedCases}</Title>
              </div>
              <Text type="secondary">失败数量</Text>
            </div>
          </Col>
        </Row>
      </div>

      {/* 测试结果和性能数据选项卡 */}
      <div className="border-t border-gray-100">
        <Tabs 
          activeKey={activeTab}
          onChange={key => setActiveTab(key)}
          className="px-4 pt-2"
          items={[
            {
              key: '测试结果',
              label: '测试结果',
              children: (
                <Row gutter={24} className="p-4">
                  <Col span={6}>
                    <div className="bg-gray-50 p-4 rounded">
                      <div className="mb-4">
                        <Title level={5} className="mb-2">测试用例进度</Title>
                        <Progress 
                          type="circle" 
                          percent={calculateOverallProgress()} 
                          width={120}
                          status={
                            project.status === 'completed' ? 'success' : 
                            project.status === 'failed' ? 'exception' : 'active'
                          }
                          className="mb-2"
                        />
                        <div className="text-center mb-4">
                          <Text type="secondary">总体完成率</Text>
                        </div>
                      </div>
                      
                      <Divider className="my-4" />
                      
                      <Title level={5} className="mb-3">测试用例类型</Title>
                      {caseTypes.map((caseType, index) => (
                        <TestCaseType key={index} {...caseType} />
                      ))}
                    </div>
                  </Col>
                  <Col span={18}>
                    {testResults.length > 0 ? (
                      <Table
                        columns={testResultColumns}
                        dataSource={testResults}
                        expandable={{ expandedRowRender }}
                        rowKey="id"
                        loading={loading}
                        pagination={false}
                        size="middle"
                      />
                    ) : (
                      <EmptyState />
                    )}
                  </Col>
                </Row>
              )
            },
            {
              key: '执行详情',
              label: '执行详情',
              children: renderTestDetail()
            },
            {
              key: '性能数据',
              label: '性能数据',
              children: (
                <Spin spinning={loading}>
                  {performanceData.length > 0 ? (
                    <div className="p-4">
                      <PerformanceChart data={performanceData} />
                      <Table
                        columns={[
                          { title: '指标名称', dataIndex: 'metric', key: 'metric' },
                          { title: '指标值', dataIndex: 'value', key: 'value' },
                          { title: '单位', dataIndex: 'unit', key: 'unit' },
                          { 
                            title: '状态', 
                            dataIndex: 'status', 
                            key: 'status',
                            render: (status: string) => (
                              <Tag color={status === 'normal' ? 'success' : 'error'}>
                                {status === 'normal' ? '正常' : '异常'}
                              </Tag>
                            )
                          }
                        ]}
                        dataSource={[
                          { key: '1', metric: '顺序读取速率', value: 520, unit: 'MB/s', status: 'normal' },
                          { key: '2', metric: '顺序写入速率', value: 480, unit: 'MB/s', status: 'normal' },
                          { key: '3', metric: '随机读取速率', value: 85, unit: 'MB/s', status: 'error' },
                          { key: '4', metric: '随机写入速率', value: 95, unit: 'MB/s', status: 'normal' },
                          { key: '5', metric: '4K随机读取IOPS', value: 22000, unit: 'IOPS', status: 'normal' },
                          { key: '6', metric: '4K随机写入IOPS', value: 20000, unit: 'IOPS', status: 'normal' },
                        ]}
                        pagination={false}
                      />
                    </div>
                  ) : (
                    <EmptyState />
                  )}
                </Spin>
              )
            }
          ]}
        />
      </div>
    </Modal>
  );
};

export default ProjectDetail; 