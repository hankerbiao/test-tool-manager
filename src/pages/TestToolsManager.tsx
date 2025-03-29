import {useState, useEffect} from 'react';
import {Layout, Typography, Card, message} from 'antd';
import ToolsList from '../components/ToolsList';
import ToolDetail from '../components/ToolDetail';
import {TestTool} from '../types/tools';
import {useToolsData} from '../hooks/useToolsData';

const {Header, Content} = Layout;
const {Title} = Typography;

const TestToolsManager: React.FC = () => {
    const [selectedTool, setSelectedTool] = useState<TestTool | null>(null);
    const {tools, loading, error} = useToolsData();

    // 当工具列表加载时，如果有工具且没有选中工具，自动选中第一个
    useEffect(() => {
        if (tools.length > 0 && !selectedTool) {
            setSelectedTool(tools[0]);
        }
    }, [tools, selectedTool]);

    // 如果有错误，显示错误信息
    useEffect(() => {
        if (error) {
            message.error(error);
        }
    }, [error]);

    const handleSelectTool = (tool: TestTool) => {
        setSelectedTool(tool);
    };

    return (
        <Layout className="app-container">
            <Header className="app-header">
                <Title level={3} style={{color: 'white', margin: 0}}>测试工具管理</Title>
            </Header>
            <Content className="app-content">
                <div className="content-container">
                    <Card className="tools-list-card" title="工具列表">
                        <ToolsList
                            onSelectTool={handleSelectTool}
                            selectedToolId={selectedTool?.id}
                        />
                    </Card>
                    <Card
                        className="tool-detail-card"
                        title={selectedTool ? `工具详情: ${selectedTool.name}` : '请选择工具'}
                        loading={loading && !selectedTool}
                    >
                        {selectedTool ? (
                            <ToolDetail
                                tool={selectedTool}
                                onToolDeleted={() => setSelectedTool(null)}
                            />
                        ) : (
                            <p>请从左侧列表中选择一个工具</p>
                        )}
                    </Card>
                </div>
            </Content>
        </Layout>
    );
};

export default TestToolsManager; 