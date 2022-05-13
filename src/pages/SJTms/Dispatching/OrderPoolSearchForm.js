/*
 * @Author: guankongjin
 * @Date: 2022-04-28 10:08:40
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-05-13 09:36:32
 * @Description: 订单池查询面板
 * @FilePath: \iwms-web\src\pages\SJTms\Dispatching\OrderPoolSearchForm.js
 */
import React, { Component } from 'react';
import { Form, Button, Row, Col } from 'antd';
import {
  SimpleTreeSelect,
  SimpleAutoComplete,
  SimpleSelect,
} from '@/pages/Component/RapidDevelopment/CommonComponent';

@Form.create()
export default class OrderPoolSearchForm extends Component {
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
          <Col span={10}>
            <Form.Item label="线路">
              {getFieldDecorator('shipGroupCode', { initialValue: '' })(
                <SimpleTreeSelect
                  placeholder="请选择线路"
                  textField="[%CODE%]%NAME%"
                  valueField="UUID"
                  parentField="PARENTUUID"
                  queryParams={{ tableName: 'sj_itms_line' }}
                  treeDefaultExpandAll={true}
                  multiSave="PARENTUUID:UUID"
                />
              )}
            </Form.Item>
          </Col>
          <Col span={10}>
            <Form.Item label="单据类型">
              {getFieldDecorator('orderType', { initialValue: 'Delivery' })(
                <SimpleAutoComplete
                  placeholder="请选择单据类型"
                  dictCode="orderType"
                  allowClear={false}
                />
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row justify="space-around">
          <Col span={10}>
            <Form.Item label="送货点">
              {getFieldDecorator('deliveryPointCode', {})(
                <SimpleAutoComplete
                  placeholder="请输入送货点"
                  dictCode="deliveryPointCode"
                  autoComplete
                  allowClear={false}
                />
              )}
            </Form.Item>
          </Col>
          <Col span={10}>
            <Form.Item label="订单号">
              {getFieldDecorator('orderNumber', {})(
                <SimpleSelect placeholder="请输入订单号" allowClear={false} />
              )}
            </Form.Item>
          </Col>
          <Col span={4}>
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
