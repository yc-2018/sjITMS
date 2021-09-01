import React, { PureComponent } from 'react';
import { Progress, Modal, Button, message, Tooltip, Icon } from 'antd';
import { formatMessage, getLocale } from 'umi/locale';
import styles from './ConfirmProgress.less';
import warnFillSvg from '@/assets/common/img_warnfill.svg';
import PropTypes from 'prop-types';
import { PROGRESS_STATUS } from '@/utils/constants';
import { showMessage, hideMessage } from '@/utils/utils';

/**
 * 确认进度条弹窗
 */
class ConfirmProgress extends PureComponent {

  static propTypes = {
    batchProcessConfirmModalVisible: PropTypes.bool,
    taskConfirmCallback: PropTypes.func,
    taskExecutionFunc: PropTypes.func,
    taskCancelCallback: PropTypes.func,
    taskFailedCallback: PropTypes.func,
    taskSuccessedCallback: PropTypes.func,
    retryCancelCallback: PropTypes.func,
    taskInfo: PropTypes.object,
    entity: PropTypes.string,
    action: PropTypes.string,
    isCloseFailedResultModal: PropTypes.bool,
  }

  static defaultProps = {
    batchProcessConfirmModalVisible: false,
    isCloseFailedResultModal: false,
    entity: '',
    action: '',
    taskInfo: {
      total: 0,
      type: '',
    },
  }

  constructor(props) {
    super(props)
    this.currentIndex = 0;
    this.state = {
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
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isCloseFailedResultModal) {
      this.setState({
        showFailedResultModal: false,
      })
    }
  }

  // -------- 外部组件可直接调用函数 START--------

  /**
   * 任务成功执行时处理
   */
  calculateTaskSuccessed = () => {
    const { taskReport } = this.state;
    const { taskInfo } = this.props;

    this.currentIndex++;
    taskReport.success += 1;

    this.setState((prevState) => {
      delete prevState.taskReport;
      return prevState;
    })

    this.setState({
      taskReport: taskReport,
    });
    this.calculateProgressPercent(taskInfo.total, this.currentIndex);

    if (this.currentIndex > 0 && taskInfo.total === this.currentIndex) {
      if (taskReport.failure === 0) {
        this.handleAllSuccessed();
      } else {
        this.setState({
          progressStatus: PROGRESS_STATUS['exception'],
        });
        this.handleTaskEndOccurFailed();
      }
    }
  }

  /**
   * 任务执行失败时处理
   */
  calculateTaskFailed = () => {
    const { taskReport } = this.state;
    const { taskInfo } = this.props;

    this.currentIndex++;
    taskReport.failure += 1;

    this.setState((prevState) => {
      delete prevState.taskReport;
      return prevState;
    })

    this.setState({
      taskReport: taskReport,
    });
    this.calculateProgressPercent(taskInfo.total, this.currentIndex);

    if (this.currentIndex > 0 && taskInfo.total === this.currentIndex) {
      this.setState({
        progressStatus: PROGRESS_STATUS['exception'],
      });
      this.handleTaskEndOccurFailed();
    }
  }

  /**
   * 任务执行跳过时处理
   */
  calculateTaskSkipped = () => {
    const { taskReport } = this.state;
    const { taskInfo } = this.props;

    this.currentIndex++;
    taskReport.skip += 1;

    this.setState((prevState) => {
      delete prevState.taskReport;
      return prevState;
    })

    this.setState({
      taskReport: taskReport,
    });

    this.calculateProgressPercent(taskInfo.total, this.currentIndex);

    if (this.currentIndex > 0 && taskInfo.total === this.currentIndex) {
      if (taskReport.failure === 0) {
        this.handleAllSuccessed();
      } else {
        this.setState({
          progressStatus: PROGRESS_STATUS['exception'],
        });
        this.handleTaskEndOccurFailed();
      }
    }
  }

  // -------- 外部组件可直接调用函数 END--------

  /**
   * 计算进度条的百分比（任务执行进度）
   *
   * @param {Integer} total 任务总数，必大于0
   * @param {Integer} index 当前已完成任务数， 必大于0
   */
  calculateProgressPercent = (total, index) => {
    if (total > 0 && index > 0 && total >= index) {
      let precent = (index / total) * 100;

      precent = Math.floor(precent)
      this.setState({
        progressPercent: precent,
      });
    } else {
      this.setState({
        progressPercent: 0,
      });
    }
  };

  // ------------ 国际化处理 START ------------

  /**
   * 国际化 - 批量处理确认
   */
  renderProgressConfirmTips = () => {
    const { action, taskInfo } = this.props;

    let number = taskInfo.total;
    if (getLocale() === 'en-US') {
      let s = '';
      if (number > 1) {
        s = 's';
      }
      return 'Whether to ' + action + ' ' + number + ' ' + 'item' + s + ' in batches?'
    } else if (getLocale() === 'zh-CN') {
      if (this.props.content) {
        return <span>是否批量{action}{number}个选项?&nbsp;&nbsp;
        <Tooltip title={this.props.content}>
            <Icon type="question-circle" theme="twoTone" twoToneColor="orange" />
          </Tooltip></span>;
      } else {
        return '是否批量' + action + number + "个选项?";
      }
    }
  }

