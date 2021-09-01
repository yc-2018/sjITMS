import React, { PureComponent } from 'react';
import { Select, Form, Input, Modal } from 'antd';
import moment from 'moment';
import { formatMessage } from 'umi/locale';
import { stockTakeBillLocal } from './StockTakeBillLocal';
import { State, METHOD, SCHEMA } from './StockTakeBillConstants';
import { commonLocale, placeholderLocale } from '@/utils/CommonLocale';

const Option = Select.Option;

const schemaOptions = [];
Object.keys(SCHEMA).forEach(function (key) {
  schemaOptions.push(<Option value={SCHEMA[key].name} key={SCHEMA[key].name}>{SCHEMA[key].caption}</Option>);
});
const FormItem = Form.Item;
@Form.create()
export default class ModifyTakeSchemaModal extends PureComponent {
  handleCancel = () => {
    const { form, handleSchemaModalVisible } = this.props;
    this.props.form.resetFields();
    handleSchemaModalVisible();
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
    const { takeSchemaModalVisible, confirmLoading,
      ModalTitle, uuid, version } = this.props;
    const { getFieldDecorator } = this.props.form;

    return (
      <Modal
        title={ModalTitle}
        onOk={this.handleAlter}
        visible={takeSchemaModalVisible}
        onCancel={this.handleCancel}
        confirmLoading={confirmLoading}
        destroyOnClose={true}
      >
        <div style={{ maxHeight: '200px', overflow: 'auto' }}>
          <Form>
            <FormItem {...baseFormItemLayout} label={stockTakeBillLocal.schema}>
              {
                getFieldDecorator('schema', {
                  rules: [{
                    required: true,
                    message: "盘点模式不能为空",
                  }]
                })(
                  <Select placeholder={placeholderLocale(stockTakeBillLocal.schema)}
                  >{schemaOptions}</Select>
                )
              }
            </FormItem>
          </Form>
        </div>
      </Modal>
    );
  }
}
