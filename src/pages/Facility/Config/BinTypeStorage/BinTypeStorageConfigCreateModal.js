import React, { PureComponent } from 'react';
import { Form, Input, TimePicker, Modal, Select, Row, Col, message } from 'antd';
import moment from 'moment';
import BinTypeSelect from '@/pages/Component/Select/BinTypeSelect';
import { convertCodeName } from '@/utils/utils';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import {
  commonLocale,
  placeholderLocale,
  placeholderChooseLocale,
  notNullLocale,
} from '@/utils/CommonLocale';
import { binTypeStorageLocale } from './BinTypeStorageLocale';

const FormItem = Form.Item;

@Form.create()
export default class BinTypeStorageConfigCreateModal extends PureComponent {

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
    let binTypeSelect =[]
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
        title={binTypeStorageLocale.binTypeStorageCreateTitle}
        visible={modalVisible}
        onOk={this.okHandle}
        onCancel={this.handleCancel}
        destroyOnClose={true}
      >
        <Form {...formItemLayout}>
          <Form.Item label={binTypeStorageLocale.binTypeStorageBinType}>
            {getFieldDecorator('binType', {
              initialValue: entity ? JSON.stringify(entity.binType) : null,
              rules: [{ required: true, message:notNullLocale(binTypeStorageLocale.binTypeStorageSelect) }],
            })(
              <BinTypeSelect autoFocus placeholder={placeholderChooseLocale(binTypeStorageLocale.binTypeStorageSelectBinType)} />)}
          </Form.Item>
          <Form.Item label={binTypeStorageLocale.binTypeStorageStorageBinType}>
            {getFieldDecorator('storageBinTypeList', {
              rules: [{ required: true, message:notNullLocale(binTypeStorageLocale.binTypeStorageSelect) }],
            })(
              <BinTypeSelect mode='multiple' placeholder={placeholderChooseLocale(binTypeStorageLocale.binTypeStorageSelectBinType)}  >{binTypeSelect}</BinTypeSelect>)}
          </Form.Item>
        </Form>
      </Modal>
    );
  }
};
