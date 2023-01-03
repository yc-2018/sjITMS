/*
 * @Author: guankongjin
 * @Date: 2022-12-19 17:48:10
 * @LastEditors: guankongjin
 * @LastEditTime: 2023-01-03 11:47:05
 * @Description: file content
 * @FilePath: \iwms-web\src\pages\SJTms\Customer\CustomerSearch.js
 */
import React from 'react';
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { Button, message } from 'antd';
import { release, finished } from '@/services/sjitms/Customer';
import BatchProcessConfirm from '../Dispatching/BatchProcessConfirm';

import { havePermission } from '@/utils/authority';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class CustomerSearch extends QuickFormSearchPage {
  drawToolsButton = () => {
    return (
      <>
        <Button
          onClick={() => this.handleDelete()}
          hidden={!havePermission(this.state.authority + '.remove')}
        >
          删除
        </Button>
        <Button
          onClick={() => this.handleRelease()}
          hidden={!havePermission(this.state.authority + '.release')}
        >
          发布
        </Button>
        <Button
          onClick={() => this.handleFinished()}
          hidden={!havePermission(this.state.authority + '.complete')}
        >
          完结
        </Button>
        <BatchProcessConfirm onRef={node => (this.batchProcessConfirmRef = node)} />
      </>
    );
  };

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

  onUpload = () => {
    this.props.switchTab('import');
  };

  //发布
  handleRelease = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length == 0) {
      message.warning('请至少选中一条数据！');
      return;
    }
    if (selectedRows.length == 1) {
      this.release(selectedRows[0]).then(response => {
        if (response.success) {
          message.success('发布成功！');
          this.onSearch();
        }
      });
    } else {
      this.batchProcessConfirmRef.show(
        '发布',
        selectedRows.map(x => x.UUID),
        this.release,
        this.onSearch
      );
    }
  };
  release = async service => {
    return await release(service.UUID);
  };

  //完结
  handleFinished = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length == 0) {
      message.warning('请至少选中一条数据！');
      return;
    }
    if (selectedRows.length == 1) {
      this.finished(selectedRows[0]).then(response => {
        if (response.success) {
          message.success('保存成功！');
          this.onSearch();
        }
      });
    } else {
      this.batchProcessConfirmRef.show(
        '完结',
        selectedRows.map(x => x.UUID),
        this.finished,
        this.onSearch
      );
    }
  };
  finished = async service => {
    return await finished(service.UUID);
  };

  //删除
  handleDelete = () => {
    const { selectedRows } = this.state;
    const service = selectedRows.filter(x => x.STATUS != 'Saved').shift();
    if (service) {
      message.error('客服工单:' + service.BILLNUMBER + service.STATUS_CN + '状态，不能删除！');
      return;
    }
    this.onBatchDelete();
  };
}
