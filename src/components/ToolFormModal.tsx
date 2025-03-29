import {useState, useEffect} from 'react';
import {Modal, Form, Input, Select, Switch, Button, Divider, Typography, message, Row, Col} from 'antd';
import {PlusOutlined, MinusCircleOutlined} from '@ant-design/icons';
import {TestTool} from '../types/tools';
import appConfig from '../config/appConfig';
import {createTool, updateTool} from '../api/toolsApi';

const {Option} = Select;
const {TextArea} = Input;
const {Text} = Typography;

interface ToolFormModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: (tool: TestTool) => void;
    initialData?: TestTool; // 编辑模式下的初始数据
    mode: 'add' | 'edit'; // 模式：添加或编辑
}

const ToolFormModal: React.FC<ToolFormModalProps> = ({
                                                         visible,
                                                         onClose,
                                                         onSuccess,
                                                         initialData,
                                                         mode
                                                     }) => {
    const [form] = Form.useForm();
    const [confirmLoading, setConfirmLoading] = useState(false);

    // 当模态框显示或初始数据变化时，设置表单初始值
    useEffect(() => {
        if (visible && initialData && mode === 'edit') {
            // 处理标签，将数组转为逗号分隔的字符串
            const formData = {
                ...initialData,
                tags: initialData.tags ? initialData.tags.join(', ') : ''
            };
            form.setFieldsValue(formData);
        } else if (visible && mode === 'add') {
            console.log('add mode');
            form.resetFields();
        }
    }, [visible, initialData, form, mode]);

    const handleCancel = () => {
        form.resetFields();
        onClose();
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setConfirmLoading(true);

            // 将表单数据转换为TestTool对象
            const toolData: Omit<TestTool, 'id'> = {
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

            let resultTool: TestTool;

            if (mode === 'add') {
                // 调用API创建工具
                resultTool = await createTool(toolData);
                message.success('工具添加成功');
            } else {
                // 调用API更新工具
                resultTool = await updateTool(initialData!.id, toolData);
                message.success('工具更新成功');
            }

            form.resetFields();
            onSuccess(resultTool);
            onClose();
        } catch (error) {
            if (error instanceof Error) {
                message.error(`操作失败: ${error.message}`);
            } else {
                message.error('操作失败，请检查表单数据');
            }
        } finally {
            setConfirmLoading(false);
        }
    };

    // 标题根据模式动态显示
    const modalTitle = mode === 'add' ? '添加新测试工具' : '编辑测试工具';
    // 提交按钮文本根据模式动态显示
    const submitButtonText = mode === 'add' ? '保存' : '更新';

    return (
        <Modal
            title={modalTitle}
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
                    {submitButtonText}
                </Button>,
            ]}
        >
            {/* 表单内容与原 AddToolModal 相同 */}
            <Form
                form={form}
                layout="vertical"
                scrollToFirstError
            >
                <Divider orientation="left">基本信息</Divider>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="name"
                            label="工具名称"
                            rules={[{required: true, message: '请输入工具名称'}]}
                        >
                            <Input placeholder="例如：API自动化测试工具"/>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item
                            name="version"
                            label="版本"
                            rules={[{required: true, message: '请输入工具版本'}]}
                        >
                            <Input placeholder="例如：1.0.0"/>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item
                            name="status"
                            label="状态"
                            initialValue="active"
                            rules={[{required: true, message: '请选择工具状态'}]}
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
                            rules={[{required: true, message: '请输入工具描述'}]}
                        >
                            <TextArea rows={3} placeholder="请详细描述工具的用途和功能"/>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="category"
                            label="分类"
                            rules={[{required: true, message: '请选择工具分类'}]}
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
                            <Input placeholder="例如：API,测试,自动化"/>
                        </Form.Item>
                    </Col>
                </Row>

                <Divider orientation="left">执行配置</Divider>

                <Row gutter={16}>
                    {/* 执行机信息 */}
                    <Col span={8}>
                        <Form.Item
                            name="host"
                            label="执行机IP"
                            tooltip="在哪个机器上执行"
                        >
                            <Input placeholder="例如：192.168.0.1"/>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name="username"
                            label="执行机用户名"
                            tooltip="有权限执行工具的用户"
                        >
                            <Input placeholder="root"/>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name="password"
                            label="执行机密码"
                            tooltip="有权限执行工具的用户密码"
                        >
                            <Input.Password placeholder="密码"/>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    {/* 工具配置 */}
                    <Col span={12}>
                        <Form.Item
                            name="path"
                            label="工具路径"
                            tooltip="工具在系统中的安装路径"
                        >
                            <Input placeholder="例如：/usr/local/bin/tool-name"/>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="log"
                            label="输出日志路径"
                            tooltip="测试套件运行日志"
                        >
                            <Input placeholder="例如：/var/logs/strss.log"/>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={16}>
                        <Form.Item
                            name="command"
                            label="执行命令"
                            tooltip="执行命令，参数会自动拼接到命令后面 --config {config} --env {environment}"
                        >
                            <Input placeholder="例如：cd /home/username/tools && ./tool-name"/>
                        </Form.Item>
                    </Col>
                </Row>

                <Divider orientation="left">参数配置</Divider>

                <Form.List name="parameters">
                    {(fields, {add, remove}) => (
                        <>
                            {fields.map(({key, name, ...restField}) => (
                                <Row key={key} gutter={8} align="top" style={{marginBottom: 8}}>
                                    <Col span={4}>
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'name']}
                                            rules={[{required: true, message: '参数名必填'}]}
                                            style={{marginBottom: 8}}
                                        >
                                            <Input placeholder="参数名"/>
                                        </Form.Item>
                                    </Col>

                                    <Col span={4}>
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'type']}
                                            initialValue="string"
                                            rules={[{required: true, message: '类型必填'}]}
                                            style={{marginBottom: 8}}
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
                                            initialValue={false}
                                            style={{marginBottom: 8}}
                                        >
                                            <Switch checkedChildren="必填" unCheckedChildren="选填"/>
                                        </Form.Item>
                                    </Col>

                                    <Col span={5}>
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'default']}
                                            style={{marginBottom: 8}}
                                        >
                                            <Input placeholder="默认值"/>
                                        </Form.Item>
                                    </Col>

                                    <Col span={7}>
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'description']}
                                            style={{marginBottom: 8}}
                                        >
                                            <Input placeholder="参数描述"/>
                                        </Form.Item>
                                    </Col>

                                    <Col span={1}>
                                        <Button
                                            icon={<MinusCircleOutlined/>}
                                            onClick={() => remove(name)}
                                            type="text"
                                            danger
                                            style={{marginBottom: 8}}
                                        />
                                    </Col>
                                </Row>
                            ))}

                            <Form.Item>
                                <Button
                                    type="dashed"
                                    onClick={() => add()}
                                    block
                                    icon={<PlusOutlined/>}
                                >
                                    添加参数
                                </Button>
                            </Form.Item>

                            {fields.length === 0 && (
                                <Text type="secondary" style={{display: 'block', textAlign: 'center'}}>
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

export default ToolFormModal;