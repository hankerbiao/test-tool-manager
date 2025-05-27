/**
 * 模拟数据文件
 * 集中管理各类模拟数据
 */

// 模拟测试数据
export const testStatistics = {
  totalTests: 18,
  passedTests: 6,
  failedTests: 1,
};

// 模拟测试用例数据
export const mockTestCases = [
  {
    id: '1',
    name: '写入性能测试',
    status: 'success',
    duration: '45秒',
    startTime: '2023-08-15 09:30:15',
    endTime: '2023-08-15 09:31:00',
  },
  {
    id: '2',
    name: '读取性能测试',
    status: 'success',
    duration: '39秒',
    startTime: '2023-08-15 09:31:05',
    endTime: '2023-08-15 09:31:44',
  },
  {
    id: '3',
    name: '随机读写测试',
    status: 'success',
    duration: '120秒',
    startTime: '2023-08-15 09:32:00',
    endTime: '2023-08-15 09:34:00',
  },
  {
    id: '4',
    name: '顺序读写测试',
    status: 'success',
    duration: '95秒',
    startTime: '2023-08-15 09:34:10',
    endTime: '2023-08-15 09:35:45',
  },
  {
    id: '5',
    name: '高负载压力测试',
    status: 'success',
    duration: '300秒',
    startTime: '2023-08-15 09:36:00',
    endTime: '2023-08-15 09:41:00',
  },
  {
    id: '6',
    name: '长时间稳定性测试',
    status: 'success',
    duration: '600秒',
    startTime: '2023-08-15 09:42:00',
    endTime: '2023-08-15 09:52:00',
  },
  {
    id: '7',
    name: '断电恢复测试',
    status: 'failed',
    duration: '180秒',
    startTime: '2023-08-15 09:53:00',
    endTime: '2023-08-15 09:56:00',
  },
];

// 模拟性能数据
export const mockPerformanceData = [
  // 读取速度数据
  { date: '09:30', value: 320, type: '读取速度(MB/s)' },
  { date: '09:35', value: 332, type: '读取速度(MB/s)' },
  { date: '09:40', value: 301, type: '读取速度(MB/s)' },
  { date: '09:45', value: 334, type: '读取速度(MB/s)' },
  { date: '09:50', value: 390, type: '读取速度(MB/s)' },
  { date: '09:55', value: 330, type: '读取速度(MB/s)' },
  // 写入速度数据
  { date: '09:30', value: 220, type: '写入速度(MB/s)' },
  { date: '09:35', value: 232, type: '写入速度(MB/s)' },
  { date: '09:40', value: 201, type: '写入速度(MB/s)' },
  { date: '09:45', value: 234, type: '写入速度(MB/s)' },
  { date: '09:50', value: 290, type: '写入速度(MB/s)' },
  { date: '09:55', value: 230, type: '写入速度(MB/s)' },
  // IOPS数据
  { date: '09:30', value: 15500, type: 'IOPS' },
  { date: '09:35', value: 15600, type: 'IOPS' },
  { date: '09:40', value: 15400, type: 'IOPS' },
  { date: '09:45', value: 15700, type: 'IOPS' },
  { date: '09:50', value: 16000, type: 'IOPS' },
  { date: '09:55', value: 15800, type: 'IOPS' },
  // 延迟数据 (ms)
  { date: '09:30', value: 2.5, type: '延迟(ms)' },
  { date: '09:35', value: 2.3, type: '延迟(ms)' },
  { date: '09:40', value: 2.7, type: '延迟(ms)' },
  { date: '09:45', value: 2.4, type: '延迟(ms)' },
  { date: '09:50', value: 2.1, type: '延迟(ms)' },
  { date: '09:55', value: 2.2, type: '延迟(ms)' },
  // CPU利用率 (%)
  { date: '09:30', value: 35, type: 'CPU利用率(%)' },
  { date: '09:35', value: 42, type: 'CPU利用率(%)' },
  { date: '09:40', value: 38, type: 'CPU利用率(%)' },
  { date: '09:45', value: 45, type: 'CPU利用率(%)' },
  { date: '09:50', value: 50, type: 'CPU利用率(%)' },
  { date: '09:55', value: 47, type: 'CPU利用率(%)' },
];

// 辅助函数 - 获取状态对应的颜色
export const getStatusColor = (status: string) => {
  switch(status) {
    case 'active':
    case 'passed':
    case 'success':
      return 'green';
    case 'inactive':
    case 'waiting':
      return 'gray';
    case 'deprecated':
    case 'failed':
      return 'red';
    case 'running':
      return 'blue';
    default:
      return 'default';
  }
}; 