/*
 * @Author: guankongjin
 * @Date: 2022-04-28 10:08:40
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-04-28 10:20:05
 * @Description: 订单池查询面板
 * @FilePath: \iwms-web\src\pages\SJTms\Dispatching\OrderPoolSearchForm.js
 */
import React, { Component } from 'react';
import { Form, Button, Row, Col } from 'antd';
import {
  SimpleTreeSelect,
  SimpleAutoComplete,
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
          <Col span={8}>
            <Form.Item label="线路">
              {getFieldDecorator('shipGroupCode', { initialValue: '' })(
                <SimpleTreeSelect
                  placeholder="请选择线路"
                  textField="[%CODE%]%NAME%"
                  valueField="UUID"
                  parentField="PARENTUUID"
                  queryParams={{ tableName: 'SJ_ITMS_LINE' }}
                  treeDefaultExpandAll={true}
                  multiSave="PARENTUUID:UUID"
                />
              )}
            </Form.Item>
          </Col>
          <Col span={8}>
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
          <Col span={8} style={{ float: 'right' }}>
            <Button
              type={'primary'}
              style={{ marginLeft: 12 }}
              loading={this.props.loading}
              htmlType="submit"
            >
              查询
            </Button>
            <Button style={{ marginLeft: 10 }} onClick={this.handleReset}>
              重置
            </Button>
          </Col>
        </Row>
      </Form>
    );
  }
}
