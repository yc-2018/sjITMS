import React, { PureComponent } from 'react';
import { Form, Input, TimePicker, Modal, Select, Row, Col, message,Tooltip,Icon } from 'antd';
import moment from 'moment';
import { formatMessage } from 'umi/locale';
import { convertCodeName } from '@/utils/utils';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import ArticleSelect from '@/pages/Component/Select/ArticleSelect';
import { articleStorageLocale } from './ArticleStorageLocale';
import { binScopePattern } from '@/utils/PatternContants';
import {
  commonLocale,
  placeholderLocale,
  placeholderChooseLocale,
  notNullLocale,
} from '@/utils/CommonLocale';

const FormItem = Form.Item;

@Form.create()
export default class ArticleStorageConfigCreateModal extends PureComponent {

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
        destroyOnClose
      >
        <Form {...formItemLayout}>
          <Form.Item label={articleStorageLocale.articleStorageArticle}>
            {getFieldDecorator('article', {
              initialValue: entity ? entity.article ? convertCodeName(entity.article) : undefined :undefined,
              rules: [{ required: true, message: notNullLocale(articleStorageLocale.articleStorageSelect) }],
            })(
              <ArticleSelect autoFocus single={true} placeholder={placeholderChooseLocale(articleStorageLocale.articleStorageSelectArticle)} />)}
          </Form.Item>
          <Form.Item label={(
            <span>
              {articleStorageLocale.articleStorageBinRange}&nbsp;
          <Tooltip title={binScopePattern.message}>
                <Icon type="info-circle" />
              </Tooltip></span>)}>

            {getFieldDecorator('binRange', {
              initialValue: entity ? entity.binRange : null,
              rules: [{ required: true, message: notNullLocale(articleStorageLocale.articleStorageBinRangeAdd) },
                {
                  pattern: binScopePattern.pattern,
                  message: binScopePattern.message
                }
              ],
            })(<Input placeholder={placeholderLocale(articleStorageLocale.articleStorageBinRangeAdd)} />)}
          </Form.Item>
        </Form>
      </Modal>
    );
  }
};
