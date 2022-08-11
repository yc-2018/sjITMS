/*
 * @Author: Liaorongchang
 * @Date: 2022-06-08 10:39:18
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-08-10 10:41:30
 * @version: 1.0
 */
import React, { PureComponent } from 'react';
import { Button, Input, Col, Row, message, Modal, DatePicker, Spin, Form, Collapse } from 'antd';
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { getBillBak, findCostFormFieldByPlanUuid } from '@/services/cost/CostCalculation';
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
    isNotHd: true,
  };

  month = moment().format('YYYY-MM');

  componentDidMount() {
    this.handleOnSertch();
    // this.getCostFormFields();
  }

  getCostFormFields = () => {
    findCostFormFieldByPlanUuid(this.props.params.entityUuid).then(result => {
      this.setState({ subjectFields: result.data });
    });
  };

  /**
   * 查询处理
   */
  handleOnSertch = async data => {
    let values = this.props.form.getFieldsValue();
    const { BILL_NUMBER, BILL_MONTH } = this.props.params;
    values.dateString = BILL_MONTH;
    for (const i in values) {
      if (values[i] == '') {
        delete values[i];
      }
    }
    this.setState({ searchLoading: true });
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
    const response = await getBillBak(BILL_NUMBER, params);
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
        reportHeadName: this.props.params.TITLE,
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
  drawToolbarPanel = () => {};

  changeState = () => {
    this.setState({ title: this.props.params.TITLE });
  };

  drawSearchPanel = () => {
    // const { getFieldDecorator } = this.props.form;
    // const { dateString } = this.state;
    // let node = [];
    // node.push(
    //   <Form.Item label="费用所属月">
    //     {getFieldDecorator('dateString', {
    //       initialValue: moment(
    //         dateString == undefined ? moment().format('YYYY-MM') : dateString,
    //         'YYYY-MM'
    //       ),
    //     })(
    //       <MonthPicker
    //         placeholder=""
    //         onChange={(date, dateString) => this.monthChange(date, dateString)}
    //       />
    //     )}
    //   </Form.Item>
    // );
    // let searchFields = this.state.subjectFields
    //   ? this.state.subjectFields.map(item => {
    //       return (
    //         <Form.Item label={item.DB_FIELD_TXT}>
    //           {getFieldDecorator(item.DB_FIELD_NAME, { initialValue: '' })(<Input />)}
    //         </Form.Item>
    //       );
    //     })
    //   : [];
    // node = [...node, ...searchFields];
    // node.push(
    //   <Form.Item>
    //     <Button type="primary" onClick={() => this.handleOnSertch()}>
    //       查询
    //     </Button>
    //     <Button style={{ margin: '0px 10px' }} type="primary" onClick={this.edit.bind()}>
    //       编辑
    //     </Button>
    //     <Button onClick={this.comeBack.bind()}>返回</Button>
    //   </Form.Item>
    // );
    // return (
    //   <Row style={{ marginTop: '10px' }}>
    //     <Col>
    //       <Form layout="inline">
    //         {node.map(e => {
    //           return e;
    //         })}
    //       </Form>
    //     </Col>
    //   </Row>
    // );
  };

  // render() {
  //   return <Spin spinning={this.state.searchLoading}>{this.drawPage()}</Spin>;
  // }
}
