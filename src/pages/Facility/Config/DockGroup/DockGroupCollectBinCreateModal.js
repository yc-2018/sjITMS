import React, { PureComponent } from 'react';
import { Form, Input, Modal } from 'antd';
import { placeholderChooseLocale, placeholderLocale } from '@/utils/CommonLocale';
import { dockGroupConfigLocale } from './DockGroupConfigLocale';
import { binScopePattern } from '@/utils/PatternContants';
import DockGroupSelect from '@/pages/Component/Select/DockGroupSelect';

@Form.create()
export default class DockGroupCollectBinCreateModal extends PureComponent {

  constructor(props) {
    super(props);
  }

  okHandle = () => {
    const { form } = this.props;

    form.validateFields((errors, fieldsValue) => {
      if (errors) return;
      this.props.handleSave(fieldsValue);
    });
  };

  handleCancel = () => {
    const { form, handleCreateModalVisible } = this.props;
    form.resetFields();
    handleCreateModalVisible();
  };

  render() {
    const { form, modalVisible, entity } = this.props;
    const { getFieldDecorator } = form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 7 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };

    return (
      <Modal
        title={'保存/修改'}
        visible={modalVisible}
        onOk={this.okHandle}
        onCancel={this.handleCancel}
        destroyOnClose
      >
        <Form {...formItemLayout}>
          <Form.Item label={dockGroupConfigLocale.dockGroup}>
            {getFieldDecorator('dockGroup', {
              initialValue: entity ? entity.dockGroup : null,
              rules: [{ required: true, message: placeholderChooseLocale(dockGroupConfigLocale.dockGroup) }],
            })(<DockGroupSelect autoFocus placeholder={placeholderChooseLocale(dockGroupConfigLocale.dockGroup)}/>)}
          </Form.Item>
          <Form.Item label={dockGroupConfigLocale.collectBinRange}>
            {getFieldDecorator('collectBinRange', {
              initialValue: entity ? entity.collectBinRange : null,
              rules: [{ required: true, message: placeholderLocale(dockGroupConfigLocale.collectBinRange) },
                {
                  pattern: binScopePattern.pattern,
                  message: binScopePattern.message,
                }],
            })(<Input.TextArea rows={4} maxLength={30} showCount={true}  placeholder={placeholderLocale(dockGroupConfigLocale.collectBinRange)}/>)}
          </Form.Item>
        </Form>
      </Modal>
    );
  }
};
