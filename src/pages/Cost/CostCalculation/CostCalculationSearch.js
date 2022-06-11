/*
 * @Author: Liaorongchang
 * @Date: 2022-06-08 10:39:18
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-06-11 17:09:41
 * @version: 1.0
 */
import React, { PureComponent } from 'react';
import { Table, Button, Input, Col, Row, Popconfirm, message, Modal, List, DatePicker } from 'antd';
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { calculatePlan, getBill } from '@/services/cost/CostCalculation';
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

  handleOnSertch = async () => {
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
    const response = await getBill(params);
    console.log(response);
    if (response && response.success) {
      const { struct, data } = response.data;
      let newColumns = [];
      struct.forEach(data => {
        newColumns.push({
          fieldName: data,
          fieldTxt: data,
          fieldType: 'VarChar',
          fieldWidth: 100,
          isSearch: false,
          isShow: true,
        });
      });
      this.setState({ key: this.props.quickuuid + new Date(), data: data });
      this.initConfig({ columns: newColumns, sql: ' ccc', reportHeadName: '费用计算' });
    } else {
      message.error('查询无数据,请核实后再操作');
    }
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
    await calculatePlan(params).then(cc => {
      console.log('cc', cc);
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
          <Button
            style={{ margin: '0px 10px' }}
            type="primary"
            onClick={this.handleOnSertch.bind()}
          >
            查询
          </Button>
          <Button type="primary" onClick={this.calculate.bind()}>
            计算
          </Button>
          <Button style={{ margin: '0px 10px' }} type="primary" onClick={this.checkData.bind()}>
            检查数据
          </Button>
          <Button onClick={this.comeBack.bind()}>返回</Button>
        </Col>
      </Row>
    );
  };

  //该方法会覆盖所有的中间功能按钮
  drawToolbarPanel = () => {};
}
