import React, { Component } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import Page from '@/pages/Component/Page/inner/Page';
import NavigatorPanel from '@/pages/Component/Page/inner/NavigatorPanel';
import ConfirmProgress from '@/pages/Component/Progress/ConfirmProgress';
import StandardTable from './RyzeStandardTable';
import LoadingIcon from '@/pages/Component/Loading/LoadingIcon';
import ToolbarPanel from '@/pages/Component/Page/inner/ToolbarPanel';
import { message, Modal } from 'antd';
import { formatMessage } from 'umi/locale';
import { getActiveKey, getPageFilter, setPageFilter } from '@/utils/LoginContext';
import { routerRedux } from 'dva/router';
import FreshPageHeaderWrapper from '@/components/PageHeaderWrapper/FullScreenPageWrapper';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ToolbarPane1Content from '@/pages/Component/Page/inner/ToolbarPane1Content';
import IconFont from '@/components/IconFont';
import { debounce } from '@/utils/utils';
import styles from '@/pages/Tms/TransportOrder/transportOrder.less';
/**
 * 搜索界面基类<br>
 * 界面标题：具体模块搜索界面在状态中设置title<br>
 * 右上角按钮：子类可通过实现drawActionButton来构造该按钮组<br>
 * 搜索面板：子类通过实现drawSearchPanel来构造搜索面板<br>
 * 工具栏：子类通过实现drawToolbarPanel来构造工具栏<br>
 * 搜索表格：父类会调用子类的columns属性作为表格的列，从子类状态中取data作为数据来源，子类需在state中提供selectedRows，由父类进行更新<br>
 * 刷新表格：子类提供refreshTable方法，当父类表格发生变化（分页、排序、表格内筛选）时会调用该方法，并传入表格搜索数据（当前页、每页条数等等）<br>
 * 界面loading ：当不想让表格进行loaing时 在子类状态中设置suspendLoading属性（是否暂停表格loading）
 * @param {boolean} noActionCol: 表格列是否有操作列
 */
export default class RyzeSearchPage extends Component {
  drapTableChange = () => {}; //拖拽事件
  constructor(props) {
    super(props);

    let queryFilter = {
      selectedRows: [],
      pageFilter: {
        page: 0,
        pageSize: sessionStorage.getItem(props.quickuuid + 'searchPageLine')
          ? parseInt(sessionStorage.getItem(props.quickuuid + 'searchPageLine'))
          : 20,
        sortFields: {},
        searchKeyValues: {},
        likeKeyValues: {},
      },
    };
    console.log('111', sessionStorage.getItem(props.quickuuid + 'searchPageLine'));
    let pageFilters = { quickuuid: props.quickuuid, changePage: true };
    //查缓存中是否有搜索条件
    if (getPageFilter(getActiveKey() + props.quickuuid)) {
      pageFilters = getPageFilter(getActiveKey() + props.quickuuid);
      //console.log('cache', pageFilters);
    }

    if (getPageFilter(getActiveKey())) {
      queryFilter = getPageFilter(getActiveKey());
      if (!queryFilter.pageFilter) {
        queryFilter.pageFilter = {
          page: 0,
          pageSize: sessionStorage.getItem(props.quickuuid + 'searchPageLine')
            ? parseInt(sessionStorage.getItem(props.quickuuid + 'searchPageLine'))
            : 20,
          sortFields: {},
          searchKeyValues: {},
          likeKeyValues: {},
        };
      }
    }

    this.state = {
      pageFilters,
      ...queryFilter,
      batchProcessConfirmModalVisible: false,
      isCloseFailedResultModal: false,
      taskInfo: {
        total: 0,
      },
      failedTasks: [],
      noActionCol: true,
    };
  }

  toggleCallback = () => {
    this.setState({
      toggle: !this.state.toggle,
    });
  };

  onCollapse = () => {
    this.setState({
      viewPanelCollapse: !this.state.viewPanelCollapse,
    });
  };

