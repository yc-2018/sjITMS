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
import { Type } from './TagState';

const FormItem = Form.Item;
const Option = Select.Option;
const tagOptions = [];
Object.keys(Type).forEach(function (key) {
  tagOptions.push(<Option value={Type[key].name}>{Type[key].caption}</Option>);
});

@Form.create()
class TagEditModal extends PureComponent {

  static propTypes = {
    handleEditTag: PropTypes.func,
    handleTagEditModalVisible: PropTypes.func,
    editTagModalVisible: PropTypes.bool,
    confirmLoading: PropTypes.bool,
    // editTagModal: PropTypes.object,
    entity: PropTypes.object
  }

  okHandle = () => {
    const { form, editTagModal, handleEditTag } = this.props;
    form.validateFields((errors, fieldsValue) => {
      if (errors) return;
      const data = {
        ...fieldsValue,
        uuid: editTagModal ? editTagModal.uuid : null,
      };
      handleEditTag(data);
    });
  };

  handleCancel = () => {
    const { form, handleTagEditModalVisible } = this.props;

    handleTagEditModalVisible();
    form.resetFields();
  };

  render() {

    const {
      form,
      editTagModalVisible,
      confirmLoading,
      editTagModal,
      entity
    } = this.props;

    let title = facilitiesMaintenanceLocale.editBtn;

    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 15 },
    };

    return (
      <Modal
        title={title}
        visible={editTagModalVisible}
        onOk={this.okHandle}
        confirmLoading={confirmLoading}
        onCancel={() => this.handleCancel()}
        destroyOnClose
      >
        <div>
          <Form>
            <FormItem {...formItemLayout} label={facilitiesMaintenanceLocale.controller}>
              {form.getFieldDecorator('controllerUuid', {
              })(
                <div>{ '[' + entity.code + ']' + entity.name}</div>)}
            </FormItem>
            <FormItem {...formItemLayout} label={facilitiesMaintenanceLocale.tagAddress}>
              {form.getFieldDecorator('address', {
                rules: [
                  { required: true, message: notNullLocale(facilitiesMaintenanceLocale.tagAddress) },
                  {
                    max: 30,
                    message: tooLongLocale(facilitiesMaintenanceLocale.tagAddress, 30),
                  },
                ],
                initialValue: editTagModal ? editTagModal.address : null,
              })(<Input placeholder={placeholderLocale(facilitiesMaintenanceLocale.address)} />)}
            </FormItem>
            <FormItem {...formItemLayout} label={facilitiesMaintenanceLocale.tagType}>
              {form.getFieldDecorator('cls', {
                rules: [
                  { required: true, message: notNullLocale(facilitiesMaintenanceLocale.tagType) }
                ],
                initialValue: editTagModal ? editTagModal.cls : null,
              })(
                <Select placeholder={placeholderLocale(facilitiesMaintenanceLocale.tagType)}>
                  {tagOptions}
                </Select>
              )}
            </FormItem>
          </Form>
        </div>
      </Modal>
    );
  }
};
export default TagEditModal;
