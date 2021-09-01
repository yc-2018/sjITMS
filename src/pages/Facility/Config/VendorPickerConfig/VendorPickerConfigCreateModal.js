import React, { PureComponent } from 'react';
import { Form, Input, TimePicker, Modal, Select, Row, Radio, Col, message } from 'antd';
import moment from 'moment';
import { formatMessage } from 'umi/locale';
import { convertCodeName } from '@/utils/utils';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { vendorPickerConfigLocale } from './VendorPickerConfigLocale';
import {
    commonLocale,
    placeholderLocale,
    placeholderChooseLocale,
    notNullLocale,
} from '@/utils/CommonLocale';
import UserSelect from '@/pages/Component/Select/UserSelect';

const FormItem = Form.Item;

@Form.create()
export default class VendorPickerConfigCreateModal extends PureComponent {

    okHandle = () => {
        const { form } = this.props;

        form.validateFields((errors, fieldsValue) => {
            if (errors) return;

            this.props.handleSave(fieldsValue);
        });
    };

    handleCancel = () => {
        const { form, handleCreateModalVisible } = this.props;
        form.resetFields();
        handleCreateModalVisible();
    };

    render() {
        const {
            form,
            modalVisible,
            entity,
        } = this.props;

        const { getFieldDecorator } = form;

        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 10 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 10 },
            },
        };

        return (
            <Modal
                title={vendorPickerConfigLocale.createTitle}
                visible={modalVisible}
                onOk={this.okHandle}
                onCancel={this.handleCancel}
                confirmLoading={this.props.confirmLoading}
                destroyOnClose={true}
            >
                <Form {...formItemLayout}>
                    <Form.Item label={vendorPickerConfigLocale.picker}>
                        {getFieldDecorator('picker', {
                            initialValue: entity.picker,
                            rules: [{ required: true, message: notNullLocale(vendorPickerConfigLocale.picker) }],
                        })(
                            <UserSelect
                                single
                                placeholder={placeholderLocale(vendorPickerConfigLocale.picker)}
                            />
                        )}
                    </Form.Item>
                    <Form.Item label={vendorPickerConfigLocale.binScope}>
                        {getFieldDecorator('binScope', {
                            initialValue: entity.binScope,
                            rules: [{ required: true, message: notNullLocale(vendorPickerConfigLocale.binScope) }],
                        })(<Input placeholder={placeholderChooseLocale(vendorPickerConfigLocale.binScope)} />)}
                    </Form.Item>
                </Form>
            </Modal>
        );
    }
};
