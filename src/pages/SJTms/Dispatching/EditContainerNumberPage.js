/*
 * @Author: guankongjin
 * @Date: 2022-04-27 11:24:00
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-05-10 16:33:14
 * @Description: 修改排车单 运输订单明细 整件配送数量
 * @FilePath: \iwms-web\src\pages\SJTms\Dispatching\EditContainerNumberPage.js
 */
import React, { Component } from 'react';
import { Modal, Form, InputNumber, Select, message } from 'antd';
import { convertCodeName } from '@/utils/utils';
import { modifyNumber } from '@/services/sjitms/ScheduleBill';

@Form.create()
export default class EditContainerNumberPage extends Component {
  //保存
  handleSave = () => {
    const { scheduleDetail, onCancel, form } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      modifyNumber(scheduleDetail.uuid, fieldsValue.cartonCount).then(response => {
        if (response.success) {
          message.success('保存成功！');
          this.props.refresh();
          onCancel();
        }
      });
    });
  };

  render() {
    const { modal, scheduleDetail, visible, onCancel } = this.props;
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
          <Form.Item label="排车单号">{scheduleDetail.billNumber}</Form.Item>
          <Form.Item label="门店">{convertCodeName(scheduleDetail.deliveryPoint)}</Form.Item>
          <Form.Item label="整件数（估/实）">
            {scheduleDetail.cartonCount}/{scheduleDetail.realCartonCount}
          </Form.Item>
          <Form.Item label="排车整件数">
            {getFieldDecorator('cartonCount', {
              rules: [{ required: true, message: '请输入修改数量' }],
            })(
              <InputNumber
                placeholder="请输入修改数量"
                min={0}
                style={{ width: '100%' }}
                max={scheduleDetail.realCartonCount}
              />
            )}
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}
