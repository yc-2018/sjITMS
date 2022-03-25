/*
 * @Author: Liaorongchang
 * @Date: 2022-03-10 11:29:17
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-03-25 11:10:24
 * @version: 1.0
 */
import React, { PureComponent } from 'react';
import { Form, Badge } from 'antd';
import { colWidth } from '@/utils/ColWidth';
import { connect } from 'dva';
import SearchPage from '@/pages/Tms/DispatchCenterShipPlanBill/SearchPage';
import { guid } from '@/utils/utils';
@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
//继承QuickFormSearchPage Search页面扩展
@Form.create()
export default class ShipPlanBillSearch extends SearchPage {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      suspendLoading: false,
      hasOnRow: true,
      searchPageType: 'LINE',
      columns: [],
      searchFields: [],
      advancedFields: [],
      data: [],
      tabTrue: props.tabTrue,
      selectedRows: [],
      width: '100%',
      scrollValue: {
        x: 4100,
        y: 'calc(40vh)',
      },
    };
    this.state.pageFilter = this.props.pageFilter;
  }

  columns = [
    {
      title: '过度数据1',
    },
    {
      title: '过度数据2',
    },
    {
      title: '过度数据3',
    },
    {
      title: '过度数据4',
    },
    {
      title: '过度数据5',
    },
  ];

  componentDidMount() {
    this.queryCoulumns();
    if (!this.state.tabTrue) {
      this.refreshTable(this.props.pageFilter ? this.props.pageFilter : null);
    } else {
      this.setState({
        data: {
          list: [],
          pagination: {},
        },
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    const cc = nextProps.pageFilter != this.props.pageFilter;
    if (nextProps.pageFilter != this.props.pageFilter) {
      this.refreshTable(nextProps.pageFilter ? nextProps.pageFilter : null);
      this.setState({
        pageFilter: { ...nextProps.pageFilter },
      });
    }
  }

  //获取列配置
  queryCoulumns = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'quick/queryColumns',
      payload: {
        reportCode: this.props.reportCode,
        sysCode: 'tms',
      },
      callback: response => {
        if (response.result) {
          this.initConfig(response.result);
          //解决用户列展示失效问题 暂时解决方法（赋值两次）
          // this.initConfig(response.result);
        }
      },
    });
  };

  //初始化配置
  initConfig = queryConfig => {
    const columns = queryConfig.columns;
    const editableState = ['已保存', '已批准', '装车中', '已装车', '配送中'];
    let quickColumns = new Array();
    columns.filter(data => data.isShow).forEach(column => {
      let OptColumn = {
        title: '操作',
        width: colWidth.operateColWidth,
        render: (val, record) => {
          return (
            <a
              disabled={!editableState.includes(record.STAT)}
              onClick={() => {
                this.props.memberModalClick(record);
              }}
            >
              编辑
            </a>
          );
        },
      };
      quickColumns.push(OptColumn);
      let e = {
        column: column,
      };
      const qiuckcolumn = {
        title: column.fieldTxt,
        dataIndex: column.fieldName,
        key: column.fieldName,
        sorter: column.orderType != 0,
        width: column.fieldWidth,
        fieldType: column.fieldType,
        render:
          column.clickEvent == '1'
            ? (val, record) => {
                const component = (
                  <a
                    onClick={this.onView.bind(this, record)}
                    style={{ color: this.colorChange(val, column.textColor) }}
                  >
                    {this.convertData(val, column.preview, record)}
                  </a>
                );
                return this.customize(
                  record,
                  this.convertData(val, column.preview, record),
                  component,
                  column
                );
              }
            : column.clickEvent == '2'
              ? (val, record) => {
                  const component = (
                    <a
                      onClick={this.onOtherView.bind(this, record, jumpPaths)}
                      style={{ color: this.colorChange(val, column.textColor) }}
                    >
                      {this.convertData(val, column.preview, record)}
                    </a>
                  );
                  return this.customize(
                    record,
                    this.convertData(val, column.preview, record),
                    component,
                    column
                  );
                }
              : (val, record) => {
                  if (column.textColor && Array.isArray(JSON.parse(column.textColor))) {
                    const component = (
                      <div>
                        <Badge
                          color={this.colorChange(val, column.textColor)}
                          text={this.convertData(val, column.preview, record)}
                        />
                      </div>
                    );
                    return this.customize(
                      record,
                      this.convertData(val, column.preview, record),
                      component,
                      column
                    );
                  } else {
                    const component = <p3>{this.convertData(val, column.preview, record)}</p3>;
                    return this.customize(
                      record,
                      this.convertData(val, column.preview, record),
                      component,
                      column
                    );
                  }
                },
      };

      quickColumns.push(qiuckcolumn);
    });
    this.columns = quickColumns;
    this.setState({
      columns: quickColumns,
      advancedFields: columns.filter(data => data.isShow),
      searchFields: columns.filter(data => data.isSearch),
    });
  };

  colorChange = (data, color) => {
    if (!color) return '';

    let colorJson = JSON.parse(color);
    if (!Array.isArray(colorJson)) return '';
    let colorItem = colorJson.find(item => item.value == data);

    if (!colorItem) return '';

    return colorItem.color;
  };

  //数据转换
  convertData = (data, preview, record) => {
    if (!data) return '<空>';
    if (!preview) return data;
    return record[preview];
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

    // //自定义报表的render
    // this.drawcell(e);

    return e.component;
  }

  /**
   * 查看详情
   */
  onView = record => {
    const { onlFormField } = this.props;
    var field = onlFormField[0].onlFormFields.find(x => x.dbIsKey)?.dbFieldName;
    if (record.ROW_ID) {
      this.props.switchTab('view', { entityUuid: record[field] });
    } else {
      const { selectedRows, batchAction } = this.state;
      if (selectedRows.length > 0) {
        this.props.switchTab('view', {
          entityUuid: selectedRows[0][field],
        });
      } else message.error('请至少选中一条数据！');
    }
  };

  //跳转到其他详情页
  onOtherView = (record, jumpPaths) => {
    if (!jumpPaths || jumpPaths.length != 2) {
      message.error('配置为空或配置错误，请检查点击事件配置！');
      return;
    }

    // console.log('jumpPath', jumpPaths[0], 'entityUuid', record[jumpPaths[1]], '3', jumpPaths[2]);

    this.props.dispatch(
      routerRedux.push({
        pathname: jumpPaths[0],
        state: {
          tab: 'view',
          param: { entityUuid: record[jumpPaths[1]] },
        },
      })
    );
  };

  /**
   * 刷新/重置
   */
  refreshTable = filter => {
    let queryFilter;
    if (filter) {
      var order = '';
      for (var key in filter.sortFields) {
        var sort = filter.sortFields[key] ? 'descend' : 'ascend';
        order = key + ',' + sort;
      }
      queryFilter = {
        order: order,
        ...filter,
        page: filter.page ? filter.page + 1 : 0 + 1,
        pageSize: filter.pageSize ? filter.pageSize : 20,
      };
    }
    this.getData(queryFilter);
  };

  //查询数据
  getData = pageFilter => {
    const { dispatch } = this.props;
    dispatch({
      type: 'quick/queryData',
      payload: pageFilter,
      callback: response => {
        if (response.data) {
          this.initData(response.data);
        }
      },
    });
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
        total: data.paging.recordCount,
        pageSize: data.paging.pageSize,
        current: data.page,
        showTotal: total => `共 ${total} 条`,
      },
    };
    this.setState({ data, selectedRows: [] });
  };

  changeSelectedRows = selectedRows => {
    this.props.refreshView(null, selectedRows);
  };
}
