/*
 * @Author: Liaorongchang
 * @Date: 2022-03-10 11:29:17
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-04-06 11:21:52
 * @version: 1.0
 */
import React, { PureComponent } from 'react';
import { Table, Button, Input, Col, Row, Popconfirm, message, Modal, Upload } from 'antd';
import { colWidth } from '@/utils/ColWidth';
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { audit } from '@/services/sjitms/OrderBill';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
//继承QuickFormSearchPage Search页面扩展
export default class OrderSearch extends QuickFormSearchPage {
  state = {
    ...this.state,
    uploadModal: false,
  };

  drawExColumns = e => {};

  drawcell = e => {};

  onUpload = () => {
    this.props.switchTab('import');
  };

  drawToolsButton = () => {
    return (
      <span>
        <Popconfirm
          title="你确定要审核所选中的内容吗?"
          onConfirm={() => this.onBatchAudit()}
          okText="确定"
          cancelText="取消"
        >
          <Button>审核</Button>
        </Popconfirm>
      </span>
    );
  };

  //该方法用于写最上层的按钮 多个按钮用<span>包裹
  drawTopButton = () => {
    return (
      <span>
        <Button type="primary" onClick={this.onUpload}>
          导入
        </Button>
      </span>
    );
  };

  onBatchAudit = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length !== 0) {
      selectedRows.forEach(data => {
        this.audit(data.BILLNUMBER);
      });
    } else {
      message.error('请至少选中一条数据！');
    }
  };

  audit = async billnumber => {
    await audit(billnumber).then(result => {
      if (result && result.success) {
        message.success('审核成功!');
      }
    });
  };
}
