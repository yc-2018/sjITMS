import React, { PureComponent } from 'react';
import { Form, Input, Modal, Select, DatePicker } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import moment from 'moment';
import { formatMessage } from 'umi/locale';
import ConfirmLeave from '@/components/MyComponent/ConfirmLeave';
import { confirmLeaveFunc } from '@/utils/utils';
import { CONFIRM_LEAVE_ACTION } from '@/utils/constants';
import { commonLocale, notNullLocale, tooLongLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { codePattern } from '@/utils/PatternContants';
import PropTypes from 'prop-types';
import { deliverycycleLocale } from './DeliverycycleLocale'

const FormItem = Form.Item;
const Option = Select.Option;
@Form.create()
class StoreGroupCreateForm extends PureComponent {

  static propTypes = {
    handleSaveGroup: PropTypes.func,
    handleCreateModalVisible: PropTypes.func,
    createModalVisible: PropTypes.bool,
    confirmLoading: PropTypes.bool,
    storeGroup: PropTypes.object,
  }

  okHandle = () => {
    const { form, storeGroup, handleSaveGroup,handleCreateModalVisible,selectedCycle} = this.props;
    form.validateFields((errors, fieldsValue) => {
      if (errors) return;
      fieldsValue.deliveryCycleUuid = selectedCycle.uuid
      const data = {
        ...storeGroup,
        ...fieldsValue,
        code:fieldsValue.groupCode
      };

      handleSaveGroup(data);
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
      handleSaveGroup,
      form,
      createModalVisible,
      handleCreateModalVisible,
      confirmLoading,
      storeGroup,
      selectedCycle
    } = this.props;
    let title = storeGroup ? deliverycycleLocale.storeGroupUpdate : deliverycycleLocale.storeGroupAdd;
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
              {form.getFieldDecorator('groupCode', {
                rules: [
                  { required: true, message: notNullLocale(commonLocale.codeLocale) },
                  {
                    pattern: deliverycycleLocale.groupCodePattern,
                    message: deliverycycleLocale.groupCodePatternMessage
                  },
                  {
                    max: 4,
                    message: tooLongLocale(commonLocale.codeLocale, 4),
                  },
                ],
                initialValue: storeGroup ? storeGroup.code : null,
              })(<Input id='groupCode' placeholder={placeholderLocale(commonLocale.codeLocale)} autoFocus/>)}
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
                initialValue: storeGroup ? storeGroup.name : null,
              })(<Input placeholder={placeholderLocale(commonLocale.nameLocale)} />)}
            </FormItem>
            <FormItem {...formItemLayout} label={deliverycycleLocale.deliverycycleTitle}>
              {
                selectedCycle ? ('[' + selectedCycle.code + ']' + selectedCycle.name) : undefined
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
                initialValue: storeGroup ? storeGroup.note : null,
              })(<TextArea placeholder={placeholderLocale(commonLocale.noteLocale)}/>)}
            </FormItem>
          </Form>
        </div>
      </Modal>
    );
  }
};
export default StoreGroupCreateForm;
