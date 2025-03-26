import { useEffect, useState } from 'react';
import { List, Input, Tag, Select, Spin, Button } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { TestTool } from '../types/tools';
// import { fetchTools } from '../api/toolsApi';
import AddToolModal from './AddToolModal';
import { useToolsData } from '../hooks/useToolsData';

const { Search } = Input;
const { Option } = Select;

interface ToolsListProps {
  onSelectTool: (tool: TestTool) => void;
  selectedToolId?: string;
}

const ToolsList: React.FC<ToolsListProps> = ({ onSelectTool, selectedToolId }) => {
  const { tools, loading,  loadTools } = useToolsData();
  const [filteredTools, setFilteredTools] = useState<TestTool[]>([]);
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  useEffect(() => {
    const filtered = tools.filter(tool => {
      const matchesSearch = tool.name.toLowerCase().includes(searchText.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchText.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || tool.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
    setFilteredTools(filtered);
  }, [searchText, categoryFilter, tools]);

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'inactive':
        return 'orange';
      case 'deprecated':
        return 'red';
      default:
        return 'default';
    }
  };

  const showAddModal = () => {
    setIsAddModalVisible(true);
  };

  const handleAddSuccess = (newTool: TestTool) => {
    // 重新加载工具列表
    loadTools();
    // 选中新添加的工具
    onSelectTool(newTool);
  };

  // 临时数据，后续会从API获取
  const categories = ['all', '自动化测试', '性能测试', '安全测试', '接口测试', '其他工具'];

  return (
    <div className="tools-list">
      <div className="tools-list-actions">
        <Search
          placeholder="搜索工具名称或描述"
          onSearch={handleSearch}
          onChange={e => handleSearch(e.target.value)}
          style={{ marginBottom: 16 }}
          prefix={<SearchOutlined />}
        />
        <Select
          defaultValue="all"
          style={{ width: '100%', marginBottom: 16 }}
          onChange={handleCategoryChange}
        >
          {categories.map(category => (
            <Option key={category} value={category}>
              {category === 'all' ? '所有分类' : category}
            </Option>
          ))}
        </Select>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          style={{ marginBottom: 16, width: '100%' }}
          onClick={showAddModal}
        >
          添加新工具
        </Button>
      </div>
      
      {loading ? (
        <div className="loading-container">
          <Spin />
        </div>
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={filteredTools}
          renderItem={tool => (
            <List.Item
              onClick={() => onSelectTool(tool)}
              className={`tool-list-item ${selectedToolId === tool.id ? 'selected' : ''}`}
            >
              <List.Item.Meta
                title={<span>{tool.name} <Tag color={getStatusColor(tool.status)}>{tool.status}</Tag></span>}
                description={
                  <>
                    <div className="tool-description">{tool.description}</div>
                    <div className="tool-meta">
                      <Tag color="blue">{tool.category}</Tag>
                      <span>v{tool.version}</span>
                    </div>
                  </>
                }
              />
            </List.Item>
          )}
        />
      )}

      {/* 添加工具的模态框 */}
      <AddToolModal 
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        onSuccess={handleAddSuccess}
      />
    </div>
  );
};

export default ToolsList; 