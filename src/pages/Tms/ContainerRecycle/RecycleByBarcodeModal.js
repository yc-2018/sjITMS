import React, { PureComponent } from 'react';
import { Select, Form, Input, Modal } from 'antd';
import { containerRecycleLocale } from './ContainerRecycleLocale';
import { ContainerRecycleType } from './ContainerRecycleContants';
import { commonLocale, placeholderChooseLocale, notNullLocale } from '@/utils/CommonLocale';

const FormItem = Form.Item;
@Form.create()
export default class RecycleByBarcodeModal extends PureComponent {
    state = {
        options: []
    }

    componentWillReceiveProps(nextProps) {
        const options = [];
        Array.isArray(nextProps.items) && nextProps.items.forEach(function (item) {
            if (ContainerRecycleType.ByBarcode.name === ContainerRecycleType[item.type].name) {
                options.push(
                    <Option key={item.containerBarcode} value={item.containerBarcode}>
                        {item.containerBarcode}
                    </Option>
                );
            }
        })

        this.setState({
            options: options
        })
    }

    handleCancel = () => {
        const { form, handleAuditModalVisible } = this.props;
        this.props.form.resetFields();
        handleAuditModalVisible();
    };

    handleAlter = (e) => {
        e.preventDefault();
        const { form, handleSave, } = this.props;
        form.validateFields((err, fieldsValue) => {
            if (err) return;

            const values = { ...fieldsValue };
            handleSave(values);
        });
    }

    onSearch = (value) => {
        const { items } = this.props;

        let options = [];
        Array.isArray(items) && items.forEach(function (item) {
            if (ContainerRecycleType.ByBarcode.name === ContainerRecycleType[item.type].name
                && item.containerBarcode.indexOf(value) != -1) {
                options.push(
                    <Option key={item.containerBarcode} value={item.containerBarcode}>
                        {item.containerBarcode}
                    </Option>
                );
            }
        })

        this.setState({
            options: options
        })
    }

    render() {
        const baseFormItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 15 },
            colon: false,
        };
        const { visible, confirmLoading, ModalTitle, items } = this.props;
        const { getFieldDecorator } = this.props.form;

        return (
            <Modal
                title={ModalTitle}
                visible={visible}
                onOk={this.handleAlter}
                onCancel={this.handleCancel}
                confirmLoading={confirmLoading}
                destroyOnClose={true}>
                <Form {...baseFormItemLayout}>
                    <FormItem key='containerBarcode' label={commonLocale.inContainerBarcodeLocale}>
                        {
                            getFieldDecorator('containerBarcode', {
                                initialValue: undefined,
                                rules: [{
                                    required: true, message: notNullLocale(commonLocale.inContainerBarcodeLocale)
                                }],
                            })(
                                <Select
                                    showSearch={true}
                                    onSearch={this.onSearch}
                                    placeholder={placeholderChooseLocale(commonLocale.inContainerBarcodeLocale)}
                                >{this.state.options}</Select>
                            )
                        }
                    </FormItem>
                </Form >
            </Modal>
        );
    }
}
