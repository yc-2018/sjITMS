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
class AreaCreateModal extends PureComponent {

  static propTypes = {
    handleSaveArea: PropTypes.func,
    handleAreaModalVisible: PropTypes.func,
    AreaCreateModalVisible: PropTypes.bool,
    editAreaModal: PropTypes.object,
    confirmLoading: PropTypes.bool,
  }

  okHandle = () => {
    const { form, editAreaModal, handleSaveArea } = this.props;
    form.validateFields((errors, fieldsValue) => {
      if (errors) return;
      const data = {
        ...fieldsValue,
        uuid: editAreaModal ? editAreaModal.uuid : null,
      };
      handleSaveArea(data);
    });
  };

  handleCancel = () => {
    const { form, handleAreaModalVisible } = this.props;

    handleAreaModalVisible();
    form.resetFields();
  };

  render() {

    const {
      form,
      confirmLoading,
      editAreaModal,
      AreaCreateModalVisible,
      entity
    } = this.props;

    let title = editAreaModal && editAreaModal.uuid ? operationPointLocal.editBtn : operationPointLocal.createBtn;

    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 15 },
    };

    return (
      <Modal
        title={title}
        visible={AreaCreateModalVisible}
        onOk={this.okHandle}
        confirmLoading={confirmLoading}
        onCancel={() => this.handleCancel()}
        destroyOnClose
      >
        <div>
          <Form>
            <FormItem {...formItemLayout} label={operationPointLocal.areaNum}>
              {form.getFieldDecorator('code', {
                rules: [
                  { required: true, message: notNullLocale(commonLocale.codeLocale) },
                  {
                    pattern: codePattern.pattern,
                    message: codePattern.message
                  },
                ],
                initialValue: editAreaModal ? editAreaModal.code : null,
              })(<Input placeholder={placeholderLocale(operationPointLocal.areaNum)} autoFocus/>)}
            </FormItem>
            <FormItem {...formItemLayout} label={operationPointLocal.areaName}>
              {form.getFieldDecorator('name', {
                rules: [
                  { required: true, message: notNullLocale(operationPointLocal.areaName) },
                  {
                    max: 30,
                    message: tooLongLocale(operationPointLocal.areaName, 30),
                  },
                ],
                initialValue: editAreaModal ? editAreaModal.name : null,
              })(<Input placeholder={placeholderLocale(operationPointLocal.areaName)} />)}
            </FormItem>
            <FormItem {...formItemLayout} label={operationPointLocal.areaOrder}>
              {form.getFieldDecorator('facilityOrder', {
                rules: [
                  { required: true, message: notNullLocale(operationPointLocal.areaOrder) },
                  {
                    pattern: /^[0-9]*$/,
                    message: formatMessage({ id: 'basic.data.order' })
                  }
                ],
                initialValue: editAreaModal ? editAreaModal.facilityOrder : null,
              })(<Input placeholder={placeholderLocale(operationPointLocal.areaOrder)} />)}
            </FormItem>
          </Form>
        </div>
      </Modal>
    );
  }
};
export default AreaCreateModal;
