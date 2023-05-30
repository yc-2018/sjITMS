/*
 * @Author: Liaorongchang
 * @Date: 2022-07-19 16:25:19
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-04-14 15:30:15
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
      this.onChangeSearch(nextProps.selectedRow);
    }
  }

  onChangeSearch = data => {
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

  onSearch = (filter, isNotFirstSearch) => {
    if ((!isNotFirstSearch || isNotFirstSearch == undefined) && filter != undefined) {
      const { selectedRow } = this.props;
      let uuidParams = [
        {
          field: 'billuuid',
          type: 'VarChar',
          rule: 'eq',
          val: selectedRow,
        },
      ];
      let queryParams = filter.queryParams.filter(item => {
        return (
          item.field != 'dispatchCenterUuid' &&
          item.field != 'dcUuid' &&
          item.field != 'companyuuid'
        );
      });
      const pageFilters = {
        ...this.state.pageFilters,
        superQuery: {
          matchType: '',
          queryParams: [...uuidParams, ...queryParams],
        },
      };
      // this.state.pageFilters = pageFilters;
      this.getData(pageFilters);
    }
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
