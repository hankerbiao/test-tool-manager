import React, { useState, useEffect } from 'react';
import { Card, Tabs, Button, Empty, Spin, message, Row, Col, Statistic, Typography } from 'antd';
import { Line } from '@ant-design/charts';
import { PlayCircleOutlined, ArrowUpOutlined, ArrowDownOutlined, CheckCircleFilled, CloseCircleFilled, ExclamationCircleFilled } from '@ant-design/icons';

const { Title, Text } = Typography;

interface PerformanceTestPageProps {
  toolId?: string;
}

// 性能数据点接口
interface PerformanceDataPoint {
  date: string;
  value: number;
  type: string;
}

// 性能指标接口
interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'error';
  benchmark?: number;
  change?: number;
}

const PerformanceTestPage: React.FC<PerformanceTestPageProps> = ({ toolId }) => {
  const [loading, setLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState<PerformanceDataPoint[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);

  // 在组件挂载时自动加载性能数据
  useEffect(() => {
    loadPerformanceData();
  }, [toolId]);

  // 加载性能数据
  const loadPerformanceData = async () => {
    if (!toolId) {
      message.error('工具ID未提供');
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 生成模拟性能数据
      const mockData = generateMockPerformanceData();
      setPerformanceData(mockData);
      
      // 生成性能指标摘要
      const metrics = generatePerformanceMetrics();
      setPerformanceMetrics(metrics);
    } catch (error) {
      console.error('加载性能数据失败:', error);
      message.error('加载性能数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 生成模拟性能数据
  const generateMockPerformanceData = () => {
    const timePoints = ['10:00', '10:05', '10:10', '10:15', '10:20', '10:25', '10:30', '10:35', '10:40', '10:45'];
    const data: PerformanceDataPoint[] = [];

    // 定义基础值和波动范围
    const baseValues = {
      '读取速度(MB/s)': 280,
      '写入速度(MB/s)': 200,
      'IOPS': 15000,
      '延迟(ms)': 1.8,
      'CPU利用率(%)': 35,
      '内存使用率(%)': 45,
      '队列深度': 32
    };
    
    const fluctuations = {
      '读取速度(MB/s)': 50,
      '写入速度(MB/s)': 40,
      'IOPS': 2000,
      '延迟(ms)': 0.8,
      'CPU利用率(%)': 15,
      '内存使用率(%)': 10,
      '队列深度': 16
    };

    // 为每种指标在每个时间点生成数据
    Object.keys(baseValues).forEach(metricType => {
      // 添加趋势因子，使得数据有一定的趋势性
      let trendFactor = 0;
      const baseValue = baseValues[metricType as keyof typeof baseValues];
      const fluctuation = fluctuations[metricType as keyof typeof fluctuations];
      
      timePoints.forEach((time, index) => {
        // 随机波动 + 趋势
        trendFactor += (Math.random() - 0.5) * 0.2;
        // 限制趋势因子在合理范围
        trendFactor = Math.max(-0.5, Math.min(0.5, trendFactor));
        
        // 计算当前值
        let value = baseValue + (Math.random() - 0.5 + trendFactor) * fluctuation;
        
        // 确保值不为负数
        if (metricType !== '延迟(ms)') {
          value = Math.max(0, value);
        } else {
          // 延迟始终为正
          value = Math.max(0.1, value);
        }
        
        // 添加到数据集
        data.push({
          date: time,
          value,
          type: metricType
        });
      });
    });

    return data;
  };

  // 生成性能指标摘要
  const generatePerformanceMetrics = (): PerformanceMetric[] => {
    // 基准值（上一次测试的结果）
    const benchmarks = {
      '读取速度': 275,
      '写入速度': 195,
      'IOPS': 14800,
      '平均延迟': 1.9,
      'CPU平均利用率': 38,
      '内存平均使用率': 47
    };
    
    // 本次测试的结果
    const currentValues = {
      '读取速度': 285 + (Math.random() - 0.5) * 20,
      '写入速度': 205 + (Math.random() - 0.5) * 15,
      'IOPS': 15200 + (Math.random() - 0.5) * 1000,
      '平均延迟': 1.75 + (Math.random() - 0.5) * 0.3,
      'CPU平均利用率': 36 + (Math.random() - 0.5) * 8,
      '内存平均使用率': 44 + (Math.random() - 0.5) * 6
    };
    
    // 计算指标状态和变化百分比
    return [
      {
        name: '读取速度',
        value: currentValues['读取速度'],
        unit: 'MB/s',
        status: currentValues['读取速度'] > 250 ? 'normal' : currentValues['读取速度'] > 200 ? 'warning' : 'error',
        benchmark: benchmarks['读取速度'],
        change: (currentValues['读取速度'] - benchmarks['读取速度']) / benchmarks['读取速度'] * 100
      },
      {
        name: '写入速度',
        value: currentValues['写入速度'],
        unit: 'MB/s',
        status: currentValues['写入速度'] > 180 ? 'normal' : currentValues['写入速度'] > 150 ? 'warning' : 'error',
        benchmark: benchmarks['写入速度'],
        change: (currentValues['写入速度'] - benchmarks['写入速度']) / benchmarks['写入速度'] * 100
      },
      {
        name: 'IOPS',
        value: currentValues['IOPS'],
        unit: '',
        status: currentValues['IOPS'] > 12000 ? 'normal' : currentValues['IOPS'] > 10000 ? 'warning' : 'error',
        benchmark: benchmarks['IOPS'],
        change: (currentValues['IOPS'] - benchmarks['IOPS']) / benchmarks['IOPS'] * 100
      },
      {
        name: '平均延迟',
        value: currentValues['平均延迟'],
        unit: 'ms',
        // 延迟越低越好
        status: currentValues['平均延迟'] < 2 ? 'normal' : currentValues['平均延迟'] < 3 ? 'warning' : 'error',
        benchmark: benchmarks['平均延迟'],
        // 延迟是负增长为好
        change: (benchmarks['平均延迟'] - currentValues['平均延迟']) / benchmarks['平均延迟'] * 100
      },
      {
        name: 'CPU平均利用率',
        value: currentValues['CPU平均利用率'],
        unit: '%',
        status: currentValues['CPU平均利用率'] < 50 ? 'normal' : currentValues['CPU平均利用率'] < 70 ? 'warning' : 'error',
        benchmark: benchmarks['CPU平均利用率'],
        // CPU利用率降低为好
        change: (benchmarks['CPU平均利用率'] - currentValues['CPU平均利用率']) / benchmarks['CPU平均利用率'] * 100
      },
      {
        name: '内存平均使用率',
        value: currentValues['内存平均使用率'],
        unit: '%',
        status: currentValues['内存平均使用率'] < 60 ? 'normal' : currentValues['内存平均使用率'] < 80 ? 'warning' : 'error',
        benchmark: benchmarks['内存平均使用率'],
        // 内存使用率降低为好
        change: (benchmarks['内存平均使用率'] - currentValues['内存平均使用率']) / benchmarks['内存平均使用率'] * 100
      }
    ];
  };

  // 过滤数据以仅显示特定类型
  const filterDataByType = (types: string[]) => {
    return performanceData.filter(item => types.includes(item.type));
  };

  // 通用图表配置
  const getBaseConfig = (title: string, unit: string, data: PerformanceDataPoint[], colors: string[]) => {
    return {
      data,
      xField: 'date',
      yField: 'value',
      seriesField: 'type',
      smooth: true,
      animation: {
        appear: {
          animation: 'path-in',
          duration: 1000,
        },
      },
      point: {
        size: 4,
        shape: 'circle',
      },
      legend: {
        position: 'top',
      },
      yAxis: {
        title: {
          text: title,
          style: {
            fontSize: 12,
          },
        },
      },
      xAxis: {
        title: {
          text: '时间',
          style: {
            fontSize: 12,
          },
        },
      },
      color: colors,
      tooltip: {
        showCrosshairs: true,
        shared: true,
      },
      interactions: [
        {
          type: 'legend-highlight',
        },
        {
          type: 'element-highlight',
        },
        {
          type: 'axis-label-highlight',
        }
      ],
    };
  };

  // 渲染性能指标卡片
  const renderMetricsCards = () => {
    if (!performanceMetrics.length) return null;
    
    return (
      <Card title="性能指标摘要" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          {performanceMetrics.map((metric, index) => (
            <Col key={index} xs={24} sm={12} md={8} lg={8} xl={8}>
              <Card 
                size="small" 
                style={{ 
                  borderLeft: `3px solid ${
                    metric.status === 'normal' ? '#52c41a' : 
                    metric.status === 'warning' ? '#faad14' : '#f5222d'
                  }`
                }}
              >
                <Statistic
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {metric.status === 'normal' ? (
                        <CheckCircleFilled style={{ color: '#52c41a' }} />
                      ) : metric.status === 'warning' ? (
                        <ExclamationCircleFilled style={{ color: '#faad14' }} />
                      ) : (
                        <CloseCircleFilled style={{ color: '#f5222d' }} />
                      )}
                      <span>{metric.name}</span>
                    </div>
                  }
                  value={metric.value}
                  precision={metric.name.includes('延迟') ? 2 : 0}
                  suffix={metric.unit}
                  valueStyle={{ color: 
                    metric.status === 'normal' ? '#52c41a' : 
                    metric.status === 'warning' ? '#faad14' : '#f5222d'
                  }}
                />
                {metric.change !== undefined && (
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      vs 基准值 {metric.benchmark?.toFixed(metric.name.includes('延迟') ? 2 : 0)} {metric.unit}
                    </Text>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      color: metric.change > 0 ? 
                        (metric.name.includes('延迟') || metric.name.includes('CPU') || metric.name.includes('内存') ? '#f5222d' : '#52c41a') :
                        (metric.name.includes('延迟') || metric.name.includes('CPU') || metric.name.includes('内存') ? '#52c41a' : '#f5222d')
                    }}>
                      {metric.change > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                      <span style={{ marginLeft: 4 }}>{Math.abs(metric.change).toFixed(1)}%</span>
                    </div>
                  </div>
                )}
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    );
  };

  // 主体内容渲染
  const renderContent = () => {
    if (loading) {
      return (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Spin tip="加载性能数据中..." size="large" />
        </div>
      );
    }

    if (!performanceData.length) {
      return (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Empty description="暂无性能数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </div>
      );
    }

    // 配置各个性能指标的图表
    const allMetricsConfig = getBaseConfig('值', '混合单位', performanceData, 
      ['#1890ff', '#52c41a', '#ffa940', '#f5222d', '#722ed1', '#13c2c2', '#eb2f96']);
    
    const ioSpeedConfig = getBaseConfig('速度 (MB/s)', 'MB/s', 
      filterDataByType(['读取速度(MB/s)', '写入速度(MB/s)']), 
      ['#1890ff', '#52c41a']);
    
    const iopsConfig = getBaseConfig('IOPS', '次/秒', 
      filterDataByType(['IOPS']), 
      ['#ffa940']);
    
    const latencyConfig = getBaseConfig('延迟 (ms)', '毫秒', 
      filterDataByType(['延迟(ms)']), 
      ['#f5222d']);
    
    const cpuMemConfig = getBaseConfig('利用率 (%)', '%', 
      filterDataByType(['CPU利用率(%)', '内存使用率(%)']), 
      ['#722ed1', '#13c2c2']);
    
    const queueDepthConfig = getBaseConfig('队列深度', '', 
      filterDataByType(['队列深度']), 
      ['#eb2f96']);

    return (
      <>
        {renderMetricsCards()}
        
        <Tabs defaultActiveKey="1" tabPosition="left">
          <Tabs.TabPane tab="所有指标" key="1">
            <div style={{ height: 400 }}>
              <Line {...allMetricsConfig} />
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
          <Tabs.TabPane tab="CPU/内存" key="5">
            <div style={{ height: 400 }}>
              <Line {...cpuMemConfig} />
            </div>
          </Tabs.TabPane>
          <Tabs.TabPane tab="队列深度" key="6">
            <div style={{ height: 400 }}>
              <Line {...queueDepthConfig} />
            </div>
          </Tabs.TabPane>
        </Tabs>
      </>
    );
  };

  return (
    <Card 
      bordered={false} 
      style={{ borderRadius: '8px' }}
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>磁盘性能分析</span>
          <Button 
            icon={<PlayCircleOutlined />}
            onClick={loadPerformanceData}
            loading={loading}
          >
            刷新数据
          </Button>
        </div>
      }
    >
      {renderContent()}
    </Card>
  );
};

export default PerformanceTestPage; 