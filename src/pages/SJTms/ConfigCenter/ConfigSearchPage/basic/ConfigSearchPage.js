import React, { Component } from 'react';
import { message, Tabs } from 'antd';
import { formatMessage } from 'umi/locale';
// import StandardTable from '@/components/StandardTable';
import StandardTable from '@/pages/Component/RapidDevelopment/CommonLayout/RyzeStandardTable';

import LoadingIcon from '@/pages/Component/Loading/LoadingIcon';
import ToolbarPanel from '@/pages/Component/Page/inner/ToolbarPanel';
import ConfirmProgress from '@/pages/Component/Progress/ConfirmProgress';
import styles from './ConfigSearchPage.less';
import { loginOrg } from '@/utils/LoginContext';
import EntityLogTab from '@/pages/Component/Page/inner/EntityLogTab';
import { commonLocale } from '@/utils/CommonLocale';
import IconFont from '@/components/IconFont';
import ResourceDescPage from '@/pages/Component/Page/inner/ResourceDescPage';
import ResourceDescHeader from '@/pages/Component/Page/inner/ResourceDescHeader';

const { TabPane } = Tabs;
/**
 * 物流设施 - 配置中心 - 搜索+表格界面基类
 *
 * 界面标题：具体模块搜索界面在状态中设置title<br>
 * 右上角按钮：子类可通过实现drawActionButton来构造该按钮组<br>
 * 搜索面板：子类通过实现drawSearchPanel来构造搜索面板<br>
 * 搜索表格：父类会调用子类的columns属性作为表格的列，从子类状态中取data作为数据来源，子类需在state中提供selectedRows，由父类进行更新<br>
 * 刷新表格：子类提供refreshTable方法，当父类表格发生变化（分页、排序、表格内筛选）时会调用该方法，并传入表格搜索数据（当前页、每页条数等等）<br>
 * 日志Tab：子类在状态中设置logCaption<br>
 * 界面loading ：当不想让表格进行loaing时 在子类状态中设置suspendLoading属性（是否暂停表格loading）
 */
export default class ConfigSearchPage extends Component {
  constructor(props) {
    super(props);

    let queryFilter = {
      selectedRows: [],
      pageFilter: {
        page: 0,
        pageSize: 20,
        sortFields: {},
        searchKeyValues: {},
        likeKeyValues: {},
      },
    };

    if (
      sessionStorage.getItem('config.selectedKey') &&
      sessionStorage.getItem(sessionStorage.getItem('config.selectedKey'))
    ) {
      queryFilter = JSON.parse(
        sessionStorage.getItem(sessionStorage.getItem('config.selectedKey'))
      );
    }

    this.state = {
      ...queryFilter,
      batchProcessConfirmModalVisible: false,
      isCloseFailedResultModal: false,
      taskInfo: {
        total: 0,
      },
      failedTasks: [],
      keyLog: 0,
      stockMoveDrawerVisible: false,
    };
  }

  shouldComponentUpdate() {
    if (this.props.pathname && this.props.pathname !== window.location.pathname) {
      return false;
    } else {
      return true;
    }
  }

  /**
   * 表格内容改变时，调用此方法
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

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  // ----- 批处理开始 ------

  /**
   * progress流程结束
   */
  terminateProgress = () => {
    this.refreshTable();
    this.setState({
      batchProcessConfirmModalVisible: false,
      selectedRows: [],
    });
  };

  /**
   * 确认执行任务之前回调
   */
  taskConfirmCallback = () => {
    this.setState({
      batchProcessConfirmModalVisible: false,
    });
  };

