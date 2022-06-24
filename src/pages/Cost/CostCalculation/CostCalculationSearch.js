/*
 * @Author: Liaorongchang
 * @Date: 2022-06-08 10:39:18
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-06-24 11:16:38
 * @version: 1.0
 */
import React, { PureComponent } from 'react';
import {
  Table,
  Button,
  Input,
  Col,
  Row,
  Popconfirm,
  message,
  Modal,
  List,
  DatePicker,
  Spin,
  Collapse,
} from 'antd';
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import FreshPageHeaderWrapper from '@/components/PageHeaderWrapper/FullScreenPageWrapper';
import Page from '@/pages/Component/Page/inner/Page';
import { DndProvider } from 'react-dnd';
import { calculatePlan, getBill, getBillLogs } from '@/services/cost/CostCalculation';
const { MonthPicker } = DatePicker;
import moment from 'moment';
const { Panel } = Collapse;

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
//继承QuickFormSearchPage Search页面扩展
export default class CostProjectSearch extends QuickFormSearchPage {
  //需要操作列的显示 将noActionCol设置为false
  state = {
    ...this.state,
    searchLoading: false,
    calculateLoading: false,
    dateString:
      this.props.params.dateString == undefined
        ? moment().format('YYYY-MM')
        : this.props.params.dateString,
    bill: null,
    isShowLogs: false,
    billLogs: [],
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

  handleOnSertch = async data => {
    const { dateString } = this.state;
    if (dateString == '') {
      message.error('请选择费用所属月');
      return;
    }
    this.setState({ searchLoading: true });
    const uuid = this.props.params.entityUuid;
    let params = {};
    if (data) {
      data.searchKeyValues = { month: dateString, ...data.searchKeyValues };
      params = data;
    } else {
      params = {
        page: 1,
        pageSize: 20,
        sortFields: {},
        searchKeyValues: { month: dateString },
        likeKeyValues: {},
      };
    }
    const response = await getBill(uuid, params);
    if (response.data && response.success) {
      const { struct, data, bill } = response.data.records[0];
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
        bill: bill,
      });
      this.initConfig({
        columns: newColumns,
        sql: ' ccc',
        reportHeadName: this.props.params.e.SCHEME_NAME,
      });
    } else {
      message.error('查询无数据,请核实后再操作');
      this.setState({ data: [], searchLoading: false });
    }
  };
  refreshTable = data => {
    data.page = data.page + 1;
    this.handleOnSertch(data);
  };
  calculate = async () => {
    const { dateString } = this.state;
    if (dateString == '') {
      message.error('请选择费用所属月');
      return;
    }
    this.setState({ searchLoading: true });
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

  getcalcLog = async () => {
    this.changeLogsModal();
    await getBillLogs(this.state.bill.UUID).then(response => {
      if (response && response.success) {
        this.setState({ billLogs: response.data.logsDetail });
        console.log('222', response);
      }
    });
  };

  changeLogsModal = () => {
    this.setState({ isShowLogs: !this.state.isShowLogs });
  };

  monthChange = (date, dateString) => {
    this.setState({ dateString });
  };

  drawSearchPanel = () => {
    const { dateString, searchLoading, billLogs } = this.state;
    console.log('billLogs', billLogs);

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
            onClick={() => this.handleOnSertch()}
          >
            查询
          </Button>
          <Button type="primary" onClick={this.calculate.bind()}>
            计算
          </Button>
          <Button
            style={{ marginLeft: '10px' }}
            hidden={!this.state.bill}
            type="primary"
            onClick={this.getcalcLog}
          >
            结果日志
          </Button>
          <Modal
            title="结果日志"
            visible={this.state.isShowLogs}
            onOk={this.state.isShowLogs}
            onCancel={this.changeLogsModal}
            width={1000}
          >
            <div style={{ overflow: 'scroll', height: '500px' }}>
              <Collapse>
                {billLogs.map((item, index) => {
                  //  let logs = item.costLog.replace(/\n/g, '&#10;');
                  let logs = item.costLog.split('\n');
                  return (
                    <Panel header={item.costTitle} key={index}>
                      {logs.map(item => {
                        return <p>{item}</p>;
                      })}
                    </Panel>
                  );
                })}
              </Collapse>
            </div>
          </Modal>
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

  changeState = () => {
    this.setState({ title: this.props.params.e.SCHEME_NAME });
  };

  render() {
    let ret = this.state.canFullScreen ? (
      <FreshPageHeaderWrapper>{this.drawPage()}</FreshPageHeaderWrapper>
    ) : (
      <PageHeaderWrapper>
        <Page withCollect={true} pathname={this.props.pathname}>
          <Spin spinning={this.state.searchLoading}>{this.drawPage()}</Spin>
        </Page>
      </PageHeaderWrapper>
    );
    if (this.state.isDrag) {
      return <DndProvider backend={HTML5Backend}>{ret}</DndProvider>;
    } else {
      return ret;
    }
  }
}
