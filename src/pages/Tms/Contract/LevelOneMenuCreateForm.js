import React, { PureComponent } from 'react';
import { Form, Input, Modal, Select, DateStocker } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import moment from 'moment';
import { formatMessage } from 'umi/locale';
import ConfirmLeave from '@/components/MyComponent/ConfirmLeave';
import { confirmLeaveFunc } from '@/utils/utils';
import { CONFIRM_LEAVE_ACTION } from '@/utils/constants';
import { commonLocale, notNullLocale, tooLongLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { codePatternDigit_4 } from '@/utils/PatternContants';
import PropTypes from 'prop-types';
import {stockOrderLocale} from '@/pages/Out/StockOrder/StockOrderLocale'

const FormItem = Form.Item;
const Option = Select.Option;
@Form.create()
class LevelOneMenuCreateForm extends PureComponent {

  static propTypes = {
    handleSaveOrder: PropTypes.func,
    handleCreateModalVisible: PropTypes.func,
    createModalVisible: PropTypes.bool,
    confirmLoading: PropTypes.bool,
    stockOrder: PropTypes.object,
  }
  okHandle = () => {
    const { form, stockOrder, handleSaveOrder,handleCreateModalVisible,selectedSchme} = this.props;
    form.validateFields((errors, fieldsValue) => {
      if (errors) return;
      fieldsValue.schemeUuid = selectedSchme.uuid
      const data = {
        ...stockOrder,
        ...fieldsValue,
        code:fieldsValue.tableCode
      };

      handleSaveOrder(data);
      handleCreateModalVisible();

    });
  };

  handleCancel = () => {
    const { form, handleCreateModalVisible } = this.props;

    handleCreateModalVisible();
    form.resetFields();
  };

  render() {

    const {
      handleSaveOrder,
      form,
      createModalVisible,
      handleCreateModalVisible,
      confirmLoading,
      stockOrder,
      selectedSchme
    } = this.props;
    let title = stockOrder ? stockOrderLocale.storeGroupUpdate : '新增费用';
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
              {form.getFieldDecorator('tableCode', {
                rules: [
                  { required: true, message: notNullLocale(commonLocale.codeLocale) },
                  {
                    pattern: codePatternDigit_4.pattern,
                    message: codePatternDigit_4.message
                  }],
                initialValue: stockOrder ? stockOrder.code : null,
              })(<Input id='tableCode' placeholder={placeholderLocale(commonLocale.codeLocale)} autoFocus/>)}
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
                initialValue: stockOrder ? stockOrder.name : null,
              })(<Input placeholder={placeholderLocale(commonLocale.nameLocale)} />)}
            </FormItem>
            <FormItem {...formItemLayout} label={stockOrderLocale.title}>
              {
                selectedSchme ? ('[' + selectedSchme.code + ']' + selectedSchme.name) : undefined
              }
            </FormItem>
            <FormItem {...formItemLayout} label={commonLocale.noteLocale}>
              {form.getFieldDecorator('note', {
                rules: [
                  {
                    max: 255,
                    message: tooLongLocale(commonLocale.noteLocale, 255),
                  },
                ],
                initialValue: stockOrder ? stockOrder.note : null,
              })(<TextArea placeholder={placeholderLocale(commonLocale.noteLocale)}/>)}
            </FormItem>
          </Form>
        </div>
      </Modal>
    );
  }
};
export default LevelOneMenuCreateForm;