  /**
   * 国际化 - 批量处理状态
   */
  renderProgressFeedbackStatus = () => {
    const { action, taskInfo } = this.props;
    const { taskReport } = this.state;

    if (getLocale() === 'en-US') {
      return <div>
        The <span className={styles.taskNumber}>{taskReport.success}/{taskInfo.total}</span> has been successfully {action},
               skip <span className={styles.taskNumber}>{taskReport.skip}</span> items
             </div>;
    } else if (getLocale() === 'zh-CN') {
      return <div>
        <center>
          <span>
            已执行
            {/* {action} */}
            <span className={styles.taskNumber}>{taskReport.success+taskReport.skip+taskReport.failure}/{taskInfo.total}</span>个选项
                 </span><br />
          <span>
            跳过
                    <span className={styles.taskNumber}>{taskReport.skip}</span>个选项
                 </span>
        </center>
      </div>;
    }
  }

  /**
   * 国际化 - 批量处理结果
   */
  renderProgressFeedbackFailedResult = () => {
    const { action } = this.props;
    const { taskReport } = this.state;

    if (getLocale() === 'en-US') {
      return <div>
        Success <span className={styles.taskNumber}>{taskReport.success}</span> items,
               Skip <span className={styles.taskNumber}>{taskReport.skip}</span> items,
               Fail <span className={styles.taskNumber}>{taskReport.failure}</span> items
             </div>;
    } else if (getLocale() === 'zh-CN') {
      return <div>
        成功{action}<span className={styles.taskNumber}>{taskReport.success}</span>个选项，
               跳过<span className={styles.taskNumber}>{taskReport.skip}</span>个选项，
               失败<span className={styles.taskNumber}>{taskReport.failure}</span>个选项
             </div>;
    }
  }

  /**
   * 国际化 - 批量处理成功提示
   */
  renderSuccessTips = () => {
    const { action, taskInfo } = this.props;
    const { taskReport } = this.state;

    if (getLocale() === 'en-US') {
      return `Successfully ${action}${taskInfo.total} items, skip ${taskReport.skip} items in batch`;
    } else if (getLocale() === 'zh-CN') {
      return `成功批量${action}${taskReport.success}个选项，跳过${taskReport.skip}个选项`;
    }
  }

  // ------------ 国际化处理 END ------------

  /**
   * 确认批量处理
   */
  handleBatchProcessConfirmOk = () => {
    hideMessage();
    this.handleProgressModalVisible(true);
    this.props.taskConfirmCallback();
    // 执行任务
    this.props.taskExecutionFunc();
  }

  /**
   * 进度条弹出框显示控制
   */
  handleProgressModalVisible = (flag) => {
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

    this.setState({
      progressModalVisible: !!flag,
    });
  };

  /**
   * 处理 确认框取消
   */
  handleBatchProcessConfirmCancel = () => {
    this.resetProgress();
    this.props.taskCancelCallback();
  }

  /**
   * 处理 重试处理取消（未完成）
   */
  handleRetryCancel = () => {
    this.resetProgress();
    this.setState({
      showFailedResultModal: false,
    })
    this.props.retryCancelCallback();
  }

  /**
   * 处理 任务全部成功
   */
  handleAllSuccessed = () => {
    message.success(this.renderSuccessTips());
    this.resetProgress();
    this.props.taskSuccessedCallback();
  }

  /**
   * 处理 任务出错
   */
  handleTaskEndOccurFailed = () => {
    this.setState({
      showFailedResultModal: true,
    })
    showMessage();
  }

  /**
   * 处理 重试
   */
  handleRerty = () => {
    this.resetProgress();
    this.setState({
      showFailedResultModal: false,
    })
    this.props.taskFailedCallback(true);
  }

  /**
   * 重置progress
   */
  resetProgress = () => {
    const { taskReport } = this.state;

    this.currentIndex = 0;
    taskReport.success = 0;
    taskReport.failure = 0;
    taskReport.skip = 0;

    this.setState({
      progressModalVisible: false,
      progressVisible: false,
      progressStatus: PROGRESS_STATUS['active'],
      taskReport: taskReport,
      confirmLoading: false
    });

    showMessage();
  }

  render() {
    const {
      batchProcessConfirmModalVisible,
      taskInfo,
      action,
      isCloseFailedResultModal,
    } = this.props;

    const {
      progressModalVisible,
      progressStatus,
      progressVisible,
      progressPercent,
      showFailedResultModal,
      confirmLoading,
    } = this.state;

    let confirmTitle = formatMessage({ id: 'common.progress.confirmModal.title' }) + action;

    return (
      <div>
        <Modal
          title={confirmTitle}
          visible={batchProcessConfirmModalVisible}
          onOk={this.handleBatchProcessConfirmOk}
          onCancel={this.handleBatchProcessConfirmCancel}
          destroyOnClose
          confirmLoading={confirmLoading}
          key="1"
        >
          <p className={styles.confirmTips}>
            {this.renderProgressConfirmTips()}
          </p>
        </Modal>
        <Modal
          visible={progressModalVisible && this.currentIndex !== taskInfo.total}
          footer={[]}
          closable={false}
          width={350}
          destroyOnClose
          key="2"
        >
          <div>
            <Progress
              percent={progressPercent}
              status={progressStatus}
              style={{ display: progressVisible ? 'block' : 'none' }}
            />
            <br />
            <span className={styles.feedbackStatus}>
              {this.renderProgressFeedbackStatus()}
            </span>
          </div>
        </Modal>
        <Modal
          visible={showFailedResultModal}
          footer={[]}
          onCancel={this.handleRetryCancel}
          width={350}
          destroyOnClose
          key="3"
        >
          <div className={styles.taskFailedWrap}>
            <img src={warnFillSvg} />
            <br /><br />
            {this.renderProgressFeedbackFailedResult()}
            <br />
            <Button type="primary" onClick={this.handleRerty}>
              {formatMessage({ id: 'common.progress.retry' })}
            </Button>
          </div>
        </Modal>
      </div>
    );
  }
}

export default ConfirmProgress;