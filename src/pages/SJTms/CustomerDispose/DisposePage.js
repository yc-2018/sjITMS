/*
 * @Author: guankongjin
 * @Date: 2023-01-10 10:48:50
 * @LastEditors: guankongjin
 * @LastEditTime: 2023-04-07 11:13:01
 * @Description: 工单处理
 * @FilePath: \iwms-web\src\pages\SJTms\CustomerDispose\DisposePage.js
 */
import React, { Component } from 'react';
import { Button, Modal, message } from 'antd';
import { getRecords, release, dispose, saveResult } from '@/services/sjitms/Customer';
import DisposeForm from './DisposeForm';

export default class DisposePageModal extends Component {
  state = {
    visible: false,
    bill: {},
    records: [],
    saving: false,
  };
  modeTxt = {
    Rejected: '驳回',
    Dispose: '处理进度',
    Disposed: '处理结果',
  };

  componentDidMount = () => {
    this.props.onRef && this.props.onRef(this);
  };

  show = async bill => {
    const response = await getRecords(bill.UUID);
    const { operation } = this.props;
    const records = response.success && response.data ? response.data : [];
    this.setState({
      visible: true,
      remark: operation == 'Result' ? bill.STAFFRESULT : '',
      records,
      validate: true,
      bill,
    });
  };

  hide = () => {
    this.formRef.resetFields();
    this.setState({ visible: false, bill: {} });
  };

  //回复处理进度
  handleDispose = async stat => {
    const { bill } = this.state;
    const validate = await this.formRef.validateFields();
    this.setState({ saving: true });
    const param = { billUuid: bill.UUID, type: this.modeTxt[stat], detail: validate.remark };
    const response = await dispose(stat, param);
    if (response.success) {
      message.success('保存成功！');
      this.hide();
      this.props.onSearch();
    }
    this.setState({ saving: false });
  };

  //客服回复结果
  handleReply = async () => {
    let { bill } = this.state;
    const validate = await this.formRef.validateFields();
    const responsibilityCode = validate.responsibilityCode.value || validate.responsibilityCode;
    const param = { ...validate, staffResult: validate.remark, responsibilityCode };
    this.setState({ saving: true });
    const response = await saveResult(bill.UUID, param);
    if (response.success) {
      message.success('保存成功！');
      this.hide();
      this.props.onSearch();
    }
    this.setState({ saving: false });
  };

  //客服发布
  handleRelease = async () => {
    const { bill } = this.state;
    const validate = await this.formRef.validateFields();
    this.setState({ saving: true });
    const response = await release(bill.UUID, validate.remark);
    if (response.success) {
      message.success('发布成功！');
      this.hide();
      this.props.onSearch();
    }
    this.setState({ saving: false });
  };

  drawButton = operation => {
    const { saving } = this.state;
    switch (operation) {
      case 'Release':
        return (
          <Button type="primary" onClick={() => this.handleRelease()} loading={saving}>
            发布
          </Button>
        );
      case 'Result':
        return (
          <Button type="primary" onClick={() => this.handleReply()} loading={saving}>
            回复结果
          </Button>
        );
      default:
        return (
          <>
            {/* <Button type="primary" onClick={() => this.handleDispose('Rejected')} loading={saving}>
              驳回
            </Button> */}
            <Button type="primary" onClick={() => this.handleDispose('Dispose')} loading={saving}>
              处理进度
            </Button>
            <Button type="primary" onClick={() => this.handleDispose('Disposed')} loading={saving}>
              处理结果
            </Button>
          </>
        );
    }
  };
  render() {
    const { modal, operation } = this.props;
    const { visible, saving, records, bill } = this.state;

    return (
      <Modal
        bodyStyle={{ overflowY: 'auto', maxHeight: '80vh', margin: -12 }}
        width="70vw"
        visible={visible}
        centered
        onCancel={() => this.hide()}
        confirmLoading={saving}
        title={`客服工单：${bill.BILLNUMBER}`}
        footer={
          <div>
            <Button onClick={this.hide}>取消</Button>
            {this.drawButton(operation)}
          </div>
        }
        {...modal}
      >
        <DisposeForm
          bill={bill}
          records={records}
          operation={operation}
          ref={node => (this.formRef = node)}
        />
      </Modal>
    );
  }
}
