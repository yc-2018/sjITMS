import React, { PureComponent } from 'react';
import { Form, Input, TimePicker, Modal, Select, Row, Radio, Col, message } from 'antd';
import moment from 'moment';
import { formatMessage } from 'umi/locale';
import { convertCodeName } from '@/utils/utils';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import OrgSelect from '@/pages/Component/Select/OrgSelect';
import { vendorRtnBinConfigLocale } from './VendorRtnBinConfigLocale';
import {
    commonLocale,
    placeholderLocale,
    placeholderChooseLocale,
    notNullLocale,
} from '@/utils/CommonLocale';


const FormItem = Form.Item;

@Form.create()
export default class VendorRtnBinConfigCreateModal extends PureComponent {

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
        let endVendor = null;
        if(entity.vendor) {
          endVendor = {
            uuid: entity.vendor.uuid,
            code: entity.vendor.code,
            name: entity.vendor.name,
            type: 'VENDOR'
          }
        }
        return (
            <Modal
                title={entity.uuid ? '编辑供应商退货位配置' :vendorRtnBinConfigLocale.vendorRtnBinConfigCreateTitle}
                visible={modalVisible}
                onOk={this.okHandle}
                onCancel={this.handleCancel}
                destroyOnClose={true}
            >
                <Form {...formItemLayout}>
                    <Form.Item label={vendorRtnBinConfigLocale.vendor}>
                        {getFieldDecorator('vendor', {
                            initialValue: entity.vendor ? JSON.stringify(endVendor) : '',
                            rules: [{ required: true, message: notNullLocale(vendorRtnBinConfigLocale.vendor) }],
                        })(
                            <OrgSelect
                                disabled={entity.uuid? true : false}
                                upperUuid={loginCompany().uuid}
                                type={'VENDOR'}
                                single
                                placeholder={placeholderChooseLocale(commonLocale.inVendorLocale)}
                            />
                        )}
                    </Form.Item>
                    <Form.Item label={vendorRtnBinConfigLocale.binScope}>
                        {getFieldDecorator('binScope', {
                            initialValue: entity.binScope,
                            rules: [{ required: true, message: notNullLocale(vendorRtnBinConfigLocale.binScope) }],
                        })(<Input placeholder={placeholderChooseLocale(vendorRtnBinConfigLocale.binScope)} />)}
                    </Form.Item>
                    <Form.Item label={vendorRtnBinConfigLocale.exclusive}>
                        {getFieldDecorator('exclusive', {
                            initialValue: entity.exclusive ? true : false
                        })(
                            <Radio.Group >
                                <Radio value={true}>{'是'}</Radio>
                                <Radio value={false}>{'否'}</Radio>
                            </Radio.Group>
                        )}
                    </Form.Item>
                </Form>
            </Modal>
        );
    }
};