  shouldComponentUpdate() {
    if (this.props.pathname && this.props.pathname !== window.location.pathname) {
      return false;
    } else {
      return true;
    }
  }

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
    this.changeSelectedRows && this.changeSelectedRows(rows);
  };

  /**
   * 表格内容改变时，调用此方法，排序触发
   */
  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;
    const { pageFilter } = this.state;
    if (pageFilter.page !== pagination.current - 1) {
      pageFilter.changePage = true;
    }

    pageFilter.page = pagination.current - 1;
    pageFilter.pageSize = pagination.pageSize;

    // 判断是否有过滤信息
    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});

    if (sorter.field) {
      var sortField = `${sorter.field}`;
      var sortType = sorter.order === 'descend' ? true : false;
      // 排序触发表格变化清空表格选中行，分页则不触发
      if (pageFilter.sortFields[sortField] === sortType) {
        pageFilter.changePage = true;
      } else {
        pageFilter.changePage = false;
      }
      // 如果有排序字段，则需要将原来的清空
      pageFilter.sortFields = {};
      pageFilter.sortFields[sortField] = sortType;
    }

    if (this.refreshTable) this.refreshTable(pageFilter);
  };

  drawToolbar = () => {
    if (this.drawToolbarPanel) {
      return <ToolbarPanel>{this.drawToolbarPanel()}</ToolbarPanel>;
    } else {
      return '';
    }
  };

  drawToolbarTwo = () => {
    if (this.drawToolbarPanelContent) {
      return <ToolbarPane1Content>{this.drawToolbarPanelContent()}</ToolbarPane1Content>;
    } else {
      return '';
    }
  };

  drawPage = () => {
    const { selectedRows, data, scroll, key, unSaveFilter } = this.state;
    const { loading } = this.props;

    let tableFilter = {
      selectedRows: this.state.selectedRows,
      pageFilter: this.state.pageFilter,
    };
    //将查询条件存入cache
    if (!unSaveFilter) {
      setPageFilter(getActiveKey() + this.props.quickuuid, this.state.pageFilters);
    }

    const tableLoading = {
      spinning: this.state.sucomIdspendLoading ? false : loading,
      indicator: LoadingIcon('default'),
    };

    return (
      <div>
        {this.state.noNavigator ? (
          ''
        ) : (
          <NavigatorPanel
            canFullScreen={this.state.canFullScreen}
            title={this.state.title}
            action={this.drawActionButton ? this.drawActionButton() : ''}
          />
        )}
        {this.drawSearchPanel ? this.drawSearchPanel() : ''}
        {this.drawToolbar()}
        {this.drawToolbarTwo()}
        {!this.state.noTable ? (
          <StandardTable
            quickuuid={this.props.quickuuid}
            minHeight={this.state.minHeight}
            colTotal={this.state.colTotal ? this.state.colTotal : []}
            unShowRow={this.state.unShowRow ? this.state.unShowRow : false}
            onRow={this.handleOnRow}
            rowKey={record => record.uuid}
            hasSettingColumns={
              this.state.hasSettingColumns == undefined ? true : this.state.hasSettingColumns
            }
            selectedRows={selectedRows}
            loading={tableLoading}
            tableHeight={this.state.tableHeight}
            data={data}
            columns={this.columns}
            noPagination={this.state.noPagination}
            newScroll={scroll ? scroll : undefined}
            onSelectRow={this.handleSelectRows}
            onChange={this.handleStandardTableChange}
            comId={key}
            rowClassName={(record, index) => {
              let name = '';
              if (index % 2 === 0) {
                name = styles.lightRow;
              }
              return name;
            }}
            noActionCol={this.state.noActionCol}
            canDrag={this.state.canDragTable}
            pageSize={sessionStorage.getItem('searchPageLine')}
            noToolbarPanel={
              !this.state.noToolbar && this.drawToolbarPanel && this.drawToolbarPanel()
                ? false
                : true
            }
            drapTableChange={this.drapTableChange}
          />
        ) : null}
        {this.drawOtherCom && this.drawOtherCom()}
      </div>
    );
  };

  render() {
    let ret = this.state.canFullScreen ? (
      <FreshPageHeaderWrapper>{this.drawPage()}</FreshPageHeaderWrapper>
    ) : this.state.isNotHd ? (
      <div>{this.drawPage()}</div>
    ) : (
      <PageHeaderWrapper>
        <Page withCollect={true} pathname={this.props.pathname}>
          {this.drawPage()}
        </Page>
      </PageHeaderWrapper>
    );
    if (this.state.isDrag) {
      return <DndProvider backend={HTML5Backend}>{ret}</DndProvider>;
    } else {
      return ret;
    }
  }
}
