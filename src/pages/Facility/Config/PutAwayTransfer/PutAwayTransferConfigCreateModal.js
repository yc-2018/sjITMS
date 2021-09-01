import React, { PureComponent } from 'react';
import { Form, Modal, message, Input,Tooltip,Icon } from 'antd';
import { formatMessage } from 'umi/locale';
import BinSelect from '@/pages/Component/Select/BinSelect';
import { commonLocale, placeholderChooseLocale, placeholderLocale } from '@/utils/CommonLocale';
import { putAwayTransferLocale } from './PutAwayTransferLocale';
import { binUsage } from '@/utils/BinUsage';
import {binScopePattern} from '@/utils/PatternContants';


@Form.create()
export default class PutAwayTransferConfigCreateModal extends PureComponent {

  okHandle = () => {
    const { form } = this.props;

    form.validateFields((errors, fieldsValue) => {
      if (errors) return;
      this.props.handleSaveOrModify(fieldsValue);
    });
  };

  handleCancel = () => {
    const { form, handleCreateModalVisible } = this.props;
    form.resetFields();
    handleCreateModalVisible();
  };

  render() {
    const {
      form,
      modalVisible,
      entity,
    } = this.props;
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
        title={entity.uuid ? commonLocale.editLocale:commonLocale.createLocale}
        visible={modalVisible}
        onOk={this.okHandle}
        onCancel={this.handleCancel}
        destroyOnClose
      >
        <Form {...formItemLayout}>
           <Form.Item label={putAwayTransferLocale.binCode} >
            {getFieldDecorator('binCode', {
              initialValue: entity.binCode ? entity.binCode : undefined,
              rules: [{ required: true, message: placeholderChooseLocale() }],
            })(<BinSelect autoFocus usage={binUsage.PickTransitBin.name} placeholder={placeholderLocale(putAwayTransferLocale.binCode)}/>)}
          </Form.Item> 
          <Form.Item label={(
            <span>
              {putAwayTransferLocale.binRange}&nbsp;
          <Tooltip title={binScopePattern.message}>
                <Icon type="info-circle" />
              </Tooltip></span>)}>
            {getFieldDecorator('binRange', {
              initialValue: entity ? entity.binRange : undefined,
              rules: [{ required: true, message: placeholderLocale(putAwayTransferLocale.binRange) },
                {
                  pattern: binScopePattern.pattern,
                  message: binScopePattern.message,
                }],
            })(<Input placeholder= {placeholderLocale(putAwayTransferLocale.binRange)} />)}
          </Form.Item>
        </Form>
      </Modal>
    );
  }
};
