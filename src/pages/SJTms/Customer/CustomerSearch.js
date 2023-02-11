/*
 * @Author: guankongjin
 * @Date: 2022-12-19 17:48:10
 * @LastEditors: guankongjin
 * @LastEditTime: 2023-02-11 17:22:55
 * @Description: 客服工单
 * @FilePath: \iwms-web\src\pages\SJTms\Customer\CustomerSearch.js
 */
import React from 'react';
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { Button, message, Form, Modal, Input, Popconfirm } from 'antd';
import { SimpleAutoComplete } from '@/pages/Component/RapidDevelopment/CommonComponent';
import { release, finished, unFinished, norm } from '@/services/sjitms/Customer';
import BatchProcessConfirm from '../Dispatching/BatchProcessConfirm';
import DisposePage from '../CustomerDispose/DisposePage';

import { havePermission } from '@/utils/authority';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class CustomerSearch extends QuickFormSearchPage {
  state = {
    ...this.state,
    releaseModal: false,
    unNormModal: false,
    releaseRemark: '',
    unNormType: '',
  };

  drawcell = row => {
    if (row.column.fieldName == 'NORM' && row.record.NORM && row.record.NORM != '规范') {
      row.component = (
        <span style={{ padding: '0 10px', background: 'red', color: '#fff' }}>
          {row.record.NORM}
        </span>
      );
    }
  };

  drawToolsButton = () => {
    return (
      <>
        <Popconfirm
          title="你确定要删除所选中的内容吗?"
          onConfirm={() => this.handleDelete()}
          okText="确定"
          cancelText="取消"
        >
          <Button type="danger" hidden={!havePermission(this.state.authority + '.remove')}>
            删除
          </Button>
        </Popconfirm>
        <Button
          onClick={() => this.handleRelease()}
          hidden={!havePermission(this.state.authority + '.release')}
        >
          发布
        </Button>
        <DisposePage
          operation="Release"
          ref={page => (this.releasePageRef = page)}
          onSearch={this.onSearch}
        />
        {/* <Modal
          width="40%"
          title={'发布'}
          onOk={() => this.onRelease()}
          visible={this.state.releaseModal}
          onCancel={() => this.setState({ releaseModal: false })}
          destroyOnClose={true}
        >
          <Form>
            <Form.Item label="发布原因" labelCol={{ span: 4 }} wrapperCol={{ span: 18 }}>
              <Input.TextArea
                placeholder="请输入发布原因"
                rows={4}
                onChange={this.onReleaseRemarkChange}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Form>
        </Modal> */}
        <Button
          onClick={() => this.handleResult()}
          hidden={!havePermission(this.state.authority + '.complete')}
        >
          回复结果
        </Button>
        <DisposePage
          operation="Result"
          ref={page => (this.disposePageRef = page)}
          onSearch={this.onSearch}
        />
        <Button
          onClick={() => this.handleFinished()}
          hidden={!havePermission(this.state.authority + '.complete')}
        >
          完结
        </Button>
        <Button
          onClick={() => this.handleUnFinished()}
          type="primary"
          hidden={!havePermission(this.state.authority + '.norm')}
        >
          撤销完结
        </Button>
        <Button
          onClick={() => this.handleNorm()}
          type="primary"
          hidden={!havePermission(this.state.authority + '.norm')}
        >
          规范标识
        </Button>
        <Button
          onClick={() => this.handleUnNorm()}
          type="primary"
          hidden={!havePermission(this.state.authority + '.norm')}
        >
          不规范标识
        </Button>
        <Modal
          width="30vw"
          title="不规范标识"
          onOk={() => this.onUnNorm()}
          visible={this.state.unNormModal}
          onCancel={() => this.setState({ unNormModal: false })}
          destroyOnClose={true}
        >
          <Form>
            <Form.Item label="不规范类型" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
              <SimpleAutoComplete
                placeholder="请选择不规范类型"
                noRecord
                dictCode="unNormType"
                value={this.state.unNormType}
                onChange={val => {
                  this.setState({ unNormType: val });
                }}
              />
            </Form.Item>
          </Form>
        </Modal>
        <BatchProcessConfirm onRef={node => (this.batchProcessConfirmRef = node)} />
      </>
    );
  };
  onRelease = async () => {
    const { selectedRows, releaseRemark } = this.state;
    const response = await release(selectedRows[0].UUID, releaseRemark);
    if (response.success) {
      message.success('发布成功！');
      this.setState({ releaseModal: false });
      this.onSearch();
    }
  };

  onReleaseRemarkChange = event => {
    this.setState({ releaseRemark: event.target.value });
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
    if (selectedRows.find(x => x.STATUS == 'Released') && selectedRows.length > 1) {
      message.warning('存在已发布工单，不能批量发布！');
      return;
    }
    if (selectedRows.find(x => x.STATUS == 'Rejected') && selectedRows.length > 1) {
      message.warning('存在驳回工单，不能批量发布！');
      return;
    }
    if (selectedRows.find(x => x.STATUS == 'Dispose') && selectedRows.length > 1) {
      message.warning('存在处理中工单，不能批量发布！');
      return;
    }
    if (selectedRows.find(x => x.STATUS == 'Disposed') && selectedRows.length > 1) {
      message.warning('存在已处理工单，不能批量发布！');
      return;
    }
    if (
      selectedRows.length == 1 &&
      (selectedRows[0].STATUS == 'Released' ||
        selectedRows[0].STATUS == 'Rejected' ||
        selectedRows[0].STATUS == 'Disposed' ||
        selectedRows[0].STATUS == 'Dispose')
    ) {
      // this.setState({ releaseModal: true });
      this.releasePageRef.show(selectedRows[0]);
      return;
    }
    if (selectedRows.length == 1) {
      this.release(selectedRows[0].UUID).then(response => {
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
  release = async uuid => {
    return await release(uuid, '');
  };

  handleResult = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length != 1) {
      message.warning('请选中一条数据！');
      return;
    }
    this.disposePageRef.show(selectedRows[0]);
  };

  //完结
  handleFinished = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length == 0) {
      message.warning('请至少选中一条数据！');
      return;
    }
    if (selectedRows.length == 1) {
      this.finished(selectedRows[0].UUID).then(response => {
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
  finished = async uuid => {
    return await finished(uuid);
  };

  // 取消完结
  handleUnFinished = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length == 0) {
      message.warning('请至少选中一条数据！');
      return;
    }
    if (selectedRows.length == 1) {
      this.unFinished(selectedRows[0].UUID).then(response => {
        if (response.success) {
          message.success('保存成功！');
          this.onSearch();
        }
      });
    } else {
      this.batchProcessConfirmRef.show(
        '撤销完结',
        selectedRows.map(x => x.UUID),
        this.unFinished,
        this.onSearch
      );
    }
  };
  unFinished = async uuid => {
    return await unFinished(uuid);
  };

  //删除
  handleDelete = () => {
    const { selectedRows } = this.state;
    const service = selectedRows
      .filter(x => 'Saved,ReleasedDispose'.indexOf(x.STATUS) == -1)
      .shift();
    if (service) {
      message.error('客服工单:' + service.BILLNUMBER + service.STATUS_CN + '状态，不能删除！');
      return;
    }
    this.onBatchDelete();
  };

  //规范标识
  handleNorm = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length == 0) {
      message.warning('请至少选中一条数据！');
      return;
    }
    if (selectedRows.length == 1) {
      this.norm(selectedRows[0].UUID).then(response => {
        if (response.success) {
          message.success('规范标识保存成功！');
          this.onSearch();
        }
      });
    } else {
      this.batchProcessConfirmRef.show(
        '规范标识',
        selectedRows.map(x => x.UUID),
        this.norm,
        this.onSearch
      );
    }
  };
  norm = async uuid => {
    return await norm(uuid, '规范');
  };

  //不规范标识
  handleUnNorm = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length != 1) {
      message.warning('请选中一条数据！');
      return;
    }
    this.setState({ unNormModal: true, unNormType: '' });
  };
  onUnNorm = async () => {
    const { selectedRows, unNormType } = this.state;
    if (unNormType === '') {
      message.warning('请选择不规范类型！');
      return;
    }
    const response = await norm(selectedRows[0].UUID, unNormType);
    if (response.success) {
      message.success('保存成功！');
      this.setState({ unNormModal: false });
      this.onSearch();
    }
  };

  //编辑
  onUpdate = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length !== 0) {
      if (selectedRows[0].STATUS != 'Finished') {
        const { onlFormField } = this.props;
        var field = onlFormField[0].onlFormFields.find(x => x.dbIsKey)?.dbFieldName;
        this.props.switchTab('update', {
          entityUuid: selectedRows[0][field],
        });
      } else {
        message.error('该客服工单已完结，不能修改');
      }
    } else {
      message.error('请至少选中一条数据!');
    }
  };
}
