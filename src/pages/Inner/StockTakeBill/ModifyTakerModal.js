import React, { PureComponent } from 'react';
import { Select, Form, Input, Modal } from 'antd';
import moment from 'moment';
import { formatMessage } from 'umi/locale';
import { stockTakeBillLocal } from './StockTakeBillLocal';
import UserSelect from '@/pages/Component/Select/UserSelect';

const FormItem = Form.Item;
@Form.create()
export default class ModifyTakerModal extends PureComponent {
  handleCancel = () => {
    const { form, handleTakerModalVisible } = this.props;
    this.props.form.resetFields();
    handleTakerModalVisible();
  };

  handleAlter = (e) => {
    e.preventDefault();
    const {
      form,
      handleSave,
      uuid,
      version
    } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const values = {
        ...fieldsValue,
        uuid: uuid,
        version: version
      };

      values['taker'] = JSON.parse(values['taker']);
      handleSave(values);
    });
  }

  render() {
    const baseFormItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 15 },
    };
    const { takerModalVisible, confirmLoading,
      ModalTitle, uuid, version } = this.props;
    const { getFieldDecorator } = this.props.form;

    return (
      <Modal
        title={ModalTitle}
        onOk={this.handleAlter}
        visible={takerModalVisible}
        onCancel={this.handleCancel}
        confirmLoading={confirmLoading}
        destroyOnClose={true}
      >
        <div style={{ maxHeight: '200px', overflow: 'auto' }}>
          <Form>
            <FormItem {...baseFormItemLayout} label={stockTakeBillLocal.taker}>
              {
                getFieldDecorator('taker', {
                  rules: [{
                    required: true,
                    message: "盘点员不能为空",
                  }]
                })(
                  <UserSelect autoFocus
                    placeholder="请选择员工"
                    single={true}
                  />
                )
              }
            </FormItem>
          </Form>
        </div>
      </Modal>
    );
  }
}
