import React, { PureComponent } from 'react';
import { Select, Form, Input, Modal } from 'antd';
import moment from 'moment';
import { formatMessage } from 'umi/locale';
import { commonLocale, notNullLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { Type } from './StoreRtnBillContants';
import { storeRtnLocal } from './StoreRtnBillLocale';

const typeOptions = [];
Object.keys(Type).forEach(function (key) {
    typeOptions.push(<Option value={Type[key].name}
        key={Type[key].name}>
        {Type[key].caption}
    </Option>);
});
const FormItem = Form.Item;
@Form.create()
export default class RtnTypeModal extends PureComponent {
    handleCancel = () => {
        const { form, handleTypeModalVisible } = this.props;
        this.props.form.resetFields();
        const value = [];
        handleTypeModalVisible(value);
    };

    handleAlter = (e) => {
        e.preventDefault();
        const { form, handleRefreshType } = this.props;
        form.validateFields((err, fieldsValue) => {
            if (err) return;

            const values = {
                ...fieldsValue,
            };

            handleRefreshType(values);
        });
    }

    render() {
        const baseFormItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 15 },
        };
        const { typeModalVisible, ModalTitle } = this.props;
        const { getFieldDecorator } = this.props.form;

        return (
            <Modal
                title={ModalTitle}
                onOk={this.handleAlter}
                visible={typeModalVisible}
                onCancel={this.handleCancel}
                destroyOnClose={true}
            >
                <div style={{ maxHeight: '200px', overflow: 'auto' }}>
                    <Form>
                        <FormItem {...baseFormItemLayout} label='退仓类型'>
                            {
                                getFieldDecorator('type', {
                                    rules: [{
                                        required: true,
                                        message: '类型不能为空',
                                    }]
                                })(
                                    <Select placeholder={placeholderChooseLocale(storeRtnLocal.type)}>
                                        {typeOptions}
                                    </Select>
                                )
                            }
                        </FormItem>
                    </Form>
                </div>
            </Modal>
        );
    }
}
