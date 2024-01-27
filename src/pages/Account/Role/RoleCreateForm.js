import React, { PureComponent } from 'react';
import { Form, Input, Modal, Select, DatePicker } from 'antd';
import moment from 'moment';
import { formatMessage } from 'umi/locale';
import ConfirmLeave from '@/components/MyComponent/ConfirmLeave';
import { confirmLeaveFunc } from '@/utils/utils';
import { CONFIRM_LEAVE_ACTION } from '@/utils/constants';
import { roleLocale } from './RoleLocale';
import {
  commonLocale,
  notNullLocale,
  tooLongLocale,
  placeholderLocale,
  placeholderChooseLocale,
} from '@/utils/CommonLocale';
import { codePattern } from '@/utils/PatternContants';
import PropTypes from 'prop-types';
import { SimpleSelect } from '@/pages/Component/RapidDevelopment/CommonComponent';

const FormItem = Form.Item;
const Option = Select.Option;

@Form.create()
class RoleCreateForm extends PureComponent {
  static propTypes = {
    handleSave: PropTypes.func,
    handleCreateModalVisible: PropTypes.func,
    createModalVisible: PropTypes.bool,
    confirmLoading: PropTypes.bool,
    role: PropTypes.object,
  };

  okHandle = () => {
    const { form, role, handleSave } = this.props;
    form.validateFields((errors, fieldsValue) => {
      if (errors) return;
      fieldsValue.org = fieldsValue.org.join(',');
      const data = {
        ...fieldsValue,
        uuid: role ? role.uuid : null,
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
      handleSave,
      form,
      createModalVisible,
      handleCreateModalVisible,
      confirmLoading,
      role,
    } = this.props;

    let title = role.uuid ? roleLocale.modifyRole : roleLocale.createRole;

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
                    message: codePattern.message,
                  },
                ],
                initialValue: role ? role.code : null,
              })(<Input placeholder={placeholderLocale(commonLocale.codeLocale)} autoFocus />)}
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
                initialValue: role ? role.name : null,
              })(<Input placeholder={placeholderLocale(commonLocale.nameLocale)} />)}
            </FormItem>
            <FormItem {...formItemLayout} label="所属组织">
              {form.getFieldDecorator('org', {
                // rules: [
                //   // { required: true, message: notNullLocale(commonLocale.nameLocale) },
                //   {
                //     max: 30,
                //     message: tooLongLocale(commonLocale.nameLocale, 30),
                //   },
                // ],
                initialValue: role.org != undefined ? role.org.split(',') : null,
              })(
                <SimpleSelect
                  searchField={{ searchCondition: 'in' }}
                  dictCode={'bmsDispatchCenter'}
                  placeholder={'请选择所属组织'}
                />
              )}
            </FormItem>
            <FormItem {...formItemLayout} label="所属菜单">
              {form.getFieldDecorator('pcode', {
                rules: [
                  // { required: true, message: notNullLocale(commonLocale.nameLocale) },
                  {
                    max: 30,
                    message: tooLongLocale(commonLocale.nameLocale, 30),
                  },
                ],
                initialValue: role ? role.pcode : null,
              })(<Input placeholder={placeholderLocale('所属菜单')} />)}
            </FormItem>
            <FormItem {...formItemLayout} label={commonLocale.noteLocale}>
              {form.getFieldDecorator('note', {
                rules: [
                  {
                    max: 255,
                    message: tooLongLocale(commonLocale.note, 255),
                  },
                ],
                initialValue: role.note,
              })(
                <Input.TextArea rows={4} placeholder={placeholderLocale(commonLocale.noteLocale)} />
              )}
            </FormItem>
          </Form>
        </div>
      </Modal>
    );
  }
}
export default RoleCreateForm;
