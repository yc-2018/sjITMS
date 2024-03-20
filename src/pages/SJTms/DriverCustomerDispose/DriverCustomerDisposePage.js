/* eslint-disable */
import React, { Component } from 'react';
import { getProcessRecords, onContent, onReject } from '@/services/sjitms/DriverCustomerService';
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
    requireTakeCargoArr: [],
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
  show = bill => {
    //获取处理记录集合
    //操作节点
    const { operation } = this.props;
    getProcessRecords(bill.UUID).then(response => {
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
  processReject = async stat => {
    const { bill } = this.state;
    const validate = await this.formRef.validateFields();
    this.setState({ saving: true });
    const param = { billuuid: bill.UUID, type: stat, detail: validate.remark };
    await onReject(param).then(response => {
      if (response && response.success) {
        message.success('驳回处理成功！');
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
    this.setState({ requireTakeCargoArr: cargoCheckArr });
  };

  /** 回复处理内容(==回复处理进度+回复处理结果 合并了) */
  replyToProcessingContent = async stat => {
    const { bill, requireTakeCargoArr } = this.state;
    const validate = await this.formRef.validateFields();
    if (stat === 'Result' && !validate.procResType) return message.error('回复结果时请选择处理结果！');
    // 获取责任人信息
    let responsiblePerson = [
      validate?.responsible?.value,           // 工号
      validate?.responsible?.record?.NAME,    // 姓名
      validate?.department?.value             // 部门
    ];

    this.setState({ saving: true });
    const param = {
      billuuid: bill.UUID,
      type: stat,
      detail: validate.remark,
      requireTakeCargoList: requireTakeCargoArr,
      procResType: validate.procResType,  // 处理结果（后端只有在处理结果时处理)
      responsiblePerson, // 责任人 [工号，姓名，部门]
    };
    onContent(param).then(response => {
      if (response && response.success) {
        message.success('回复结果成功！');
        this.hide();
        this.props.onSearch();
      } else message.error(response.message);
    });
    this.setState({ saving: false });
  };

  /** 弹窗里面的按钮 */
  drawButton = operation => {
    const { saving } = this.state;
    const buildButton = (text, onClick, type = 'primary') => {
      return (
        <Button type={type} onClick={onClick} loading={saving}>
          {text}
        </Button>
      );
    };
    switch (operation) {
      case 'Rejecte':
        return buildButton('驳回', () => this.processReject('Rejecte'), 'danger');
      case 'Release':
        return; //buildButton('发布',()=>this.handleProgress("Release"))
      case 'formReply':
        return <>
          {buildButton('回复进度', () => this.replyToProcessingContent('Dispose'), 'default')}
          {buildButton('回复结果', () => this.replyToProcessingContent('Result'), 'default')}
        </>;

    }
  };
  /** 在Model中显示按钮 */
  isNoDrawButton = operation => {
    switch (operation) {
      case 'Rejecte': // 驳回
        return this.state.bill.PROCESSINGSTATE !== 'Released';
      case 'Release': // 发布
        return this.state.bill.PROCESSINGSTATE !== 'Saved';
      case 'Dispose': // 回复进度
      case 'Result':  // 回复结果
      case 'formReply':  // 回复结果
        return !['Released', 'Dispose'].includes(this.state.bill.PROCESSINGSTATE);
      default:
        return false;
    }
  };

  render() {
    const { modal, operation } = this.props;
    const { visible, saving, records, bill } = this.state;
    return (
      <Modal
        bodyStyle={{ overflowY: 'auto', maxHeight: '80vh', margin: -12 }}
        width="85vw"
        visible={visible}
        centered
        onCancel={() => this.hide()}
        confirmLoading={saving}
        title={`司机客服：${bill.BILLNUMBER}`}
        footer={
          <div>
            <Button onClick={this.hide}>取消</Button>
            {
              this.isNoDrawButton(operation) ? <Button disabled>当前状态不能进行此操作</Button> :
                this.drawButton(operation)
            }
            {}

          </div>
        }
        {...modal}
      >
        <DriverDisposeForm
          visible={visible}
          bill={bill}
          records={records}
          operation={operation}
          getRequireTakeDeliveryData={this.getRequireTakeDeliveryData}
          ref={node => {
            this.formRef = node;
          }}
        />
      </Modal>
    );
  }

}
