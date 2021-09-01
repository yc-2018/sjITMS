import React, { PureComponent } from 'react';
import { Form, Input, TimePicker, Modal, Select, Row, Col, message, Icon, Tooltip } from 'antd';
import moment from 'moment';
import { formatMessage } from 'umi/locale';
import DockGroupSelect from '@/pages/Component/Select/DockGroupSelect';
import { convertCodeName } from '@/utils/utils';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import CFormItem from '@/pages/Component/Form/CFormItem';
import CategorySelect from '@/pages/Component/Select/CategorySelect';
import { binScopePattern } from '@/utils/PatternContants';
import {
  commonLocale,
  placeholderLocale,
  placeholderChooseLocale,
  notNullLocale,
} from '@/utils/CommonLocale';
import { categoryStorageConfigLocale } from './CategoryStorageConfigLocale';

const format = 'HH:mm';
const FormItem = Form.Item;

@Form.create()
export default class CategoryStorageConfigCreateModal extends PureComponent {

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

    let timeRange = entity ? entity.timeRange : '';
    let timeRangeArr = [];
    if (timeRange) {
      timeRangeArr = timeRange.split('\-');
    }
    let title = entity.uuid ? commonLocale.editLocale : commonLocale.addLocale;
    return (
      <Modal
        title={title}
        visible={modalVisible}
        onOk={this.okHandle}
        onCancel={this.handleCancel}
        destroyOnClose
      >
        <Form {...formItemLayout}>
          <Form.Item label={categoryStorageConfigLocale.categoryStorageCategorye}>
            {getFieldDecorator('category', {
              initialValue: entity ? (entity.category ? JSON.stringify(entity.category) : undefined) : undefined,
              rules: [{ required: true, message: notNullLocale(categoryStorageConfigLocale.categoryStorageCategorye) }],
            })(
              <CategorySelect autoFocus single placeholder={placeholderChooseLocale(categoryStorageConfigLocale.categoryStorageCategorye)} />)}
          </Form.Item>
          <Form.Item label={(
            <span>
              {categoryStorageConfigLocale.categoryStorageConfigBinRange}&nbsp;
          <Tooltip title={binScopePattern.message}>
                <Icon type="info-circle" />
              </Tooltip></span>)}>
            {getFieldDecorator('binRange', {
              initialValue: entity ? entity.binRange : null,
              rules: [
                {
                  required: true,
                  message: notNullLocale(categoryStorageConfigLocale.categoryStorageConfigBinRange)
                },
                {
                  pattern: binScopePattern.pattern,
                  message: binScopePattern.message
                }
              ],
            })(
              <Input placeholder={placeholderLocale(categoryStorageConfigLocale.categoryStorageConfigBinRange)} />)}
          </Form.Item>

        </Form>
      </Modal>
    );
  }
};
