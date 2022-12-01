/*
 * @Author: Liaorongchang
 * @Date: 2022-11-11 15:02:14
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-12-01 11:09:43
 * @version: 1.0
 */
import React, { Component } from 'react';
import { Modal, Form, InputNumber, Input, message } from 'antd';
import { vehicleApply } from '@/services/sjitms/VehicleWeight';

@Form.create()
export default class CreatePageModal extends Component {
  state = {
    saving: false,
    visible: false,
  };

  componentDidMount = () => {
    this.props.onRef && this.props.onRef(this);
  };

  show = () => {
    this.setState({ visible: true });
  };

  hide = () => {
    this.setState({ visible: false });
  };

  //保存申请调吨
  onSavedApplyWeight = async fieldsValue => {
    const { savedRowKeys } = this.props;
    let payload = {
      scheduleUuid: savedRowKeys,
      applyWeight: fieldsValue.applyWeight,
      applyNote: fieldsValue.applyNote,
    };
    const response = await vehicleApply(payload);
    if (response && response.success) {
      message.success('发起成功!');
      this.setState({ visible: false });
    }
  };

  render() {
    const { visible } = this.state;
    const { getFieldDecorator } = this.props.form;
    const { savedRowKeys, maxAdjustWeight } = this.props;
    let adjustWeight = maxAdjustWeight == undefined ? null : maxAdjustWeight / 1000;
    return (
      <Modal
        title="申请调吨"
        visible={visible}
        key={savedRowKeys}
        onOk={() => {
          this.props.form.validateFields((err, fieldsValue) => {
            if (err) {
              return;
            }
            this.onSavedApplyWeight(fieldsValue);
          });
        }}
        onCancel={() => {
          this.setState({ visible: false });
        }}
      >
        <Form>
          <Form.Item label="申请调限吨位:" labelCol={{ span: 6 }} wrapperCol={{ span: 15 }}>
            {getFieldDecorator('applyWeight', {
              initialValue: adjustWeight,
              rules: [{ required: true, message: '申请调限吨位' }],
            })(<InputNumber style={{ width: '100%' }} />)}
          </Form.Item>
          <Form.Item labelCol={{ span: 6 }} wrapperCol={{ span: 15 }} label="超限原因说明">
            {getFieldDecorator('applyNote', { initialValue: '区域货重，需调整限重排车' })(
              <Input />
            )}
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}
