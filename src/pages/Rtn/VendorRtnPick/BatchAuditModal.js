import React, { PureComponent } from 'react';
import { Select, Form, Input, Modal } from 'antd';
import moment from 'moment';
import { formatMessage } from 'umi/locale';
import { vendorRtnPickLocale } from './VendorRtnPickBillLocale';
import { METHOD } from './VendorRtnPickBillContants';
import UserSelect from '@/pages/Component/Select/UserSelect';
import BinSelect from '@/pages/Component/Select/BinSelect';
import { binUsage } from '@/utils/BinUsage';
import { commonLocale, placeholderLocale, placeholderChooseLocale, notNullLocale } from '@/utils/CommonLocale';
import { loginCompany, loginOrg, loginUser } from '@/utils/LoginContext';

const FormItem = Form.Item;
@Form.create()
export default class BatchAuditModal extends PureComponent {
    handleCancel = () => {
        const { form, handleAuditModalVisible } = this.props;
        this.props.form.resetFields();
        handleAuditModalVisible();
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
        const { batchAuditVisible, confirmLoading,
            ModalTitle, } = this.props;
        const { getFieldDecorator } = this.props.form;

        return (
            <Modal
                title={ModalTitle}
                visible={batchAuditVisible}
                onOk={this.handleAlter}
                onCancel={this.handleCancel}
                confirmLoading={confirmLoading}
                destroyOnClose={true}>
                <Form {...baseFormItemLayout}>
                    <FormItem key='pickQty' label={commonLocale.inQtyStrLocale}>
                        {
                            getFieldDecorator('pickQty', {
                                initialValue: 'ZERO',
                                rules: [
                                    { required: true, message: notNullLocale(commonLocale.inQtyStrLocale) }
                                ],
                            })(
                                <Select>
                                    <Select.Option key='ZERO' value='ZERO'>0</Select.Option>
                                    <Select.Option key='REALQTY' value='REALQTY'>应拣数量</Select.Option>
                                </Select>
                            )
                        }
                    </FormItem>
                    <FormItem label={vendorRtnPickLocale.picker} key='picker'>
                        {getFieldDecorator('picker', {
                            initialValue: JSON.stringify({ uuid: loginUser().uuid, code: loginUser().code, name: loginUser().name }),
                            rules: [
                                { required: true, message: notNullLocale(vendorRtnPickLocale.picker) }
                            ],
                        })(<UserSelect autoFocus single={true} />)}
                    </FormItem>
                    <FormItem key='toBinCode' label={vendorRtnPickLocale.toBinCode}>
                        {getFieldDecorator('toBinCode'
                            , {
                                rules: [
                                    { required: true, message: notNullLocale(vendorRtnPickLocale.toBinCode) }
                                ]
                            })(
                                <BinSelect
                                    usages={[binUsage.VendorRtnCollectTempBin.name, binUsage.VendorRtnCollectBin.name]}
                                    disabled={false}
                                    placeholder={placeholderLocale(vendorRtnPickLocale.toBinCode)} />
                            )}
                    </FormItem>
                </Form >
            </Modal>
        );
    }
}
