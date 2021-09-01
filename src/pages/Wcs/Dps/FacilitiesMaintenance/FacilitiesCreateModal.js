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
class FacilitiesCreateModal extends PureComponent {

  static propTypes = {
    handleSave: PropTypes.func,
    handleCreateModalVisible: PropTypes.func,
    createModalVisible: PropTypes.bool,
    confirmLoading: PropTypes.bool,
    controller: PropTypes.object,
    entity: PropTypes.object,
    lightStepUuid: PropTypes.string,
  }

  okHandle = () => {
    const { form, controller, handleSave, lightStepUuid } = this.props;
    form.validateFields((errors, fieldsValue) => {
      if (errors) return;
      const data = {
        ...fieldsValue,
        uuid: controller ? controller.uuid : null
      };
      handleSave(data);
    });
  };

  handleCancel = () => {
    const { form, handleCreateModalVisible } = this.props;

    handleCreateModalVisible();
    form.resetFields();
  };

  render() {

    const {
      form,
      createModalVisible,
      confirmLoading,
      controller,
      entity
    } = this.props;

    let title = controller.uuid ? facilitiesMaintenanceLocale.modifyTag : facilitiesMaintenanceLocale.createTag;

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
              {form.getFieldDecorator('code', {
                rules: [
                  { required: true, message: notNullLocale(commonLocale.codeLocale) },
                  {
                    pattern: codePattern.pattern,
                    message: codePattern.message
                  },
                ],
                initialValue: controller ? controller.code : null,
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
                initialValue: controller ? controller.name : null,
              })(<Input placeholder={placeholderLocale(commonLocale.nameLocale)} />)}
            </FormItem>
            <FormItem {...formItemLayout} label={facilitiesMaintenanceLocale.ipAddress}>
              {form.getFieldDecorator('ip', {
                rules: [
                  { required: true, message: notNullLocale(facilitiesMaintenanceLocale.ipAddress) },
                  {
                    max: 255,
                    message: tooLongLocale(facilitiesMaintenanceLocale.ipAddress, 255),
                  },
                ],
                initialValue: controller && controller.ip ? controller.ip : null
              })(<Input placeholder={placeholderLocale(facilitiesMaintenanceLocale.ipAddress)} />)}
            </FormItem>
            <FormItem {...formItemLayout} label={facilitiesMaintenanceLocale.port}>
              {form.getFieldDecorator('port', {
                rules: [
                  { required: true, message: notNullLocale(facilitiesMaintenanceLocale.port) },
                  // {
                  //   max: 4,
                  //   message: tooLongLocale(facilitiesMaintenanceLocale.port, 4),
                  // },
                ],
                initialValue: controller ? controller.port : null,
              })(<Input placeholder={placeholderLocale(facilitiesMaintenanceLocale.port)} />)}
            </FormItem>
          </Form>
        </div>
      </Modal>
    );
  }
};
export default FacilitiesCreateModal;
