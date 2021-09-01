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
import styles from './FacilitiesMaintenance.less';
import { Type } from './TagState';

const FormItem = Form.Item;
const Option = Select.Option;
const tagOptions = [];
Object.keys(Type).forEach(function (key) {
  tagOptions.push(<Option value={Type[key].name}>{Type[key].caption}</Option>);
});

@Form.create()
class TagCreateModal extends PureComponent {

  static propTypes = {
    handleSaveTag: PropTypes.func,
    handleTagCreateModalVisible: PropTypes.func,
    creatTagModalVisible: PropTypes.bool,
    confirmLoading: PropTypes.bool,
    addTagModal: PropTypes.object,
  }

  okHandle = () => {
    const { form, addTagModal, handleSaveTag } = this.props;
    form.validateFields((errors, fieldsValue) => {
      if (errors) return;
      const data = {
        ...fieldsValue,
        uuid: addTagModal ? addTagModal.uuid : null,
      };
      handleSaveTag(data);
    });
  };

  handleCancel = () => {
    const { form, handleTagCreateModalVisible } = this.props;

    handleTagCreateModalVisible();
    form.resetFields();
  };

  render() {

    const {
      form,
      creatTagModalVisible,
      confirmLoading,
      addTagModal,
    } = this.props;

    let title = facilitiesMaintenanceLocale.createBtn;

    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 15 },
    };

    return (
      <Modal
        title={title}
        visible={creatTagModalVisible}
        onOk={this.okHandle}
        confirmLoading={confirmLoading}
        onCancel={() => this.handleCancel()}
        destroyOnClose
      >
        <div>
          <Form>
            <FormItem {...formItemLayout} label={facilitiesMaintenanceLocale.tagRadix}>
              <Form.Item
                className={styles.formItemControl}
                style={{ display: 'inline-block', width: 'calc(50%)' }}>
                {form.getFieldDecorator('startAddress', {
                  rules: [
                    {
                      required: true,
                      message: notNullLocale(facilitiesMaintenanceLocale.tagRadix),
                    }, {
                      pattern: /^[0-9]{4}$/,
                      message: formatMessage({ id: 'tag.start.address' })
                    }
                  ],
                })(<Input />)}
              </Form.Item>
              <Form.Item
                className={styles.formItemControl}
                style={{ display: 'inline-block', width: 'calc(50%)' }}>
                {form.getFieldDecorator('endAddress', {
                  rules: [
                    {
                      required: true,
                      message: notNullLocale(facilitiesMaintenanceLocale.tagRadix),
                    }, {
                      pattern: /^[0-9]{4}$/,
                      message: formatMessage({ id: 'tag.start.address' })
                    }
                  ],
                })(<Input />)}
              </Form.Item>
            </FormItem>
            <FormItem {...formItemLayout} label={facilitiesMaintenanceLocale.tagSpan}>
              {form.getFieldDecorator('span', {
                rules: [
                  { required: true, message: notNullLocale(facilitiesMaintenanceLocale.tagSpan) },
                  {
                    max: 30,
                    message: tooLongLocale(facilitiesMaintenanceLocale.tagSpan, 30),
                  },
                ]
              })(<Input placeholder={placeholderLocale(facilitiesMaintenanceLocale.tagSpan)} />)}
            </FormItem>
            <FormItem {...formItemLayout} label={facilitiesMaintenanceLocale.tagAdd}>
              {form.getFieldDecorator('count', {
                rules: [
                  { required: true, message: notNullLocale(facilitiesMaintenanceLocale.tagAdd) },
                  {
                    max: 255,
                    message: tooLongLocale(facilitiesMaintenanceLocale.tagAdd, 255),
                  },
                ]
              })(<Input placeholder={placeholderLocale(facilitiesMaintenanceLocale.tagAdd)} />)}
            </FormItem>
            <FormItem {...formItemLayout} label={facilitiesMaintenanceLocale.tagType}>
              {form.getFieldDecorator('cls', {
                rules: [
                  { required: true, message: notNullLocale(facilitiesMaintenanceLocale.tagType) }
                ]
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
export default TagCreateModal;
