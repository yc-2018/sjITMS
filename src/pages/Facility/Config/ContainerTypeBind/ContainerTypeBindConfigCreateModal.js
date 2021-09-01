import React, { PureComponent } from 'react';
import { Form, Modal, message } from 'antd';
import { formatMessage } from 'umi/locale';
import ContainerTypeSelect from '@/pages/Component/Select/ContainerTypeSelect';
import { commonLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { containerTypeBindLocale } from './ContainerTypeBindLocale';

const FormItem = Form.Item;

@Form.create()
export default class ContainerTypeBindConfigCreateModal extends PureComponent {

  okHandle = () => {
    const { form } = this.props;

    form.validateFields((errors, fieldsValue) => {
      if (errors) return;
      this.props.handleSaveOrModify(fieldsValue);
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
        sm: { span: 7 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };


    return (
      <Modal
        title={commonLocale.createLocale}
        visible={modalVisible}
        onOk={this.okHandle}
        onCancel={this.handleCancel}
        destroyOnClose
      >
        <Form {...formItemLayout}>
          <Form.Item label={containerTypeBindLocale.containerType} >
            {getFieldDecorator('containerType', {
              initialValue: entity ? JSON.stringify(entity.containerType) : undefined,
              rules: [{ required: true, message: placeholderChooseLocale() }],
            })(<ContainerTypeSelect placeholder= {placeholderChooseLocale()} autoFocus/>)}
          </Form.Item>
          <Form.Item label={containerTypeBindLocale.parentContainerType}>
            {getFieldDecorator('parentContainerType', {
              initialValue: entity ? JSON.stringify(entity.parentContainerType) : undefined,
              rules: [{ required: true, message: placeholderChooseLocale() }],
            })(<ContainerTypeSelect placeholder= {placeholderChooseLocale()} mode='multiple'/>)}
          </Form.Item>
        </Form>
      </Modal>
    );
  }
};
