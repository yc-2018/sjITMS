import React, { PureComponent } from 'react';
import { Form, Input, TimePicker, Modal, Select, Row, Col, message } from 'antd';
import moment from 'moment';
import { formatMessage } from 'umi/locale';
import DockGroupSelect from '@/pages/Component/Select/DockGroupSelect';
import { convertCodeName } from '@/utils/utils';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import CFormItem from '@/pages/Component/Form/CFormItem';
import CategorySelect from '@/pages/Component/Select/CategorySelect';
import OrgSelect from '@/pages/Component/Select/OrgSelect';
import PreTypeSelect from '@/pages/Component/Select/PreTypeSelect';
import { PRETYPE } from '@/utils/constants';
import { deliverycycleLocale } from '../DeliverycycleLocale'
import {
  commonLocale,
  placeholderLocale,
  placeholderChooseLocale,
  notNullLocale,
} from '@/utils/CommonLocale';

const format = 'HH:mm';
const FormItem = Form.Item;

@Form.create()
export default class StoreDeliverycycleCreateModal extends PureComponent {

  state = {
    showStore: true,
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.entity.uuid) {
      this.setState({
        showStore: false
      })
    } else {
      this.setState({
        showStore: true
      })
    }
  }

  okHandle = () => {
    const { form } = this.props;
    const { showStore } = this.state;
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

    const { showStore } = this.state;

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

    let timeRange = entity ? entity.timeRange : '';
    let timeRangeArr = [];
    if (timeRange) {
      timeRangeArr = timeRange.split('\-');
    }
    let title = entity.uuid ? deliverycycleLocale.deliverycycleEditStoreDeliverycycle : deliverycycleLocale.deliverycycleAddStoreDeliverycycle;
    return (
      <Modal
        title={title}
        visible={modalVisible}
        onOk={this.okHandle}
        onCancel={this.handleCancel}
        destroyOnClose
      >
        <Form {...formItemLayout}>
          <Form.Item label={deliverycycleLocale.deliverycycleStoreName} style={{ display: showStore ? 'block' : 'none' }}>
            {getFieldDecorator('stores', {
              rules: [{ required: showStore, message: notNullLocale(deliverycycleLocale.deliverycycleSelectStoreDeliverycycle) }],
            })(
              <OrgSelect
                autoFocus
                showSearch
                placeholder={deliverycycleLocale.deliverycycleSelectStoreDeliverycycle}
                upperUuid={loginCompany().uuid}
                type={'STORE'}
                mode="multiple"
              />)}
          </Form.Item>

          <Form.Item label={deliverycycleLocale.deliverycycleMon}>
            {getFieldDecorator('mons', {
              initialValue: entity ? entity.mon && entity.mon.split(",") : null,
              rules: [{ required: false, }],
            })(
              <PreTypeSelect mode="multiple" placeholder={placeholderChooseLocale("")} preType={PRETYPE.deliverycycleType} />)}
          </Form.Item>

          <Form.Item label={deliverycycleLocale.deliverycycleTues}>
            {getFieldDecorator('tuess', {
              initialValue: entity ? entity.tues && entity.tues.split(",") : null,
              rules: [{ required: false, }],
            })(
              <PreTypeSelect mode="multiple" placeholder={placeholderChooseLocale("")} preType={PRETYPE.deliverycycleType} />)}
          </Form.Item>

          <Form.Item label={deliverycycleLocale.deliverycycleWed}>
            {getFieldDecorator('weds', {
              initialValue: entity ? entity.wed && entity.wed.split(",") : null,
              rules: [{ required: false, }],
            })(
              <PreTypeSelect mode="multiple" placeholder={placeholderChooseLocale("")} preType={PRETYPE.deliverycycleType} />)}
          </Form.Item>

          <Form.Item label={deliverycycleLocale.deliverycycleThur}>
            {getFieldDecorator('thurs', {
              initialValue: entity ? entity.thur && entity.thur.split(",") : null,
              rules: [{ required: false, }],
            })(
              <PreTypeSelect mode="multiple" placeholder={placeholderChooseLocale("")} preType={PRETYPE.deliverycycleType} />)}
          </Form.Item>

          <Form.Item label={deliverycycleLocale.deliverycycleFri}>
            {getFieldDecorator('fris', {
              initialValue: entity ? entity.fri && entity.fri.split(",") : null,
              rules: [{ required: false, }],
            })(
              <PreTypeSelect mode="multiple" placeholder={placeholderChooseLocale("")} preType={PRETYPE.deliverycycleType} />)}
          </Form.Item>

          <Form.Item label={deliverycycleLocale.deliverycycleSat}>
            {getFieldDecorator('sats', {
              initialValue: entity ? entity.sat && entity.sat.split(",") : null,
              rules: [{ required: false, }],
            })(
              <PreTypeSelect mode="multiple" placeholder={placeholderChooseLocale("")} preType={PRETYPE.deliverycycleType} />)}
          </Form.Item>

          <Form.Item label={deliverycycleLocale.deliverycycleSun}>
            {getFieldDecorator('suns', {
              initialValue: entity ? entity.sun && entity.sun.split(",") : null,
              rules: [{ required: false, }],
            })(
              <PreTypeSelect mode="multiple" placeholder={placeholderChooseLocale("")} preType={PRETYPE.deliverycycleType} />)}
          </Form.Item>
        </Form>
      </Modal>
    );
  }
};
