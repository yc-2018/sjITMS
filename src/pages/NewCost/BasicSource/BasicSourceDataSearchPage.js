/*
 * @Author: Liaorongchang
 * @Date: 2022-06-14 11:10:51
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-08-23 15:32:59
 * @version: 1.0
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Button, Form, Input, message, Modal, Spin, DatePicker } from 'antd';
import AdvanceQuery from '@/pages/Component/RapidDevelopment/OnlReport/AdvancedQuery/AdvancedQuery';
import SearchPage from '@/pages/Component/RapidDevelopment/CommonLayout/RyzeSearchPage';
import { dynamicQuery } from '@/services/quick/Quick';
import { onSaveSourceData, deleteSourceData, sourceConfirm } from '@/services/cost/BasicSource';
import { colWidth } from '@/utils/ColWidth';
import { guid } from '@/utils/utils';
import { loginUser } from '@/utils/LoginContext';
import ExportJsonExcel from 'js-export-excel';
import moment from 'moment';

const { MonthPicker } = DatePicker;

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
@Form.create()
export default class BasicSourceDataSearchPage extends SearchPage {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      isNotHd: true,
      scroll: this.props.scroll,
      title: this.props.title,
      data: [],
      suspendLoading: false,
      columns: [],
      searchFields: [],
      isOrgQuery: [],
      pageFilters: [],
      // queryParams: this.props.params,
      system: this.props.system,
      searchLoading: false,
      showDataConfirmModal: false,
      confirmMonth: moment(new Date())
        .add(-1, 'months')
        .format('YYYY-MM'),
    };
  }

  drawRightClickMenus = () => {}; //右键菜单

  componentDidMount() {
    this.queryColumns();
  }

  //获取列配置
  queryColumns = async () => {
    let param = {
      tableName: 'cost_form_field',
      orderBy: ['LINE+'],
      condition: {
        params: [{ field: 'FORMUUID', rule: 'eq', val: [this.props.selectedRows] }],
      },
    };
    const columnsData = await dynamicQuery(param);
    if (columnsData && columnsData.success) {
      this.initConfig(columnsData.result.records);
      this.initConfig(columnsData.result.records);

      //配置查询成功后再去查询数据
      this.onSearch();
    }
  };

  initConfig = queryConfig => {
    let quickColumns = new Array();
    let quickSearchFields = new Array();
    queryConfig.filter(data => data.SHOW).forEach(data => {
      const qiuckcolumn = {
        title: data.DB_FIELD_TXT,
        dataIndex: data.DB_FIELD_NAME,
        key: data.DB_FIELD_NAME,
        sorter: true,
        width: colWidth.codeColWidth,
        fieldType: data.DB_TYPE,
        render: (val, record) => this.getRender(val, data, record),
      };
      quickColumns.push(qiuckcolumn);

      const quickSearchField = {
        fieldName: data.DB_FIELD_NAME,
        fieldTxt: data.DB_FIELD_TXT,
        fieldType: data.DB_TYPE,
        searchShowtype: data.DB_TYPE.toLowerCase(),
        searchCondition: 'eq',
      };
      quickSearchFields.push(quickSearchField);
    });
    if (quickColumns.length == 0) {
      message.error(this.state.title + '数据源展示列为空');
      return;
    }

    this.columns = quickColumns;
    this.setState({
      columns: quickColumns,
      searchFields: quickSearchFields,
    });
  };

  getRender = (val, column, record) => {
    const { expanded } = this.props;
    if (expanded == '1') {
      return (
        <Input defaultValue={val} onChange={v => (record[column.DB_FIELD_NAME] = v.target.value)} />
      );
    } else {
      return val;
    }
  };

  getData = async (pageFilters, system) => {
    this.setState({ searchLoading: true });
    this.state.pageFilters = pageFilters;
    const result = await dynamicQuery(pageFilters, system);
    if (result && result.result && result.result.records != 'false') {
      this.initData(result.result);
      this.setState({ searchLoading: false });
    } else {
      message.error('查无数据');
      this.setState({ searchLoading: false });
      return;
    }
  };

  onSearch = async filter => {
    const { system } = this.state;
    let param;
    if (filter == undefined) {
      param = {
        pageNo: 1,
        pageSize: 20,
        searchCount: true,
        tableName: system.tableName,
      };
    } else {
      const queryParams = params => {
        let param = params.map(data => {
          return {
            field: data.field,
            rule: data.rule,
            type: data.type,
            val: [data.val],
          };
        });
        return param;
      };

      param = {
        pageNo: 1,
        pageSize: 20,
        searchCount: true,
        tableName: system.tableName,
        condition: {
          params: queryParams(filter.queryParams),
        },
      };
      this.setState({ queryParams: queryParams(filter.queryParams) });
    }
    this.getData(param, system.system);
  };

  //初始化数据
  initData = data => {
    // 海鼎底层需要uuid作为StandardTable的rowkey
    if (data?.records && data.records.length > 0 && !data.records[0].uuid) {
      data.records.forEach(row => (row.uuid = guid()));
    }
    var data = {
      list: data.records,
      pagination: {
        total: data.total,
        pageSize: data.pageSize,
        current: data.pageNo,
        showTotal: total => `共 ${total} 条`,
      },
    };
    this.setState({ data, selectedRows: [] });
  };

  refreshTable = filter => {
    const { system, queryParams } = this.state;
    let queryFilter;
    if (filter) {
      var order = [];
      for (var key in filter.sortFields) {
        var sort = filter.sortFields[key] ? '-' : '+';
        order.push(key + sort);
      }
      queryFilter = {
        tableName: system.tableName,
        searchCount: true,
        orderBy: order,
        pageNo: filter.page + 1,
        pageSize: filter.pageSize,
        condition: {
          params: queryParams,
        },
      };
    }
    this.getData(queryFilter, system.system);
  };

  columns = [
    {
      title: '查询异常',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      width: colWidth.codeColWidth,
    },
  ];

  port = async () => {
    const { pageFilters, title } = this.state;
    let pageFilter = {
      tableName: pageFilters.tableName,
      condition: pageFilters.condition,
    };
    const result = await dynamicQuery(pageFilter);
    if (result && result.success) {
      let columns = this.state.columns;
      var option = [];
      let sheetfilter = []; //对应列表数据中的key值数组，就是上面resdata中的 name，address
      let sheetheader = []; //对应key值的表头，即excel表头
      columns.map(a => {
        sheetfilter.push(a.key);
        sheetheader.push(a.title);
      });
      option.fileName = title; //导出的Excel文件名
      option.datas = [
        {
          sheetData: result.result.records,
          sheetName: title, //工作表的名字
          sheetFilter: sheetfilter,
          sheetHeader: sheetheader,
        },
      ];
      var toExcel = new ExportJsonExcel(option);
      toExcel.saveExcel();
    }
  };

  onSave = async () => {
    const { selectedRows } = this.state;
    if (selectedRows.length == 0) {
      message.error('请至少选中一条数据！');
      return;
    }
    let param = {
      uuid: this.props.selectedRows,
      rows: selectedRows,
    };
    const response = await onSaveSourceData(param);
    if (response && response.success) {
      message.success('保存成功');
      this.onSearch();
    }
  };

  delete = async () => {
    const { selectedRows } = this.state;
    if (selectedRows.length == 0) {
      message.error('请至少选中一条数据！');
      return;
    }
    let param = {
      uuid: this.props.selectedRows,
      rows: selectedRows,
    };
    const response = await deleteSourceData(param);
    if (response && response.success) {
      message.success('删除成功');
      this.onSearch();
    }
  };

  sourceConfirm = async () => {
    const { system, confirmMonth } = this.state;
    this.setState({ searchLoading: true });
    let entity = {
      sourceuuid: system.uuid,
      sourcename: system.title,
      month: confirmMonth.toString(),
      operatorcode: loginUser().code,
      type: 'DataSource',
    };
    const response = await sourceConfirm(entity);
    if (response.success) {
      message.success('确认成功');
    } else {
      message.error('确认失败' + response.message);
    }
    this.setState({ showDataConfirmModal: false, searchLoading: false });
  };

  /**
   * 绘制批量工具栏
   */
  drawToolbarPanel = () => {
    const { expanded } = this.props;
    const { showDataConfirmModal, system, confirmMonth } = this.state;
    const monthFormat = 'YYYY-MM';
    return (
      <div style={{ marginTop: '10px' }}>
        <AdvanceQuery
          searchFields={this.state.searchFields}
          fieldInfos={this.columns}
          filterValue={this.state.pageFilter.searchKeyValues}
          refresh={this.onSearch}
          reportCode={this.state.tableName}
          // isOrgQuery={this.state.isOrgQuery}
        />
        <Button onClick={this.port} type="primary">
          导出
        </Button>
        <Button
          type="primary"
          onClick={() => {
            this.setState({ showDataConfirmModal: true });
          }}
        >
          确认
        </Button>
        <Button type="primary">备份</Button>
        {expanded == '1' ? <Button onClick={this.onSave}>保存</Button> : ''}
        {expanded == '1' ? <Button onClick={this.delete}>删除</Button> : ''}
        <Modal
          title="数据确认"
          visible={showDataConfirmModal}
          onOk={() => {
            this.sourceConfirm();
          }}
          onCancel={() => {
            this.setState({ showDataConfirmModal: false });
          }}
        >
          <Form>
            <Form.Item label="数据源" labelCol={{ span: 6 }} wrapperCol={{ span: 15 }}>
              <span>{system.title}</span>
            </Form.Item>
            <Form.Item label="所属月份" labelCol={{ span: 6 }} wrapperCol={{ span: 15 }}>
              <MonthPicker
                // defaultValue={moment('2023-07', monthFormat)}
                defaultValue={moment(confirmMonth, monthFormat)}
                format={monthFormat}
                onChange={date => {
                  this.setState({ confirmMonth: date.format('yyyy-MM') });
                }}
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    );
  };

  render() {
    return (
      <Spin spinning={this.state.searchLoading}>
        <div>{this.drawPage()}</div>
      </Spin>
    );
  }
}