  /**
   * 重试取消
   */
  retryCancelCallback = () => {
    this.terminateProgress();
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
    });

    if (failedTasks.length >= 1) {
      // 将执行失败的任务加入到selectedRows
      this.setState({
        selectedRows: failedTasks,
        failedTasks: [],
      });
      // 继续进行批处理
      this.handleBatchProcessConfirmModalVisible(true, taskInfo.type, failedTasks);
    }
  };

  /**
   * 批量处理弹出框显示处理（入口）
   */
  handleBatchProcessConfirmModalVisible = (flag, taskType, failedTasks) => {
    const { selectedRows } = this.state;

    if (selectedRows.length === 0) {
      message.warn(formatMessage({ id: 'common.progress.select.tips' }));
      return;
    }
    if (flag) {
      const { taskInfo } = this.state;
      taskInfo.total = failedTasks ? failedTasks.length : selectedRows.length;
      taskInfo.type = taskType;

      this.setState({
        taskInfo: taskInfo,
      });
    }

    this.setState({
      batchProcessConfirmModalVisible: !!flag,
    });
  };

  /**
   * 任务全部执行成功时回调
   */
  taskSuccessedCallback = () => {
    this.terminateProgress();
  };

  /**
   * 任务取消执行
   */
  taskCancelCallback = () => {
    this.setState({
      batchProcessConfirmModalVisible: false,
    });
    this.terminateProgress();
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
   * 响应批处理
   */
  batchCallback = (response, record) => {
    if (response && response.success) {
      this.refs.batchHandle.calculateTaskSuccessed();
    } else {
      this.refs.batchHandle.calculateTaskFailed();
      this.collectFaildedTask(record);
    }
  };

  // ----- 批处理结果 ------

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

  drawToolbar = () => {
    if (this.drawToolbarPanel) {
      return <ToolbarPanel>{this.drawToolbarPanel()}</ToolbarPanel>;
    } else {
      return '';
    }
  };
  /**
   * 切换tab页
   */
  handleChangeTab = key => {
    if (key == '2') {
      this.setState({
        keyLog: this.state.keyLog + 1,
      });
    }
  };

  render() {
    const { loading } = this.props;
    const { title, selectedRows, data, scroll, unShowRow, key } = this.state;
    let tableFilter = {
      selectedRows: this.state.selectedRows,
      pageFilter: this.state.pageFilter,
    };
    if (sessionStorage.getItem('config.selectedKey')) {
      sessionStorage.setItem(
        sessionStorage.getItem('config.selectedKey'),
        JSON.stringify(tableFilter)
      );
    }
    const tableLoading = {
      spinning: this.state.suspendLoading ? false : loading,
      indicator: LoadingIcon('default'),
    };

    return (
      <div>
        {(title || this.drawActionButton) && (
          <div className={styles.topWrapper}>
            {title && <ResourceDescHeader title={title} />}
            <div className={styles.action}>{this.drawActionButton && this.drawActionButton()}</div>
          </div>
        )}
        <Tabs defaultActiveKey="1" onChange={this.handleChangeTab}>
          {!this.state.hideBusTabe && (
            <TabPane tab={commonLocale.congfigLocale} key="1">
              {this.drawSearchPanel && (
                <div className={styles.searchPanel}>
                  {this.drawSearchPanel && this.drawSearchPanel()}
                </div>
              )}
              {this.drawToolbarPanel && <ToolbarPanel>{this.drawToolbarPanel()}</ToolbarPanel>}

              {!this.state.hideTable && (
                <StandardTable
                  selectedRows={selectedRows}
                  rowKey={record => record.uuid}
                  loading={tableLoading}
                  noActionCol={this.state.noActionCol ? true : false}
                  unShowRow={unShowRow}
                  data={data}
                  columns={this.state.columns ? this.state.columns : []}
                  onSelectRow={this.handleSelectRows}
                  // onChange={this.handleStandardTableChange}
                  scroll={scroll}
                  newScroll={this.state.newScroll}
                  comId={key}
                  noSettingColumns
                  noToolbarPanel={this.state.noToolbarPanel}
                  colTotal={[]}
                />
              )}
              {this.drawCreateModal && this.drawCreateModal()}
              {this.drawProgress()}
            </TabPane>
          )}
          {!this.state.hideLogTab ? (
            <TabPane tab={formatMessage({ id: 'company.detail.tab.operateInfo' })} key="2">
              <EntityLogTab
                entityUuid={
                  this.state.onlyEntityUuid
                    ? this.state.logCaption
                    : loginOrg().uuid + this.state.logCaption
                }
                key={this.state.keyLog}
              />
            </TabPane>
          ) : null}
        </Tabs>
      </div>
    );
  }
}
