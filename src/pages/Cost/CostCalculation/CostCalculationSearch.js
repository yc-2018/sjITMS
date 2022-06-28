/*
 * @Author: Liaorongchang
 * @Date: 2022-06-08 10:39:18
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-06-17 15:43:14
 * @version: 1.0
 */
import React, { PureComponent } from 'react';
import { Table, Button, Input, Col, Row, Popconfirm, message, Modal, List, DatePicker } from 'antd';
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { calculatePlan, getBill } from '@/services/cost/CostCalculation';
const { MonthPicker } = DatePicker;
import moment from 'moment';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
//继承QuickFormSearchPage Search页面扩展
export default class CostProjectSearch extends QuickFormSearchPage {
  //需要操作列的显示 将noActionCol设置为false
  state = {
    ...this.state,
    dateString:
      this.props.params.dateString == undefined
        ? moment().format('YYYY-MM')
        : this.props.params.dateString,
  };

  comeBack = () => {
    this.props.switchTab('query');
  };

  checkData = () => {
    const { dateString } = this.state;
    const { e } = this.props.params;
    if (dateString == '') {
      message.error('请选择费用所属月');
      return;
    }

    const startDate =
      moment(dateString)
        .add(e.START_DATE, 'month')
        .format('YYYY-MM') +
      '-' +
      e.START_DAY;

    const endDate =
      moment(dateString)
        .add(e.END_DATE, 'month')
        .format('YYYY-MM') +
      '-' +
      e.END_DAY;

    this.props.switchTab('update', {
      entityUuid: this.props.params.entityUuid,
      dateString,
      dateInterval: [startDate, endDate],
      e,
    });
  };

  edit = () => {
    const { selectedRows } = this.state;
    console.log(this.state);
    // if (selectedRows.length == 0) {
    //   message.error('请选择一条数据');
    //   return;
    // }
    // 拿到主键
    this.props.switchTab('create');
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
    if (response.data && response.success) {
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
      this.setState({
        key: this.props.quickuuid + new Date(),
        data: data,
      });
      this.initConfig({
        columns: newColumns,
        sql: ' ccc',
        reportHeadName: this.props.params.e.SCHEME_NAME,
      });
    } else {
      message.error('查询无数据,请核实后再操作');
      this.setState({ data: [] });
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
    await calculatePlan(params).then(response => {
      if (response && response.success) {
        message.success('计算成功');
        this.handleOnSertch();
      }
    });
  };

  monthChange = (date, dateString) => {
    this.setState({ dateString });
  };

  drawSearchPanel = () => {
    const { dateString } = this.state;
    return (
      <Row style={{ marginTop: '10px' }}>
        <Col>
          费用所属月：
          <MonthPicker
            defaultValue={moment(
              dateString == undefined ? moment().format('YYYY-MM') : dateString,
              'YYYY-MM'
            )}
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
          <Button style={{ margin: '0px 10px' }} type="primary" onClick={this.edit.bind()}>
            编辑
          </Button>
          <Button onClick={this.comeBack.bind()}>返回</Button>
        </Col>
      </Row>
    );
  };

  //该方法会覆盖所有的中间功能按钮
  drawToolbarPanel = () => {};

  changeState = () => {
    this.setState({ title: this.props.params.e.SCHEME_NAME });
  };
}
