import React, { Component } from 'react';
import { queryColumnsByOpen, queryDataByDbSource } from '@/services/bms/OpenApi';
import StandardTable from '@/pages/Component/RapidDevelopment/CommonLayout/RyzeStandardTable/index';
import { Button, Switch, Badge, Icon, Modal } from 'antd';
import CostBillDtlSearchPage from './CostBillDtlSearchPage';

export default class index extends Component {
  state = {
    col: [
      {
        dataIndex: 'ERROR',
        title: '查询异常',
        width: 100,
      },
    ],
    dataSource: [],
    dbSource: '',
    isModalVisible: false,
  };

  columnComponent = {
    view: (val, column, record) => {
      return (
        <a
          onClick={() => this.onView(record)}
          style={{ color: this.colorChange(val, column.textColorJson) }}
        >
          {this.convertData(val, column.preview, record)}
        </a>
      );
    },
    otherView: (val, column, record) => {
      const value = this.convertData(val, column.preview, record);
      return value != '<空>' ? (
        <a
          onClick={() => this.onOtherView(record, column)}
          style={{ color: this.colorChange(val, column.textColorJson) }}
        >
          {value}
        </a>
      ) : (
        <p3>{value}</p3>
      );
    },
    switch: (val, column, record) => {
      return (
        <Switch
          checkedChildren="启用"
          unCheckedChildren="禁用"
          checked={val == 1}
          onClick={e => this.changeOpenState(e, record, column)}
        />
      );
    },
    colorBadge: (val, column, record) => {
      return (
        <div>
          <Badge
            color={this.colorChange(val, column.textColorJson)}
            text={this.convertData(val, column.preview, record)}
          />
        </div>
      );
    },
    p3: (val, column, record) => {
      return <p3>{this.convertData(val, column.preview, record)}</p3>;
    },
  };

  componentDidMount = () => {
    //获取列配置
    this.queryColumns();
  };

  //获取列配置
  queryColumns = async () => {
    const param = {
      reportCode: 'cost_child_bill',
      sysCode: 'tms',
    };
    const response = await queryColumnsByOpen(param);
    if (response && response.success) {
      const columns = response.result.columns;
      let col = [];
      columns.map(column => {
        if (column.isShow) {
          const c = {
            title: column.fieldTxt,
            dataIndex: column.fieldName,
            width: column.fieldWidth,
            render: (val, record) => this.getRender(val, column, record),
          };
          col.push(c);
        }
      });
      this.setState({ col });
      //获取表数据
      this.queryData(response.result.reportHead.dbSource);
    }
  };

  getRender = (val, column, record) => {
    let component = this.columnComponent.p3(val, column, record);
    return this.customize(record, this.convertData(val, column.preview, record), component, column);
  };

  //自定义报表的render
  customize(record, val, component, column) {
    let e = {
      column: column,
      record: record,
      component: component,
      val: val,
      // props: { ...commonPropertis, ...fieldExtendJson },
    };

    //自定义报表的render
    this.drawcell(e);

    return e.component;
  }

  //扩展render
  drawcell = e => {
    if (e.column.fieldName == 'BILL_NUMBER') {
      const component = <a onClick={() => this.checkDtl(e)}>{e.record.BILL_NUMBER}</a>;
      e.component = component;
    }
    if (e.column.fieldName === 'TOTALAMOUNT') {
      const fontColor = e.val === '<空>' || e.val >= 0 ? 'black' : 'red';
      const component = <a style={{ color: fontColor }}>{e.val}</a>;
      e.component = component;
    }
    if (e.column.fieldName == 'ACCESSORY') {
      let accessory = e.val == '<空>' ? 0 : e.val.split(',').length;
      let billAccessory =
        e.record.BILL_ACCESSORY != undefined ? e.record.BILL_ACCESSORY.split(',').length : 0;
      let count = accessory + billAccessory;
      const component = (
        <Button
        //onClick={() => this.accessoryModalShow(true, e.record)}
        >
          <Icon type="upload" />
          附件（
          {count}）
        </Button>
      );
      e.component = component;
    }
  };

  //数据转换
  convertData = (data, preview, record) => {
    if (data === '' || data == undefined || data === '[]') return '<空>';
    if (!preview) return data;
    const convert = record[preview] || '<空>';
    return convert;
  };

  queryData = async dbSource => {
    const groupInfo = this.props.computedMatch.params[0];
    let filter = { superQuery: { matchType: 'and', queryParams: [] } };
    filter.superQuery.queryParams = [
      { field: 'GROUPINFO', type: 'VarChar', rule: 'eq', val: groupInfo },
    ];
    filter.order = 'BILL_NUMBER,desc';
    filter.quickuuid = 'cost_child_bill';
    filter.dbSource = dbSource;
    const response = await queryDataByDbSource(filter);
    console.log('response', response);
    if (response && response.success) {
      this.setState({ dataSource: response.data.records });
    }
  };

  checkDtl = e => {
    this.setState({ isModalVisible: true, e });
  };

  handleOk = () => {
    this.setState({ isModalVisible: false });
  };

  handleCancel = () => {
    this.setState({ isModalVisible: false });
  };

  render() {
    const { isModalVisible, e } = this.state;
    return (
      <div>
        <StandardTable
          dataSource={this.state.dataSource}
          columns={this.state.col}
          size="middle"
          colTotal={[]}
          // width="800"
        />
        <Modal
          visible={isModalVisible}
          onOk={this.handleOk.bind()}
          onCancel={this.handleCancel.bind()}
          width={'90%'}
          bodyStyle={{ height: 'calc(82vh)', overflowY: 'auto' }}
        >
          <CostBillDtlSearchPage
            key={e == undefined ? new Date() : e.val}
            quickuuid="123"
            {...e}
            // {...this.props}
            location={{ pathname: '1' }}
          />
        </Modal>
      </div>
    );
  }
}
