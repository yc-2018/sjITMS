import React, { PureComponent } from 'react';
import { Form, Input, Modal, Col, Select } from 'antd';
import { commonLocale, notNullLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { pickUpBillLocale } from './PickUpBillLocale';
import UserSelect from '@/pages/Component/Select/UserSelect';
import { loginUser } from '@/utils/LoginContext';
const FormItem = Form.Item;
@Form.create()
class ModifyPickerModal extends PureComponent {
  okHandle = () => {
    const { form } = this.props;
    form.validateFields((errors, fieldsValue) => {
      if (errors) return;
      fieldsValue.picker = JSON.parse(fieldsValue.picker);
      const data = {
        ...fieldsValue
      };
      this.props.modifyPicker(data);
    });
  };

  handleCancel = () => {
    const { form, handleModal } = this.props;
    handleModal();
  };

  render() {
    const {
      form: { getFieldDecorator },
      visible,
    } = this.props;

    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 15 },
    };
    return (
      <Modal
        title={this.props.title}
        visible={visible}
        onOk={() => this.okHandle()}
        onCancel={() => this.handleCancel()}
      >
        <Form {...formItemLayout}>
          <FormItem label={pickUpBillLocale.picker} key='picker'>
            {getFieldDecorator('picker', {
              initialValue: JSON.stringify({ uuid: loginUser().uuid, code: loginUser().code, name: loginUser().name }),
              rules: [
                { required: true, message: notNullLocale(pickUpBillLocale.picker) }
              ],
            })(<UserSelect autoFocus single={true} />)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
};
export default ModifyPickerModal;