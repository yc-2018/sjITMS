import React, { PureComponent } from 'react';
import { Select, Form, Input, Modal, InputNumber } from 'antd';
import moment from 'moment';
import { formatMessage } from 'umi/locale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { commonLocale, notNullLocale, tooLongLocale, placeholderLocale } from '@/utils/CommonLocale';
import { BinLocale } from './BinLocale';
import styles from './Bin.less';

const FormItem = Form.Item;
const { TextArea } = Input;
const InputGroup = Input.Group;
@Form.create()
export default class ShelfCreateModal extends PureComponent {

  handleCancel = () => {
    const { form, handleCreateShelfModalVisible } = this.props;
    this.props.form.resetFields();
    handleCreateShelfModalVisible();
  };

  handleAddShelf = (e) => {
    e.preventDefault();
    const {
      form,
      handleSave,
    } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const values = {
        ...fieldsValue,
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid
      };

      handleSave(values);
    });
  }

  calcAndGenShelfCode = (e) => {
    e.preventDefault();
    const {
      form,
      handleCalcCode,
    } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const values = {
        ...fieldsValue,
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid
      };

      handleCalcCode(values);
    });
  }

  render() {
    const baseFormItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    };
    const { createShelfModalVisible, confirmLoading, ModalTitle } = this.props;
    const { getFieldDecorator } = this.props.form;

    return (
      <Modal
        title={ModalTitle}
        onOk={this.calcAndGenShelfCode}
        visible={createShelfModalVisible}
        onCancel={this.handleCancel}
        confirmLoading={confirmLoading}
        destroyOnClose={true}
      >
        <div style={{ maxHeight: '350px', overflow: 'auto' }}>
          <Form>
            <FormItem {...baseFormItemLayout} label={BinLocale.pathScope} required={true}>
              <Form.Item
                className={styles.formItemControl}
                style={{ display: 'inline-block', width: 'calc(50%)' }}>
                {getFieldDecorator('startUpperCode', {
                  rules: [
                    {
                      required: true,
                      message: notNullLocale(BinLocale.startpathScope),
                    }, {
                      pattern: /^[0-9]{4}$/,
                      message: formatMessage({ id: 'bin.validate.path.code' })
                    }
                  ],
                })(<Input placeholder={placeholderLocale(BinLocale.startpathScope)} />)}
              </Form.Item>
              <Form.Item className={styles.formItemControl}
                         style={{ display: 'inline-block', width: 'calc(50%)' }}>
                {getFieldDecorator('endUpperCode', {
                  rules: [
                    {
                      required: true,
                      message: notNullLocale(BinLocale.endpathScope),
                    }, {
                      pattern: /^[0-9]{4}$/,
                      message: formatMessage({ id: 'bin.validate.path.code' })
                    }
                  ],
                })(<Input placeholder={placeholderLocale(BinLocale.endpathScope)} />)}
              </Form.Item>
            </FormItem>
            <FormItem {...baseFormItemLayout} label={BinLocale.avgShelfCount}>
              {
                getFieldDecorator('count', {
                  rules: [{
                    required: true,
                    message: notNullLocale(BinLocale.avgShelfCount)
                  },
                    {
                      pattern: /^[0-9]{1,2}$/,
                      message: BinLocale.avgCountValidate
                    },]
                })(
                  <InputNumber min={1} max={99}
                               step={1}
                               style={{ width: '100%' }}
                               placeholder={placeholderLocale(BinLocale.avgShelfCount)} />
                )
              }
            </FormItem>
            <FormItem {...baseFormItemLayout} label={BinLocale.startShelf}>
              {
                getFieldDecorator('startCode', {
                  rules: [{
                    required: true,
                    message: notNullLocale(BinLocale.startShelf),
                  }, {
                    pattern: /^[0-9]{1,2}$/,
                    message: formatMessage({ id: 'bin.validate.shelf.start.length' })
                  }]
                })(
                  <Input placeholder={placeholderLocale(BinLocale.startShelf)} />
                )
              }
            </FormItem>
          </Form>
        </div>
      </Modal>
    );
  }
}
