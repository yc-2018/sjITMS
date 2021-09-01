import React, { PureComponent } from 'react';
import { Progress, Modal, Button } from 'antd';

class BatchProgress extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      ...props,
      recordIndex: 0
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
      });
    } else {
      this.setState({
        ...newProps,
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

  start() {
    if (this.state.records == null || this.state.records.length == 0) { return; }
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
    const index = this.state.recordIndex;
    const entity = this.state.records[index];
    this.props.process(entity);
    this.setState({
      processing,
      percent,
      recordIndex: index + 1
    }, function() {
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
      this.props.refreshGrid();
    });
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
          title={!processing ? `${this.state.actionText}完成` : `正在${this.state.actionText} `}
          visible={this.state.showProgressModal}
          onCancel={this.handleCancel}
          footer={[]}
        >
          <span>{this.state.showProgressModal && processing ? `正在${this.state.actionText}${this.state.entityCaption}${records[recordIndex].code}` : ''}</span>
          <Progress percent={this.state.percent} />
        </Modal>
      </div>
    );
  }
}

export default BatchProgress;
