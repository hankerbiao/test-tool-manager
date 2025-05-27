import React from 'react';
import { Layout, List, Typography, Tag, Input, Select, Button } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { TestTool } from '../types';
import { getStatusColor, getStatusText, getCategoryText } from '../utils/toolUtils';

const { Sider } = Layout;
const { Text } = Typography;
const { Search } = Input;
const { Option } = Select;

// 添加样式类定义
const styles = {
  toolCard: {
    padding: '12px 16px',
    margin: '8px 0',
    background: '#fff',
    borderRadius: '6px',
    transition: 'all 0.3s',
    cursor: 'pointer'
  },
  selectedCard: {
    boxShadow: '0 4px 12px rgba(24, 144, 255, 0.15)',
    transform: 'translateY(-1px)',
    border: '1px solid #1890ff',
    borderLeft: '4px solid #1890ff'
  },
  normalCard: {
    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
    border: '1px solid transparent',
    borderLeft: '1px solid transparent'
  }
};

interface ToolSidebarProps {
  tools: TestTool[];
  selectedTool: TestTool | null;
  categoryFilter: string;
  onSearch: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onAddTool: () => void;
  onSelectTool: (tool: TestTool) => void;
}

const ToolSidebar: React.FC<ToolSidebarProps> = ({
  tools,
  selectedTool,
  categoryFilter,
  onSearch,
  onCategoryChange,
  onAddTool,
  onSelectTool
}) => {
  return (
    <Sider 
      width={260} 
      theme="light" 
      style={{ 
        height: 'calc(100vh - 64px)', 
        overflow: 'auto', 
        position: 'sticky', 
        top: 64,
        left: 0,
        borderRight: '1px solid #f0f0f0',
        paddingLeft: 1,
        background: 'transparent'
      }}
    >
      <style>
        {`
          .tool-card-hover:hover {
            box-shadow: 0 6px 16px rgba(0,0,0,0.08) !important;
            transform: translateY(-2px) !important;
          }
        `}
      </style>
      <div style={{ 
        padding: '16px 12px',
        background: '#fff',
        borderRadius: '8px',
        marginRight: '16px',
        marginBottom: '16px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
      }}>
        <Search
          placeholder="搜索工具名称或描述"
          onSearch={onSearch}
          style={{ marginBottom: 16 }}
        />
        
        <Select
          placeholder="所有分类"
          style={{ width: '100%', marginBottom: 16 }}
          value={categoryFilter}
          onChange={onCategoryChange}
        >
          <Option value="all">所有分类</Option>
          <Option value="performance">性能测试</Option>
          <Option value="stress">压力测试</Option>
          <Option value="diagnostic">诊断工具</Option>
        </Select>
        
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          style={{ width: '100%', marginBottom: 8, borderRadius: '4px' }}
          onClick={onAddTool}
        >
          添加新测试计划
        </Button>
      </div>
      
      <div style={{ 
        background: '#f5f7fa',
        borderRadius: '8px',
        marginRight: '16px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
        paddingBottom: '12px'
      }}>
        <div className="px-4 py-2" style={{ borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}>
          <Text strong>工具列表</Text>
        </div>
        
        <List
          dataSource={tools}
          renderItem={(tool, index) => (
            <div 
              style={{ 
                padding: '0 8px',
              }}
            >
              <List.Item 
                className={`tool-card-hover`}
                onClick={() => onSelectTool(tool)}
                style={{ 
                  ...styles.toolCard,
                  ...(selectedTool?.id === tool.id ? styles.selectedCard : styles.normalCard)
                }}
              >
                <div className="w-full">
                  <div className="flex justify-between items-center mb-1">
                    <Text strong>{tool.name}</Text>
                    <Tag color={getStatusColor(tool.status)} style={{ borderRadius: '4px' }}>{getStatusText(tool.status)}</Tag>
                  </div>
                  <Text type="secondary" className="block text-sm mb-2" ellipsis={{ tooltip: tool.description }}>
                    {tool.description}
                  </Text>
                  <div className="flex justify-between items-center">
                    <Tag color="blue" style={{ borderRadius: '4px' }}>{getCategoryText(tool.category)}</Tag>
                    <Text type="secondary" className="text-xs">v{tool.version}</Text>
                  </div>
                </div>
              </List.Item>
            </div>
          )}
          style={{
            padding: '0',
          }}
        />
      </div>
    </Sider>
  );
};

export default ToolSidebar; 