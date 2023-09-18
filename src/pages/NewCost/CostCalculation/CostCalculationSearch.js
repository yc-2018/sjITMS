/*
 * @Author: Liaorongchang
 * @Date: 2022-06-08 10:39:18
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-09-11 14:30:40
 * @version: 1.0
 */
import React, { PureComponent } from 'react';
import { Button, Input, Col, Row, message, Modal, DatePicker, Form, Spin, Collapse } from 'antd';
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import Page from '@/pages/Component/Page/inner/Page';
import {
  newCalculatePlan,
  getBill,
  findCostFormFieldByPlanUuid,
  getBillLogs,
  onLock,
  isLock,
  calculateMemberWage,
  UpdateDtlNote,
} from '@/services/cost/CostCalculation';
import { colWidth } from '@/utils/ColWidth';
import BatchProcessConfirm from '@/pages/SJTms/Dispatching/BatchProcessConfirm';
import moment from 'moment';
import { guid } from '@/utils/utils';
import ExportJsonExcel from 'js-export-excel';
import { getTableColumns } from '@/utils/LoginContext';

const { MonthPicker } = DatePicker;
const { Panel } = Collapse;

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
//继承QuickFormSearchPage Search页面扩展
@Form.create()
export default class CostCalculationSearch extends QuickFormSearchPage {
  //需要操作列的显示 将noActionCol设置为false
  state = {
    ...this.state,
    searchLoading: false,
    calculateLoading: false,
    dateString:
      this.props.params.dateString == undefined
        ? moment()
            .subtract(1, 'months')
            .format('YYYY-MM')
        : this.props.params.dateString,
    plan: null,
    bill: null,
    isShowLogs: false,
    billLogs: [],
    isLock: null,
    showCalculateAgainPop: false,
  };

  month = moment().format('YYYY-MM');

  componentDidMount() {
    this.handleOnSertch();
    this.getCostFormFields();
  }

  getCostFormFields = () => {
    findCostFormFieldByPlanUuid(this.props.params.entityUuid).then(result => {
      this.setState({ subjectFields: result.data });
    });
  };

  // getLockStatus = date => {
  //   isLock(this.props.params.entityUuid, date == undefined ? this.month : date).then(result => {
  //     this.setState({ isLock: result.data });
  //   });
  // };

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

    this.props.switchTab('update', {
      entityUuid: this.props.params.entityUuid,
      dateString,
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
      const { structs, data, plan, bill, colTotal } = response.data.records[0];
      let newColumns = [];
      structs.forEach(struct => {
        newColumns.push({
          fieldName: struct.fieldName,
          fieldTxt: struct.fieldTxt,
          fieldType: 'VarChar',
          fieldWidth: colWidth.dateColWidth,
          isSearch: false,
          isShow: true,
          render: (val, record) => this.getRender(val, struct, record),
        });
      });
      if (data && data.length > 0 && !data[0].uuid) {
        data.forEach(row => (row.uuid = guid()));
      }
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
        key: this.props.quickuuid + '|' + bill.planUuid,
        data: datas,
        colTotal,
        searchLoading: false,
        bill,
        plan,
      });
      this.initConfig({
        columns: newColumns,
        sql: ' ccc',
        reportHeadName: this.props.params.e.SCHEME_NAME,
      });

