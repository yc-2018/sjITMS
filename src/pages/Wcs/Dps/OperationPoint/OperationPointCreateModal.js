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

const FormItem = Form.Item;

@Form.create()
class OperationPointCreateModal extends PureComponent {

  static propTypes = {
    handleSaveOperationPoint: PropTypes.func,
    handleOperationPointModalVisible: PropTypes.func,
    OperationPointCreateModalVisible: PropTypes.bool,
    editOperationPointModal: PropTypes.object,
    confirmLoading: PropTypes.bool,
  }

  okHandle = () => {
    const { form, editOperationPointModal, handleSaveOperationPoint } = this.props;
    form.validateFields((errors, fieldsValue) => {
      if (errors) return;
      const data = {
        ...fieldsValue,
        uuid: editOperationPointModal ? editOperationPointModal.uuid : null,
      };
      handleSaveOperationPoint(data);
    });
  };

  handleCancel = () => {
    const { form, handleOperationPointModalVisible } = this.props;

    handleOperationPointModalVisible();
    form.resetFields();
  };

  render() {

    const {
      form,
      handleOperationPointModalVisible,
      confirmLoading,
      editOperationPointModal,
      OperationPointCreateModalVisible,
      entity
    } = this.props;

    let title = editOperationPointModal && editOperationPointModal.uuid ? operationPointLocal.editBtn : operationPointLocal.createBtn;

    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 15 },
    };

    return (
      <Modal
        title={title}
        visible={OperationPointCreateModalVisible}
        onOk={this.okHandle}
        confirmLoading={confirmLoading}
        onCancel={() => this.handleCancel()}
        destroyOnClose
      >
        <div>
          <Form>
            <FormItem {...formItemLayout} label={operationPointLocal.taskNum}>
              {form.getFieldDecorator('code', {
                rules: [
                  { required: true, message: notNullLocale(commonLocale.codeLocale) },
                  {
                    pattern: codePattern.pattern,
                    message: codePattern.message
                  },
                ],
                initialValue: editOperationPointModal ? editOperationPointModal.code : null,
              })(<Input placeholder={placeholderLocale(operationPointLocal.taskNum)} autoFocus/>)}
            </FormItem>
            <FormItem {...formItemLayout} label={operationPointLocal.taskName}>
              {form.getFieldDecorator('name', {
                rules: [
                  { required: true, message: notNullLocale(operationPointLocal.taskName) },
                  {
                    max: 30,
                    message: tooLongLocale(operationPointLocal.taskName, 30),
                  },
                ],
                initialValue: editOperationPointModal ? editOperationPointModal.name : null,
              })(<Input placeholder={placeholderLocale(operationPointLocal.taskName)} />)}
            </FormItem>
            <FormItem {...formItemLayout} label={operationPointLocal.taskOrder}>
              {form.getFieldDecorator('facilityOrder', {
                rules: [
                  { required: true, message: notNullLocale(operationPointLocal.taskOrder) },
                  {
                    pattern: /^[0-9]*$/,
                    message: formatMessage({ id: 'basic.data.order' })
                  }
                ],
                initialValue: editOperationPointModal ? editOperationPointModal.facilityOrder : null,
              })(<Input placeholder={placeholderLocale(operationPointLocal.taskOrder)} />)}
            </FormItem>
          </Form>
        </div>
      </Modal>
    );
  }
};
export default OperationPointCreateModal;
