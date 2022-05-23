/*
 * @Author: Liaorongchang
 * @Date: 2022-03-10 11:29:17
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-05-23 11:16:23
 * @version: 1.0
 */
import React, { PureComponent } from 'react';
import { Table, Button, Input, Col, Row, Popconfirm, message, Modal, Upload } from 'antd';
import { colWidth } from '@/utils/ColWidth';
import { connect } from 'dva';
import { havePermission } from '@/utils/authority';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { audit, cancel } from '@/services/sjitms/OrderBill';

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
    console.log('this.state', this.state);
    // this.props.switchTab('import');
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
          hidden={!havePermission(this.state.reportCode + '.import')}
          type="primary"
          onClick={this.onUpload}
        >
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
      this.onSearch();
    } else {
      message.error('请至少选中一条数据！');
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

  /**
   * 绘制右上角按钮
   */
  drawActionButton = () => {
    //额外的菜单选项
    const menus = [];
    menus.push({
      // disabled: !havePermission(STORE_RES.CREATE), //权限认证
      name: '测试', //功能名称
      onClick: this.test, //功能实现
    });
    return (
      <div>
        <Button
          hidden={!havePermission(this.state.reportCode + '.create')}
          onClick={this.onCreate}
          type="primary"
          icon="plus"
        >
          新建
        </Button>
        <Button
          hidden={!havePermission(this.state.reportCode + '.edit')}
          onClick={this.onUpdate}
          type="primary"
        >
          编辑
        </Button>
        <Button
          hidden={!havePermission(this.state.reportCode + '.view')}
          onClick={this.onView}
          type="primary"
        >
          查看
        </Button>
        <Button
          hidden={!havePermission(this.state.reportCode + '.port')}
          onClick={this.port}
          type="primary"
        >
          导出
        </Button>
        {this.drawTopButton()}
        {/* <SearchMoreAction menus={menus} /> */}
      </div>
    );
  };
}
