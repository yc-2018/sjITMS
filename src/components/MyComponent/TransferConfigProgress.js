import React from 'react';
import { Progress, Modal, Button } from 'antd';
import { stringify } from 'qs';
import reqwest from 'reqwest';
import { getUser, getOrg } from '../../utils/LoginCache';

class TransferConfigProgress extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ...props,
      recordIndex: 0,
      report: {
        total: 0,
        success: 0,
        failure: 0,
        skipped: 0,
      },
    };
    this.handleOk = this.handleOk.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.start = this.start.bind(this);
    this.execute = this.execute.bind(this);
  }

  componentWillReceiveProps(newProps) {
    if (newProps.showProgressModal) {
      this.setState({
        ...newProps,
        report: {
          total: 0,
          success: 0,
          failure: 0,
          skipped: 0,
        },
        url: '',
      });
    } else {
      this.setState({
        ...newProps,
        report: {
          total: 0,
          success: 0,
          failure: 0,
          skipped: 0,
        },
      });
    }
  }

  handleOk() {
    this.setState({
      showConfirmModal: false,
      showProgressModal: true,
    }, function () {
      this.start();
    });
  }

  handleCancel() {
    this.setState({
      showConfirmModal: false,
      showProgressModal: false,
      processing: false,
      percent: 0,
      records: [],
      recordIndex: 0,
    }, function () {
      this.props.hideConfirmModal();
      this.props.refreshGrid();
    });
  }

  start() {
    if (this.state.records == null || this.state.records.length === 0) { return; }
    let percent = (this.state.recordIndex + 1) * Math.ceil(100 / this.props.records.length);
    let { processing } = this.state;

    if (this.state.recordIndex + 1 > this.props.records.length) {
      return;
    }

    if (percent >= 100) {
      percent = 100;
      processing = false;
    }

    this.execute(processing, percent);
  }

  execute(processing, percent) {
    const  operator = getUser().code;
    const index = this.state.recordIndex;
    const { uuid } = this.state.records[index];
    const requestMethod = this.state.option === 'remove' ? 'DELETE' : 'POST';
    if (this.state.option !== 'remove' && this.state.records[index].enable === this.state.canSkipState) {
      this.setState({
        processing,
        percent,
        recordIndex: this.state.recordIndex + 1,
        report: { ...this.state.report, skipped: this.state.report.skipped + 1 },
      }, function () {
        this.start();
      });
    } else {
      reqwest({
        url: `${this.state.url}/${this.state.option}?uuid=${uuid}`,
        method: requestMethod,
        type: 'json',
        contentType: 'application/json',
        headers: {
          'X-My-Custom-Header': 'SomethingImportant',
          Authorization: localStorage.getItem('jwt'),
        },
      }).then((result) => {
        if (result.success === true) {
          this.setState({
            processing,
            percent,
            recordIndex: this.state.recordIndex + 1,
            report: { ...this.state.report, success: this.state.report.success + 1 },
          }, function () {
            this.start();
          });
        }else if ( result.message.endsWith('不存在') && this.state.option==='remove') {
          this.setState({
            processing,
            percent,
            recordIndex: this.state.recordIndex + 1,
            report: { ...this.state.report, skipped: this.state.report.skipped + 1 },
          }, function () {
            this.start();
          });
        }else if (result.message.indexOf('已')!=-1){
          this.setState({
            processing,
            percent,
            recordIndex: this.state.recordIndex + 1,
            report: { ...this.state.report, skipped: this.state.report.skipped + 1 },
          }, function () {
            this.start();
          });
        }else {
          this.setState({
            processing,
            percent,
            recordIndex: this.state.recordIndex + 1,
            report: { ...this.state.report, failure: this.state.report.failure + 1 },
          }, function () {
            this.start();
          });
        }
      });
    }
  }

  render() {
    const { progressVisible, percent, showConfirmModal, processing, records, recordIndex } = this.state;
    return (
      <div>
        <Modal
          title="批量处理框"
          visible={showConfirmModal}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          okText="确定"
          cancelText="取消"
        >
          <center>
            {`是否批量${this.state.actionText} ${this.state.records.length} 个${this.state.entityCaption} ? `}
          </center>
        </Modal>
        <Modal
          title="完成进度"
          visible={this.state.showProgressModal}
          onCancel={this.handleCancel}
          footer={[]}
        >
          <span>{this.state.showProgressModal && processing ? `正在${this.state.actionText}${this.state.entityCaption}${records[recordIndex].code}` : ''}</span>
          <Progress percent={this.state.percent} />
          <p>
                {`总共${this.state.actionText} ${this.state.recordIndex} 个${this.state.entityCaption}。`}{`成功 ${this.state.report.success} 个。`}{`失败 ${this.state.report.failure} 个。`} {`跳过 ${this.state.report.skipped} 个。`} </p>
        </Modal>
      </div>
    );
  }
}

export default TransferConfigProgress;