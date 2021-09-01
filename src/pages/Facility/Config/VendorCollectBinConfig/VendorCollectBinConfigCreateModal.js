import React, { PureComponent } from 'react';
import { Form, Input, TimePicker, Modal, Select, Row, Radio, Col, message } from 'antd';
import moment from 'moment';
import { formatMessage } from 'umi/locale';
import { convertCodeName } from '@/utils/utils';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import OrgSelect from '@/pages/Component/Select/OrgSelect';
import { vendorCollectBinConfigLocale } from './VendorCollectBinConfigLocale';
import {
    commonLocale,
    placeholderLocale,
    placeholderChooseLocale,
    notNullLocale,
} from '@/utils/CommonLocale';


const FormItem = Form.Item;

@Form.create()
export default class VendorCollectBinConfigCreateModal extends PureComponent {

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
                title={vendorCollectBinConfigLocale.createTitle}
                visible={modalVisible}
                onOk={this.okHandle}
                onCancel={this.handleCancel}
                destroyOnClose={true}
            >
                <Form {...formItemLayout}>
                    <Form.Item label={vendorCollectBinConfigLocale.vendor}>
                        {getFieldDecorator('vendor', {
                            initialValue: entity.vendor,
                            rules: [{ required: true, message: notNullLocale(commonLocale.inVendorLocale) }],
                        })(
                            <OrgSelect
                                upperUuid={loginCompany().uuid}
                                type={'VENDOR'}
                                single
                                placeholder={placeholderChooseLocale(commonLocale.inVendorLocale)}
                            />
                        )}
                    </Form.Item>
                    <Form.Item label={vendorCollectBinConfigLocale.binScope}>
                        {getFieldDecorator('binScope', {
                            initialValue: entity.binScope,
                            rules: [{ required: true, message: notNullLocale(vendorCollectBinConfigLocale.binScope) }],
                        })(<Input placeholder={placeholderChooseLocale(vendorCollectBinConfigLocale.binScope)} />)}
                    </Form.Item>
                </Form>
            </Modal>
        );
    }
};
