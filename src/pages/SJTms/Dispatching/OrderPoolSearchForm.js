/*
 * @Author: guankongjin
 * @Date: 2022-04-28 10:08:40
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-05-24 14:06:40
 * @Description: 订单池查询面板
 * @FilePath: \iwms-web\src\pages\SJTms\Dispatching\OrderPoolSearchForm.js
 */
import React, { Component } from 'react';
import { Form, Input, Button, Row, Col } from 'antd';
import {
  SimpleTreeSelect,
  SimpleAutoComplete,
  SimpleSelect,
} from '@/pages/Component/RapidDevelopment/CommonComponent';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

@Form.create()
export default class OrderPoolSearchForm extends Component {
  onSearch = event => {
    const { form } = this.props;
    event.preventDefault();
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      let searchKeyValues = {};
      for (let param in fieldsValue) {
        let val = fieldsValue[param];
        if (val == undefined) {
          continue;
        }
        val = val.hasOwnProperty('value') ? val.value : val;
        if (val == null || val == undefined) {
          continue;
        }
        searchKeyValues[param] = val;
      }
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
              {getFieldDecorator('lineCode', { initialValue: '' })(
                <SimpleTreeSelect
                  placeholder="请选择线路"
                  textField="[%CODE%]%NAME%"
                  valueField="CODE"
                  sonField="UUID"
                  parentField="PARENTUUID"
                  queryParams={{ tableName: 'v_sj_tms_line_system' }}
                  showSearch
                  linkFilter={{
                    COMPANYUUID: loginCompany().uuid,
                    DISPATCHCENTERUUID: loginOrg().uuid,
                  }}
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
                  allowClear={true}
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
                  placeholder="请输入送货点编码"
                  textField="[%CODE%]%NAME%"
                  valueField="CODE"
                  searchField="CODE,NAME"
                  linkFilter={{
                    COMPANYUUID: loginCompany().uuid,
                    DISPATCHCENTERUUID: loginOrg().uuid,
                  }}
                  queryParams={{ tableName: 'v_sj_itms_ship_store' }}
                  autoComplete
                  allowClear={true}
                />
              )}
            </Form.Item>
          </Col>
          <Col span={10}>
            <Form.Item label="货主">
              {getFieldDecorator('ownerCode', {})(
                <SimpleAutoComplete
                  placeholder="请输入货主编码"
                  textField="[%CODE%]%NAME%"
                  valueField="CODE"
                  searchField="CODE,NAME"
                  linkFilter={{
                    COMPANYUUID: loginCompany().uuid,
                    DISPATCHCENTERUUID: loginOrg().uuid,
                  }}
                  queryParams={{ tableName: 'sj_itms_owner' }}
                  autoComplete
                  allowClear={true}
                />
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
          </Col>
        </Row>
      </Form>
    );
  }
}
