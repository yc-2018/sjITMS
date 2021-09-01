import React, { PureComponent } from 'react';
import { Form, Modal } from 'antd';
import { convertCodeName } from '@/utils/utils';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import OrgSelect from '@/pages/Component/Select/OrgSelect';
import BinSelect from '@/pages/Component/Select/BinSelect';
import { commonLocale, placeholderLocale, placeholderChooseLocale, notNullLocale } from '@/utils/CommonLocale';
import { storeAllocationLocale } from './StoreAllocationLocale';
import { binUsage } from '@/utils/BinUsage';
import {binScopePattern} from '@/utils/PatternContants';

const FormItem = Form.Item;

@Form.create()
export default class StoreAllocationConfigCreateModal extends PureComponent {
  state = {
    customOptions: []
  }
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
  componentWillReceiveProps(nextProps) {
    const entity = nextProps.entity
    let arr = []
    if (entity && entity.store) {
      arr.push({key: JSON.stringify({uuid: entity.store.uuid, code: entity.store.code, name: entity.store.name}),
        caption: '[' + entity.store.code + ']' + entity.store.name})
    }
    this.setState({
      customOptions: arr
    })
  }
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
    if (entity && entity.uuid) {
      return (
        <Modal
          title={commonLocale.editLocale}
          visible={modalVisible}
          onOk={this.okHandle}
          onCancel={this.handleCancel}
          destroyOnClose
        >
          <Form {...formItemLayout}>
            <Form.Item label={storeAllocationLocale.storeAllocationStore}>
              {getFieldDecorator('store', {
                initialValue: entity ? JSON.stringify(entity.store) : null,
                rules: !entity.uuid ? [{ required: true, message:notNullLocale((storeAllocationLocale.storeAllocationStore)) }] : '',
              })(
                <div>{'['+entity.store.code+']'+entity.store.name}</div>)}
            </Form.Item>
            <Form.Item label={storeAllocationLocale.storeAllocationAllocation} >
              {getFieldDecorator('binCode', {
                initialValue: entity ? entity.binCode : null,
                rules: [{ required: true, message: notNullLocale(storeAllocationLocale.storeAllocationAllocation) }],
              })(<BinSelect usage={binUsage.StoreAllocateBin.name} placeholder={placeholderChooseLocale(storeAllocationLocale.storeAllocationAllocation)}/>)}
            </Form.Item>
          </Form>
        </Modal>
      );
    } else {
      return (
        <Modal
          title={commonLocale.createLocale}
          visible={modalVisible}
          onOk={this.okHandle}
          onCancel={this.handleCancel}
          destroyOnClose
        >
          <Form {...formItemLayout}>
            <Form.Item label={storeAllocationLocale.storeAllocationStore}>
              {getFieldDecorator('store', {
                initialValue: entity ? JSON.stringify(entity.store) : null,
                rules: (entity && !entity.uuid) ? [{ required: true, message:notNullLocale((storeAllocationLocale.storeAllocationStore)) }] : '',
              })(
                <OrgSelect autoFocus type={'STORE'} state={'ONLINE'} customOptions={this.state.customOptions} upperUuid={loginCompany().uuid} placeholder={placeholderChooseLocale(storeAllocationLocale.storeAllocationStore)}/>)}
            </Form.Item>
            <Form.Item label={storeAllocationLocale.storeAllocationAllocation} >
              {getFieldDecorator('binCode', {
                initialValue: entity ? entity.binCode : null,
                rules: [{ required: true, message: notNullLocale(storeAllocationLocale.storeAllocationAllocation) }],
              })(<BinSelect usage={binUsage.StoreAllocateBin.name} placeholder={placeholderChooseLocale(storeAllocationLocale.storeAllocationAllocation)}/>)}
            </Form.Item>
          </Form>
        </Modal>
      );
    }
  }
};
