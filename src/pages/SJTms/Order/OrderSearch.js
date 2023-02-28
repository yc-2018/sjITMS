/*
 * @Author: Liaorongchang
 * @Date: 2022-03-10 11:29:17
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-07-27 16:31:04
 * @version: 1.0
 */
import React from 'react';
import { Button, Popconfirm, message } from 'antd';
import { connect } from 'dva';
import { havePermission } from '@/utils/authority';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import BatchProcessConfirm from '../Dispatching/BatchProcessConfirm';
import { batchAudit, audit, cancel } from '@/services/sjitms/OrderBill';
import moment from 'moment';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
//继承QuickFormSearchPage Search页面扩展
export default class OrderSearch extends QuickFormSearchPage {
  state = {
    ...this.state,
    showAuditPop: false,
    showCancelPop: false,
    uploadModal: false,
  };

  onUpload = () => {
    this.props.switchTab('import');
  };

  // exSearchFilter = () => {
  //   return [
  //     {
  //       field: 'WAVENUM',
  //       type: 'VARCHAR',
  //       rule: 'eq',
  //       val: moment(new Date()).format('YYMMDD') + '0001',
  //     },
  //   ];
  // };

  drawToolsButton = () => {
    const { showAuditPop, showCancelPop, selectedRows } = this.state;
    return (
      <span>
        <Popconfirm
          title="你确定要审核所选中的内容吗?"
          visible={showAuditPop}
          onVisibleChange={visible => {
            if (!visible) this.setState({ showAuditPop: visible });
          }}
          onCancel={() => {
            this.setState({ showAuditPop: false });
          }}
          onConfirm={() => {
            this.setState({ showAuditPop: false });
            this.onAudit(selectedRows[0]).then(response => {
              if (response.success) {
                message.success('审核成功！');
                this.onSearch();
              }
            });
          }}
        >
          <Button onClick={() => this.onBatchAudit()}>审核</Button>
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
          visible={showCancelPop}
          onVisibleChange={visible => {
            if (!visible) this.setState({ showCancelPop: visible });
          }}
          onCancel={() => {
            this.setState({ showCancelPop: false });
          }}
          onConfirm={() => {
            this.setState({ showCancelPop: false });
            this.onCancel(selectedRows[0]).then(response => {
              if (response.success) {
                message.success('取消成功！');
                this.onSearch();
              }
            });
          }}
        >
          <Button onClick={() => this.onBatchCancel()}>取消</Button>
        </Popconfirm>
        <BatchProcessConfirm onRef={node => (this.batchProcessConfirmRef = node)} />
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

  //审核
  onAudit = async record => {
    return await audit(record.BILLNUMBER);
  };
  //批量审核（多选）
  onBatchAudit = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length == 0) {
      message.warn('请选中一条数据！');
      return;
    }
    selectedRows.length == 1
      ? this.setState({ showAuditPop: true })
      : this.batchProcessConfirmRef.show('审核', selectedRows, this.onAudit, this.onSearch);
  };
  //批量审核（查询结果）
  onBatchAllAudit = async () => {
    const response = await batchAudit(this.state.pageFilters);
    if (response.success) {
      message.success('审核成功!');
      this.onSearch();
    }
  };

  //取消
  onCancel = async record => {
    return await cancel(record.BILLNUMBER);
  };
  //批量取消
  onBatchCancel = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length == 0) {
      message.warn('请选中一条数据！');
      return;
    }
    selectedRows.length == 1
      ? this.setState({ showCancelPop: true })
      : this.batchProcessConfirmRef.show('取消', selectedRows, this.onCancel, this.onSearch);
  };
}
