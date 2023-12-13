import { Form, Spin } from 'antd';
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { getSource } from '@/services/bms/CostCalculation';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
//继承QuickFormSearchPage Search页面扩展
@Form.create()
export default class CostbillSource extends QuickFormSearchPage {
  //需要操作列的显示 将noActionCol设置为false
  state = {
    ...this.state,
    searchLoading: false,
    calculateLoading: false,
    plan: null,
    bill: null,
    isShowLogs: false,
    billLogs: [],
    isLock: false,
    isNotHd: true,
    title: this.props.project.ITEM_NAME,
    key: null,
  };

  async componentDidMount() {
    let param = {
      projectUuid: this.props.project.UUID,
      page: 1,
      pageSize: 20,
    };
    let res = await getSource(param);
    this.init(res);
    this.handleOnSertch();
  }

  comeBack = () => {
    this.props.switchTab('query');
  };

  /**
   * 查询处理
   */
  handleOnSertch = async data => {
    this.setState({ searchLoading: true });
    let param = {
      projectUuid: this.props.project.UUID,
      page: data?.page ? data.page : 1,
      pageSize: data?.pageSize ? data.pageSize : 20,
    };
    let res = await getSource(param);
    if (!res.data) return;
    const { list, page, pageSize, total } = res.data;
    var datas = {
      list: list,
      pagination: {
        total: total,
        pageSize: pageSize,
        current: page,
        showTotal: total => `共 ${total} 条`,
      },
    };
    this.setState({
      key: null,
      data: datas,
      searchLoading: false,
    });
  };

  init = res => {
    let newColumns = [];
    if (!res.data) return;
    const { column } = res.data;
    column.map(item => {
      newColumns.push({
        fieldName: item,
        fieldTxt: item,
        fieldType: 'VarChar',
        fieldWidth: 100,
        isSearch: false,
        isShow: true,
      });
    });

    this.initConfig({
      columns: newColumns,
      sql: ' ccc',
      reportHeadName: this.props.project.ITEM_NAME,
    });
    this.initConfig({
      columns: newColumns,
      sql: ' ccc',
      reportHeadName: this.props.project.ITEM_NAME,
    });
  };

  refreshTable = data => {
    console.log('111', data);
    data.page = data.page + 1;
    this.handleOnSertch(data);
  };

  //该方法会覆盖所有的中间功能按钮
  drawToolbarPanel = () => {};

  drawSearchPanel = () => {};

  render() {
    return <Spin spinning={this.state.searchLoading}>{this.drawPage()}</Spin>;
  }
}
