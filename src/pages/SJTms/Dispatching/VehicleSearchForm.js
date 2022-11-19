/*
 * @Author: guankongjin
 * @Date: 2022-04-28 10:08:40
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-11-19 15:58:53
 * @Description: 订单池查询面板
 * @FilePath: \iwms-web\src\pages\SJTms\Dispatching\VehicleSearchForm.js
 */
import React, { Component } from 'react';
import { Form, Button, Row, Col } from 'antd';
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
      params.push({ field: param, type: 'String', rule: 'eq', val });
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
      <Form onSubmit={this.onSubmit} autoComplete="off">
        <Row justify="space-around">
          <Col span={6}>
            <Form.Item label="代码" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
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
          <Col span={7}>
            <Form.Item label="车牌号" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
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
          <Col span={7}>
            <Form.Item label="组队" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
              {getFieldDecorator('VEHICLEGROUP', {})(
                <SimpleAutoComplete placeholder={'请选择组队'} dictCode="csTeam" noRecord />
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
