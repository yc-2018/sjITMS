/*
 * @Author: Liaorongchang
 * @Date: 2022-07-19 16:25:19
 * @LastEditors: guankongjin
 * @LastEditTime: 2023-04-14 14:13:34
 * @version: 1.0
 */
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { havePermission } from '@/utils/authority';
import { Button } from 'antd';
import { getTableColumns } from '@/utils/LoginContext';
import ExportJsonExcel from 'js-export-excel';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class ScheduleReportSearchPage extends QuickFormSearchPage {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      title: '',
      data: [],
      suspendLoading: false,
      columns: [],
      searchFields: [],
      advancedFields: [],
      reportCode: props.quickuuid,
      isOrgQuery: [],
      key: props.quickuuid + 'quick.search.report', //用于缓存用户配置数据
      defaultSort: '',
      formConfig: {},
      colTotal: [],
      queryConfigColumns: [],
      tableName: '',
      authority: props.route?.authority ? props.route.authority[0] : null,
    };
  }

  //查询数据
  getData = pageFilters => {
    const { dispatch } = this.props;
    let queryFilter = { ...pageFilters };
    const deliverypointCode = queryFilter.superQuery.queryParams.find(
      x => x.field == 'DELIVERYPOINTCODE'
    );
    queryFilter.applySql = '';
    if (deliverypointCode) {
      queryFilter.applySql = ` uuid in (select billuuid from sj_itms_schedule_order where deliverypointcode='${
        deliverypointCode.val
      }')`;
      queryFilter.superQuery.queryParams = queryFilter.superQuery.queryParams.filter(
        x => x.field != 'DELIVERYPOINTCODE'
      );
    }
    dispatch({
      type: 'quick/queryData',
      payload: queryFilter,
      callback: response => {
        if (response.data) this.initData(response.data);
      },
    });
  };

  /**
   * 绘制右上角按钮
   */
  drawActionButton = () => {
    //额外的菜单选项
    const menus = [];
    menus.push({
      // disabled: !havePermission(STORE_RES.CREATE), //权限认证
      name: '测试', //功能名称
      onClick: this.test, //功能实现
    });
    return (
      <div>
        <Button
          hidden={!havePermission(this.state.authority + '.port')}
          onClick={this.port}
          type="primary"
        >
          导出
        </Button>
      </div>
    );
  };

  //导出
  port = () => {
    const { selectedRows, key } = this.state;
    let defaultCache =
      getTableColumns(key + 'columnInfo') && typeof getTableColumns(key + 'columnInfo') != 'object'
        ? JSON.parse(getTableColumns(key + 'columnInfo'))
        : getTableColumns(key + 'columnInfo');
    let columnsList = [];
    if (defaultCache) {
      columnsList = defaultCache.newList;
    }
    var option = [];
    let sheetfilter = []; //对应列表数据中的key值数组，就是上面resdata中的 name，address
    let sheetheader = []; //对应key值的表头，即excel表头
    let columns = this.state.columns;
    let excelColumns = [];
    if (columnsList.length > 0) {
      columnsList.map(e => {
        let column = columns.find(i => i.title == e);
        if (column.preview != 'N') {
          excelColumns.push(column.preview);
        } else {
          excelColumns.push(column.key);
        }
      });
      sheetheader = columnsList;
      sheetfilter = excelColumns;
    } else {
      columns.map(a => {
        let excelColumn = '';
        if (a.preview != 'N') {
          excelColumn = a.preview;
        } else {
          excelColumn = a.key;
        }
        sheetfilter.push(excelColumn);
        sheetheader.push(a.title);
      });
    }
    option.fileName = this.state.title; //导出的Excel文件名

    if (selectedRows.length > 0) {
      option.datas = [
        {
          sheetData: selectedRows,
          sheetName: this.state.title, //工作表的名字
          sheetFilter: sheetfilter,
          sheetHeader: sheetheader,
        },
      ];
      var toExcel = new ExportJsonExcel(option);
      toExcel.saveExcel();
    } else {
      this.props.dispatch({
        type: 'quick/queryAllData',
        payload: this.state.pageFilters,
        callback: response => {
          if (response && response.success) {
            option.datas = [
              {
                sheetData: response.data.records,
                sheetName: this.state.title, //工作表的名字
                sheetFilter: sheetfilter,
                sheetHeader: sheetheader,
              },
            ];
            var toExcel = new ExportJsonExcel(option);
            toExcel.saveExcel();
          }
        },
      });
    }
  };
}
