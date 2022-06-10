/*
 * @Author: Liaorongchang
 * @Date: 2022-06-08 10:39:18
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-06-10 15:36:33
 * @version: 1.0
 */
import React, { PureComponent } from 'react';
import { Table, Button, Input, Col, Row, Popconfirm, message, Modal, List, DatePicker } from 'antd';
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { calculatePlan } from '@/services/cost/CostCalculation';
const { MonthPicker } = DatePicker;

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
//继承QuickFormSearchPage Search页面扩展
export default class CostProjectSearch extends QuickFormSearchPage {
  //需要操作列的显示 将noActionCol设置为false
  state = { ...this.state, dateString: '', downloads: [] }; // noActionCol: false

  comeBack = () => {
    this.props.switchTab('query');
  };

  checkData = () => {
    this.props.switchTab('update', {
      entityUuid: this.props.params.entityUuid,
    });
  };

  calculate = async () => {
    const { dateString } = this.state;
    if (dateString == '') {
      message.error('请选择费用所属月');
      return;
    }
    const uuid = this.props.params.entityUuid;
    let params = {
      planUuid: uuid,
      month: dateString,
    };
    await calculatePlan(params).then(response => {
      console.log('response', response);
    });
  };

  monthChange = (date, dateString) => {
    this.setState({ dateString });
  };

  drawSearchPanel = () => {
    return (
      <Row style={{ marginTop: '10px' }}>
        <Col>
          费用所属月：
          <MonthPicker
            onChange={(date, dateString) => this.monthChange(date, dateString)}
            style={{ width: '15%' }}
          />
          <Button style={{ margin: '0px 10px' }} type="primary" onClick={this.calculate.bind()}>
            计算
          </Button>
          <Button type="primary" onClick={this.checkData.bind()}>
            检查数据
          </Button>
          <Button style={{ margin: '0px 10px' }} onClick={this.comeBack.bind()}>
            返回
          </Button>
        </Col>
      </Row>
    );
  };

  //该方法会覆盖所有的中间功能按钮
  drawToolbarPanel = () => {};
}
