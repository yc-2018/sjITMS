/*
 * @Author: guankongjin
 * @Date: 2022-04-28 10:08:40
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-12-02 14:56:19
 * @Description: 订单池查询面板
 * @FilePath: \iwms-web\src\pages\SJTms\Dispatching\VehicleSearchForm.js
 */
import React, { Component } from 'react';
import { Form, Button, Row, Col, Input } from 'antd';
import {
  SimpleSelect,
  SimpleAutoComplete,
} from '@/pages/Component/RapidDevelopment/CommonComponent';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
@Form.create()
export default class VehicleSearchForm extends Component {
  state = {
    quickuuid: 'v_sj_itms_vehicle_stat',
    isOrgQuery: [
      { field: 'COMPANYUUID', type: 'VarChar', rule: 'eq', val: loginCompany().uuid },
      { field: 'DISPATCHCENTERUUID', type: 'VarChar', rule: 'eq', val: loginOrg().uuid },
    ],
  };
  onSubmit = event => {
    const { form } = this.props;
    event.preventDefault();
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      this.onSearch(fieldsValue);
    });
  };
  //查询
  onSearch = async searchParam => {
    let params = new Array();
    for (let param in searchParam) {
      let val = searchParam[param];
      if (val == null || val == undefined) {
        continue;
      }
      params.push({ field: param, type: 'String', rule: 'like', val });
    }
    await this.props.refresh(params);
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
        onSubmit={this.onSubmit}
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        autoComplete="off"
      >
        <Row justify="start">
          <Col span={10}>
            <Form.Item label="代码">
              {getFieldDecorator('CODE', {})(
                <SimpleSelect
                  placeholder="请输入车辆代码"
                  showSearch
                  allowClear
                  reportCode={this.state.quickuuid}
                  searchField={{ fieldName: 'CODE', fieldType: 'String' }}
                  isOrgQuery={this.state.isOrgQuery}
                />
              )}
            </Form.Item>
          </Col>
          <Col span={10}>
            <Form.Item label="车牌号">
              {getFieldDecorator('PLATENUMBER', {})(
                <SimpleSelect
                  placeholder="请输入车牌号"
                  showSearch
                  allowClear
                  reportCode={this.state.quickuuid}
                  searchField={{ fieldName: 'PLATENUMBER', fieldType: 'String' }}
                  isOrgQuery={this.state.isOrgQuery}
                />
              )}
            </Form.Item>
          </Col>
          <Col span={10}>
            <Form.Item label="组队">
              {getFieldDecorator('VEHICLEGROUP', {})(
                <SimpleAutoComplete placeholder="请选择组队" dictCode="csTeam" noRecord />
              )}
            </Form.Item>
          </Col>
          <Col span={10}>
            <Form.Item label="配送区域">
              {getFieldDecorator('SHIPAREANAME', {})(
                <Input placeholder="请输入配送区域" allowClear />
              )}
            </Form.Item>
          </Col>
          <Col span={2}>
            <Button
              type={'primary'}
              style={{ marginLeft: 15 }}
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
