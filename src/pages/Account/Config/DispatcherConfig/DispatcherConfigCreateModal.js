import React, { PureComponent } from 'react';
import { Form, Input, InputNumber, Modal, Select, Row, Col, message, Checkbox } from 'antd';
import moment from 'moment';
import { convertCodeName } from '@/utils/utils';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { commonLocale, notNullLocale, tooLongLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { dispatcherConfigLocale } from './DispatcherConfigLocale';
import DCUcnSelect from '@/pages/Component/Select/DCUcnSelect';
import UserSelect from '@/pages/Component/Select/UserSelect';

const FormItem = Form.Item;

@Form.create()
export default class DispatcherConfigCreateModal extends PureComponent {
    okHandle = () => {
        const { form } = this.props;

        form.validateFields((errors) => {
            if (errors) return;

            this.props.handleSave();
        });
    };

    handleCancel = () => {
        const { form, handleCreateModalVisible } = this.props;
        form.resetFields();
        handleCreateModalVisible();
    };

    onDcChange = (value) => {
        const { entity } = this.props;
        if (!entity)
            return;
        entity.dc = JSON.parse(value);
    }

    onDispatcherChange = (value) => {
        const { entity } = this.props;
        if (!entity)
            return;

        entity.dispatcher = JSON.parse(value);
    }

    render() {
        const {
            form,
            modalVisible,
            entity,
            loading,
        } = this.props;

        const { getFieldDecorator } = form;

        const baseFormItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 7 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 16 },
            },
        };

        return (
            <Modal
                title={commonLocale.addLocale}
                visible={modalVisible}
                onOk={this.okHandle}
                onCancel={this.handleCancel}
                confirmLoading={loading}
                destroyOnClose
            >
                <Form {...baseFormItemLayout}>
                    <FormItem
                        label={dispatcherConfigLocale.dispatcher}>
                        {getFieldDecorator('dispatcher', {
                            rules: [{ required: true, message: notNullLocale(dispatcherConfigLocale.dispatcher) },
                            ]
                        })(
                            <UserSelect
                                single={true}
                                onChange={this.onDispatcherChange}
                            />
                        )}
                    </FormItem>
                    <FormItem
                        label={dispatcherConfigLocale.dc}>
                        {getFieldDecorator('dc', {
                            rules: [{ required: true, message: notNullLocale(dispatcherConfigLocale.dc) },
                            ]
                        })(
                            <DCUcnSelect
                                onChange={this.onDcChange}
                            />
                        )}
                    </FormItem>
                </Form>
            </Modal>
        );
    }
};
