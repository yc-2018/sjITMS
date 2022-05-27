/*
 * @Author: guankongjin
 * @Date: 2022-05-27 09:11:09
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-05-27 14:59:25
 * @Description: 批处理
 * @FilePath: \iwms-web\src\pages\SJTms\Dispatching\batchProcessConfirm.js
 */
import React, { Component } from 'react';
import { Progress, Modal, Button, message, Tooltip, Icon } from 'antd';
import styles from './BatchProcessConfirm.less';
import warnFillSvg from '@/assets/common/img_warnfill.svg';
import { PROGRESS_STATUS } from '@/utils/constants';

export default class BatchProcessConfirm extends Component {
  currentIndex = 0;
  state = {
    actionName: '',
    taskCount: 0,
    rowKeys: [],
    failedRowKeys: [],
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
  };

  componentDidMount() {
    this.props.onRef && this.props.onRef(this);
  }

  //显示
  show = (actionName, rowKeys) => {
    this.setState({
      actionName,
      rowKeys,
      taskCount: rowKeys.length,
      confirmModalVisible: true,
    });
  };

  //任务全部成功
  handleAllSuccessed = () => {
    const { actionName, taskReport } = this.state;
    message.success(
      `成功批量${actionName}${taskReport.success}个选项，跳过${taskReport.skip}个选项`
    );
    this.resetProgress();
    this.props.refreshTable();
  };

  //确认批量处理
  handleBatchProcessConfirmOk = () => {
    const { rowKeys } = this.state;
    this.handleProgressModalVisible(true);
    // 执行任务
    this.taskExecutionFunc(rowKeys);
  };
  //取消
  handleBatchProcessConfirmCancel = () => {
    this.resetProgress();
    this.setState({ confirmModalVisible: false });
  };
  //执行任务
  taskExecutionFunc = rowKeys => {
    let bacth = index => {
      this.props.task(rowKeys[index]).then(taskResult => {
        if (index + 1 < rowKeys.length) {
          bacth(index + 1);
        }
        this.calculateTask(taskResult, rowKeys[index]);
      });
    };
    bacth(0);
  };

  //任务执行记录
  calculateTask = (taskResult, uuid) => {
    let { taskReport, taskCount, failedRowKeys } = this.state;
    this.currentIndex++;
    if (taskResult == null) {
      taskReport.skip += 1;
    } else {
      if (taskResult.success) {
        taskReport.success += 1;
      } else {
        taskReport.failure += 1;
        failedRowKeys.push(uuid);
      }
    }
    this.setState({ taskReport, failedRowKeys });
    this.calculateProgressPercent(taskCount, this.currentIndex);

    if (this.currentIndex > 0 && taskCount === this.currentIndex) {
      if (taskReport.failure === 0) {
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
    const { progressPercent, currentIndex } = this.state;
    if (flag) {
      const { progressStatus, progressVisible } = this.state;
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
    this.resetProgress();
    let rowkeys = this.state.failedRowKeys;
    this.setState({
      progressModalVisible: true,
      progressVisible: true,
      showFailedResultModal: false,
      taskCount: rowkeys.length,
      failedRowKeys: [],
    });
    this.taskExecutionFunc(rowkeys);
  };
  //取消重试
  handleRetryCancel = () => {
    this.resetProgress();
    this.setState({ showFailedResultModal: false });
  };
  //重试批量处理结果
  renderProgressFeedbackFailedResult = () => {
    const { actionName, taskReport } = this.state;
    return (
      <div>
        成功
        {actionName}
        <span className={styles.taskNumber}>{taskReport.success}</span>
        个选项， 跳过
        <span className={styles.taskNumber}>{taskReport.skip}</span>
        个选项， 失败
        <span className={styles.taskNumber}>{taskReport.failure}</span>
        个选项
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
          <p className={styles.confirmTips}>{'是否批量' + actionName + taskCount + '个选项?'}</p>
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
          footer={[]}
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
            <br />
            <Button type="primary" onClick={this.handleRerty}>
              重试
            </Button>
          </div>
        </Modal>
      </div>
    );
  }
}
