import React, { PureComponent, Fragment } from 'react';
import { formatMessage } from 'umi/locale';
import { confirmLeaveFunc } from '@/utils/utils';
import { Icon, Form, Input, Row, Col, Button, Select, Card } from 'antd';
import moment from 'moment';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import Page from '@/components/MyComponent/Page';
import NavigatorPanel from '@/components/MyComponent/NavigatorPanel';
import ConfirmLeave from '@/components/MyComponent/ConfirmLeave';
import OwnerSelect from '@/components/MyComponent/OwnerSelect';
import DCSelect from '@/components/MyComponent/DCSelect';
import RouteConfirmLeave from '@/components/MyComponent/RouteConfirmLeave';
import { CONFIRM_LEAVE_ACTION } from '@/utils/constants';
import styles from '@/components/MyComponent/IWmsCreate.less';

import 'moment/locale/zh-cn';
moment.locale('zh-cn');

const FormItem = Form.Item;
const { Option } = Select;
const { TextArea } = Input;

@Form.create()
export default class NewCreateForm extends PureComponent {
    state = {
        confirmLeaveVisible: false,
    };

    resetForms = () => { //清空表单
        this.props.form.resetFields();
    }

    componentDidMount() {
        // 刷新/退出该页面时执行，但页面卸载时不会执行
        window.onbeforeunload = confirmLeaveFunc;
    }

    componentWillUnmount() {
        window.onbeforeunload = undefined;
    }

    handleCancel = () => {
        this.setState({
            confirmLeaveVisible: true,
        })
    }

    handleLeaveConfirmOk = () => {
        this.props.onCancel();
    }

    handleLeaveConfirmCancel = () => {
        this.setState({
            confirmLeaveVisible: false,
        })
    }


    handleAdd = (e, toCreateView) => {
        e.preventDefault();
        const { form, handleSave, dcs } = this.props;
        const {
            loading,
        } = this.props;

        form.validateFields((errors, fieldsValue) => {
            if (errors) return;

            form.resetFields();
            const data = {
                ...fieldsValue,
            };

            handleSave(data, toCreateView);
        });
    };

    cancel = () => {
        const { form } = this.props;

        this.setState({
            confirmLeaveVisible: false,
        })

        form.resetFields();
    };

    switchItem = (item) => {
        const type = item.type;
        switch (type) {
            case 'input':
                return <Input placeholder={formatMessage({ id: item.message })} />
                break;
            case 'textarea':
                return <TextArea rows={4} placeholder={formatMessage({ id: item.message })} />
                break;
            case 'ownerSelect':
                return <OwnerSelect placeholder={formatMessage({ id: item.message })} />
                break;
            case 'select':
                return (
                    <Select placeholder={formatMessage({ id: item.message })}>
                        {
                            item.options.map((option, index) => {
                                return (<Option key={index} value={option.value}>
                                    {formatMessage({ id: option.message })}
                                </Option>);
                            })
                        }
                    </Select>
                );
                break;
            case 'dcSelect':
                return <DCSelect placeholder={formatMessage({ id: item.message })} />
                break;
            default:
                return <Input />
                break;
        }
    }

    buildFields() {
        const formData = this.props.data;
        const { getFieldDecorator } = this.props.form;
        const children = [];
        for (let index = 0; index < formData.length; index++) {
            let item = formData[index];

            if (item.type === 'div') {
                children.push(
                    <Col span={24} className={styles.iwmsTitle}>{formatMessage({ id: item.id })}</Col>
                )
            }
            else if (item.type === 'textarea') {
                children.push(
                    <Col span={22} offset={2}>
                        {getFieldDecorator(item.id, {
                            initialValue: item.defaultValue,
                            rules: [{
                                required: item.required,
                                message: item.requiredMessage
                            }, {
                                pattern: item.pattern,
                                message: item.patternMessage
                            }, {
                                max: item.maxValue,
                                message: item.maxValueMessage,
                            }],
                        })(
                            <TextArea rows={4} placeholder={formatMessage({ id: item.message })} />
                        )}
                    </Col>
                )
            }
            else {

                children.push(
                    <Col span={12} >
                        <FormItem
                            key={index}
                            label={formatMessage({ id: item.label })}
                            hasFeedback
                        >
                            {getFieldDecorator(item.id, {
                                initialValue: item.defaultValue,
                                rules: [{
                                    required: item.required,
                                    message: item.requiredMessage
                                }, {
                                    pattern: item.pattern,
                                    message: item.patternMessage
                                }, {
                                    max: item.maxValue,
                                    message: item.maxValueMessage,
                                }],
                            })(
                                this.switchItem(item)
                            )}
                        </FormItem>
                    </Col>
                );
            }
        }

        children.push(

        )

        return children;
    };

    render() {
        const {
            form, handleSave, data, title, onCancel
        } = this.props;

        const { confirmLeaveVisible } = this.state;

        const actionBtn = (
            <Fragment>
                <Button onClick={this.handleCancel}>
                    {formatMessage({ id: 'iwms.create.button.cancel' })}
                </Button>
                <Button type="primary" onClick={() => { this.handleAdd(window.event, false) }}>
                    {formatMessage({ id: 'iwms.create.button.confirm' })}
                </Button>
                <Button type="primary" onClick={() => { this.handleAdd(window.event, true) }}>
                    {formatMessage({ id: 'iwms.create.button.confirmCreate' })}
                </Button>
            </Fragment>
        );

        const comfirmLeaveProps = {
            confirmLeaveVisible: confirmLeaveVisible,
            action: 1 ? CONFIRM_LEAVE_ACTION['EDIT'] : CONFIRM_LEAVE_ACTION['NEW'],
            handleLeaveConfirmOk: this.handleLeaveConfirmOk,
            handleLeaveConfirmCancel: this.handleLeaveConfirmCancel,
        };

        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 8 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 16 },
            },
        };

        return (
            <PageHeaderWrapper>
                <Page>
                    <NavigatorPanel title={title} action={actionBtn} />
                    <Card bordered={false}>
                        <Form {...formItemLayout}>
                            {this.buildFields()}
                        </Form>
                    </Card>
                    <ConfirmLeave {...comfirmLeaveProps} />
                    <RouteConfirmLeave />
                </Page>
            </PageHeaderWrapper>
        )
    }
}