      // this.getLockStatus(dateString);
    } else {
      message.error('当前查询无数据,请计算后再操作');
      this.setState({ data: [], searchLoading: false, bill: null });
    }
  };

  port = async () => {
    let values = this.props.form.getFieldsValue();
    const { dateString, columns, key } = this.state;
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
    // this.setState({ searchLoading: true });
    const uuid = this.props.params.entityUuid;
    let params = {
      page: 1,
      pageSize: this.state.data.pagination.total,
      sortFields: {},
      searchKeyValues: { ...values },
      likeKeyValues: {},
    };
    const response = await getBill(uuid, params);
    if (response.data && response.success) {
      const { data, bill } = response.data.records[0];
      const c = key.substring(0, key.indexOf('|')) + 'quick.search.table';
      let defaultCache =
        getTableColumns(c + 'columnInfo') && typeof getTableColumns(c + 'columnInfo') != 'object'
          ? JSON.parse(getTableColumns(c + 'columnInfo'))
          : getTableColumns(c + 'columnInfo');
      let columnsList = [];
      if (defaultCache) {
        columnsList = defaultCache.newList;
      }
      var option = [];
      let sheetfilter = []; //对应列表数据中的key值数组，就是上面resdata中的 name，address
      let sheetheader = []; //对应key值的表头，即excel表头
      option.fileName = bill.title; //导出的Excel文件名
      columns.map(a => {
        let excelColumn = '';
        if (a.preview != 'N') {
          excelColumn = a.preview;
        } else {
          excelColumn = a.key;
        }
        if (columnsList.length <= 0) {
          sheetfilter.push(excelColumn);
          sheetheader.push(a.title);
        } else if (columnsList.indexOf(a.title) != -1) {
          sheetfilter.push(excelColumn);
          sheetheader.push(a.title);
        }
      });
      option.datas = [
        {
          sheetData: data,
          sheetName: bill.title, //工作表的名字
          sheetFilter: sheetfilter,
          sheetHeader: sheetheader,
        },
      ];
      var toExcel = new ExportJsonExcel(option);
      toExcel.saveExcel();
    } else {
      message.error('当前查询无数据,请计算后再操作');
      this.setState({ data: [], searchLoading: false, bill: null });
    }
  };

  drawTopButton = () => {
    return (
      <>
        <Button onClick={this.comeBack.bind()}>返回</Button>
      </>
    );
  }; //扩展最上层按钮

  getRender = (val, column, record) => {
    if (column.fieldName == 'note') {
      return (
        <Input
          defaultValue={val}
          onChange={v => {
            record[column.fieldName] = v.target.value;
          }}
        />
      );
    } else {
      if (column.fieldName == 'modified') {
        val = val ? '是' : '否';
      }
      if (record.modified) {
        return <p3 style={{ color: 'red' }}>{val}</p3>;
      } else {
        return val;
      }
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
    const planUuid = this.props.params.e.uuid;
    let params = {
      planUuid: planUuid,
      month: dateString,
    };
    await newCalculatePlan(params).then(response => {
      this.setState({ searchLoading: false });
      if (response && response.success) {
        message.success('计算成功');
        this.handleOnSertch();
      }
    });
  };

  onBatchCalculateAgain = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length == 0) {
      message.error('请至少选中一条数据！');
      return;
    }
    selectedRows.length == 1
      ? this.setState({ showCalculateAgainPop: true })
      : this.batchProcessConfirmRef.show(
          '重算',
          selectedRows,
          this.calculateAgain,
          this.handleOnSertch
        );
  };

  calculateAgain = async selectedRows => {
    return await calculateMemberWage(selectedRows.BILLNUMBER);
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

  // drawcell = e => {
  //   if (e.column.fieldName == 'modified') {
  //     e.val = e.val ? '是' : '否';
  //   }
  //   if (e.record.modified) {
  //     e.component = (
  //       <p3 style={{ color: 'red' }}>{this.convertData(e.val, e.column.preview, e.record)}</p3>
  //     );
  //   }
  // };

  /**
   * 版本锁定
   */
  // onLock = async () => {
  //   await onLock(this.props.params.entityUuid, this.state.dateString).then(e => {
  //     if (e.data) {
  //       this.setState({ isLock: e.data });
  //       message.success('操作成功');
  //     }
  //   });
  // };

  //该方法会覆盖所有的中间功能按钮
  drawToolbarPanel = () => {
    const { billLogs, isLock } = this.state;
    return (
      <div style={{ marginBottom: '-15px' }}>
        <Button onClick={this.calculate.bind()}>计算</Button>
        <Button onClick={this.checkData.bind()}>检查数据</Button>
        <Button onClick={this.onSaveNote.bind()}>保存</Button>
        {/* <Button
          disabled={!(isLock == 'Saved' || isLock == 'Approved')}
          type={isLock != 'Saved' ? 'danger' : ''}
          onClick={() => this.onLock()}
        >
          {isLock == 'Approved' ? '取消批准' : '批准'}
        </Button> */}
        <Button hidden={!this.state.bill} onClick={this.getcalcLog}>
          结果日志
        </Button>
        <Button onClick={this.getView}>查看</Button>
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
                //  let logs = item.costLog.replace(/\n/g, '&#10;');
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
        <BatchProcessConfirm onRef={node => (this.batchProcessConfirmRef = node)} />
      </div>
    );
  };

  changeState = () => {
    this.setState({ title: this.props.params.e.SCHEME_NAME });
  };
  getView = () => {
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
    this.props.switchTab('checkView', {
      billUuid,
      subjectUuid,
      dateString,
      entityUuid: this.props.params.entityUuid,
      e,
    });
    // this.props.switchTab('billView');
  };
  drawSearchPanel = () => {
    const { getFieldDecorator } = this.props.form;
    const { dateString } = this.state;
    let node = [];
    node.push(
      <Form.Item label="费用所属月">
        {getFieldDecorator('dateString', {
          initialValue: moment(
            dateString == undefined
              ? moment()
                  .subtract(1, 'months')
                  .format('YYYY-MM')
              : dateString,
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
        <Button type="primary" onClick={() => this.handleOnSertch()}>
          查询
        </Button>
        <Button style={{ margin: '0px 10px' }} type="primary" onClick={this.edit.bind()}>
          编辑
        </Button>
        {/* <Button onClick={this.comeBack.bind()}>返回</Button> */}
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

  onSaveNote = async () => {
    const { selectedRows } = this.state;
    if (selectedRows.length !== 0) {
      const row = {
        selectedRows,
      };
      await UpdateDtlNote(row).then(response => {
        if (response && response.success) {
          message.success('保存成功');
          this.handleOnSertch();
        }
      });
    } else {
      message.error('请至少选中一条数据！');
    }
  };

  render() {
    return (
      <PageHeaderWrapper>
        <Page withCollect={true} pathname={this.props.pathname}>
          <Spin spinning={this.state.searchLoading}>{this.drawPage()}</Spin>
        </Page>
      </PageHeaderWrapper>
    );
  }
}
