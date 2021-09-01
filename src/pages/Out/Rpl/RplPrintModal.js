import React, { PureComponent } from 'react';
import { Form, Input, Modal, Col, Select } from 'antd';
import { commonLocale, notNullLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { rplLocale } from './RplLocale';
import { PrintTemplateType } from '@/pages/Account/PrintTemplate/PrintTemplateContants';
import PrintTemplateSelect from '@/pages/Component/Select/PrintTemplateSelect';
const FormItem = Form.Item;
@Form.create()
class RplPrintModal extends PureComponent {
  okHandle = () => {
    const { form } = this.props;
    form.validateFields((errors, fieldsValue) => {
      if (errors) return;
      const data = {
        ...fieldsValue
      };
      this.props.onPrint(data);
    });
  };

  handleCancel = () => {
    const { form, handlePrintModal } = this.props;
    handlePrintModal();
  };

  render() {
    const {
      form,
      visible,
    } = this.props;

    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 15 },
    };
    return (
      <Modal
        title={'打印标签'}
        visible={visible}
        onOk={() => this.okHandle()}
        onCancel={() => this.handleCancel()}
        destroyOnClose={true}
      >
        <Form>
          <FormItem
            {...formItemLayout}
            label={commonLocale.printTemplateLocale}>
            {form.getFieldDecorator('printTemplate', {
              rules: [{
                required: true, message: notNullLocale(commonLocale.printTemplateLocale),
              }],
            })(
              <PrintTemplateSelect templateType={PrintTemplateType.LABELRPL.name} />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={'是否审核'}>
            {form.getFieldDecorator('isAudit', {
              initialValue: true,
              rules: [{
                required: true, message: notNullLocale(rplLocale.targetMode),
              }],
            })(
              <Select placeholder={placeholderChooseLocale('是否审核')}>
                <Select.Option key={1} value={1}>是</Select.Option>
                <Select.Option key={0} value={0}>否</Select.Option>
              </Select>
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
};
export default RplPrintModal;