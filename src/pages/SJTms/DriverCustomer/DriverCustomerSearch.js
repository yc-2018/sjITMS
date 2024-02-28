/*
 * 司机服务表格上面的那些操作按钮
 */
import React from 'react';
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { Button, message, Popconfirm } from 'antd';
import { release, unFinished } from '@/services/sjitms/Customer';
import BatchProcessConfirm from '../Dispatching/BatchProcessConfirm';
import { loginUser } from '@/utils/LoginContext';
import { onFinish, onReject, publish } from '@/services/sjitms/DriverCustomerService';
import DriverCustomerDisposePageModal from '@/pages/SJTms/DriverCustomerDispose/DriverCustomerDisposePage';
import styles from './DriverCustomerSearch.less'

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
    let creatorCol = queryConfig.columns.find(x => x.fieldName === 'CREATORNAME');
    creatorCol.searchDefVal = loginUser().name;
    return queryConfig;
  };

  /**
   * @description 改变每一行的数据展示（这里改变状态颜色）
   * @param row 行数据
   * */
  drawcell = row => {
    if (row.column.fieldName === 'PROCESSINGSTATE') {
      let color = this.colorChange(row.record.PROCESSINGSTATE, row.column.textColorJson);
      let textColor = color ? this.hexToRgb(color) : 'black';
      row.component = (
          <div className={styles.stat} style={{ backgroundColor: color, color: textColor }}>{row.val}</div>
      );
    }
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

        <Button
         onClick={() => this.handleUnFinished()}
         type="primary"
         // hidden={!havePermission(this.state.authority + '.norm')}
        >
         撤销完结
        </Button>
        <BatchProcessConfirm onRef={node => (this.batchProcessConfirmRef = node)} />
      </>
    );
  };

  //发布
  handleRelease = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length === 0) return message.warning('请至少选中一条数据！')
    if (selectedRows.length > 1){
      if (selectedRows.find(x => x.PROCESSINGSTATE === 'Released'))
        return message.warning('存在已发布工单，不能批量发布！')
      if (selectedRows.find(x => x.PROCESSINGSTATE === 'Rejected'))
        return message.warning('存在驳回工单，不能批量发布！');
      if (selectedRows.find(x => x.PROCESSINGSTATE === 'Dispose'))
        return message.warning('存在处理中工单，不能批量发布！')
      if (selectedRows.find(x => x.PROCESSINGSTATE === 'Disposed'))
        return message.warning('存在已处理工单，不能批量发布！');
    }

    if(selectedRows.length === 1) {
      if(['Released', 'Rejected', 'Disposed', 'Dispose','Finished'].includes(selectedRows[0].PROCESSINGSTATE)) {
        message.warning('只有已保存状态的工单才能发布，当前状态不能发布！')
        return this.releasePageRef.show(selectedRows[0])
      }

      //TODO 我在改
      //为保存且只选择一份工单
      this.publish(selectedRows[0].UUID).then(response => {
        if (response && response.success) {
          message.success('发布成功！');
          this.onSearch();
        }else message.error('发布失败！')

      })

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
  publish = async (uuid)=> {
    return await publish(uuid);
  };


  //回复进度
  handleProgress = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length !== 1) return message.warning('请选中一条数据！')
    if (!['Dispose','Released'].includes(selectedRows[0].PROCESSINGSTATE)) message.warning('只有已发布或处理中的状态才能回复进度，当前状态无法回复结果！')

    this.processPageRef.show(selectedRows[0]);
  }

  //回复结果
  handleResult = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length !== 1) return message.warning('请选中一条数据！');
    if (!['Dispose','Released'].includes(selectedRows[0].PROCESSINGSTATE)) message.warning('只有已发布或处理中的状态才能回复结果，当前状态无法回复结果！')

    this.resultPageRef.show(selectedRows[0]);
  };

  // TODO 我没弄
  //完结
  handleFinished = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length === 0) return message.warning('请至少选中一条数据！');

    if (selectedRows.length === 1) {
      if (selectedRows[0].PROCESSINGSTATE!=='Disposed'){
        this.resultPageRef.show(selectedRows[0])
        return message.warning('只有已处理状态才能完结，当前状态无法完结！')
      }
      onFinish(selectedRows[0].UUID).then(response => {
        if (response.success) {
          message.success('保存成功！');
          this.onSearch();
        }else message.error(response.message)
      })
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
      .filter(x => 'Saved,ReleasedDispose'.indexOf(x.PROCESSINGSTATE) === -1)
      .shift();
    if (service) return message.error('客服工单:' + service.BILLNUMBER+ service.PROCESSINGSTATE_CN + '状态，不能删除！');

    this.onBatchDelete();
  };

  //驳回
  handleReject = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length !== 1) return message.warning('请选中一条数据！')
    if (selectedRows[0].PROCESSINGSTATE !== 'Released') message.warning('只有发布状态的工单才能驳回！当前状态不能驳回！')

      this.rejectedPageRef.show(selectedRows[0]);
  }

  //编辑
  onUpdate = () => {
    const { selectedRows } = this.state
    if (selectedRows.length === 1)
      if (['Saved','Released','Rejected'].includes(selectedRows[0].PROCESSINGSTATE)) this.props.switchTab('update', { entity: selectedRows[0] })
      else message.error('回复后不能再编辑了！')
    else message.warn('请选中一条数据!')
  }
}
