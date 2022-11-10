/*
 * @Author: guankongjin
 * @Date: 2022-04-27 11:24:00
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-11-10 17:41:06
 * @Description: 修改排车单 运输订单明细 整件配送数量
 * @FilePath: \iwms-web\src\pages\SJTms\Dispatching\EditContainerNumberPageF.js
 */
import React, { Component } from 'react';
import { Modal, Form, InputNumber, Select, message } from 'antd';
import { convertCodeName } from '@/utils/utils';
import { modifyNumber } from '@/services/sjitms/ScheduleBill';

@Form.create()
export default class EditContainerNumberPageF extends Component {
  //保存
  handleSave = () => {
    const { order, onCancel, form, updateCartonCount } = this.props;

    form.validateFields((err, fieldsValue) => {
      if (err) return;
      updateCartonCount({ billNumber: order.billNumber, count: fieldsValue });
    });
  };

  render() {
    const { modal, order, visible, onCancel } = this.props;
    const { getFieldDecorator } = this.props.form;
    return (
      <Modal
        visible={visible}
        onOk={() => this.handleSave()}
        onCancel={onCancel}
        destroyOnClose
        centered
        {...modal}
      >
        <Form labelCol={{ span: 8 }} wrapperCol={{ span: 12 }} autoComplete="off">
          <Form.Item label="运输单号">{order.billNumber}</Form.Item>
          <Form.Item label="送货点">{convertCodeName(order.deliveryPoint)}</Form.Item>
          <Form.Item label="整件数（估/实）">
            {order.cartonCount}/{order.stillCartonCount}
          </Form.Item>
          <Form.Item label="本次排车整件数">
            {getFieldDecorator('cartonCount', {
              rules: [{ required: true, message: '请输入排车件数' }],
            })(
              <InputNumber
                placeholder="请输入排车件数"
                min={0}
                style={{ width: '100%' }}
                max={order.stillCartonCount}
              />
            )}
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}
