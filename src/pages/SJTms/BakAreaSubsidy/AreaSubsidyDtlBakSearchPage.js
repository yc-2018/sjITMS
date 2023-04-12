/*
 * @Author: Liaorongchang
 * @Date: 2022-07-19 16:25:19
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-04-11 16:31:58
 * @version: 1.0
 */
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import Page from '@/pages/Component/Page/inner/Page';
import { DndProvider } from 'react-dnd';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class AreaSubsidyDtlBakSearchPage extends QuickFormSearchPage {
  state = {
    ...this.state,
    modalVisible: false,
    transferDataSource: [],
    targetKeys: [],
    modalTitle: '',
    transferColumnsTitle: '',
    modalQuickuuid: '',
    buttonDisable: false,
    authority: 'sjtms.basic.areasubsidyBak',
    // canDragTable: true,
  };
  componentDidMount() {
    this.queryCoulumns();
    this.getCreateConfig();
    this.props.onRef && this.props.onRef(this);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedRow != this.props.selectedRow) {
      this.onSearch(nextProps.selectedRow);
    }
  }

  onSearch = data => {
    const { selectedRow } = this.props;
    let UUID = typeof data == 'undefined' ? selectedRow : data;
    const pageFilters = {
      ...this.state.pageFilters,
      superQuery: {
        matchType: '',
        queryParams: [
          {
            field: 'billuuid',
            type: 'VarChar',
            rule: 'eq',
            val: UUID,
          },
        ],
      },
    };
    this.state.pageFilters = pageFilters;
    this.refreshTable();
  };

  render() {
    let ret = (
      <div style={{ marginTop: '24px' }}>
        <PageHeaderWrapper>
          <Page withCollect={true} pathname={this.props.pathname}>
            {this.drawPage()}
          </Page>
        </PageHeaderWrapper>
      </div>
    );
    if (this.state.isDrag) {
      return <DndProvider backend={HTML5Backend}>{ret}</DndProvider>;
    } else {
      return ret;
    }
  }
}
