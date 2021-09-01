import React, { PureComponent } from 'react';
import { Progress, Modal, Button } from 'antd';
import { stringify } from 'qs';

class BatchProgress extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            showProgressModal: false,// 完成进度框
            showConfirmModal: false, // 是否批量操作的框
            percent: 0, // 批处理完成度
            records: [],// 选中的行数
            processing: false,
            recordIndex: 0,
            actionText: this.props.actionText,// 批量操作框的标题
            entityCaption: this.props.entityCaption,
            report: {
                total: 0,
                success: 0,
                failure: 0,
                skipped: 0,
            },
            canSkipState: false,
            url: this.props.url, // 请求的路径
            option: '', // models的方法
            failMessage: '',
            failMessageShow: false,
        };
        this.handleOk = this.handleOk.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.start = this.start.bind(this);
        this.abort = this.abort.bind(this);
    }

    // 初始化时不调用，接受新的props时调用
    componentWillReceiveProps(newProps) {
            this.setState({
                ...newProps,
            });
    }

    // 点击确认批量操作后调用
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
            report: {
                total: 0,
                success: 0,
                failure: 0,
                skipped: 0,
            }
        }, function () {
            this.props.hideConfirmModal();
            this.props.refreshGrid();
        });
    }

    calPercent(){
        let percent = (this.state.recordIndex + 1) * Math.ceil(100 / this.props.records.length);

        if (percent >= 100) {
            percent = 100;
        }
        return percent;
    }

    start() {
        if (this.state.records == null || this.state.records.length === 0) { return; }
        let { processing } = this.state;
        if (this.state.recordIndex + 1 > this.props.records.length) {
            this.setState({
                showProgressModal: true,
                showConfirmModal:false,
              }, function () {
                this.props.hideConfirmModal();
            });
            return;
        }

        const index = this.state.recordIndex;
        const entity = this.state.records[index];
        this.props.process(entity);
    }

    success(){
        this.setState({
            processing: false,
            percent: this.calPercent(),
            recordIndex: this.state.recordIndex + 1,
            report: { ...this.state.report, success: this.state.report.success + 1 }
        }, function() {
            this.start();
          });
    }

    skip(){
        this.setState({
            processing: false,
            percent: this.calPercent(),
            recordIndex: this.state.recordIndex + 1,
            report: { ...this.state.report, skipped: this.state.report.skipped + 1 }
        }, function() {
            this.start();
          });
    }

    failed(){
        this.setState({
            processing: false,
            percent: this.calPercent(),
            recordIndex: this.state.recordIndex + 1,
            report: { ...this.state.report, failure: this.state.report.failure + 1 }
        }, function() {
            this.start();
          });
    }


    abort() {
        if (this.state.processing == false) {
            return;
        }

        this.setState({
            processing: false,
        });
    }

    render() {
        return (
            <div>
                <Modal
                    title="批量处理框"
                    visible={this.state.showConfirmModal}
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
                    <Progress percent={this.state.percent} />
                    {this.state.processing ?
                        <Button onClick={this.abort}>中断</Button> :
                        <div>
                            <p>{this.state.recordIndex < this.state.records.length ? `正在处理第${this.state.recordIndex}个` : '批量处理完成。 '}
                            </p>
                            <p>
                                {this.state.failMessageShow ? `失败原因：${this.state.failMessage}` : ''}
                            </p>
                            <p>
                                {`总共${this.state.actionText} ${this.state.recordIndex} 个${this.state.entityCaption}。`}
                            </p>    
                            <p>
                                {`成功 ${this.state.report.success} 个。`}
                            </p>    
                            <p>    
                                {`失败 ${this.state.report.failure} 个。`}
                            </p>    
                            <p>
                                {`跳过 ${this.state.report.skipped} 个。`}
                            </p>
                        </div>
                    }
                </Modal>
            </div>
        );
    }
}

export default BatchProgress;
