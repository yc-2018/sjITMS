/*
 * @Author: Liaorongchang
 * @Date: 2022-06-08 10:39:18
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-11-08 12:32:04
 * @version: 1.0
 */
import React, { PureComponent } from 'react';
import { Button, Input, Col, Row, message, Modal, DatePicker, Spin, Form, Collapse } from 'antd';
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { getBill, findCostFormFieldByPlanUuid } from '@/services/cost/CostCalculation';
import moment from 'moment';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
//继承QuickFormSearchPage Search页面扩展
@Form.create()
export default class CostBillDtlSeacrhPage extends QuickFormSearchPage {
  //需要操作列的显示 将noActionCol设置为false
  state = {
    ...this.state,
    searchLoading: false,
    calculateLoading: false,
    plan: null,
    bill: null,
    isShowLogs: false,
    billLogs: [],
    isLock: null,
  };

  month = moment().format('YYYY-MM');

  componentDidMount() {
    this.handleOnSertch();
    // this.getCostFormFields();
  }
  // componentWillReceiveProps(){
  //   this.handleOnSertch();
  // }
  getCostFormFields = () => {
    findCostFormFieldByPlanUuid(this.props.params.entityUuid).then(result => {
      this.setState({ subjectFields: result.data });
    });
  };

  /**
   * 查询处理
   */
  handleOnSertch = async data => {
    const { PLAN_UUID, BILL_MONTH } = this.props;
    let values = { dateString: BILL_MONTH };
    // this.setState({ searchLoading: true });
    let params = {};
    if (data) {
      data.searchKeyValues = { ...values, ...data.searchKeyValues };
      params = data;
    } else {
      params = {
        page: 1,
        pageSize: 20,
        sortFields: {},
        searchKeyValues: { ...values },
        likeKeyValues: {},
      };
    }
    const response = await getBill(PLAN_UUID, params);
    if (response.data && response.success) {
      const { structs, data, plan, bill } = response.data.records[0];
      let newColumns = [];
      structs.forEach(struct => {
        newColumns.push({
          fieldName: struct.fieldName,
          fieldTxt: struct.fieldTxt,
          fieldType: 'VarChar',
          fieldWidth: 100,
          isSearch: false,
          isShow: true,
        });
      });
      var datas = {
        list: data,
        pagination: {
          total: response.data.pageCount,
          pageSize: response.data.pageSize,
          current: response.data.page,
          showTotal: total => `共 ${total} 条`,
        },
      };
      this.setState({
        key: this.props.quickuuid + new Date(),
        data: datas,
        searchLoading: false,
        bill,
        plan,
      });
      this.initConfig({
        columns: newColumns,
        sql: ' ccc',
        reportHeadName: this.props.TITLE, //this.props.params.TITLE,
      });
    } else {
      message.error('当前查询无数据,请计算后再操作');
      this.setState({ data: [], searchLoading: false, bill: null });
    }
  };

  refreshTable = data => {
    data.page = data.page + 1;
    this.handleOnSertch(data);
  };

  drawcell = e => {
    if (e.column.fieldName == 'modified') {
      e.val = e.val ? '是' : '否';
    }
    if (e.record.modified) {
      e.component = (
        <p3 style={{ color: 'red' }}>{this.convertData(e.val, e.column.preview, e.record)}</p3>
      );
    }
  };

  //该方法会覆盖所有的中间功能按钮
  drawToolbarPanel = () => {
    // return <>
    //   <Button>查看</Button>
    // </>
  };
  onView = () => {
    if (this.state.selectedRows.length == 0) {
      message.info('请选择一条记录');
      return;
    }
    const {
      plan: { subjectKeyField },
      bill: { uuid: billUuid },
    } = this.state;
    const subjectUuid = this.state.selectedRows[0][subjectKeyField];
    this.props.switchTab('view', {
      billUuid,
      subjectUuid,
      view: 'query',
      // entityUuid: this.props.params.entityUuid,
      // e,
    });
  };
  drawTopButton = () => {
    //   return <>
    //   <Button onClick={()=>this.showVilew()}>查看</Button>
    // </>
  }; //扩展最上层按钮
  changeState = () => {
    this.setState({ title: this.props.params.TITLE });
  };

  drawSearchPanel = () => {};

  render() {
    return (
      <div style={{ marginTop: '15px' }}>
        <Spin spinning={this.state.searchLoading}>{this.drawPage()}</Spin>
      </div>
    );
  }
}
