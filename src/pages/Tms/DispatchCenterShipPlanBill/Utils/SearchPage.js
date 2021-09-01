import React, { PureComponent, Component } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import Page from '@/pages/Component/Page/inner/Page';
import NavigatorPanel from './NavigatorPanel';
import ConfirmProgress from '@/pages/Component/Progress/ConfirmProgress';
import StandardTable from '../StandardTable';
import LoadingIcon from '@/pages/Component/Loading/LoadingIcon';
import { message } from 'antd';
import { formatMessage } from 'umi/locale';
import { getActiveKey } from '@/utils/LoginContext';
import styles from './util.less';
import { OrderStat } from '../DispatchCenterShipPlanBillContants';
import { runInThisContext } from 'vm';
/**
 * 搜索界面基类<br>
 * 界面标题：具体模块搜索界面在状态中设置title<br>
 * 右上角按钮：子类可通过实现drawActionButton来构造该按钮组<br>
 * 搜索面板：子类通过实现drawSearchPanel来构造搜索面板<br>
 * 工具栏：子类通过实现drawToolbarPanel来构造工具栏<br>
 * 搜索表格：父类会调用子类的columns属性作为表格的列，从子类状态中取data作为数据来源，子类需在state中提供selectedRows，由父类进行更新<br>
 * 刷新表格：子类提供refreshTable方法，当父类表格发生变化（分页、排序、表格内筛选）时会调用该方法，并传入表格搜索数据（当前页、每页条数等等）<br>
 * 界面loading ：当不想让表格进行loaing时 在子类状态中设z置suspendLoading属性（是否暂停表格loading）
 */
