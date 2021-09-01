import React, { PureComponent } from 'react';
import { Form, Input, TimePicker, Modal, Select, Row, Col, message,Tooltip,Icon } from 'antd';
import moment from 'moment';
import { formatMessage } from 'umi/locale';
import { convertCodeName } from '@/utils/utils';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import ArticleSelect from '@/pages/Component/Select/ArticleSelect';
import { packageVirtualArticleConfigLocale } from './VirtualArticleConfigLocale';
import { binScopePattern } from '@/utils/PatternContants';
import OwnerSelect from '@/pages/Component/Select/OwnerSelect';
import {
  commonLocale,
  placeholderLocale,
  placeholderChooseLocale,
  notNullLocale,
} from '@/utils/CommonLocale';

const FormItem = Form.Item;

@Form.create()
export default class VirtualArticleConfigCreateModal extends PureComponent {

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

  handlechangeOwner = (value) => {
    const { entity } = this.props;
    entity.owner = JSON.parse(value);
    this.setState({
      entity: entity
    })
  }

  render() {
    const {
      form,
      modalVisible,
      entity
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
          <Form.Item label={packageVirtualArticleConfigLocale.owner}>
            {getFieldDecorator('owner', {
              initialValue: entity && entity.owner ? JSON.stringify(entity.owner) : '',
              rules: [{ required: true, message: notNullLocale(packageVirtualArticleConfigLocale.articleStorageSelect) }],
            })(
              <OwnerSelect
                hasAll
                onChange={this.handlechangeOwner}
                />)}
          </Form.Item>
          <Form.Item label={packageVirtualArticleConfigLocale.articleStorageArticle}>
            {getFieldDecorator('virtualArticle', {
              initialValue: entity && entity.virtualArticle ? convertCodeName(entity.virtualArticle) : undefined,
              rules: [{ required: true, message: notNullLocale(packageVirtualArticleConfigLocale.articleStorageSelect) }],
            })(
              <ArticleSelect
                single={true}
                onlyOnline
                ownerUuid={entity.owner ? entity.owner.uuid : '-'}
                placeholder={placeholderChooseLocale(packageVirtualArticleConfigLocale.articleStorageSelectArticle)} />)}
          </Form.Item>
        </Form>
      </Modal>
    );
  }
};
