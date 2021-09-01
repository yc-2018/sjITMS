import React, { PureComponent } from 'react';
import { Form, Input, Modal, Select, DatePicker } from 'antd';
import { formatMessage } from 'umi/locale';
import { dockLocale }from './DockLocale';
import { commonLocale, notNullLocale, tooLongLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import PropTypes from 'prop-types';
import { dockListState } from '@/pages/In/InWrhBill/InWrhBillContants';
const FormItem = Form.Item;
const Option = Select.Option;
const stateOptions = [];
Object.keys(dockListState).forEach(function (key) {
  stateOptions.push(<Option key={dockListState[key].name} value={dockListState[key].name}>{dockListState[key].caption}</Option>);
});
@Form.create()
class DockStateModal extends PureComponent {
  static propTypes = {
    handleSave: PropTypes.func,
    onModify: PropTypes.func,
    modifyModalVisible: PropTypes.bool,
    confirmLoading: PropTypes.bool,
  }
  okHandle = () => {
    const { form, handleSave } = this.props;
    form.validateFields((errors, fieldsValue) => {
      if (errors) return;
      const data = {
        ...fieldsValue
      };
      handleSave(data);
    });
  };
  handleCancel = () => {
    const { form, onModify } = this.props;
    onModify(false);
    form.resetFields();
  };
  render() {
    const {
      form,
      modifyModalVisible,
      confirmLoading
    } = this.props;
    let title = dockLocale.dockState;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 15 },
    };
    return (
      <Modal
        title={title}
        visible={modifyModalVisible}
        onOk={this.okHandle}
        confirmLoading={confirmLoading}
        onCancel={() => this.handleCancel()}
        destroyOnClose
      >
        <div>
          <Form>
            <FormItem {...formItemLayout} label={dockLocale.dockState}>
              {form.getFieldDecorator('state', {
                rules: [
                  { required: true, message: notNullLocale(dockLocale.dockState) }
                ],
                initialValue: null,
              })(<Select placeholder={placeholderChooseLocale(dockLocale.dockState)}>
                {stateOptions}
              </Select>)}
            </FormItem>
          </Form>
        </div>
      </Modal>
    );
  }
};
export default DockStateModal;
