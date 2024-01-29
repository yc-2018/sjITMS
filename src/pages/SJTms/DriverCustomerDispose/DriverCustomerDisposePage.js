import React, { Component } from 'react';
import { disposeProcess, getProcessRecords, onReject, onResult } from '@/services/sjitms/DriverCustomerService';
import { Button, message, Modal } from 'antd';
import DriverDisposeForm from '@/pages/SJTms/DriverCustomerDispose/DriverDisposeForm';

export default class DriverCustomerDisposePageModal extends Component {

  state = {
    visible: false,
    //当前的传来的一个客服服务单实体
    bill: {},
    //处理记录集合
    records: [],
    saving: false,
    //需要取货的数据的uuid
    requireTakeCargoArr:[]
  };
  modeTxt = {
    Rejecte: '驳回',
    Release: '发布',
    Dispose: '处理进度',
    Result: '处理结果',
  };

  componentDidMount = () => {
    this.props.onRef && this.props.onRef(this);
  };

  //展示
  show =  bill => {
    //获取处理记录集合
    //操作节点
    const { operation } = this.props;
    getProcessRecords(bill.UUID).then(response=>{
      const records = response.success && response.data ? response.data : [];
      this.setState({
        visible: true,
        // remark: operation == 'Result' ? bill.STAFFRESULT : '',
        records,
        validate: true,
        bill,
      });
    });
  };

  //TODO 是隐藏？
  hide = () => {
    this.formRef.resetFields();
    this.setState({ visible: false, bill: {} });
  };
  //处理驳回
  processReject=  async stat => {
    const { bill } = this.state;
    const validate = await this.formRef.validateFields();
    this.setState({ saving: true });
    const param = { billuuid: bill.UUID, type: this.modeTxt[stat], detail: validate.remark };
    await onReject(param).then(response => {
      if (response && response.success) {
        message.success('驳回处理成功！');
        this.hide();
        this.props.onSearch();
      }else{
        message.error(response.message);
      }
    });
    this.setState({ saving: false });
  }

  //处理回复进度
  handleProgress = async stat => {
    const { bill } = this.state;
    const validate = await this.formRef.validateFields();
    this.setState({ saving: true });
    const param = { billuuid: bill.UUID, type: this.modeTxt[stat], detail: validate.remark };
    await disposeProcess(param).then(response => {
      if (response && response.success) {
        message.success('回复处理成功！');
        this.hide();
        this.props.onSearch();
      } else {
        message.error(response.message);
      }
    });
    this.setState({ saving: false });
  };

  //获取客服决定司机需要取货的数据主键:回调函数，由子组件触发
  getRequireTakeDeliveryData = (cargoCheckArr) => {
    this.setState({requireTakeCargoArr:cargoCheckArr})
  };
  //处理回复结果
  processResult = stat => {
    const { bill,requireTakeCargoArr} = this.state;
    const validate =  this.formRef.validateFields();
    this.setState({ saving: true });
    const param = { billuuid: bill.UUID, type: this.modeTxt[stat], detail: validate.remark,requireTakeCargoList:requireTakeCargoArr};
    onResult(param).then(response => {
      if (response && response.success) {
        message.success('回复结果成功！');
        this.hide();
        this.props.onSearch();
      } else {
        message.error(response.message);
      }
    });
    this.setState({ saving: false });
  };

  drawButton = operation=> {
    const { saving } = this.state;
    switch (operation) {
      case 'Rejecte':
        return (
          <Button type="danger" onClick={() => this.processReject("Rejecte")} loading={saving}>
            驳回
          </Button>
        );
      case 'Release':
        return (
          <Button type="primary" onClick={() => this.handleRelease("Release")} loading={saving}>
            发布
          </Button>
        );
      case 'Dispose':
        return (
          <Button type="primary" onClick={() => this.handleProgress("Dispose")} loading={saving}>
            回复进度
          </Button>
        );
      case 'Result':
        return (
          <Button type="primary" onClick={() => this.processResult("Result")} loading={saving}>
            回复结果
          </Button>
        );
    }
  }

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
        title={`司机客服：${bill.BILLNUMBER}`}
        footer={
          <div>
            <Button onClick={this.hide}>取消</Button>
            {this.drawButton(operation)}
          </div>
        }
        {...modal}
      >
        <DriverDisposeForm
          bill={bill}
          records={records}
          operation={operation}
          getRequireTakeDeliveryData={this.getRequireTakeDeliveryData}
          ref={node => (this.formRef = node)}
        />
      </Modal>
    );
  }

}
