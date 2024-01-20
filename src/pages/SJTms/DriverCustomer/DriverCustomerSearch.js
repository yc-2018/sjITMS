/*
 * @Author: guankongjin
 * @Date: 2022-12-19 17:48:10
 * @LastEditors: guankongjin
 * @LastEditTime: 2023-04-21 14:39:39
 * @Description: 客服工单
 * @FilePath: \iwms-web\src\pages\SJTms\Customer\CustomerSearch.js
 */
import React from 'react';
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { Button, message, Form, Modal, Input, Popconfirm } from 'antd';
import { SimpleAutoComplete } from '@/pages/Component/RapidDevelopment/CommonComponent';
import { release, unFinished, norm } from '@/services/sjitms/Customer';
import BatchProcessConfirm from '../Dispatching/BatchProcessConfirm';
import { loginUser } from '@/utils/LoginContext';
import DisposePage from '../CustomerDispose/DisposePage';
import moment from 'moment';
import { havePermission } from '@/utils/authority';
import { onBatchReject, onFinish, onReject, publish } from '@/services/sjitms/DriverCustomerService';
import DriverCustomerDisposePageModal from '@/pages/SJTms/DriverCustomerDispose/DriverCustomerDisposePage';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class DriverCustomerSearch extends QuickFormSearchPage {
  state = {
    ...this.state,
    releaseModal: false,
    unNormModal: false,
    releaseRemark: '',
    unNormType: '',
  };
  componentWillMount() {
    this.setState({selectedRows:[]})
  }

  editColumns = queryConfig => {
    let creatorCol = queryConfig.columns.find(x => x.fieldName == 'CREATORNAME');
    creatorCol.searchDefVal = loginUser().name;
    return queryConfig;
  };
  drawcell = row => {
    // if (row.column.fieldName == 'NORM' && row.record.NORM && row.record.NORM != '规范') {
    //   row.component = (
    //     <span style={{ padding: '0 10px', background: 'red', color: '#fff' }}>
    //       {row.record.NORM}
    //     </span>
    //   );
    // }
  };

  //中间那些按钮
  drawToolsButton = () => {
    return (
      <>
        <Popconfirm
          title="你确定要删除所选中的内容吗?"
          onConfirm={() => this.handleDelete()}
          okText="确定"
          cancelText="取消"
        >
          <Button type="danger"
                  // hidden={!havePermission(this.state.authority + '.remove')}
          >
            删除
          </Button>
        </Popconfirm>
        {/*<Popconfirm*/}
        {/*  title="你确定要驳回所选中的内容吗?"*/}
        {/*  onConfirm={() =>}*/}
        {/*  okText="确定"*/}
        {/*  cancelText="取消"*/}
        {/*>*/}
          <Button type="danger" onClick={()=> this.handleReject()}
            // hidden={!havePermission(this.state.authority + '.remove')}
          >
            驳回
          </Button>
          <DriverCustomerDisposePageModal
            operation="Rejecte"
            ref={page => (this.rejectedPageRef = page)}
            onSearch={this.onSearch}
          />
        {/*</Popconfirm>*/}
        <Button
          type="primary"
          onClick={() => this.handleRelease()}
          // hidden={!havePermission(this.state.authority + '.release')}
        >
          发布
        </Button>
        <DriverCustomerDisposePageModal
          operation="Release"
          ref={page => (this.releasePageRef = page)}
          onSearch={this.onSearch}
        />
        <Button
          onClick={() => this.handleProgress()}
          // hidden={!havePermission(this.state.authority + '.complete')}
        >
          回复进度
        </Button>
        <DriverCustomerDisposePageModal
          operation="Dispose"
          ref={page => (this.processPageRef = page)}
          onSearch={this.onSearch}
        />
        <Button
          onClick={() => this.handleResult()}
          // hidden={!havePermission(this.state.authority + '.complete')}
        >
          回复结果
        </Button>
        <DriverCustomerDisposePageModal
          operation="Result"
          ref={page => (this.resultPageRef = page)}
          onSearch={this.onSearch}
        />
        <Button
          type="danger"
          onClick={() => this.handleFinished()}
          // hidden={!havePermission(this.state.authority + '.complete')}
        >
          完结
        </Button>
        {/*<Button*/}
        {/*  onClick={() => this.handleUnFinished()}*/}
        {/*  type="primary"*/}
        {/*  // hidden={!havePermission(this.state.authority + '.norm')}*/}
        {/*>*/}
        {/*  撤销完结*/}
        {/*</Button>*/}
        <BatchProcessConfirm onRef={node => (this.batchProcessConfirmRef = node)} />
      </>
    );
  };

  //发布
  handleRelease = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length === 0) {
      message.warning('请至少选中一条数据！');
      return;
    }
    if (selectedRows.find(x => x.PROCESSINGSTATE === 'Released') && selectedRows.length > 1) {
      message.warning('存在已发布工单，不能批量发布！');
      return;
    }
    if (selectedRows.find(x => x.PROCESSINGSTATE === 'Rejected') && selectedRows.length > 1) {
      message.warning('存在驳回工单，不能批量发布！');
      return;
    }
    if (selectedRows.find(x => x.PROCESSINGSTATE === 'Dispose') && selectedRows.length > 1) {
      message.warning('存在处理中工单，不能批量发布！');
      return;
    }
    if (selectedRows.find(x => x.PROCESSINGSTATE === 'Disposed') && selectedRows.length > 1) {
      message.warning('存在已处理工单，不能批量发布！');
      return;
    }
    if (
      selectedRows.length === 1 &&
      ( selectedRows[0].PROCESSINGSTATE === 'Released' ||
        selectedRows[0].PROCESSINGSTATE === 'Rejected' ||
        selectedRows[0].PROCESSINGSTATE === 'Disposed' ||
        selectedRows[0].PROCESSINGSTATE === 'Dispose')
    ) {
      // this.setState({ releaseModal: true });
      this.releasePageRef.show(selectedRows[0]);
      return;
    }
    //TODO 我在改
    //为保存且只选择一份工单
    if (selectedRows.length === 1) {
      this.publish(selectedRows[0].UUID,
        {
          //暂时不要吧
          // COMPLETIONTIME:selectedRows[0].COMPLETIONTIME,
          // DEADLINE:moment(new Date()).format(selectedRows[0].DEADLINE)
        }).then(response => {
        if (response && response.success) {
          message.success('发布成功！');
          this.onSearch();
        }else{
          message.error('发布失败！');
        }
      });
    } else {//多条处理了 TODO 先写的这个
      this.batchProcessConfirmRef.show(
        '发布',
        selectedRows.map(x => x.UUID),
        this.publish,
        this.onSearch
      );
    }
  };

  release = async (uuid ,data)=> {
    return await release(uuid, data);
  };
  //这是我的客服服务驳回
  onReject = async (data)=> {
    return await onReject(data);
  };

  //这是我的客服服务发布
  publish = async (uuid ,data)=> {
    return await publish(uuid, data);
  };


  //回复进度
  handleProgress = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length !== 1) {
      message.warning('请选中一条数据！');
      return;
    }
    this.processPageRef.show(selectedRows[0]);
  }

  //回复结果
  handleResult = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length !== 1) {
      message.warning('请选中一条数据！');
      return;
    }
    this.resultPageRef.show(selectedRows[0]);
  };

  // TODO 我没弄
  //完结
  handleFinished = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length === 0) {
      message.warning('请至少选中一条数据！');
      return;
    }
    if (selectedRows.length === 1) {
      onFinish(selectedRows[0].UUID).then(response => {
        if (response.success) {
          message.success('保存成功！');
          this.onSearch();
        }else{
          message.error(response.message)
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
    return await onFinish(uuid);
  };

  // TODO 我没弄
  // 取消完结
  handleUnFinished = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length === 0) {
      message.warning('请至少选中一条数据！');
      return;
    }
    if (selectedRows.length === 1) {
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

  // TODO 已弄好
  //删除
  handleDelete = () => {
    const { selectedRows } = this.state;
    const service = selectedRows
      .filter(x => 'Saved,ReleasedDispose'.indexOf(x.PROCESSINGSTATE) == -1)
      .shift();
    if (service) {
      // message.error('客服工单:' + service.BILLNUMBER + service.STATUS_CN + '状态，不能删除！');
      message.error('客服工单:' + service.BILLNUMBER+ service.PROCESSINGSTATE_CN + '状态，不能删除！');
      return;
    }
    this.onBatchDelete();
  };

  // TODO 已弄好,再弄
  //驳回
  handleReject = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length !== 1) {
      message.warning('请选中一条数据！');
      return;
    }
      this.rejectedPageRef.show(selectedRows[0]);
  };

  //编辑
  onUpdate = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length !== 0) {
      if (selectedRows[0].STATUS !== 'Finished') {
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
