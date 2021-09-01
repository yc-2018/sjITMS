import React, { PureComponent } from 'react';
import { Form, Input, InputNumber, Modal, Select, Row, Col, message, Checkbox } from 'antd';
import moment from 'moment';
import { convertCodeName } from '@/utils/utils';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { commonLocale, notNullLocale, tooLongLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { formatMessage } from 'umi/locale';
import TextArea from 'antd/lib/input/TextArea';

const FormItem = Form.Item;

@Form.create()
export default class ReturnDistributionTypeConfigCreateModal extends PureComponent {
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
            record,
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
                title={record.uuid ? commonLocale.editLocale : commonLocale.createLocale}
                visible={modalVisible}
                onOk={this.okHandle}
                onCancel={this.handleCancel}
                confirmLoading={loading}
                destroyOnClose
            >
                <div style={{ maxHeight: '350px', overflow: 'auto' }}>
            <Form>
              <FormItem
                {...baseFormItemLayout}
                label={formatMessage({ id: 'pretype.create.form.name' })}
              >
                {
                  getFieldDecorator('name', {
                    rules: [{ required: true, message: notNullLocale(commonLocale.nameLocale) }, {
                      max: 30, message: tooLongLocale(commonLocale.nameLocale, 30),
                    }],
                    initialValue: record.name,
                  })(
                    <Input placeholder={formatMessage({ id: 'form.weight.placeholder' })} autoFocus/>
                  )
                }
              </FormItem>
              <FormItem
                {...baseFormItemLayout}
                label={formatMessage({ id: 'pretype.create.form.note' })}
              >
                {
                  getFieldDecorator('note', {
                    rules: [{
                      max: 255, message: formatMessage({ id: 'pretype.create.form.item.input.limitLength.note' }),
                    }],
                    initialValue: record.note,
                  })(
                    <TextArea placeholder={formatMessage({ id: 'pretype.create.form.item.input.placeholder.note' })} />
                  )
                }
              </FormItem>
            </Form>
          </div>
            </Modal>
        );
    }
};
