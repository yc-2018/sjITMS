/*
 * @Author: guankongjin
 * @Date: 2022-04-28 10:08:40
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-05-13 15:16:51
 * @Description: 订单池查询面板
 * @FilePath: \iwms-web\src\pages\SJTms\Dispatching\ScheduleSearchForm.js
 */
import React, { Component } from 'react';
import { Form, Button, Row, Col } from 'antd';
import {
  SimpleTreeSelect,
  SimpleAutoComplete,
  SimpleSelect,
} from '@/pages/Component/RapidDevelopment/CommonComponent';

@Form.create()
export default class ScheduleSearchForm extends Component {
  onSearch = event => {
    const { form } = this.props;
    event.preventDefault();
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const searchKeyValues = { orderType: fieldsValue.orderType.value };
      this.props.refresh(searchKeyValues);
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
      <Form
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        onSubmit={this.onSearch}
        autoComplete="off"
      >
        <Row justify="space-around">
          <Col span={9}>
            <Form.Item label="排车单号">
              {getFieldDecorator('deliveryPointCode', {})(
                <SimpleAutoComplete placeholder="请输入排车单号" autoComplete allowClear={false} />
              )}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="门店号/车牌号">
              {getFieldDecorator('orderNumber', {})(
                <SimpleAutoComplete
                  placeholder="请输入门店号/车牌号"
                  autoComplete
                  allowClear={false}
                />
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
            {/* <Button style={{ marginLeft: 10 }} onClick={this.handleReset}>
              重置
            </Button> */}
          </Col>
        </Row>
      </Form>
    );
  }
}
