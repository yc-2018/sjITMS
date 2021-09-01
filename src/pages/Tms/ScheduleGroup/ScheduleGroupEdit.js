import React, { PureComponent } from 'react';
import { Form, Input, Modal } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import { commonLocale, notNullLocale, tooLongLocale, placeholderLocale } from '@/utils/CommonLocale';
import { codePattern } from '@/utils/PatternContants';
import selectedSerialArch from '../../../../config/router.config';

const FormItem = Form.Item;
@Form.create()

export default class ScheduleGroupEdit extends PureComponent {

  okHandle = () => {
    const {
      form,
      handleSaveScheduleGroup,
      handleCreateModalVisible,
      selectedScheduleGroup,
      showGroup
    } = this.props;
    form.validateFields((errors, fieldsValue) => {
      if (errors) return;
      const data = {
        uuid:showGroup && selectedScheduleGroup ? selectedScheduleGroup.uuid : '',
        scheduleGroupNum: showGroup && selectedScheduleGroup ? selectedScheduleGroup.scheduleGroupNum : '',
        ...fieldsValue
      };

      handleSaveScheduleGroup(data);
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
      form,
      createModalVisible,
      confirmLoading,
      selectedScheduleGroup,
      showGroup
    } = this.props;
    let title = showGroup ? '编辑描述' : '添加描述';
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
            {showGroup ? <FormItem {...formItemLayout} label={'排车组号'}>
              {
                selectedScheduleGroup ? selectedScheduleGroup.scheduleGroupNum : undefined
              }
            </FormItem> : null}
            <FormItem {...formItemLayout} label={'描述'}>
              {form.getFieldDecorator('note', {
                rules: [
                  {
                    max: 255,
                    message: tooLongLocale('描述', 255),
                  },
                ],
                initialValue: selectedScheduleGroup ? selectedScheduleGroup.note : null,
              })(<TextArea autoFocus placeholder={placeholderLocale('描述')} />)}
            </FormItem>
          </Form>
        </div>
      </Modal>
    );
  }
};
