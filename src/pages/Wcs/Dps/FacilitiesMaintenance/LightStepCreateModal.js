import React, { PureComponent } from 'react';
import { Form, Input, Modal, Select, DatePicker } from 'antd';
import moment from 'moment';
import { formatMessage } from 'umi/locale';
import ConfirmLeave from '@/components/MyComponent/ConfirmLeave';
import { confirmLeaveFunc } from '@/utils/utils';
import { CONFIRM_LEAVE_ACTION } from '@/utils/constants';
import facilitiesMaintenanceLocale from './FacilitiesMaintenanceLocale';
import { commonLocale, notNullLocale, tooLongLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { codePattern } from '@/utils/PatternContants';
import PropTypes from 'prop-types';

const FormItem = Form.Item;
const Option = Select.Option;

@Form.create()
class LightStepCreateModal extends PureComponent {

  static propTypes = {
    handleSaveLightStep: PropTypes.func,
    handleCreateLightStepModalVisible: PropTypes.func,
    creatLightStepModalVisible: PropTypes.bool,
    confirmLoading: PropTypes.bool,
    editLightStep: PropTypes.object,
    entity: PropTypes.object
  }

  okHandle = () => {
    const { form, editLightStep, handleSaveLightStep } = this.props;
    form.validateFields((errors, fieldsValue) => {
      if (errors) return;
      const data = {
        ...fieldsValue,
        uuid: editLightStep ? editLightStep.uuid : null,
      };
      handleSaveLightStep(data);
    });
  };

  handleCancel = () => {
    const { form, handleCreateLightStepModalVisible } = this.props;

    handleCreateLightStepModalVisible();
    form.resetFields();
  };

  render() {

    const {
      form,
      creatLightStepModalVisible,
      confirmLoading,
      editLightStep,
      entity
    } = this.props;

    let title = editLightStep && editLightStep.uuid ? facilitiesMaintenanceLocale.editLightStep : facilitiesMaintenanceLocale.createLightStep;

    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 15 },
    };

    return (
      <Modal
        title={title}
        visible={creatLightStepModalVisible}
        onOk={this.okHandle}
        confirmLoading={confirmLoading}
        onCancel={() => this.handleCancel()}
        destroyOnClose
      >
        <div>
          <Form>
            <FormItem {...formItemLayout} label={commonLocale.codeLocale}>
              {form.getFieldDecorator('code', {
                rules: [
                  { required: true, message: notNullLocale(commonLocale.codeLocale) },
                  {
                    pattern: codePattern.pattern,
                    message: codePattern.message
                  },
                ],
                initialValue: editLightStep ? editLightStep.code : null,
              })(<Input placeholder={placeholderLocale(commonLocale.codeLocale)} autoFocus/>)}
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
                initialValue: editLightStep ? editLightStep.name : null,
              })(<Input placeholder={placeholderLocale(commonLocale.nameLocale)} />)}
            </FormItem>
            <FormItem {...formItemLayout} label={facilitiesMaintenanceLocale.serviceAddress}>
              {form.getFieldDecorator('server', {
                rules: [
                  { required: true, message: notNullLocale(facilitiesMaintenanceLocale.serviceAddress) },
                  {
                    max: 255,
                    message: tooLongLocale(facilitiesMaintenanceLocale.serviceAddress, 255),
                  },
                ],
                initialValue: editLightStep && editLightStep.server ? entity.server : null,
              })(<Input placeholder={placeholderLocale(facilitiesMaintenanceLocale.serviceAddress)} />)}
            </FormItem>
          </Form>
        </div>
      </Modal>
    );
  }
};
export default LightStepCreateModal;
