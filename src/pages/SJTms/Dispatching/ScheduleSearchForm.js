/*
 * @Author: guankongjin
 * @Date: 2022-04-28 10:08:40
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-11-17 12:03:42
 * @Description: 订单池查询面板
 * @FilePath: \iwms-web\src\pages\SJTms\Dispatching\ScheduleSearchForm.js
 */
import React, { Component } from 'react';
import { Form, Button, Row, Col, Input } from 'antd';
import { SimpleAutoComplete } from '@/pages/Component/RapidDevelopment/CommonComponent';
import { loginUser } from '@/utils/LoginContext';

@Form.create()
export default class ScheduleSearchForm extends Component {
  componentDidMount() {}
  onSearch = event => {
    const { form } = this.props;
    event.preventDefault();
    form.validateFields((err, fieldsValue) => {
      if (err) return;
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
    const { users } = this.props;
    const creatorParam = {
      textField: '%name%',
      valueField: 'uuid',
      label: 'name',
      sourceData: users,
      searchField: 'code,name',
      mode: 'multiple',
      multipleSplit: ',',
      maxTagCount: 2,
    };
    return (
      <Form onSubmit={this.onSearch} autoComplete="off">
        <Row justify="space-around">
          <Col span={6}>
            <Form.Item label="单号" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
              {getFieldDecorator('billNumber', {})(
                <Input placeholder="请输入排车单号" autoComplete allowClear />
              )}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="门店/车牌/司机" labelCol={{ span: 12 }} wrapperCol={{ span: 12 }}>
              {getFieldDecorator('code', {})(
                <Input placeholder="请输入门店/车牌/司机" autoComplete allowClear />
              )}
            </Form.Item>
          </Col>
          <Col span={7}>
            <Form.Item label="创建人" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
              {getFieldDecorator('creatorId', { initialValue: loginUser().uuid })(
                <SimpleAutoComplete
                  placeholder={'请选择请选择创建人'}
                  searchField={'creatorId'}
                  noRecord
                  {...creatorParam}
                />
              )}
            </Form.Item>
          </Col>
          <Col span={2}>
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
