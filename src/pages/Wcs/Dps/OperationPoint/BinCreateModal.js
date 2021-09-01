import React, { PureComponent } from 'react';
import { Form, Input, Modal, Select, DatePicker } from 'antd';
import moment from 'moment';
import { formatMessage } from 'umi/locale';
import ConfirmLeave from '@/components/MyComponent/ConfirmLeave';
import { confirmLeaveFunc } from '@/utils/utils';
import { CONFIRM_LEAVE_ACTION } from '@/utils/constants';
import operationPointLocal from './OperationPointLocal';
import { commonLocale, notNullLocale, tooLongLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { codePattern } from '@/utils/PatternContants';
import PropTypes from 'prop-types';
import styles from './operationPoint.less';
import { Usage }from './TagUsage';

const FormItem = Form.Item;

const usageOptions = [];
const Option = Select.Option;
Object.keys(Usage).forEach(function (key) {
  usageOptions.push(<Option value={Usage[key].name}>{Usage[key].caption}</Option>);
});

@Form.create()
class BinCreateModal extends PureComponent {

  static propTypes = {
    handleSaveBin: PropTypes.func,
    handleBinAddModalVisible: PropTypes.func,
    BinCreateModalVisible: PropTypes.bool,
    confirmLoading: PropTypes.bool
  }

  okHandle = () => {
    const { form, handleSaveBin } = this.props;
    form.validateFields((errors, fieldsValue) => {
      if (errors) return;
      const data = {
        ...fieldsValue
      };
      handleSaveBin(data);
    });
  };

  handleCancel = () => {
    const { form, handleBinAddModalVisible } = this.props;

    handleBinAddModalVisible();
    form.resetFields();
  };

  render() {

    const {
      form,
      BinCreateModalVisible,
      confirmLoading
    } = this.props;

    let title = operationPointLocal.createBtn;

    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 15 },
    };

    return (
      <Modal
        title={title}
        visible={BinCreateModalVisible}
        onOk={this.okHandle}
        confirmLoading={confirmLoading}
        onCancel={() => this.handleCancel()}
        destroyOnClose
      >
        <div>
          <Form>
            <FormItem {...formItemLayout} label={operationPointLocal.binNum}>
              <Form.Item
                className={styles.formItemControl}
                style={{ display: 'inline-block', width: 'calc(50%)' }}>
                {form.getFieldDecorator('binStartAddress', {
                  rules: [
                    {
                      required: true,
                      message: notNullLocale(operationPointLocal.binNum),
                    },
                    {
                      pattern: /^[0-9]{8}$/,
                      message: formatMessage({ id: 'bin.validate.bin.address' })
                    }
                  ],
                })(<Input />)}
              </Form.Item>
              <Form.Item
                className={styles.formItemControl}
                style={{ display: 'inline-block', width: 'calc(50%)' }}>
                {form.getFieldDecorator('binEndAddress', {
                  rules: [
                    {
                      required: true,
                      message: notNullLocale(operationPointLocal.binNum),
                    },
                    {
                      pattern: /^[0-9]{8}$/,
                      message: formatMessage({ id: 'bin.validate.bin.address' })
                    }
                  ]
                })(<Input />)}
              </Form.Item>
            </FormItem>
            <FormItem {...formItemLayout} label={operationPointLocal.binSpan}>
              {form.getFieldDecorator('binSpan', {
                rules: [
                  { required: true, message: notNullLocale(operationPointLocal.binSpan) },
                  {
                    max: 30,
                    message: tooLongLocale(operationPointLocal.binSpan, 30),
                  },
                ]
              })(<Input placeholder={placeholderLocale(operationPointLocal.binSpan)} />)}
            </FormItem>
            <FormItem {...formItemLayout} label={operationPointLocal.binAdd}>
              {form.getFieldDecorator('binCount', {
                rules: [
                  { required: true, message: notNullLocale(operationPointLocal.binAdd) },
                  {
                    max: 255,
                    message: tooLongLocale(operationPointLocal.binAdd, 255),
                  },
                ]
              })(<Input placeholder={placeholderLocale(operationPointLocal.binAdd)} />)}
            </FormItem>

            <FormItem {...formItemLayout} label={operationPointLocal.nodeAddress}>
              <Form.Item
                className={styles.formItemControl}
                style={{ display: 'inline-block', width: 'calc(50%)' }}>
                {form.getFieldDecorator('equipmentStartAddress', {
                  rules: [
                    {
                      required: true,
                      message: notNullLocale(operationPointLocal.nodeAddress),
                    }, {
                      pattern: /^[0-9]{4}$/,
                      message: formatMessage({ id: 'tag.start.address' })
                    }
                  ],
                })(<Input />)}
              </Form.Item>
              <Form.Item
                className={styles.formItemControl}
                style={{ display: 'inline-block', width: 'calc(50%)' }}>
                {form.getFieldDecorator('equipmentEndAddress', {
                  rules: [
                    {
                      required: true,
                      message: notNullLocale(operationPointLocal.nodeAddress),
                    }, {
                      pattern: /^[0-9]{4}$/,
                      message: formatMessage({ id: 'tag.start.address' })
                    }
                  ],
                })(<Input />)}
              </Form.Item>
            </FormItem>
            <FormItem {...formItemLayout} label={operationPointLocal.binSpan}>
              {form.getFieldDecorator('equipmentSpan', {
                rules: [
                  { required: true, message: notNullLocale(operationPointLocal.binSpan) },
                  {
                    max: 30,
                    message: tooLongLocale(operationPointLocal.binSpan, 30),
                  },
                ]
              })(<Input placeholder={placeholderLocale(operationPointLocal.binSpan)} />)}
            </FormItem>
            <FormItem {...formItemLayout} label={operationPointLocal.binAdd}>
              {form.getFieldDecorator('equipmentCount', {
                rules: [
                  { required: true, message: notNullLocale(operationPointLocal.binAdd) },
                  {
                    max: 255,
                    message: tooLongLocale(operationPointLocal.binAdd, 255),
                  },
                ]
              })(<Input placeholder={placeholderLocale(operationPointLocal.binAdd)} />)}
            </FormItem>
            <FormItem {...formItemLayout} label={operationPointLocal.nodeUsage}>
              {form.getFieldDecorator('usage', {
                rules: [
                  { required: true, message: notNullLocale(operationPointLocal.nodeUsage) }
                ]
              })(<Select placeholder={placeholderChooseLocale(operationPointLocal.nodeUsage)}>
                {usageOptions}
              </Select>)}
            </FormItem>
          </Form>
        </div>
      </Modal>
    );
  }
};
export default BinCreateModal;
