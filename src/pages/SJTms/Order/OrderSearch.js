/*
 * @Author: Liaorongchang
 * @Date: 2022-03-10 11:29:17
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-07-05 09:30:56
 * @version: 1.0
 */
import React from 'react';
import { Button, Popconfirm, message } from 'antd';
import { connect } from 'dva';
import { havePermission } from '@/utils/authority';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { batchAudit, audit, cancel } from '@/services/sjitms/OrderBill';

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
        <Popconfirm
          title="你确定要审全部的内容吗?"
          onConfirm={() => this.onBatchAllAudit()}
          okText="确定"
          cancelText="取消"
        >
          <Button>批量审核</Button>
        </Popconfirm>
        <Popconfirm
          title="你确定要取消所选中的内容吗?"
          onConfirm={() => this.onBatchCancel()}
          okText="确定"
          cancelText="取消"
        >
          <Button>取消</Button>
        </Popconfirm>
      </span>
    );
  };

  //该方法用于写最上层的按钮 多个按钮用<span>包裹
  drawTopButton = () => {
    return (
      <span>
        <Button
          hidden={!havePermission(this.state.authority + '.import')}
          type="primary"
          onClick={this.onUpload}
        >
          导入
        </Button>
      </span>
    );
  };

  /**
   * 编辑界面
   */
  onUpdate = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length !== 0 && selectedRows[0].STAT === 'Saved') {
      const { onlFormField } = this.props;
      var field = onlFormField[0].onlFormFields.find(x => x.dbIsKey)?.dbFieldName;
      this.props.switchTab('update', {
        entityUuid: selectedRows[0][field],
      });
    } else {
      message.error('请至少选中一条数据或该单据状态不是保存状态，不能修改');
    }
  };

  //批量审核（多选）
  onBatchAudit = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length !== 0) {
      selectedRows.forEach(data => {
        this.audit(data.BILLNUMBER);
      });
      this.onSearch();
    } else {
      message.error('请至少选中一条数据！');
    }
  };
  //批量审核（查询结果）
  onBatchAllAudit = async () => {
    const response = await batchAudit(this.state.pageFilters);
    if (response.success) {
      message.success('审核成功!');
      this.onSearch();
    }
  };

  onBatchCancel = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length !== 0) {
      selectedRows.forEach(data => {
        this.cancel(data.BILLNUMBER);
      });
      this.onSearch();
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

  cancel = async billnumber => {
    await cancel(billnumber).then(result => {
      if (result && result.success) {
        message.success('取消成功!');
      }
    });
  };
}
