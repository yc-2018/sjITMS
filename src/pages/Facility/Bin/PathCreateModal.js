import React, { PureComponent } from 'react';
import { Select, Form, Input, Modal, InputNumber, Row, Col } from 'antd';
import moment from 'moment';
import { formatMessage } from 'umi/locale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import WrhSelect from '@/components/MyComponent/WrhSelect';
import { commonLocale, notNullLocale, tooLongLocale, placeholderLocale } from '@/utils/CommonLocale';
import { BinLocale } from './BinLocale';
import styles from './Bin.less';

const FormItem = Form.Item;
const { TextArea } = Input;
const InputGroup = Input.Group;
@Form.create()
export default class PathCreateModal extends PureComponent {

  handleCancel = () => {
    const { form, handleCreatePathModalVisible } = this.props;
    this.props.form.resetFields();
    handleCreatePathModalVisible();
  };

  handleAddPath = (e) => {
    e.preventDefault();
    const {
      form,
      handleSave,
    } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const values = {
        uuid: record.uuid,
        ...fieldsValue,
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid
      };

      handleSave(values);
    });
  }

  calcAndGenPathCode = (e) => {
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

    const { createPathModalVisible, confirmLoading, ModalTitle } = this.props;
    const { getFieldDecorator } = this.props.form;

    return (
      <Modal
        title={ModalTitle}
        onOk={this.calcAndGenPathCode}
        visible={createPathModalVisible}
        onCancel={this.handleCancel}
        confirmLoading={confirmLoading}
        destroyOnClose={true}
      >
        <div style={{ maxHeight: '350px', overflow: 'auto' }}>
          <Form>
            <FormItem {...baseFormItemLayout} label={BinLocale.zoneScope} required={true}>
              <Form.Item
                className={styles.formItemControl}
                style={{ display: 'inline-block', width: 'calc(50%)' }}>
                {getFieldDecorator('startUpperCode', {
                  rules: [
                    {
                      required: true,
                      message: notNullLocale(BinLocale.startZoneScope),
                    }, {
                      pattern: /^[0-9]{2}$/,
                      message: formatMessage({ id: 'bin.validate.zone.code' })
                    }
                  ],
                })(<Input placeholder={placeholderLocale(BinLocale.startZoneScope)} />)}
              </Form.Item>
              <Form.Item
                className={styles.formItemControl}
                style={{ display: 'inline-block', width: 'calc(50%)' }}>
                {getFieldDecorator('endUpperCode', {
                  rules: [{
                    required: true,
                    message: notNullLocale(BinLocale.endzoneScope),
                  }, {
                    pattern: /^[0-9]{2}$/,
                    message: formatMessage({ id: 'bin.validate.zone.code' })
                  }],
                })(<Input placeholder={placeholderLocale(BinLocale.endzoneScope)} />)}
              </Form.Item>
            </FormItem>
            <FormItem {...baseFormItemLayout} label={BinLocale.avgPathCount}>
              {
                getFieldDecorator('count', {
                  rules: [{
                    required: true,
                    message: notNullLocale(BinLocale.avgPathCount),
                  },{
                    pattern: /^[0-9]{1,2}$/,
                    message: BinLocale.avgCountValidate
                  },]
                })(
                  <InputNumber min={1} max={99}
                               style={{ width: '100%' }}
                               placeholder={placeholderLocale(BinLocale.avgPathCount)} />
                )
              }
            </FormItem>
            <FormItem {...baseFormItemLayout} label={BinLocale.startPath}>
              {
                getFieldDecorator('startCode', {
                  rules: [{
                    required: true,
                    message: notNullLocale(BinLocale.startPath),
                  }, {
                    pattern: /^[0-9]{1,2}$/,
                    message: formatMessage({ id: 'bin.validate.path.start.length' })
                  }]
                })(
                  <Input placeholder={placeholderLocale(BinLocale.startPath)} />
                )
              }
            </FormItem>
          </Form>
        </div>
      </Modal>
    );
  }
}
