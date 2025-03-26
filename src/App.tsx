import { ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TestToolsManager from './pages/TestToolsManager';
import './styles/global.css';

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <Router>
        <Routes>
          <Route path="/" element={<TestToolsManager />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;
