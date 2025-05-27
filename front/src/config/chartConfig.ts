/**
 * 图表配置文件
 * 集中管理各类图表的配置信息
 */

// 通用折线图配置
export const getLineChartConfig = (data: any[], xField = 'date', yField = 'value', seriesField = 'type') => {
  return {
    data,
    xField,
    yField,
    seriesField,
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
    ],
  };
};

// 综合性能图表配置
export const getPerformanceChartConfig = (performanceChartData: any[]) => {
  return {
    ...getLineChartConfig(performanceChartData),
    yAxis: {
      title: {
        text: '值',
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
    // 为不同系列设置不同颜色和线条样式
    color: ['#1890ff', '#52c41a', '#ffa940', '#f5222d', '#722ed1'],
    lineStyle: ({ type }: { type: string }) => {
      if (type === 'IOPS') {
        return {
          lineWidth: 3,
          lineDash: [0, 0],
        };
      }
      if (type === '延迟(ms)') {
        return {
          lineWidth: 2,
          lineDash: [4, 4],
        };
      }
      if (type === 'CPU利用率(%)') {
        return {
          lineWidth: 2,
          lineDash: [8, 4],
        };
      }
      return {
        lineWidth: 2,
        lineDash: [0, 0],
      };
    },
  };
};

// IO读写速度图表配置
export const getIOSpeedChartConfig = (ioPerformanceData: any[]) => {
  return {
    ...getLineChartConfig(ioPerformanceData),
    yAxis: {
      title: {
        text: '速度 (MB/s)',
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
    color: ['#1890ff', '#52c41a'],
  };
};

// IOPS图表配置
export const getIOPSChartConfig = (iopsData: any[]) => {
  return {
    ...getLineChartConfig(iopsData),
    yAxis: {
      title: {
        text: 'IOPS',
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
    color: ['#ffa940'],
  };
};

// 延迟数据图表配置
export const getLatencyChartConfig = (latencyData: any[]) => {
  return {
    ...getLineChartConfig(latencyData),
    yAxis: {
      title: {
        text: '延迟 (ms)',
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
    color: ['#f5222d'],
    lineStyle: {
      lineWidth: 2,
      lineDash: [4, 4],
    },
  };
};

// CPU利用率图表配置
export const getCPUChartConfig = (cpuData: any[]) => {
  return {
    ...getLineChartConfig(cpuData),
    yAxis: {
      title: {
        text: 'CPU利用率 (%)',
        style: {
          fontSize: 12,
        },
      },
      min: 0,
      max: 100,
    },
    xAxis: {
      title: {
        text: '时间',
        style: {
          fontSize: 12,
        },
      },
    },
    color: ['#722ed1'],
    lineStyle: {
      lineWidth: 2,
      lineDash: [8, 4],
    },
  };
}; 