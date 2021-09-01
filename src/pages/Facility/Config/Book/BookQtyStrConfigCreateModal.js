import React, { PureComponent } from 'react';
import { Form, Input, InputNumber, Modal, Select, Row, Col, message } from 'antd';
import moment from 'moment';
import DockGroupSelect from '@/pages/Component/Select/DockGroupSelect';
import { convertCodeName } from '@/utils/utils';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import {
  commonLocale,
  placeholderLocale,
  placeholderChooseLocale,
  notNullLocale,
} from '@/utils/CommonLocale';
import { bookConfigLocale } from './BookConfigLocale';

const FormItem = Form.Item;

@Form.create()
export default class BookQtyStrConfigCreateModal extends PureComponent {

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
      loading,
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

    let title = entity.uuid ? commonLocale.editLocale : commonLocale.addLocale;

    return (
      <Modal
        title={title}
        visible={modalVisible}
        onOk={this.okHandle}
        onCancel={this.handleCancel}
        confirmLoading={loading}
        destroyOnClose
      >
        <Form {...formItemLayout}>
          <Form.Item label={bookConfigLocale.bookQtyStrConfigDockGroup}>
            {getFieldDecorator('dockGroup', {
              initialValue: entity ? entity.dockGroup ? JSON.stringify(entity.dockGroup) : undefined : undefined,
              rules: [{ required: true, message: notNullLocale(bookConfigLocale.bookQtyStrConfigDockGroup) }],
            })(
              <DockGroupSelect autoFocus placeholder={placeholderChooseLocale(bookConfigLocale.bookQtyStrConfigDockGroup)} />)}
          </Form.Item>
          <Form.Item label={bookConfigLocale.bookQtyStrConfigMaxReceiveQtyStr}>
           {getFieldDecorator('maxReceiveQtyStr', {
              initialValue: entity.maxReceiveQtyStr ? entity.maxReceiveQtyStr : undefined,
              rules: [
                { required: true, message: notNullLocale(bookConfigLocale.bookQtyStrConfigMaxReceiveQtyStr) },
              ],
            })(
              <InputNumber
                max={999999999}
                style={{width: '100%'}}
                placeholder={placeholderLocale(bookConfigLocale.bookQtyStrConfigMaxReceiveQtyStr)}
              />
            )}
            </Form.Item>
          <Form.Item label={bookConfigLocale.bookQtyStrConfigExceedRatio}>
            {getFieldDecorator('exceedRatio', {
              initialValue: entity.exceedRatio ? entity.exceedRatio * 100 : 0,
              rules: [
                { required: true, message: notNullLocale(bookConfigLocale.bookQtyStrConfigExceedRatio) },
                {
                  pattern: /^[0-9]{1,2}$/,
                  message: bookConfigLocale.bookQtyStrConfigExceedRatio + ': 0~99'
                }
              ],
            })(
              <InputNumber
                min={0}
                max={99}
                precision={0}
                formatter={value => `${value}%`}
                parser={value => value.replace('%', '')}
                style={{width: '100%'}}
                placeholder={placeholderLocale(bookConfigLocale.bookQtyStrConfigExceedRatio)}
              />
            )}
          </Form.Item>
          <Form.Item label={bookConfigLocale.bookQtyStrConfigMaxReceiveArticleCount}>
           {getFieldDecorator('maxReceiveArticleCount', {
              initialValue: entity.maxReceiveQtyStr ? entity.maxReceiveArticleCount : null,
              rules: [
                { required: true, message: notNullLocale(bookConfigLocale.bookQtyStrConfigMaxReceiveArticleCount) },
              ],
            })(
              <InputNumber
                style={{width: '100%'}}
                max={999999999}
                placeholder={placeholderLocale(bookConfigLocale.bookQtyStrConfigMaxReceiveArticleCount)}
              />
            )}
            </Form.Item>
        </Form>
      </Modal>
    );
  }
};
