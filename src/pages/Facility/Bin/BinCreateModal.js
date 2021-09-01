import React, { PureComponent } from 'react';
import { Select, Form, Input, Modal, InputNumber, Row } from 'antd';
import moment from 'moment';
import { formatMessage } from 'umi/locale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import BinTypeSelect from '../../Component/Select/BinTypeSelect';
import BinUsageSelect from '../../Component/Select/BinUsageSelect';
import { commonLocale, notNullLocale, tooLongLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { BinLocale } from './BinLocale';
import styles from './Bin.less';

const FormItem = Form.Item;
const { TextArea } = Input;
const InputGroup = Input.Group;
@Form.create()
export default class BinCreateModal extends PureComponent {

  handleCancel = () => {
    const { form, handleCreateBinModalVisible } = this.props;
    this.props.form.resetFields();
    handleCreateBinModalVisible();
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

  calcAndGenBinCode = (e) => {
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

      values['binTypeUuid'] = JSON.parse(values['binTypeUuid']).uuid;

      handleCalcCode(values);
    });
  }

  render() {
    const baseFormItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    };
    const { createBinModalVisible, confirmLoading, ModalTitle } = this.props;
    const { getFieldDecorator } = this.props.form;

    return (
      <Modal
        title={ModalTitle}
        onOk={this.calcAndGenBinCode}
        visible={createBinModalVisible}
        onCancel={this.handleCancel}
        confirmLoading={confirmLoading}
        destroyOnClose={true}
      >
        <div style={{ maxHeight: '350px', overflow: 'auto' }}>
          <Form>
            <FormItem {...baseFormItemLayout}
                      label={BinLocale.shelfScope} required={true}>
              <Form.Item
                className={styles.formItemControl}
                style={{ display: 'inline-block', width: 'calc(50%)' }}>
                {getFieldDecorator('startShelfCode', {
                  rules: [
                    {
                      required: true,
                      message: notNullLocale(BinLocale.startshelfScope),
                    }, {
                      pattern: /^[0-9]{6}$/,
                      message: formatMessage({ id: 'bin.validate.shelf.code' })
                    }
                  ],
                })(<Input placeholder={placeholderLocale(BinLocale.startshelfScope)} />)}

              </Form.Item>
              <Form.Item
                className={styles.formItemControl}
                style={{ display: 'inline-block', width: 'calc(50%)' }}
              >
                {getFieldDecorator('endShelfCode', {
                  rules: [
                    {
                      required: true,
                      message: notNullLocale(BinLocale.endshelfScope),
                    }, {
                      pattern: /^[0-9]{6}$/,
                      message: formatMessage({ id: 'bin.validate.shelf.code' })
                    }
                  ],
                })(<Input placeholder={placeholderLocale(BinLocale.endshelfScope)} />)}
              </Form.Item>
            </FormItem>
            <FormItem {...baseFormItemLayout}
                      label={BinLocale.colCode} required={true}>
              <Form.Item
                className={styles.formItemControl}
                style={{ display: 'inline-block', width: 'calc(50%)' }}>
                {getFieldDecorator('startColumn', {
                  rules: [
                    {
                      required: true,
                      message: notNullLocale(BinLocale.startColCode),
                    }, {
                      pattern: /^[0-9]{1}$/,
                      message: formatMessage({ id: 'bin.validate.bin.column.code' })
                    }
                  ],
                })(<Input placeholder={placeholderLocale(BinLocale.startColCode)} />)}
              </Form.Item>
              <Form.Item
                className={styles.formItemControl}
                style={{ display: 'inline-block', width: 'calc(50%)' }} >
                {getFieldDecorator('endColumn', {
                  rules: [
                    {
                      required: true,
                      message: notNullLocale(BinLocale.endColCode),
                    }, {
                      pattern: /^[0-9]{1}$/,
                      message: formatMessage({ id: 'bin.validate.bin.column.code' })
                    }
                  ],
                })(<Input placeholder={placeholderLocale(BinLocale.endColCode)} />)}
              </Form.Item>
            </FormItem>
            <FormItem {...baseFormItemLayout} label={BinLocale.levelCode} required={true}>
              <Form.Item
                className={styles.formItemControl}
                style={{ display: 'inline-block', width: 'calc(50%)' }}>
                {getFieldDecorator('startLevel', {
                  rules: [
                    {
                      required: true,
                      message: notNullLocale(BinLocale.startLevelCode),
                    }, {
                      pattern: /^[0-9]{1}$/,
                      message: formatMessage({ id: 'bin.validate.bin.level.code' })
                    }
                  ],
                })(<Input placeholder={placeholderLocale(BinLocale.startLevelCode)} />)}
              </Form.Item>

              <Form.Item
                className={styles.formItemControl}
                style={{ display: 'inline-block', width: 'calc(50%)' }}>
                {getFieldDecorator('endLevel', {
                  rules: [
                    {
                      required: true,
                      message: notNullLocale(BinLocale.endLevelCode),
                    }, {
                      pattern: /^[0-9]{1}$/,
                      message: formatMessage({ id: 'bin.validate.bin.level.code' })
                    }
                  ],
                })(<Input placeholder={placeholderLocale(BinLocale.endLevelCode)} />)}
              </Form.Item>
            </FormItem>
            <FormItem {...baseFormItemLayout} label={BinLocale.binUasge}>
              {
                getFieldDecorator('usage', {
                  rules: [{
                    required: true,
                    message: notNullLocale(BinLocale.binUasge),
                  }]
                })(
                  <BinUsageSelect onChange={this.getUsageOptions}
                                  placeholder={placeholderChooseLocale(BinLocale.binUasge)} />
                )
              }
            </FormItem>
            <FormItem {...baseFormItemLayout} label={BinLocale.binType}>
              {
                getFieldDecorator('binTypeUuid', {
                  rules: [{
                    required: true,
                    message: notNullLocale(BinLocale.binType),
                  }]
                })(
                  <BinTypeSelect onChange={this.onChange}
                                 placeholder={placeholderChooseLocale(BinLocale.binType)} />
                )
              }
            </FormItem>
            <FormItem {...baseFormItemLayout} label={commonLocale.noteLocale}>
              {
                getFieldDecorator('note', {
                  rules: [{
                    max: 255, message: tooLongLocale(commonLocale.noteLocale, 255),
                  }]
                })(
                  <TextArea placeholder={placeholderLocale(commonLocale.noteLocale)} />
                )
              }
            </FormItem>
          </Form>
        </div>
      </Modal>
    );
  }
}
