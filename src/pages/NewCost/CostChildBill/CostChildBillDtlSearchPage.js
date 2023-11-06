import React, { PureComponent } from 'react';
import { Button, message, Spin, Form } from 'antd';
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { getChildBillInfo } from '@/services/bms/CostBill';

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
    bill: null,
    isShowLogs: false,
    billLogs: [],
    isLock: null,
  };

  month = moment().format('YYYY-MM');

  componentDidMount() {
    this.handleOnSertch();
  }

  /**
   * 查询处理
   */
  handleOnSertch = async data => {
    const { UUID } = this.props.record;
    // let values = { dateString: BILL_MONTH };
    this.setState({ searchLoading: true });
    let params = {};
    if (data) {
      data.searchKeyValues = { ...data.searchKeyValues };
      params = data;
    } else {
      params = {
        page: 1,
        pageSize: 20,
        sortFields: {},
        searchKeyValues: {},
        likeKeyValues: {},
      };
    }
    const response = await getChildBillInfo(UUID, params);
    if (response.data && response.success) {
      this.init(response);
      this.init(response);
    } else {
      message.error('当前查询无数据,请计算后再操作');
      this.setState({ data: [], searchLoading: false, bill: null });
    }
  };

  init = response => {
    const { structs, data } = response.data.records[0];
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
      // bill,
      // plan,
    });
    this.initConfig({
      columns: newColumns,
      sql: ' ccc',
      reportHeadName: this.props.TITLE, //this.props.params.TITLE,
    });
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
      // plan: { subjectKeyField },
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

  drawActionButton = () => {
    // //额外的菜单选项
    // const menus = [];
    // menus.push({
    //   // disabled: !havePermission(STORE_RES.CREATE), //权限认证
    //   name: '测试', //功能名称
    //   onClick: this.test, //功能实现
    // });
    // return (
    //   <div>
    //     <Button
    //       // hidden={!havePermission(this.state.authority + '.port')}
    //       onClick={this.port}
    //       type="primary"
    //     >
    //       导出
    //     </Button>
    //   </div>
    // );
  };

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
