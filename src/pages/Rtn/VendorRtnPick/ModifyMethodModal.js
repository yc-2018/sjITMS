import React, { PureComponent } from 'react';
import { Select, Form, Input, Modal } from 'antd';
import moment from 'moment';
import { formatMessage } from 'umi/locale';
import { vendorRtnPickLocale } from './VendorRtnPickBillLocale';
import { METHOD } from './VendorRtnPickBillContants';

const methodOptions = [];
Object.keys(METHOD).forEach(function (key) {
    methodOptions.push(<Option value={METHOD[key].name} key={METHOD[key].name}>{METHOD[key].caption}</Option>);
});
const FormItem = Form.Item;
@Form.create()
export default class ModifyMethodModal extends PureComponent {
    handleCancel = () => {
        const { form, handleMethodModalVisible } = this.props;
        this.props.form.resetFields();
        handleMethodModalVisible();
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
        const { methodModalVisible, confirmLoading,
            ModalTitle,} = this.props;
        const { getFieldDecorator } = this.props.form;

        return (
            <Modal
                title={ModalTitle}
                onOk={this.handleAlter}
                visible={methodModalVisible}
                onCancel={this.handleCancel}
                confirmLoading={confirmLoading}
                destroyOnClose={true}
            >
                <div style={{ maxHeight: '200px', overflow: 'auto' }}>
                    <Form>
                        <FormItem {...baseFormItemLayout} label={vendorRtnPickLocale.method}>
                            {
                                getFieldDecorator('method', {
                                    rules: [{
                                        required: true,
                                        message: "操作方式不能为空",
                                    }]
                                })(
                                    <Select 
                                    placeholder="请选择操作方式"
                                    >{methodOptions}</Select>
                                )
                            }
                        </FormItem>
                    </Form>
                </div>
            </Modal>
        );
    }
}
