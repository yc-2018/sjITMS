/*
 * @Author: Liaorongchang
 * @Date: 2022-03-10 11:29:17
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-05-09 09:58:04
 * @version: 1.0
 */
import React from 'react';
import { Button, Popconfirm, message, Menu, Modal, Form } from 'antd';
import { connect } from 'dva';
import { havePermission } from '@/utils/authority';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { audited, canceled } from '@/services/oms/outBoundOrder';
import BatchProcessConfirm from '@/pages/SJTms/Dispatching/BatchProcessConfirm';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
//继承QuickFormSearchPage Search页面扩展
export default class OutboundOrderSearchPage extends QuickFormSearchPage {

  state = {
    ...this.state,
    showAuditPop: false,
    showCancelPop: false,
  };

  // 审核
  onAudit = async record => {
    return await audited(record.UUID);
  };

  // 批量审核（多选）
  onBatchAudit = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length == 0) {
      message.warn("请选中一条数据！");
      return;
    }
    selectedRows.length == 1 
      ? this.setState({ showAuditPop: true }) 
      : this.batchProcessConfirmRef.show('审核', selectedRows, this.onAudit, this.onSearch);
  };

  // 取消
  onCancel = async record => {
    return await canceled(record.UUID);
  }

  // 批量取消（多选）
  onBatchCancel = () => {
    const { selectedRows } =  this.state;
    if (selectedRows.length == 0) {
      message.warn("请选中一条数据！");
      return;
    }
    selectedRows.length == 1 
    ? this.setState({ showCancelPop: true}) 
    : this.batchProcessConfirmRef.show('取消', selectedRows, this.onCancel, this.onSearch);
  }

  drawToolsButton = () => {
    const { showAuditPop, showCancelPop, selectedRows } = this.state;
    return (
      <>
        <Popconfirm
          title = "你确定要审核所选中的内容吗?"

          visible = { showAuditPop }

          onVisibleChange = { visible => {
            if (!visible)
              this.setState({ showAuditPop: visible });
          }}

          onCancel = {() => {
            this.setState({ showAuditPop: false });
          }}

          onConfirm = {() => {
            this.setState({ showAuditPop: false });
            this.onAudit(selectedRows[0]).then(response => {
              if (response.success) {
                message.success("审核成功！");
                this.onSearch;
              } else {
                message.error(response.message);
              }
            });
          }}
        >
          <Button onClick = {() => this.onBatchAudit()}>审核</Button>
        </Popconfirm>

        <Popconfirm
          title = "你确定要取消所选中的内容吗?"

          visible = { showCancelPop }

          onVisibleChange = { visible => {
            if (!visible)
              this.setState({ showCancelPop: visible });
          }}

          onCancel = {() => {
            this.setState({ showCancelPop: false });
          }}

          onConfirm = {() => {
            this.setState({ showCancelPop: false});
            this.onCancel(selectedRows[0]).then(response => {
              if (response.success) {
                message.success("取消成功！");
                this.onSearch;
              } else {
                message.error(response.message);
              }
            });
          }}
        >
          <Button onClick = {() => this.onBatchCancel()}>取消</Button>
        </Popconfirm>
        
        <BatchProcessConfirm onRef = {node => (this.batchProcessConfirmRef = node)} />
      </>
    );
  };
}
