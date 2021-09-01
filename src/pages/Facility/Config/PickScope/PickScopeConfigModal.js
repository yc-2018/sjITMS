import React, { PureComponent } from 'react';
import { Form, Input, Modal, Select, DateStocker } from 'antd';
import { commonLocale, notNullLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import PropTypes from 'prop-types';
import { pickScopeConfigLocale } from './PickScopeConfigLocale';
import UserSelect from '@/pages/Component/Select/UserSelect';
import PickareaSelect from '@/pages/Component/Select/PickareaSelect';
const FormItem = Form.Item;
const Option = Select.Option;
@Form.create()
class PickScopeConfigModal extends PureComponent {
    static propTypes = {
        handleSave: PropTypes.func,
        handleRenameStoreGroup: PropTypes.func,
        createModalVisible: PropTypes.bool,
        confirmLoading: PropTypes.bool,
      }
      okHandle = () => {
        const { form, handleSave} = this.props;
        form.validateFields((errors, fieldsValue) => {
          if (errors) return;
          const data = {
            ...fieldsValue
          };

          handleSave(data);
          form.resetFields();
          this.props.handleModalVisible(false)
        });
      };

      handleCancel = () => {
        const { form, } = this.props;
        form.resetFields();
        this.props.handleModalVisible(false)
      };
      render(){
        const {
            createModalVisible,
            confirmLoading,
            entity
          } = this.props;
          const { getFieldDecorator } = this.props.form;
          const formItemLayout = {
            labelCol: {
              xs: { span: 24 },
              sm: { span: 4 },
            },
            wrapperCol: {
              xs: { span: 24 },
              sm: { span: 18 },
            },
          };
          const title=`${commonLocale.createLocale}${pickScopeConfigLocale.picker}`
          return <Modal
          title={title}
          visible={createModalVisible}
          onOk={this.okHandle}
        //   confirmLoading={confirmLoading}
          onCancel={() => this.handleCancel()}
          destroyOnClose>
            <Form {...formItemLayout}>
          {<Form.Item label={pickScopeConfigLocale.picker}>
            {getFieldDecorator('picker', {
              initialValue: undefined,
              rules: [{ required: true, message: notNullLocale(pickScopeConfigLocale.picker) }],
            })(
              <UserSelect single placeholder={placeholderLocale(pickScopeConfigLocale.pickerCodeAndName)} autoFocus/>
            )}
          </Form.Item>}
          <Form.Item label={pickScopeConfigLocale.pickArea}>
            {getFieldDecorator('pickArea', {
              initialValue: [],
              rules: [{ required: true, message: notNullLocale(pickScopeConfigLocale.pickArea) }],
            })(
              <PickareaSelect multiple placeholder={placeholderChooseLocale(pickScopeConfigLocale.pickArea)} />
            )}
          </Form.Item>
        </Form>
          </Modal>
      }
}
export default PickScopeConfigModal;
