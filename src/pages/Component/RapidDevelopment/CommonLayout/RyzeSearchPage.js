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
        pageSize: sessionStorage.getItem('searchPageLine')
          ? parseInt(sessionStorage.getItem('searchPageLine'))
          : 20,
        sortFields: {},
        searchKeyValues: {},
        likeKeyValues: {},
      },
    };

    if (getPageFilter(getActiveKey())) {
      queryFilter = getPageFilter(getActiveKey());
      if (!queryFilter.pageFilter) {
        queryFilter.pageFilter = {
          page: 0,
          pageSize: sessionStorage.getItem('searchPageLine')
            ? parseInt(sessionStorage.getItem('searchPageLine'))
            : 20,
          sortFields: {},
          searchKeyValues: {},
          likeKeyValues: {},
        };
      }
    }

    this.state = {
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
    // if (this.state.batching) {
    //   return false;
    // }
    if (this.props.pathname && this.props.pathname !== window.location.pathname) {
      return false;
    } else {
      return true;
    }
  }

  componentWillReceiveProps(nextProps) {}

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
      if (sorter.field === 'article' || sorter.field === 'store') {
        sortField = `${sorter.field}Code`;
      }
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

  // region -------- 批处理相关 START -------

  /**
   * 确认执行任务之前回调
   */
  taskConfirmCallback = () => {
    this.setState({
      batchProcessConfirmModalVisible: false,
      batching: true,
      description: false,
    });
    localStorage.setItem('showMessage', '0');
  };

  /**
   * progress流程结束
   */
  terminateProgress = cancel => {
    if (cancel) {
      this.setState({
        batching: false,
      });
      return;
    }

    this.setState(
      {
        batchProcessConfirmModalVisible: false,
        selectedRows: [],
        failedTasks: [],
        batching: false,
      },
      () => {
        this.refreshTable();
      }
    );
    this.changeSelectedRows && this.changeSelectedRows([]);
  };

  /**
   * 重试取消
   */
  retryCancelCallback = () => {
    localStorage.setItem('showMessage', '1');
    this.terminateProgress(true);
  };

  /**
   * 任务执行出错时回调，用于重试
   */
  taskFailedCallback = () => {
    const { taskInfo, selectedRows, failedTasks } = this.state;
    // 关掉错误提示
    this.setState({
      isCloseFailedResultModal: false,
      batchProcessConfirmModalVisible: false,
      batching: false,
    });

    if (failedTasks.length >= 1) {
      // 将执行失败的任务加入到selectedRows
      this.setState({
        selectedRows: failedTasks,
        failedTasks: [],
      });
      // 继续进行批处理
      this.handleBatchProcessConfirmModalVisible(true, taskInfo.type, failedTasks);
      this.changeSelectedRows && this.changeSelectedRows(failedTasks);
    }
  };

  /**
   * 批量处理弹出框显示处理（入口）
   */
  handleBatchProcessConfirmModalVisible = (flag, taskType, failedTasks) => {
    const { selectedRows } = this.state;
    if (selectedRows.length === 0 && (failedTasks ? failedTasks.length : 0) === 0) {
      if (!this.state.noMessage) {
        message.warn(formatMessage({ id: 'common.progress.select.tips' }));
      }
      return;
    }
    if (flag) {
      const { taskInfo } = this.state;
      taskInfo.total = failedTasks ? failedTasks.length : selectedRows.length;
      taskInfo.type = taskType;

      this.setState({
        taskInfo: taskInfo,
        batchProcessConfirmModalVisible: flag,
      });
    } else {
      this.setState({
        batchProcessConfirmModalVisible: !!flag,
      });
    }
  };

  showConfirm = (content, action) => {
    const { confirm } = Modal;
    let confirmTitle =
      '确认' + formatMessage({ id: 'common.progress.confirmModal.title' }) + action;
    confirm({
      title: confirmTitle,
      icon: <IconFont type="icon-status_warn" />,
      content: content,
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        //防抖
        debounce(this.handleConfirmOk, 600);
      },
      onCancel: () => {
        //防抖
        debounce(this.handleConfirmCancel, 600);
      },
    });
  };
  // 确认框确定按钮 -- onOk
  handleConfirmOk = () => {
    this.refs.batchHandle.handleProgressModalVisible(true);
    this.taskConfirmCallback();
    // 执行任务
    this.onBatchProcess();
  };
  // 确认框取消按钮 -- onCancel
  handleConfirmCancel = () => {
    this.refs.batchHandle.resetProgress();
    this.taskCancelCallback();
  };
  /**
   * 任务全部执行成功时回调
   */
  taskSuccessedCallback = () => {
    this.terminateProgress();
    localStorage.setItem('showMessage', '1');
  };

  /**
   * 任务取消执行
   */
  taskCancelCallback = () => {
    this.setState({
      batchProcessConfirmModalVisible: false,
      description: false,
    });
    localStorage.setItem('showMessage', '1');
    this.terminateProgress(true);
    this.subTaskCancelCallback && this.subTaskCancelCallback();
  };

  /**
   * 收集批量处理产生的失败任务
   */
  collectFaildedTask = record => {
    const { failedTasks } = this.state;
    if (failedTasks.indexOf(record) == -1) {
      failedTasks.push(record);
      this.setState({
        failedTasks: failedTasks,
      });
    }
  };

  /**
   * 成功或者失败回调
   */
  batchCallback = (response, record) => {
    if (response && response.success) {
      this.refs.batchHandle.calculateTaskSuccessed();
    } else {
      this.refs.batchHandle.calculateTaskFailed();
      this.collectFaildedTask(record);
    }
  };

  /**
   * 渲染批处理
   */
  drawProgress = () => {
    const { taskInfo, batchProcessConfirmModalVisible, isCloseFailedResultModal } = this.state;

    const progressProps = {
      taskInfo: taskInfo,
      entity: this.state.title,
      action: this.state.batchAction,
      batchProcessConfirmModalVisible: batchProcessConfirmModalVisible,
      isCloseFailedResultModal: isCloseFailedResultModal,
      content: this.state.content,
      description: this.state.description,
    };
    const progressMethods = {
      taskConfirmCallback: this.taskConfirmCallback,
      taskCancelCallback: this.taskCancelCallback,
      taskFailedCallback: this.taskFailedCallback,
      taskSuccessedCallback: this.taskSuccessedCallback,
      retryCancelCallback: this.retryCancelCallback,
      taskExecutionFunc: this.onBatchProcess,
    };
    return <ConfirmProgress {...progressProps} {...progressMethods} ref="batchHandle" />;
  };

  // endregion -------- 批处理相关 END -------

  // region ----------- 公共模块跳转方法 -----------
  onViewDC = dcUuid => {
    this.props.dispatch(
      routerRedux.push({
        pathname: '/basic/dc',
        payload: {
          showPage: 'view',
          entityUuid: dcUuid,
        },
      })
    );
  };

  onViewArticle = articleUuid => {
    this.props.dispatch(
      routerRedux.push({
        pathname: '/basic/article',
        payload: {
          showPage: 'view',
          entityUuid: articleUuid,
        },
      })
    );
  };

  onViewVendor = vendorUuid => {
    this.props.dispatch(
      routerRedux.push({
        pathname: '/basic/vendor',
        payload: {
          showPage: 'view',
          entityUuid: vendorUuid,
        },
      })
    );
  };

  onViewStore = storeUuid => {
    this.props.dispatch(
      routerRedux.push({
        pathname: '/basic/store',
        payload: {
          showPage: 'view',
          entityUuid: storeUuid,
        },
      })
    );
  };

  onViewOwner = ownerUuid => {
    this.props.dispatch(
      routerRedux.push({
        pathname: '/basic/owner',
        payload: {
          showPage: 'view',
          entityUuid: ownerUuid,
        },
      })
    );
  };

  onViewContainer = barcode => {
    if (!barcode || '-' === barcode) return;
    this.props.dispatch(
      routerRedux.push({
        pathname: '/facility/container',
        payload: {
          showPage: 'view',
          entityUuid: barcode,
        },
      })
    );
  };

  onViewWrh = wrhUuid => {
    this.props.dispatch(
      routerRedux.push({
        pathname: '/facility/wrh',
        payload: {
          showPage: 'view',
          entityUuid: wrhUuid,
        },
      })
    );
  };

  onViewCarrier = carrierUuid => {
    this.props.dispatch(
      routerRedux.push({
        pathname: '/tms/carrier',
        payload: {
          showPage: 'view',
          entityUuid: carrierUuid,
        },
      })
    );
  };

  onViewVehicle = vehicleUuid => {
    this.props.dispatch(
      routerRedux.push({
        pathname: '/tms/vehicle',
        payload: {
          showPage: 'view',
          uuid: vehicleUuid,
        },
      })
    );
  };
  // endregion

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
    if (!unSaveFilter) {
      setPageFilter(getActiveKey(), tableFilter);
    }

    const tableLoading = {
      spinning: this.state.sucomIdspendLoading ? false : loading,
      indicator: LoadingIcon('default'),
    };
    return (
      <Page withCollect={true} pathname={this.props.pathname}>
        <NavigatorPanel
          canFullScreen={this.state.canFullScreen}
          title={this.state.title}
          action={this.drawActionButton ? this.drawActionButton() : ''}
        />
        {this.drawSearchPanel ? this.drawSearchPanel() : ''}
        {this.drawToolbar()}
        {this.drawToolbarTwo()}
        {!this.state.noTable ? (
          <StandardTable
            unShowRow={this.state.unShowRow ? this.state.unShowRow : false}
            rowKey={record => record.uuid}
            hasSettingColumns
            selectedRows={selectedRows}
            loading={tableLoading}
            tableHeight={this.state.tableHeight}
            data={data}
            columns={this.columns}
            noPagination={this.state.noPagination}
            scroll={scroll ? scroll : undefined}
            onSelectRow={this.handleSelectRows}
            onChange={this.handleStandardTableChange}
            comId={key}
            rowClassName={(record, index) => {
              let name = '';
              if (record.sourceOrderBillTms) {
                name = styles.changeColor;
              } else if (index % 2 === 0) {
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
      </Page>
    );
  };

  render() {
    let ret = this.state.canFullScreen ? (
      <FreshPageHeaderWrapper>
        {this.drawPage()}
        {this.drawProgress()}
      </FreshPageHeaderWrapper>
    ) : (
      <PageHeaderWrapper>
        {this.drawPage()}
        {this.drawProgress()}
      </PageHeaderWrapper>
    );
    if (this.state.isDrag) {
      return <DndProvider backend={HTML5Backend}>{ret}</DndProvider>;
    } else {
      return ret;
    }
  }
}
