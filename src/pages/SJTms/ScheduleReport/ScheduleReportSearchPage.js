/*
 * @Author: Liaorongchang
 * @Date: 2022-07-19 16:25:19
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-11-14 14:44:22
 * @version: 1.0
 */
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { havePermission } from '@/utils/authority';
import { Button } from 'antd';
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
    const { selectedRows } = this.state;
    var option = [];
    let sheetfilter = []; //对应列表数据中的key值数组，就是上面resdata中的 name，address
    let sheetheader = []; //对应key值的表头，即excel表头
    let columns = this.state.columns;
    columns.map(a => {
      if (a.preview != 'N') {
        sheetfilter.push(a.preview);
      } else {
        sheetfilter.push(a.key);
      }
      sheetheader.push(a.title);
    });
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
          }
        },
      });
    }
    var toExcel = new ExportJsonExcel(option);
    toExcel.saveExcel();
  };
}
