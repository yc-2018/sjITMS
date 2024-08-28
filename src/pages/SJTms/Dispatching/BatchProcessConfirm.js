/*
 * @Author: guankongjin
 * @Date: 2022-05-27 09:11:09
 * @LastEditors: guankongjin
 * @LastEditTime: 2023-03-09 16:22:19
 * @Description: 批处理
 * @FilePath: \iwms-web\src\pages\SJTms\Dispatching\BatchProcessConfirm.js
 */
import React, { Component } from 'react';
import { Progress, Modal, Popover, Button, message } from 'antd';
import styles from './BatchProcessConfirm.less';
import warnFillSvg from '@/assets/common/img_warnfill.svg';
import { PROGRESS_STATUS } from '@/utils/constants';

export default class BatchProcessConfirm extends Component {
  currentIndex = 0;
  state = {
    actionName: '',
    taskCount: 0,
    rowKeys: [],
    successRowKeys: [],
    errMsg: [],
    confirmModalVisible: false,
    progressModalVisible: false,
    progressStatus: PROGRESS_STATUS['active'],
    progressVisible: false,
    progressPercent: 0,
    taskReport: {
      success: 0,
      failure: 0,
      skip: 0,
    },
    showFailedResultModal: false,
    confirmLoading: false,
    task: {},
    refresh: {},
    tip: <></>,                     // 批量操作前提示
  };

  componentDidMount() {
    this.props.onRef && this.props.onRef(this);
  }

  /**
   * 显示
   * @param actionName{string} 操作名称 如删除、审核、作废等
   * @param rowKeys{Array}     需要批量处理的列表
   * @param task{Function}     执行任务方法（多次执行）
   * @param refresh{Function} 刷新方法（重新搜索列表）
   * @param tip{ReactNode}    刷新方法（重新搜索列表）
  */
  show = (actionName, rowKeys, task, refresh, tip = <></>) => {
    this.setState({
      actionName,
      rowKeys,
      taskCount: rowKeys.length,
      confirmModalVisible: true,
      task,
      refresh,
      tip,
    });
  };

  //任务全部成功
  handleAllSuccessed = () => {
    const { actionName, taskReport } = this.state;
    message.success(
      `成功批量${actionName}${taskReport.success}个选项，跳过${taskReport.skip}个选项`
    );
    localStorage.setItem('showMessage', '1');
    this.resetProgress();
    this.state.refresh();
  };

  //确认批量处理
  handleBatchProcessConfirmOk = () => {
    const { rowKeys } = this.state;
    this.handleProgressModalVisible(true);
    localStorage.setItem('showMessage', '0');
    // 执行任务
    this.taskExecutionFunc(rowKeys);
  };
  //取消
  handleBatchProcessConfirmCancel = () => {
    localStorage.setItem('showMessage', '1');
    this.resetProgress();
    this.setState({ confirmModalVisible: false });
  };
  //执行任务
  taskExecutionFunc = rowKeys => {
    let bacth = index => {
      this.state.task(rowKeys[index]).then(response => {
        if (index + 1 < rowKeys.length) {
          bacth(index + 1);
        }
        this.calculateTask(response, rowKeys[index]);
      });
    };
    bacth(0);
  };

  //任务执行记录
  calculateTask = (taskResult, uuid) => {
    let { taskReport, successRowKeys, errMsg } = this.state;
    this.currentIndex++;
    if (taskResult == null) {
      taskReport.skip += 1;
    } else {
      if (taskResult.success) {
        taskReport.success += 1;
        successRowKeys.push(uuid);
      } else {
        errMsg.push(taskResult.message);
        taskReport.failure += 1;
      }
    }
    this.setState({ taskReport, successRowKeys, errMsg });
    this.showResult();
  };

  showResult = () => {
    let { taskReport, taskCount } = this.state;

    this.calculateProgressPercent(taskCount, this.currentIndex);

    if (this.currentIndex > 0 && taskCount === this.currentIndex) {
      if (taskReport.failure == 0 && taskReport.skip == 0) {
        this.handleAllSuccessed();
      } else {
        this.setState({
          progressModalVisible: false,
          progressVisible: false,
          progressStatus: PROGRESS_STATUS['exception'],
          showFailedResultModal: true,
        });
      }
    }
  };

