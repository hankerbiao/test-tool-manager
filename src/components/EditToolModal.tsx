import { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Switch, Button, Divider, Typography, message, Row, Col } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { TestTool } from '../types/tools';
import appConfig from '../config/appConfig';
import { updateTool } from '../api/toolsApi';

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

interface EditToolModalProps {
  visible: boolean;
  tool: TestTool | null;
  onClose: () => void;
  onSuccess: (tool: TestTool) => void;
}

const EditToolModal: React.FC<EditToolModalProps> = ({ visible, tool, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [confirmLoading, setConfirmLoading] = useState(false);

  // 当模态框显示并且有工具数据时，初始化表单
  useEffect(() => {
    if (visible && tool) {
      form.setFieldsValue({
        ...tool,
        tags: tool.tags ? tool.tags.join(', ') : '',
      });
    }
  }, [visible, tool, form]);

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  const handleSubmit = async () => {
    if (!tool) return;
    
    try {
      const values = await form.validateFields();
      setConfirmLoading(true);

      // 将表单数据转换为TestTool对象
      const toolData: Partial<TestTool> = {
        name: values.name,
        description: values.description,
        version: values.version,
        status: values.status,
        category: values.category,
        parameters: values.parameters || [],
        path: values.path,
        command: values.command,
        tags: values.tags ? values.tags.split(',').map((tag: string) => tag.trim()) : [],
      };

      // 调用API更新工具
      const updatedTool = await updateTool(tool.id, toolData);
      message.success('工具更新成功');
      form.resetFields();
      onSuccess(updatedTool);
      onClose();
    } catch (error) {
      if (error instanceof Error) {
        message.error(`更新失败: ${error.message}`);
      } else {
        message.error('更新失败，请检查表单数据');
      }
    } finally {
      setConfirmLoading(false);
    }
  };

  if (!tool) return null;

  return (
    <Modal
      title={`编辑工具: ${tool.name}`}
      open={visible}
      onCancel={handleCancel}
      width={900}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          取消
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          loading={confirmLoading} 
          onClick={handleSubmit}
        >
          保存
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        scrollToFirstError
        initialValues={{
          ...tool,
          tags: tool.tags ? tool.tags.join(', ') : '',
        }}
      >
        <Divider orientation="left">基本信息</Divider>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="工具名称"
              rules={[{ required: true, message: '请输入工具名称' }]}
            >
              <Input placeholder="例如：API自动化测试工具" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name="version"
              label="版本"
              rules={[{ required: true, message: '请输入工具版本' }]}
            >
              <Input placeholder="例如：1.0.0" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name="status"
              label="状态"
              rules={[{ required: true, message: '请选择工具状态' }]}
            >
              <Select>
                <Option value="active">活跃</Option>
                <Option value="inactive">未激活</Option>
                <Option value="deprecated">已废弃</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="description"
              label="描述"
              rules={[{ required: true, message: '请输入工具描述' }]}
            >
              <TextArea rows={3} placeholder="请详细描述工具的用途和功能" />
            </Form.Item>
          </Col>
        </Row>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="category"
              label="分类"
              rules={[{ required: true, message: '请选择工具分类' }]}
            >
              <Select>
                {appConfig.defaultCategories.map(category => (
                  <Option key={category} value={category}>{category}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="tags"
              label="标签"
              tooltip="多个标签请用逗号分隔"
            >
              <Input placeholder="例如：API,测试,自动化" />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">执行配置</Divider>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="path"
              label="工具路径"
              tooltip="工具在系统中的安装路径"
            >
              <Input placeholder="例如：/usr/local/bin/tool-name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="command"
              label="执行命令"
              tooltip="使用 {参数名} 作为参数占位符"
            >
              <Input placeholder="例如：tool-name --config {config} --env {environment}" />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">参数配置</Divider>
        
        <Form.List name="parameters">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Row key={key} gutter={8} align="top" style={{ marginBottom: 8 }}>
                  <Col span={4}>
                    <Form.Item
                      {...restField}
                      name={[name, 'name']}
                      rules={[{ required: true, message: '参数名必填' }]}
                      style={{ marginBottom: 8 }}
                    >
                      <Input placeholder="参数名" />
                    </Form.Item>
                  </Col>
                  
                  <Col span={4}>
                    <Form.Item
                      {...restField}
                      name={[name, 'type']}
                      rules={[{ required: true, message: '类型必填' }]}
                      style={{ marginBottom: 8 }}
                    >
                      <Select>
                        <Option value="string">字符串</Option>
                        <Option value="number">数字</Option>
                        <Option value="boolean">布尔值</Option>
                        <Option value="array">数组</Option>
                        <Option value="object">对象</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  
                  <Col span={3}>
                    <Form.Item
                      {...restField}
                      name={[name, 'required']}
                      valuePropName="checked"
                      style={{ marginBottom: 8 }}
                    >
                      <Switch checkedChildren="必填" unCheckedChildren="选填" />
                    </Form.Item>
                  </Col>
                  
                  <Col span={5}>
                    <Form.Item
                      {...restField}
                      name={[name, 'default']}
                      style={{ marginBottom: 8 }}
                    >
                      <Input placeholder="默认值" />
                    </Form.Item>
                  </Col>
                  
                  <Col span={7}>
                    <Form.Item
                      {...restField}
                      name={[name, 'description']}
                      style={{ marginBottom: 8 }}
                    >
                      <Input placeholder="参数描述" />
                    </Form.Item>
                  </Col>
                  
                  <Col span={1}>
                    <Button
                      icon={<MinusCircleOutlined />}
                      onClick={() => remove(name)}
                      type="text"
                      danger
                      style={{ marginBottom: 8 }}
                    />
                  </Col>
                </Row>
              ))}
              
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
                  添加参数
                </Button>
              </Form.Item>
              
              {fields.length === 0 && (
                <Text type="secondary" style={{ display: 'block', textAlign: 'center' }}>
                  如果工具需要参数，请点击"添加参数"按钮添加
                </Text>
              )}
            </>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
};

export default EditToolModal; 