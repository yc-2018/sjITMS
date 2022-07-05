/*
 * @Author: Liaorongchang
 * @Date: 2022-06-08 10:39:18
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-06-29 17:35:32
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
  Form,
  Collapse,
} from 'antd';
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import FreshPageHeaderWrapper from '@/components/PageHeaderWrapper/FullScreenPageWrapper';
import Page from '@/pages/Component/Page/inner/Page';
import { DndProvider } from 'react-dnd';
import {
  calculatePlan,
  getBill,
  findCostFormFieldByPlanUuid,
  getBillLogs,
  onLock,
  isLock,
} from '@/services/cost/CostCalculation';
const { MonthPicker } = DatePicker;
import moment from 'moment';
const { Panel } = Collapse;
import { throttleSetter } from 'lodash-decorators';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
//继承QuickFormSearchPage Search页面扩展
@Form.create()
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
    plan: null,
    bill: null,
    isShowLogs: false,
    billLogs: [],
    isLock: false,
  };

  month = moment().format('YYYY-MM');

  componentWillReceiveProps(nextprops) {
    this.getLockStatus();
    this.getCostFormFields();
  }

  componentDidMount() {
    this.handleOnSertch();
  }

  getCostFormFields = () => {
    findCostFormFieldByPlanUuid(this.props.params.entityUuid).then(result => {
      this.setState({ subjectFields: result.data });
    });
  };

  getLockStatus = date => {
    isLock(this.props.params.entityUuid, date == undefined ? this.month : date).then(result => {
      this.setState({ isLock: result.data });
    });
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

    // const startDate =
    //   moment(dateString)
    //     .add(e.START_DATE, 'month')
    //     .format('YYYY-MM') +
    //   '-' +
    //   e.START_DAY;

    // const endDate =
    //   moment(dateString)
    //     .add(e.END_DATE, 'month')
    //     .format('YYYY-MM') +
    //   '-' +
    //   e.END_DAY;

    this.props.switchTab('update', {
      entityUuid: this.props.params.entityUuid,
      dateString,
      // dateInterval: [startDate, endDate],
      e,
    });
  };

  /**
   * 跳转到编辑页面
   */
  edit = () => {
    const { selectedRows } = this.state;
    const { dateString } = this.state;
    const { e } = this.props.params;
    if (selectedRows.length == 0) {
      message.error('请选择一条数据');
      return;
    }
    const {
      plan: { subjectKeyField },
      bill: { uuid: billUuid },
    } = this.state;
    // 拿到主键
    const subjectUuid = selectedRows[0][subjectKeyField];
    this.props.switchTab('create', {
      billUuid,
      subjectUuid,
      dateString,
      entityUuid: this.props.params.entityUuid,
      e,
    });
  };

  /**
   * 查询处理
   */
  handleOnSertch = async data => {
    let values = this.props.form.getFieldsValue();
    const { dateString } = this.state;
    if (dateString == '') {
      message.error('请选择费用所属月');
      return;
    }
    values.dateString = dateString;
    for (const i in values) {
      if (values[i] == '') {
        delete values[i];
      }
    }
    this.setState({ searchLoading: true });
    const uuid = this.props.params.entityUuid;
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
    const response = await getBill(uuid, params);
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
          isShow: true
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
        reportHeadName: this.props.params.e.SCHEME_NAME,
      });
    } else {
      message.error('当前查询无数据,请计算后再操作');
      this.setState({ data: [], searchLoading: false, bill: null });
    }
  };

  /**
   * 费用计算
   */
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
      this.setState({ searchLoading: false });
      if (response && response.success) {
        message.success('计算成功');
        this.handleOnSertch();
      }
    });
  };

  getcalcLog = async () => {
    this.changeLogsModal();
    await getBillLogs(this.state.bill.uuid).then(response => {
      if (response && response.success) {
        this.setState({ billLogs: response.data.logsDetail });
      } else {
        message.error('查询日志失败，请重新计算后再查询');
      }
    });
  };

  changeLogsModal = () => {
    this.setState({ isShowLogs: !this.state.isShowLogs });
  };

  refreshTable = data => {
    data.page = data.page + 1;
    this.handleOnSertch(data);
  };

  monthChange = (date, dateString) => {
    this.month = dateString;
    this.setState({ dateString });
    // this.isLock(dateString);
  };

  drawcell = (e) => {
    if(e.column.fieldName == "modified"){
      e.val = e.val ? "是" : "否";
    }
    if (e.record.modified) {
      e.component = <p3 style={{ color: "red" }}>{this.convertData(e.val, e.column.preview, e.record)}</p3>;
    }
  };

  /**
   * 版本锁定
   */
  onLock = async () => {
    await onLock(this.props.params.entityUuid, this.state.dateString).then(e => {
      if (e.data == 0) {
        this.setState({ isLock: false });
        message.success('解锁成功');
      } else if (e.data == 1) {
        this.setState({ isLock: true });
        message.success('锁定成功');
      } else {
        this.setState({ isLock: false });
        message.info('未找到数据!');
      }
    });
  };

  //该方法会覆盖所有的中间功能按钮
  drawToolbarPanel = () => {};

  changeState = () => {
    this.setState({ title: this.props.params.e.SCHEME_NAME });
  };

  drawSearchPanel = () => {
    const { getFieldDecorator } = this.props.form;
    const { dateString, searchLoading, billLogs } = this.state;
    let node = [];

    node.push(
      <Form.Item label="费用所属月">
        {getFieldDecorator('dateString', {
          initialValue: moment(
            dateString == undefined ? moment().format('YYYY-MM') : dateString,
            'YYYY-MM'
          ),
        })(
          <MonthPicker
            placeholder=""
            onChange={(date, dateString) => this.monthChange(date, dateString)}
          />
        )}
      </Form.Item>
    );
    let searchFields = this.state.subjectFields
      ? this.state.subjectFields.map(item => {
          return (
            <Form.Item label={item.DB_FIELD_TXT}>
              {getFieldDecorator(item.DB_FIELD_NAME, { initialValue: '' })(<Input />)}
            </Form.Item>
          );
        })
      : [];
    node = [...node, ...searchFields];
    node.push(
      <Form.Item>
        <Button style={{ margin: '0px 10px' }} type="primary" onClick={() => this.handleOnSertch()}>
          查询
        </Button>
      </Form.Item>
    );

    node.push(
      <Form.Item>
        <Button type="primary" onClick={this.calculate.bind()}>
          计算
        </Button>
      </Form.Item>
    );
    node.push(
      <Form.Item>
        <Button type={this.state.isLock ? 'danger' : 'primary'} onClick={() => this.onLock()}>
          {this.state.isLock ? '解锁(已锁定)' : '锁定(未锁定)'}
        </Button>
      </Form.Item>
    );
    node.push(
      <Form.Item>
        <Button hidden={!this.state.bill} type="primary" onClick={this.getcalcLog}>
          结果日志
        </Button>
        <Modal
          title="结果日志"
          visible={this.state.isShowLogs}
          onOk={this.changeLogsModal}
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
      </Form.Item>
    );
    node.push(
      <Form.Item>
        <Button style={{ margin: '0px 8px' }} type="primary" onClick={this.checkData.bind()}>
          检查数据
        </Button>
        <Button style={{ margin: '0px 10px' }} type="primary" onClick={this.edit.bind()}>
          编辑
        </Button>
        <Button onClick={this.comeBack.bind()}>返回</Button>
      </Form.Item>
    );

    return (
      <Row style={{ marginTop: '10px' }}>
        <Col>
          <Form layout="inline">
            {node.map(e => {
              return e;
            })}
          </Form>
        </Col>
      </Row>
    );
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
