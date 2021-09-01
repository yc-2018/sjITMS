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
class SectionCreateModal extends PureComponent {

  static propTypes = {
    handleSaveSection: PropTypes.func,
    handleSectionModalVisible: PropTypes.func,
    SectionCreateModalVisible: PropTypes.bool,
    editSectionModal: PropTypes.object,
    confirmLoading: PropTypes.bool,
  }

  okHandle = () => {
    const { form, editSectionModal, handleSaveSection } = this.props;
    form.validateFields((errors, fieldsValue) => {
      if (errors) return;
      const data = {
        ...fieldsValue,
        uuid: editSectionModal ? editSectionModal.uuid : null,
      };
      handleSaveSection(data);
    });
  };

  handleCancel = () => {
    const { form, handleSectionModalVisible } = this.props;

    handleSectionModalVisible();
    form.resetFields();
  };

  render() {

    const {
      form,
      confirmLoading,
      editSectionModal,
      SectionCreateModalVisible,
      entity
    } = this.props;

    let title = editSectionModal && editSectionModal.uuid ? operationPointLocal.editBtn : operationPointLocal.createBtn;

    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 15 },
    };

    return (
      <Modal
        title={title}
        visible={SectionCreateModalVisible}
        onOk={this.okHandle}
        confirmLoading={confirmLoading}
        onCancel={() => this.handleCancel()}
        destroyOnClose
      >
        <div>
          <Form>
            <FormItem {...formItemLayout} label={operationPointLocal.sectionNum}>
              {form.getFieldDecorator('code', {
                rules: [
                  { required: true, message: notNullLocale(commonLocale.codeLocale) },
                  {
                    pattern: codePattern.pattern,
                    message: codePattern.message
                  },
                ],
                initialValue: editSectionModal ? editSectionModal.code : null,
              })(<Input placeholder={placeholderLocale(operationPointLocal.sectionNum)} autoFocus/>)}
            </FormItem>
            <FormItem {...formItemLayout} label={operationPointLocal.sectionName}>
              {form.getFieldDecorator('name', {
                rules: [
                  { required: true, message: notNullLocale(operationPointLocal.sectionName) },
                  {
                    max: 30,
                    message: tooLongLocale(operationPointLocal.sectionName, 30),
                  },
                ],
                initialValue: editSectionModal ? editSectionModal.name : null,
              })(<Input placeholder={placeholderLocale(operationPointLocal.sectionName)} />)}
            </FormItem>
            <FormItem {...formItemLayout} label={operationPointLocal.sectionOrder}>
              {form.getFieldDecorator('facilityOrder', {
                rules: [
                  { required: true, message: notNullLocale(operationPointLocal.sectionOrder) },
                  {
                    pattern: /^[0-9]*$/,
                    message: formatMessage({ id: 'basic.data.order' })
                  }
                ],
                initialValue: editSectionModal ? editSectionModal.facilityOrder : null,
              })(<Input placeholder={placeholderLocale(operationPointLocal.sectionOrder)} />)}
            </FormItem>
          </Form>
        </div>
      </Modal>
    );
  }
};
export default SectionCreateModal;
