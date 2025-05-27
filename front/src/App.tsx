import React, { useState, useEffect } from 'react';
import { Layout, Typography, theme, Tag, List, Tabs, Card, Button, Modal, message, Row, Col, Table, Descriptions, Statistic } from 'antd';
import { Line } from '@ant-design/charts';
import { useToolManagement } from './hooks/useToolManagement';
import ProjectDetail from './components/ProjectDetail';
import ToolSidebar from './components/ToolSidebar';
import ToolDetails from './components/ToolDetails';
import EmptyState from './components/EmptyState';
import AddToolModal from './components/AddToolModal';
import EditToolModal from './components/EditToolModal';
import { TestTool, ExecutionHistory as ExecutionHistoryType } from './types';
import { DownloadOutlined, EyeOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { 
  getPerformanceChartConfig, 
  getIOSpeedChartConfig, 
  getIOPSChartConfig, 
  getLatencyChartConfig, 
  getCPUChartConfig 
} from './config/chartConfig';
import {
  testStatistics,
  mockTestCases,
  mockPerformanceData,
  getStatusColor
} from './config/mockData';

const { Header, Content } = Layout;
const { Title } = Typography;

/**
 * 应用主组件
 */
function App() {

  // 项目相关状态
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any | undefined>(undefined);

  // 使用工具管理Hook
  const {
    selectedTool,
    categoryFilter,
    executionHistory,
    executionLoading,
    filteredTools,
    handleSearch,
    handleCategoryChange,
    handleSelectTool,
    handleDeleteTool,
    handleExecuteTool,
    addTool,
    updateTool
  } = useToolManagement();

  // 新增添加工具模态框状态
  const [addToolModalOpen, setAddToolModalOpen] = useState(false);
  // 新增编辑工具模态框状态
  const [editToolModalOpen, setEditToolModalOpen] = useState(false);
  const [toolToEdit, setToolToEdit] = useState<TestTool | null>(null);

  // 处理添加新工具
  const handleAddTool = () => {
    // 打开添加工具模态框
    setAddToolModalOpen(true);
  };
  
  // 处理编辑工具
  const handleEditToolClick = (tool: TestTool) => {
    setToolToEdit(tool);
    setEditToolModalOpen(true);
  };
  
  // 处理添加工具成功
  const handleAddToolSuccess = (tool: TestTool) => {
    // 将新工具添加到列表并选中
    addTool(tool);
  };
  
  // 处理编辑工具成功
  const handleEditToolSuccess = (tool: TestTool) => {
    // 更新工具信息
    updateTool(tool);
    message.success(`工具 "${tool.name}" 更新成功`);
  };

  // 显示历史详情
  const showHistoryDetails = (record: ExecutionHistoryType) => {
    // 分离IOPS和其他指标数据，用于创建双轴图
    const ioPerformanceData = mockPerformanceData.filter(item => item.type === '读取速度(MB/s)' || item.type === '写入速度(MB/s)');
    const iopsData = mockPerformanceData.filter(item => item.type === 'IOPS');
    const latencyData = mockPerformanceData.filter(item => item.type === '延迟(ms)');
    const cpuData = mockPerformanceData.filter(item => item.type === 'CPU利用率(%)');

    // 使用配置文件中的函数获取图表配置
    const lineConfig = getPerformanceChartConfig(mockPerformanceData);
    const ioSpeedConfig = getIOSpeedChartConfig(ioPerformanceData);
    const iopsConfig = getIOPSChartConfig(iopsData);
    const latencyConfig = getLatencyChartConfig(latencyData);
    const cpuConfig = getCPUChartConfig(cpuData);

    // 下载日志
    const handleDownloadCaseLog = (caseId: string, caseName: string) => {
      message.success(`开始下载 ${caseName} 的日志文件`);
      // 实际应用中这里应该调用API下载日志文件
      console.log(`下载用例 #${caseId} 的日志`);
    };

    Modal.destroyAll(); // 关闭之前的所有弹窗
    
    Modal.info({
      title: `项目详情：${record.toolName}`,
      className: 'project-detail-modal',
      icon: null,
      centered: true,
      width: 1000,
      maskClosable: true,
      okButtonProps: { style: { display: 'none' } },
      footer: (
        <Button onClick={() => Modal.destroyAll()}>
          关闭
        </Button>
      ),
      content: (
        <div style={{ maxHeight: 'calc(80vh)', overflow: 'auto' }}>
          {/* 项目基本信息 */}
          <div className="project-info" style={{ marginBottom: '24px' }}>
            <Descriptions bordered column={{ xxl: 4, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}>
              <Descriptions.Item label="项目名称" span={1}>
                {record.toolName}
              </Descriptions.Item>
              <Descriptions.Item label="状态" span={1}>
                <Tag color={getStatusColor(record.status)}>{record.status}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="创建时间" span={1}>
                {record.startTime.split(' ')[0]} {record.startTime.split(' ')[1]}
              </Descriptions.Item>
              <Descriptions.Item label="测试机器" span={1}>
                192.168.1.102 (user3)
              </Descriptions.Item>
              <Descriptions.Item label="代理版本" span={1}>
                v1.2.0
              </Descriptions.Item>
              <Descriptions.Item label="进度" span={1}>
                {record.progress}%
              </Descriptions.Item>
            </Descriptions>
          </div>

          {/* 测试统计 */}
          <div className="test-statistics" style={{ marginBottom: '24px' }}>
            <Row gutter={24}>
              <Col span={8}>
                <Card bordered={false}>
                  <Statistic
                    title="测试总数"
                    value={testStatistics.totalTests}
                    prefix={<ClockCircleOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card bordered={false}>
                  <Statistic
                    title="通过数量"
                    value={testStatistics.passedTests}
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card bordered={false}>
                  <Statistic
                    title="失败数量"
                    value={testStatistics.failedTests}
                    prefix={<CloseCircleOutlined />}
                    valueStyle={{ color: '#ff4d4f' }}
                  />
                </Card>
              </Col>
            </Row>
          </div>

          {/* 选项卡 */}
          <Tabs defaultActiveKey="1">
            <Tabs.TabPane tab="测试结果" key="1">
              <Card bordered={false}>
                <Table
                  columns={[
                    {
                      title: '测试用例',
                      dataIndex: 'name',
                      key: 'name',
                    },
                    {
                      title: '状态',
                      dataIndex: 'status',
                      key: 'status',
                      render: (status: string) => (
                        <Tag color={getStatusColor(status)}>{status}</Tag>
                      )
                    },
                    {
                      title: '执行时间',
                      dataIndex: 'duration',
                      key: 'duration',
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
                      render: (_, record: any) => (
                        <Button
                          type="link"
                          size="small"
                          icon={<DownloadOutlined />}
                          onClick={() => handleDownloadCaseLog(record.id, record.name)}
                        >
                          下载日志
                        </Button>
                      )
                    }
                  ]}
                  dataSource={mockTestCases}
                  pagination={false}
                  rowKey="id"
                />
              </Card>
            </Tabs.TabPane>
            <Tabs.TabPane tab="性能数据" key="2">
              <Card bordered={false}>
                <Tabs defaultActiveKey="1" tabPosition="left">
                  <Tabs.TabPane tab="所有指标" key="1">
                    <div style={{ height: 400 }}>
                      <Line {...lineConfig} />
                    </div>
                  </Tabs.TabPane>
                  <Tabs.TabPane tab="读写速度" key="2">
                    <div style={{ height: 400 }}>
                      <Line {...ioSpeedConfig} />
                    </div>
                  </Tabs.TabPane>
                  <Tabs.TabPane tab="IOPS" key="3">
                    <div style={{ height: 400 }}>
                      <Line {...iopsConfig} />
                    </div>
                  </Tabs.TabPane>
                  <Tabs.TabPane tab="延迟" key="4">
                    <div style={{ height: 400 }}>
                      <Line {...latencyConfig} />
                    </div>
                  </Tabs.TabPane>
                  <Tabs.TabPane tab="CPU利用率" key="5">
                    <div style={{ height: 400 }}>
                      <Line {...cpuConfig} />
                    </div>
                  </Tabs.TabPane>
                </Tabs>
              </Card>
            </Tabs.TabPane>
          </Tabs>
        </div>
      ),
    });
  };

  // 下载报告
  const downloadReport = (record: ExecutionHistoryType) => {
    message.success(`开始下载 ${record.toolName} 的执行报告`);
  };

  // 渲染内容
  const renderContent = () => {
    if (!selectedTool) {
      return <EmptyState message="请选择一个测试工具" />;
    }

    return (
      <ToolDetails
        tool={selectedTool}
        onExecute={handleExecuteTool}
        onEdit={handleEditToolClick}
        onDelete={handleDeleteTool}
      >
        <div className="execution-history-container">
          {executionLoading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              加载中...
            </div>
          ) : (
            <List
              itemLayout="horizontal"
              dataSource={executionHistory}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button icon={<EyeOutlined />} onClick={() => showHistoryDetails(item)}>查看</Button>,
                    <Button icon={<DownloadOutlined />} onClick={() => downloadReport(item)}>下载报告</Button>
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <span>
                        {item.toolName} <Tag color={getStatusColor(item.status)}>{item.status}</Tag>
                      </span>
                    }
                    description={`执行时间: ${item.startTime} 至 ${item.endTime} | 执行者: ${item.executor}`}
                  />
                </List.Item>
              )}
            />
          )}
        </div>
      </ToolDetails>
    );
  };

  return (
    <Layout>
      <Header style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 1, 
        width: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        padding: '0 24px',
        background: '#1890ff'
      }}>
        <div className="flex-1">
          <Title level={3} style={{ margin: 0, color: 'white' }}>
            测试工具管理平台-让测试工程师只关注测试
          </Title>
        </div>
      </Header>
      
      <div style={{ maxWidth: 1800, margin: '0 auto', width: '100%' }}>
        <Layout hasSider>
          <ToolSidebar
            tools={filteredTools}
            selectedTool={selectedTool}
            categoryFilter={categoryFilter}
            onSearch={handleSearch}
            onCategoryChange={handleCategoryChange}
            onAddTool={handleAddTool}
            onSelectTool={handleSelectTool}
          />
          
          <Layout style={{ padding: '0 16px', minHeight: 'calc(100vh - 64px)' }}>
            <Content style={{ margin: '24px 0', overflow: 'initial' }}>
              {renderContent()}
            </Content>
          </Layout>
        </Layout>
      </div>
      
      {/* 添加工具弹窗 */}
      <AddToolModal
        open={addToolModalOpen}
        onClose={() => setAddToolModalOpen(false)}
        onSuccess={handleAddToolSuccess}
      />
      
      {/* 编辑工具弹窗 */}
      <EditToolModal 
        open={editToolModalOpen}
        onClose={() => setEditToolModalOpen(false)}
        onSuccess={handleEditToolSuccess}
        tool={toolToEdit}
      />
      
      {/* 项目详情弹窗 */}
      {selectedProject && (
        <ProjectDetail
          open={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          project={selectedProject}
        />
      )}
    </Layout>
  );
}

export default App;
