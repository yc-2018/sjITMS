import React, { PureComponent } from 'react';
import { Form, Input, Modal, Select, DatePicker } from 'antd';
import moment from 'moment';
import { formatMessage } from 'umi/locale';
import ConfirmLeave from '@/components/MyComponent/ConfirmLeave';
import { confirmLeaveFunc } from '@/utils/utils';
import { CONFIRM_LEAVE_ACTION } from '@/utils/constants';
import jobLocale from './JobLocal';
import { commonLocale, notNullLocale, tooLongLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { codePattern } from '@/utils/PatternContants';
import PropTypes from 'prop-types';

const FormItem = Form.Item;
const Option = Select.Option;

@Form.create()
class AlcNumModal extends PureComponent {

  static propTypes = {
    handleSave: PropTypes.func,
    handleCreateModalVisible: PropTypes.func,
    startModalVisible: PropTypes.bool,
    confirmLoading: PropTypes.bool,
    startAlcNumObj: PropTypes.object,
    entity: PropTypes.object,
    alcNumData: PropTypes.array
  }

  okHandle = () => {
    const { form, startAlcNumObj, handleSave } = this.props;
    form.validateFields((errors, fieldsValue) => {
      if (errors) return;
      const data = {
        ...fieldsValue
      };
      const upData = {
        jobpointuuid: startAlcNumObj ? startAlcNumObj.uuid : null,
        alcjob: data.jobId
      }
      handleSave(upData);
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
      startModalVisible,
      confirmLoading,
      alcNumData
    } = this.props;

    let title = jobLocale.selectAlcNum;

    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 15 },
    };

    return (
      <Modal
        title={title}
        visible={startModalVisible}
        onOk={this.okHandle}
        confirmLoading={confirmLoading}
        onCancel={() => this.handleCancel()}
        destroyOnClose
      >
        <div>
          <Form>
            <FormItem {...formItemLayout} label={jobLocale.alcNum}>
              {form.getFieldDecorator('jobId', {
                rules: [
                  { required: true, message: notNullLocale(jobLocale.alcNum) }
                ],
                initialValue: null,
              })(<Select placeholder={placeholderChooseLocale(jobLocale.alcNum)}>
                {alcNumData}
              </Select>)}
            </FormItem>
          </Form>
        </div>
      </Modal>
    );
  }
};
export default AlcNumModal;