export default class SearchPage extends Component {
  constructor(props) {
    super(props);
    let queryFilter = {
      selectedRows: [],
      // selectedRowsNest:[],
      selectedRowsNest:{},
      selectedRowKeysForNest: [],
      pageFilter: {
        page: 0,
        pageSize: 50,
        sortFields: {},
        searchKeyValues: {},
        likeKeyValues: {}
      },
      rowId:''
    };
    // 获取三个页面的searchKeyValues
    if (sessionStorage.getItem(this.props.searchPageType?this.props.searchPageType:getActiveKey())) {
      queryFilter = JSON.parse(sessionStorage.getItem(this.props.searchPageType?this.props.searchPageType:getActiveKey()));
    }
    this.state = {
      ...queryFilter,
      batchProcessConfirmModalVisible: false,
      isCloseFailedResultModal: false,
      taskInfo: {
        total: 0,
      },
      failedTasks: [],
    };
  }
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
    let selectedRowsNest = {};
    let keys = [];
    for(let j=0;j<rows.length;j++){
      const childrens = rows[j].items;
      if (childrens) {
        selectedRowsNest[rows[j].uuid] = childrens;
      }
    }
    for(let propyKey in selectedRowsNest){
      for(let i=0;i<selectedRowsNest[propyKey].length;i++){
        keys.push(selectedRowsNest[propyKey][i] && selectedRowsNest[propyKey][i].uuid ? selectedRowsNest[propyKey][i].uuid : '');
      }
    }
    this.setState({
      selectedRowsNest:{...selectedRowsNest},
      selectedRowKeysForNest: [...keys]
    },()=>{
      this.changeSelectedRowsNest && this.changeSelectedRowsNest(selectedRowsNest, keys);
    });
  };
  handleRowSelectChangeForNest= (rows,mainRecord) => {
    const { selectedRowsNest, selectedRowKeysForNest, selectedRows } = this.state;
    let keys = [];
    if(rows.length > 0){
      selectedRowsNest[mainRecord.uuid] = rows;
    }else{
      delete selectedRowsNest[mainRecord.uuid]
    }
    for(let propyKey in selectedRowsNest){
      for(let i=0;i<selectedRowsNest[propyKey].length;i++){
        keys.push(selectedRowsNest[propyKey][i] && selectedRowsNest[propyKey][i].uuid ? selectedRowsNest[propyKey][i].uuid : '');
      }
    }
    let idx = -1;
    for (let i = 0;i<selectedRows.length;i++) {
      if (selectedRows[i].uuid === mainRecord.uuid) {
        idx = i;
      }
    }
    if (rows.length === mainRecord.items.length && idx === -1) {
      selectedRows.push(mainRecord);
    } else if (rows.length < mainRecord.items.length && idx > -1) {
      selectedRows.splice(idx, 1);
    }
    this.setState({
      selectedRowsNest:{...selectedRowsNest},
      selectedRowKeysForNest: [...keys],
      selectedRows: [...selectedRows]
    },()=>{
      this.changeSelectedRows && this.changeSelectedRows(selectedRows);
      this.changeSelectedRowsNest && this.changeSelectedRowsNest(selectedRowsNest, keys);
    });
  };
  // handleRowSelectChangeForNestForOrder= (rows,mainRecord) => {
  //   const { selectedRowsNest } = this.state;
  //
  //   if(rows.length!=0){
  //     selectedRowsNest[mainRecord.orderUuid] = rows;
  //   }else{
  //     delete selectedRowsNest[mainRecord.orderUuid]
  //   }
  //
  //   this.setState({
  //     selectedRowsNest:{...selectedRowsNest},
  //   },()=>{
  //     this.changeSelectedRowsNest && this.changeSelectedRowsNest(rows);
  //   });
  //
  // };
  clearNestSelect = ()=>{
    this.state.selectedRowsNest = {};
    this.setState({
      selectedRowsNest:{},
    });
    this.changeSelectedRowsNest && this.changeSelectedRowsNest({});
  }
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
    if (this.refreshTable)
      this.refreshTable(pageFilter);
  };
  //  -------- 批处理相关 START -------
  /**
   * 确认执行任务之前回调
   */
  taskConfirmCallback = () => {
    this.setState({
      batchProcessConfirmModalVisible: false,
    });
    localStorage.setItem("showMessage", "0");
  }
  /**
   * progress流程结束
   */
  terminateProgress = (cancel) => {
    if (cancel) {
      return;
    }
    this.refreshTableForProgress();
    this.setState({
      batchProcessConfirmModalVisible: false,
      selectedRows: [],
      failedTasks: [],
    });
    this.changeSelectedRows && this.changeSelectedRows([]);
  }
  /**
   * 重试取消
   */
  retryCancelCallback = () => {
    localStorage.setItem("showMessage", "1");
    this.terminateProgress(true);
    if(this.state.batchAction =='批准'){
      this.refreshTableForProgress();
    }
  };
  /**
   * 任务执行出错时回调，用于重试
   */
  taskFailedCallback = (noModal) => {
    const { taskInfo, selectedRows, failedTasks } = this.state;
    // 关掉错误提示
    this.setState({
      isCloseFailedResultModal: false,
      batchProcessConfirmModalVisible: false,
    })
    if (failedTasks.length >= 1) {
      // 将执行失败的任务加入到selectedRows
      this.setState({
        selectedRows: failedTasks,
        failedTasks: [],
      },()=>{
        // 继续进行批处理
        if(!noModal){
          this.handleBatchProcessConfirmModalVisible(true, taskInfo.type, failedTasks);
        }else{
          this.handleNotBatchProcessConfirmModalVisible(true, taskInfo.type, failedTasks);
        }
      });
      this.changeSelectedRows && this.changeSelectedRows(failedTasks);
    }
  };
  /**
   * 批量处理弹出框显示处理（入口）
   */
  handleBatchProcessConfirmModalVisible = (flag, taskType, failedTasks) => {
    const { selectedRows } = this.state;
    if (selectedRows.length === 0 && ((failedTasks ? failedTasks.length : 0) === 0)) {
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
      });
    }
    this.setState({
      batchProcessConfirmModalVisible: !!flag,
    });
  };
  /**
   * 批量处理弹出框显示处理（入口）--无确认提示框
   */
  handleNotBatchProcessConfirmModalVisible = (flag, taskType, failedTasks)=>{
    const { selectedRows,taskInfo } = this.state;
    if (flag) {
      taskInfo.total = failedTasks ? failedTasks.length : selectedRows.length;
      taskInfo.type = taskType;
      this.setState({
        taskInfo: taskInfo,
      });
    }
    this.refs.batchHandle.handleBatchProcessConfirmOk();
  }
  /**
   * 任务全部执行成功时回调
   */
  taskSuccessedCallback = () => {
    this.terminateProgress();
    localStorage.setItem("showMessage", "1");
  }
  /**
   * 任务取消执行
   */
  taskCancelCallback = () => {
    this.setState({
      batchProcessConfirmModalVisible: false,
    });
    localStorage.setItem("showMessage", "1");
    this.terminateProgress(true);
    this.subTaskCancelCallback && this.subTaskCancelCallback()
  }
  /**
   * 收集批量处理产生的失败任务
   */
  collectFaildedTask = (record) => {
    const { failedTasks } = this.state;
    if (failedTasks.indexOf(record) == -1) {
      failedTasks.push(record);
      this.setState({
        failedTasks: failedTasks,
      })
    }
  }
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
  }
  /**
   * 渲染批处理
   */
  drawProgress = () => {
    const {
      taskInfo,
      batchProcessConfirmModalVisible,
      isCloseFailedResultModal
    } = this.state;
    const progressProps = {
      taskInfo: taskInfo,
      entity: this.state.title,
      action: this.state.batchAction,
      batchProcessConfirmModalVisible: batchProcessConfirmModalVisible,
      isCloseFailedResultModal: isCloseFailedResultModal,
      content: this.state.content
    }
    const progressMethods = {
      taskConfirmCallback: this.taskConfirmCallback,
      taskCancelCallback: this.taskCancelCallback,
      taskFailedCallback: this.taskFailedCallback,
      taskSuccessedCallback: this.taskSuccessedCallback,
      retryCancelCallback: this.retryCancelCallback,
      taskExecutionFunc: this.onBatchProcess,
    }
    return (
      <ConfirmProgress {...progressProps} {...progressMethods} ref="batchHandle" />
    );
  }
  //  -------- 批处理相关 END -------
  onClickedRow = (record)=>{
    this.setState({
      rowId: record.uuid?record.uuid:record.billUuid,
    });
    if(this.state.hasOnRow){
      this.onClickRow && this.onClickRow(record);
    }
  }
  // ----------- 公共模块跳转方法 -----------
  render() {
    const { selectedRows,selectedRowsNest, data, scroll,key,selectedRowKeysForNest } = this.state;
    const { loading } = this.props;
    let tableFilter = {
      selectedRows: this.state.selectedRows,
      pageFilter: this.state.pageFilter
    };
    //存储三个页面的searchKeyValues
    sessionStorage.setItem(this.props.searchPageType?this.props.searchPageType:getActiveKey(), JSON.stringify(tableFilter));
    const tableLoading = {
      spinning: this.state.suspendLoading ? false : loading,
      indicator: LoadingIcon('default')
    }
    //   console.log('============================')
    // console.log(selectedRows)
    // console.log(selectedRowsNest)
    // console.log(selectedRowKeysForNest)
    return (
      <div style={{width:this.state.width?this.state.width:'92%',paddingTop:'2%'}}>
        <div style={{minHeight:this.state.minHeight?this.state.minHeight:'500px'}}>
          <NavigatorPanel title={this.state.title} action={this.drawActionButton ? this.drawActionButton() : ''}/>
          {this.drawSearchPanel?this.drawSearchPanel():null}
          {this.drawBussiness?this.drawBussiness():null}
          {this.drawOther?this.drawOther():null}
          <StandardTable
            nestColumns={this.nestColumns?this.nestColumns:null}
            expand={this.state.expand?this.state.expand:false}
            nestRowSelect={this.state.nestRowSelect?this.state.nestRowSelect:false}
            clearNestSelect={this.clearNestSelect}
            hasOnRow
            comId={key}
            noPagination
            unShowRow={this.state.unShowRow ? this.state.unShowRow : false}
            rowKey={(record,index) => record.uuid}
            fixed={this.state.noFixed?false:true}
            rowSelectionWidth={10}
            selectedRows={selectedRows}
            selectedRowsNest={selectedRowsNest}
            selectedRowKeysForNestUse={selectedRowKeysForNest}
            loading={loading}
            data={data}
            columns={this.columns}
            newScroll={this.state.scrollValue?this.state.scrollValue:null}
            size="small"
            defaultPageSize={20}
            onSelectRow={this.handleSelectRows}
            onSelectRowForNest={this.handleRowSelectChangeForNest}
            // setSelectedRows={this.setSelectedRows}
            onChange={this.handleStandardTableChange}
            onClickRow={this.onClickedRow}
            canDrag={this.state.canDragTable}
            rowClassName ={(record, index) => {
              let name = '';
              if(((this.state.showViewPage!=undefined&&this.state.showViewPage==true)||this.state.showViewPage==undefined)
                &&(record.uuid||record.billUuid)&&this.state.rowId
                &&(record.uuid === this.state.rowId||record.billUuid === this.state.rowId)){
                name= styles.clickedStyle;
              }else if(record.orderStat&&record.orderStat==OrderStat.Reschedule.name){
                name = styles.reschedulStyle;
              }else if(record.orderStat&&record.orderStat==OrderStat.Resend.name){
                name = styles.resendStyle;
              }else if(index % 2 === 0 ){
                name = styles.lightRow;
              }
              return name
            }}
          />
          {this.drawProgress()}
        </div>
      </div>
    );
  }
}
