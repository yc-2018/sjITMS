import React, { PureComponent } from 'react';
import { Select, Form, Input, Modal } from 'antd';
import moment from 'moment';
import { formatMessage } from 'umi/locale';
import { stockTakeBillLocal } from './StockTakeBillLocal';
import { METHOD } from './StockTakeBillConstants';
import { commonLocale, placeholderLocale } from '@/utils/CommonLocale';

const Option = Select.Option;

const methodOptions = [];
Object.keys(METHOD).forEach(function (key) {
  methodOptions.push(<Option value={METHOD[key].name} key={METHOD[key].name}>{METHOD[key].caption}</Option>);
});
const FormItem = Form.Item;
@Form.create()
export default class ModifyTakerModal extends PureComponent {
  handleCancel = () => {
    const { form, handleMethodModalVisible } = this.props;
    this.props.form.resetFields();
    handleMethodModalVisible();
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

      handleSave(values);
    });
  }

  render() {
    const baseFormItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 15 },
    };
    const { methodModalVisible, confirmLoading,
      ModalTitle, uuid, version } = this.props;
    const { getFieldDecorator } = this.props.form;

    return (
      <Modal
        title={ModalTitle}
        onOk={this.handleAlter}
        visible={methodModalVisible}
        onCancel={this.handleCancel}
        confirmLoading={confirmLoading}
        destroyOnClose={true}
      >
        <div style={{ maxHeight: '200px', overflow: 'auto' }}>
          <Form>
            <FormItem {...baseFormItemLayout} label={stockTakeBillLocal.method}>
              {
                getFieldDecorator('method', {
                  rules: [{
                    required: true,
                    message: "盘点方式不能为空",
                  }]
                })(
                  <Select placeholder={placeholderLocale(stockTakeBillLocal.method)}>
                    {methodOptions}</Select>
                )
              }
            </FormItem>
          </Form>
        </div>
      </Modal>
    );
  }
}
