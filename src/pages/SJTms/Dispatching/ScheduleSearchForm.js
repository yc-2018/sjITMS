/*
 * @Author: guankongjin
 * @Date: 2022-04-28 10:08:40
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-05-17 15:26:13
 * @Description: 订单池查询面板
 * @FilePath: \iwms-web\src\pages\SJTms\Dispatching\ScheduleSearchForm.js
 */
import React, { Component } from 'react';
import { Form, Button, Row, Col, Input } from 'antd';

@Form.create()
export default class ScheduleSearchForm extends Component {
  onSearch = event => {
    const { form } = this.props;
    event.preventDefault();
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      console.log(fieldsValue);
      this.props.refresh(fieldsValue);
    });
  };
  //重置
  handleReset = () => {
    this.props.form.resetFields();
    this.props.refresh();
  };
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.onSearch} autoComplete="off">
        <Row justify="space-around">
          <Col span={9}>
            <Form.Item label="排车单号" labelCol={{ span: 10 }} wrapperCol={{ span: 14 }}>
              {getFieldDecorator('billNumber', {})(
                <Input placeholder="请输入排车单号" autoComplete allowClear />
              )}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="门店号/车牌号/司机" labelCol={{ span: 12 }} wrapperCol={{ span: 12 }}>
              {getFieldDecorator('code', {})(
                <Input placeholder="请输入门店号/车牌号/司机" autoComplete allowClear />
              )}
            </Form.Item>
          </Col>
          <Col span={3}>
            <Button
              type={'primary'}
              style={{ marginLeft: 12 }}
              loading={this.props.loading}
              htmlType="submit"
            >
              查询
            </Button>
          </Col>
        </Row>
      </Form>
    );
  }
}
