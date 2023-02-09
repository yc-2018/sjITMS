/*
 * @Author: guankongjin
 * @Date: 2022-04-27 11:24:00
 * @LastEditors: guankongjin
 * @LastEditTime: 2023-02-09 12:34:24
 * @Description: 修改排车单 运输订单明细 整件配送数量
 * @FilePath: \iwms-web\src\pages\SJTms\Dispatching\EditContainerNumberPageF.js
 */
import React, { Component } from 'react';
import { Modal, Form, InputNumber } from 'antd';
import { convertCodeName } from '@/utils/utils';
import { getContainerByBillUuid } from '@/services/sjitms/OrderBill';

@Form.create()
export default class EditContainerNumberPageF extends Component {
  state = {
    delCarton: 0,
    collectCount: 0,
    collectVolume: 0,
    collectWeight: 0,
    remVolume: 0,
    remWeight: 0,
  };

  componentWillReceiveProps(nextProps) {
    const { totalData } = this.props;
    if (nextProps.totalData != this.props.totalData) {
      this.setState({
        delCarton: 0,
        collectCount:
          totalData.stillCartonCount +
          totalData.stillScatteredCount +
          totalData.stillContainerCount * 2,
        collectVolume: Math.round(totalData.volume * 100) / 100,
        collectWeight: Math.round(totalData.weight) / 1000,
      });
    }
  }

  onChange = async val => {
    if (val < 0) {
      return;
    }
    const result = await this.reCacl(val);
    const { totalData } = this.props;
    this.setState({
      delCarton: val,
      collectCount: totalData.stillCartonCount - val,
      collectVolume: result.volume,
      collectWeight: result.weight,
      remVolume: result.remVolume,
      remWeight: result.remWeight,
    });
  };

  //保存
  handleSave = () => {
    const { form, order, updateCartonCount } = this.props;
    const { remVolume, remWeight, collectWeight, collectVolume } = this.state;
    form.validateFields(async (err, fieldsValue) => {
      if (err) return;
      updateCartonCount({
        billNumber: order.billNumber,
        remVolume,
        remWeight,
        volume: collectVolume,
        weight: collectWeight,
        cartonCount: order.stillCartonCount - Number(fieldsValue.cartonCount),
      });
    });
  };
  reCacl = async cartonCount => {
    const { order, totalData } = this.props;
    let cartonVolume = order.volume;
    let cartonWeight = order.weight;
    let totalCartonCount = order.cartonCount;
    const response = await getContainerByBillUuid(order.uuid);
    if (response.success) {
      const cartonNumber = response.data?.find(x => x.vehicleType == 'Carton');
      if (cartonNumber) {
        cartonVolume = cartonNumber.realVolume || cartonNumber.forecastVolume;
        cartonWeight = cartonNumber.realWeight || cartonNumber.forecastWeight;
        totalCartonCount = cartonNumber.realCount || cartonNumber.forecastCount;
      }
    }
    const delVolume = (Number(cartonCount) / totalCartonCount) * cartonVolume;
    const delWeight = (Number(cartonCount) / totalCartonCount) * cartonWeight;
    const volume = Math.round((totalData.volume - delVolume) * 100) / 100;
    const weight = Math.round(totalData.weight - delWeight) / 1000;
    return {
      remVolume: Math.round((order.volume - delVolume) * 100) / 100,
      remWeight: Math.round((order.weight - delWeight) * 1000) / 1000,
      volume,
      weight,
      cartonCount: order.stillCartonCount - Number(cartonCount),
    };
  };

  render() {
    const { modal, order, totalData, visible, onCancel } = this.props;
    const { collectVolume, collectWeight, delCarton } = this.state;
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
          <Form.Item label="整件数">{order.stillCartonCount}</Form.Item>
          <Form.Item label="本次剔出整件数">
            {getFieldDecorator('cartonCount', {
              rules: [{ required: true, message: '请输入本次剔出整件数' }],
            })(
              <InputNumber
                placeholder="请输入本次剔出整件数"
                min={0}
                style={{ width: '100%' }}
                onChange={val => this.onChange(val)}
                max={order.stillCartonCount}
              />
            )}
          </Form.Item>
          <Form.Item label="散件数">{order.stillScatteredCount}</Form.Item>
          <Form.Item label="周转筐">{order.stillContainerCount}</Form.Item>
          <Form.Item label="总件数">
            {Number(order.stillCartonCount) -
              Number(delCarton) +
              Number(order.stillScatteredCount) +
              Number(order.stillContainerCount) * 2}
          </Form.Item>
          <Form.Item label="排车单总件数">
            {Number(totalData.stillCartonCount) -
              Number(delCarton) +
              Number(totalData.stillScatteredCount) +
              Number(totalData.stillContainerCount) * 2}
          </Form.Item>
          <Form.Item label="排车单总体积">{collectVolume}</Form.Item>
          <Form.Item label="排车单总重量">{collectWeight}</Form.Item>
        </Form>
      </Modal>
    );
  }
}
