import React, { PureComponent } from 'react';
import { Form, Input, TimePicker, Modal, Select, Row, Col, message, Icon, Tooltip } from 'antd';
import moment from 'moment';
import { formatMessage } from 'umi/locale';
import PickareaSelect from '@/pages/Component/Select/PickareaSelect';
import { convertCodeName } from '@/utils/utils';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { pickareaStorageConfigLocale } from './PickareaStorageConfigLocale';
import { codePattern, binScopePattern } from '@/utils/PatternContants';
import {
  commonLocale,
  placeholderLocale,
  placeholderChooseLocale,
  notNullLocale,
} from '@/utils/CommonLocale';

const FormItem = Form.Item;

@Form.create()
export default class PickareaStorageConfigCreateModal extends PureComponent {

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
        sm: { span: 10 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 10 },
      },
    };
    let title = entity.uuid ? commonLocale.editLocale : commonLocale.addLocale;

    return (
      <Modal
        title={title}
        visible={modalVisible}
        onOk={this.okHandle}
        onCancel={this.handleCancel}
        destroyOnClose={true}
      >
        <Form {...formItemLayout}>
          <Form.Item label={pickareaStorageConfigLocale.pickareaStorageConfigPickarea}>
            {getFieldDecorator('pickarea', {
              initialValue: entity ? JSON.stringify(entity.pickarea) : null,
              rules: [{ required: true, message: notNullLocale(pickareaStorageConfigLocale.pickareaStorageConfigPickarea) }],
            })(
              <PickareaSelect autoFocus placeholder={placeholderChooseLocale(pickareaStorageConfigLocale.pickareaStorageConfigPickarea)} />)}
          </Form.Item>
          <Form.Item label={(
            <span>
              {pickareaStorageConfigLocale.pickareaStorageConfigBinRange}&nbsp;
          <Tooltip title={binScopePattern.message}>
                <Icon type="info-circle" />
              </Tooltip></span>)}>
            {getFieldDecorator('binRange', {
              initialValue: entity ? entity.binRange : null,
              rules: [
                {
                  required: true,
                  message: notNullLocale(pickareaStorageConfigLocale.pickareaStorageConfigBinRange)
                },
                {
                  pattern: binScopePattern.pattern,
                  message: binScopePattern.message
                }],
            })(<Input placeholder={placeholderChooseLocale(pickareaStorageConfigLocale.pickareaStorageConfigBinRange)} />)}
          </Form.Item>
        </Form>
      </Modal>
    );
  }
};
