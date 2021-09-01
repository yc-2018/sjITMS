import React, { PureComponent } from 'react';
import { Form, Input, Modal, Select, DatePicker } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import moment from 'moment';
import { formatMessage } from 'umi/locale';
import ConfirmLeave from '@/components/MyComponent/ConfirmLeave';
import { confirmLeaveFunc } from '@/utils/utils';
import { CONFIRM_LEAVE_ACTION } from '@/utils/constants';
import { commonLocale, notNullLocale, tooLongLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { codePatternDigit_4 } from '@/utils/PatternContants';
import PropTypes from 'prop-types';
import { pickOrderLocale } from './PickOrderLocale'

const FormItem = Form.Item;
const Option = Select.Option;
@Form.create()
class PickOrderCreateForm extends PureComponent {

  static propTypes = {
    handleSaveOrder: PropTypes.func,
    handleCreateModalVisible: PropTypes.func,
    createModalVisible: PropTypes.bool,
    confirmLoading: PropTypes.bool,
    pickOrder: PropTypes.object,
  }

  okHandle = () => {
    const { form, pickOrder, handleSaveOrder,handleCreateModalVisible,selectedSchme} = this.props;
    form.validateFields((errors, fieldsValue) => {
      if (errors) return;
      fieldsValue.schemeUuid = selectedSchme.uuid
      const data = {
        ...pickOrder,
        ...fieldsValue,
        code:fieldsValue.orderCode
      };

      handleSaveOrder(data);
      handleCreateModalVisible();

    });
  };

  handleCancel = () => {
    const { form, handleCreateModalVisible } = this.props;

    handleCreateModalVisible();
    form.resetFields();
  };

  render() {

    const {
      handleSaveOrder,
      form,
      createModalVisible,
      handleCreateModalVisible,
      confirmLoading,
      pickOrder,
      selectedSchme
    } = this.props;
    let title = pickOrder ? pickOrderLocale.storeGroupUpdate : pickOrderLocale.storeGroupAdd;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 15 },
    };
    return (
      <Modal
        title={title}
        visible={createModalVisible}
        onOk={this.okHandle}
        confirmLoading={confirmLoading}
        onCancel={() => this.handleCancel()}
        destroyOnClose
      >
        <div>
          <Form>
            <FormItem {...formItemLayout} label={commonLocale.codeLocale}>
              {form.getFieldDecorator('orderCode', {
                rules: [
                  { required: true, message: notNullLocale(commonLocale.codeLocale) },
                  {
                    pattern: codePatternDigit_4.pattern,
                    message: codePatternDigit_4.message
                  }],
                initialValue: pickOrder ? pickOrder.code : null,
              })(<Input id='orderCode' autoFocus placeholder={placeholderLocale(commonLocale.codeLocale)} />)}
            </FormItem>
            <FormItem {...formItemLayout} label={commonLocale.nameLocale}>
              {form.getFieldDecorator('name', {
                rules: [
                  { required: true, message: notNullLocale(commonLocale.nameLocale) },
                  {
                    max: 30,
                    message: tooLongLocale(commonLocale.nameLocale, 30),
                  },
                ],
                initialValue: pickOrder ? pickOrder.name : null,
              })(<Input placeholder={placeholderLocale(commonLocale.nameLocale)} />)}
            </FormItem>
            <FormItem {...formItemLayout} label={pickOrderLocale.pickOrderScheme}>
              {
                selectedSchme ? ('[' + selectedSchme.code + ']' + selectedSchme.name) : undefined
              }
            </FormItem>
            <FormItem {...formItemLayout} label={commonLocale.noteLocale}>
              {form.getFieldDecorator('note', {
                rules: [
                  {
                    max: 255,
                    message: tooLongLocale(commonLocale.noteLocale, 255),
                  },
                ],
                initialValue: pickOrder ? pickOrder.note : null,
              })(<TextArea placeholder={placeholderLocale(commonLocale.noteLocale)}/>)}
            </FormItem>
          </Form>
        </div>
      </Modal>
    );
  }
};
export default PickOrderCreateForm;
