import React, { PureComponent } from 'react';
import { Select, Form, Input, Modal } from 'antd';
import moment from 'moment';
import { formatMessage } from 'umi/locale';
import { vendorRtnPickLocale } from './VendorRtnPickBillLocale';
import UserSelect from '@/pages/Component/Select/UserSelect';

const FormItem = Form.Item;
@Form.create()
export default class ModifyPickerModal extends PureComponent {
    handleCancel = () => {
        const { form, handlePickerModalVisible } = this.props;
        this.props.form.resetFields();
        handlePickerModalVisible();
    };

    handleAlter = (e) => {
        e.preventDefault();
        const {
            form,
            handleSave,
        } = this.props;
        form.validateFields((err, fieldsValue) => {
            if (err) return;

            const values = {
                ...fieldsValue,
            };

            handleSave(values);
        });
    }

    render() {
        const baseFormItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 15 },
        };
        const { pickerModalVisible, confirmLoading,
            ModalTitle, } = this.props;
        const { getFieldDecorator } = this.props.form;

        return (
            <Modal
                title={ModalTitle}
                onOk={this.handleAlter}
                visible={pickerModalVisible}
                onCancel={this.handleCancel}
                confirmLoading={confirmLoading}
                destroyOnClose={true}
            >
                <div style={{ maxHeight: '200px', overflow: 'auto' }}>
                    <Form>
                        <FormItem {...baseFormItemLayout} label={vendorRtnPickLocale.picker}>
                            {
                                getFieldDecorator('picker', {
                                    rules: [{
                                        required: true,
                                        message: "拣货员不能为空",
                                    }]
                                })(
                                    <UserSelect autoFocus
                                        placeholder="请选择员工"
                                        single={true}
                                    />
                                )
                            }
                        </FormItem>
                    </Form>
                </div>
            </Modal>
        );
    }
}