  /** 计算进度条的百分比（任务执行进度）
   * @param {Integer} total 任务总数，必大于0
   * @param {Integer} index 当前已完成任务数， 必大于0
   */
  calculateProgressPercent = (total, index) => {
    let precent = (index / total) * 100;
    precent = Math.floor(precent);
    this.setState({
      progressPercent: total > 0 && index > 0 && total >= index ? precent : 0,
    });
  };
  //进度条弹出框显示控制
  handleProgressModalVisible = flag => {
    if (flag) {
      this.setState({
        currentIndex: 0,
        progressStatus: PROGRESS_STATUS['active'],
        progressPercent: 0,
        progressVisible: true,
        confirmLoading: true,
      });
    }
    this.setState({ progressModalVisible: !!flag });
  };
  //批量处理状态
  renderProgressFeedbackStatus = () => {
    const { taskCount, taskReport } = this.state;
    return (
      <div>
        <center>
          <span>
            已执行
            <span className={styles.taskNumber}>
              {taskReport.success + taskReport.skip + taskReport.failure}/{taskCount}
            </span>
            个选项
          </span>
          <br />
          <span>
            跳过
            <span className={styles.taskNumber}>{taskReport.skip}</span>
            个选项
          </span>
        </center>
      </div>
    );
  };

  //重试
  handleRerty = () => {
    let { successRowKeys, rowKeys } = this.state;
    this.resetProgress();
    let rows = rowKeys.filter(x => successRowKeys.indexOf(x) == -1);
    this.setState({
      progressModalVisible: true,
      progressVisible: true,
      showFailedResultModal: false,
      taskCount: rows.length,
    });
    this.taskExecutionFunc(rows);
  };
  //取消重试
  handleRetryCancel = () => {
    localStorage.setItem('showMessage', '1');
    this.resetProgress();
    this.setState({ showFailedResultModal: false });
  };
  //重试批量处理结果
  renderProgressFeedbackFailedResult = () => {
    const { actionName, taskReport, errMsg } = this.state;
    return (
      <div>
        成功
        {actionName}
        <span className={styles.taskNumber}>{taskReport.success}</span>
        个选项， 跳过
        <span className={styles.taskNumber}>{taskReport.skip}</span>
        个选项，
        <Popover
          content={
            errMsg.length > 0 ? (
              errMsg.map(err => {
                return <p>{err}</p>;
              })
            ) : (
              <></>
            )
          }
          title="失败原因"
          trigger="hover"
        >
          失败
          <a className={styles.taskNumber} style={{ textDecoration: 'underline' }}>
            {taskReport.failure}
          </a>
          个选项
        </Popover>
      </div>
    );
  };

  //重置
  resetProgress = () => {
    const { taskReport } = this.state;

    taskReport.success = 0;
    taskReport.failure = 0;
    taskReport.skip = 0;
    this.currentIndex = 0;
    this.setState({
      confirmModalVisible: false,
      progressModalVisible: false,
      progressVisible: false,
      progressStatus: PROGRESS_STATUS['active'],
      progressPercent: 0,
      taskReport,
      errMsg: [],
      confirmLoading: false,
    });
  };

  render() {
    const {
      confirmModalVisible,
      actionName,
      taskCount,
      progressModalVisible,
      progressStatus,
      progressVisible,
      progressPercent,
      showFailedResultModal,
      confirmLoading,
      errMsg,
      tip,
    } = this.state;

    return (
      <div>
        {/* 确定 */}
        <Modal
          title={`批量${actionName}`}
          visible={confirmModalVisible}
          onOk={this.handleBatchProcessConfirmOk}
          onCancel={this.handleBatchProcessConfirmCancel}
          destroyOnClose
          confirmLoading={confirmLoading}
          key="batchmodal1"
        >
          <p className={styles.confirmTips}>{`是否批量${actionName}${taskCount}个选项?`}</p>
          <div style={{textAlign: 'center'}}>{tip}</div>
        </Modal>
        {/* 进度 */}
        <Modal
          visible={progressModalVisible && this.currentIndex !== taskCount}
          footer={[]}
          closable={false}
          width={350}
          destroyOnClose
          key="batchmodal2"
        >
          <div>
            <Progress
              percent={progressPercent}
              status={progressStatus}
              style={{ display: progressVisible ? 'block' : 'none' }}
            />
            <br />
            <span className={styles.feedbackStatus}>{this.renderProgressFeedbackStatus()}</span>
          </div>
        </Modal>
        {/* 失败提示 */}
        <Modal
          visible={showFailedResultModal}
          footer={
            <div>
              <Button onClick={this.handleRerty}>重试</Button>
              <Button
                type="primary"
                onClick={() => {
                  this.resetProgress();
                  this.setState({ showFailedResultModal: false });
                }}
              >
                关闭
              </Button>
            </div>
          }
          onCancel={this.handleRetryCancel}
          width={350}
          destroyOnClose
          key="batchmodal3"
        >
          <div className={styles.taskFailedWrap}>
            <img src={warnFillSvg} />
            <br />
            <br />
            {this.renderProgressFeedbackFailedResult()}
            {errMsg.length > 0 ? (
              <div style={{ marginTop: 15, color: 'red' }}>
                失败原因
                {errMsg.map(err => {
                  return <p style={{ marginTop: 5 }}>{err}</p>;
                })}
              </div>
            ) : null}
          </div>
        </Modal>
      </div>
    );
  }
}
