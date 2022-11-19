/*
 * @Author: guankongjin
 * @Date: 2022-04-27 11:24:00
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-11-19 18:07:35
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
    carton: 0,
    collectCount: 0,
    collectVolume: 0,
    collectWeight: 0,
  };

  componentWillReceiveProps(nextProps) {
    const { totalData, order } = this.props;
    if (nextProps.order != this.props.order) {
      this.setState({
        carton: order.stillCartonCount,
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
    if (val <= 0) {
      return;
    }
    const result = await this.reCacl(val);
    const { totalData } = this.props;
    this.setState({
      carton: result.cartonCount,
      collectCount: totalData.stillCartonCount - val,
      collectVolume: result.volume,
      collectWeight: result.weight,
    });
  };

  //保存
  handleSave = () => {
    const { form, order, updateCartonCount } = this.props;
    form.validateFields(async (err, fieldsValue) => {
      if (err) return;
      const result = await this.reCacl(fieldsValue.cartonCount);
      updateCartonCount({ billNumber: order.billNumber, ...result });
    });
  };
  reCacl = async cartonCount => {
    const { order, totalData } = this.props;
    let refvolume = order.volume;
    let refweight = order.weight;
    const response = await getContainerByBillUuid(order.uuid);
    if (response.success) {
      const cartonNumber = response.data?.find(x => x.vehicleType == 'Carton');
      if (cartonNumber) {
        refvolume = cartonNumber.realVolume || cartonNumber.forecastVolume;
        refweight = cartonNumber.realWeight || cartonNumber.forecastWeight;
      }
    }
    const bear = (order.stillCartonCount - Number(cartonCount)) / order.stillCartonCount;
    const remVolume = bear * refvolume;
    const remWeight = bear * refweight;
    const volume = Math.round((totalData.volume - (refvolume - remVolume)) * 100) / 100;
    const weight = Math.round(totalData.weight - (refweight - remWeight)) / 1000;
    return {
      remVolume,
      remWeight,
      volume,
      weight,
      cartonCount: order.stillCartonCount - Number(cartonCount),
    };
  };

  render() {
    const { modal, order, visible, onCancel } = this.props;
    const { collectCount, collectVolume, collectWeight, carton } = this.state;
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
            {Number(carton || 0) +
              Number(order.stillScatteredCount || 0) +
              Number(order.stillContainerCount || 0) * 2}
          </Form.Item>
          <Form.Item label="排车单总件数">{collectCount}</Form.Item>
          <Form.Item label="排车单总体积">{collectVolume}</Form.Item>
          <Form.Item label="排车单总重量">{collectWeight}</Form.Item>
        </Form>
      </Modal>
    );
  }
}
