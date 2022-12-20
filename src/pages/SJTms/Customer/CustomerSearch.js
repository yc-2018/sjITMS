/*
 * @Author: guankongjin
 * @Date: 2022-12-19 17:48:10
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-12-20 10:25:18
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
          message.success('发布成功！');
          this.onSearch();
        }
      });
    } else {
      this.batchProcessConfirmRef.show(
        '发布',
        selectedRows.map(x => x.UUID),
        this.finished,
        this.onSearch
      );
    }
  };
  finished = async service => {
    return await finished(service.UUID);
  };
}
