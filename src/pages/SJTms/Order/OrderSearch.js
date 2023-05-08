/*
 * @Author: Liaorongchang
 * @Date: 2022-03-10 11:29:17
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-03-28 15:48:34
 * @version: 1.0
 */
import React from 'react';
import { Button, Popconfirm, message, Menu, Modal, Form, Input } from 'antd';
import { connect } from 'dva';
import { havePermission } from '@/utils/authority';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import BatchProcessConfirm from '../Dispatching/BatchProcessConfirm';
import { batchAudit, audit, cancel, removeOrder,updateOrderWavenum } from '@/services/sjitms/OrderBill';
import { SimpleAutoComplete } from '@/pages/Component/RapidDevelopment/CommonComponent';
import moment from 'moment';
import { log } from 'lodash-decorators/utils';

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
    showRemovePop: false,
    dispatchCenter: '',
    showUpdateWaven:false
  };

  onUpload = () => {
    this.props.switchTab('import');
  };

  defaultSearch = () => {
    //默认查询
    let ex = this.state.queryConfigColumns.filter(item => {
      return item.searchDefVal != null && item.searchDefVal != '';
    });
    let defaultSearch = [];
    let exSearchFilter;
    for (const item of ex) {
      if (item.fieldType == 'Date') {
        let days = parseInt(item.searchDefVal);
        if (days != days) days = 0;
        let endDate = moment(new Date()).format('YYYY-MM-DD');
        let startDate = moment(new Date())
          .add(-item.searchDefVal, 'days')
          .format('YYYY-MM-DD');
        exSearchFilter = {
          field: item.fieldName,
          type: item.fieldType,
          rule: item.searchCondition,
          val: `${startDate}||${endDate}`,
        };
      } else if (item.fieldType == 'DateTime') {
        let days = parseInt(item.searchDefVal);
        if (days != days) days = 0;
        let endDate = moment(new Date()).format('YYYY-MM-DD 23:59:59');
        let startDate = moment(new Date())
          .add(-item.searchDefVal, 'days')
          .format('YYYY-MM-DD 00:00:00');
        exSearchFilter = {
          field: item.fieldName,
          type: item.fieldType,
          rule: item.searchCondition,
          val: `${startDate}||${endDate}`,
        };
      } else {
        exSearchFilter = {
          field: item.fieldName,
          type: item.fieldType,
          rule: item.searchCondition,
          val: item.searchDefVal,
        };
      }
      defaultSearch.push(exSearchFilter);
    }
    //暂时通过这种方式赋予默认值
    defaultSearch.push({
      field: 'WAVENUM',
      type: 'VARCHAR',
      rule: 'eq',
      val: moment(new Date()).format('YYMMDD') + '0001',
    });
    return defaultSearch;
  };

  handleRemove = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length <= 0) {
      message.error('请先选择排车单！');
      return;
    }
    this.setState({ showRemovePop: true });
  };
  handleUpdate = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length <= 0) {
      message.error('至少选择一条数据！');
      return;
    }
    this.setState({ showUpdateWaven: true });
  };

  // drawRightClickMenus = () => {
  //   return (
  //     <Menu>
  //       <Menu.Item
  //         key="1"
  //         hidden={!havePermission(this.state.authority + '.remove')}
  //         onClick={() => this.handleRemove()}
  //       >
  //         转仓
  //       </Menu.Item>
  //     </Menu>
  //   );
  // };

  handleOk = async () => {
    const { selectedRows, dispatchCenter } = this.state;
    if (selectedRows.length == 1) {
      const response = await removeOrder(selectedRows[0].UUID, dispatchCenter);
      if (response && response.success) {
        message.success('转仓成功');
        this.setState({ showRemovePop: false });
        this.onSearch();
      } else {
        message.error('转仓失败');
      }
    } else {
      this.batchProcessConfirmRef.show('转仓', selectedRows, this.remove, this.onSearch);
      this.setState({ showRemovePop: false });
    }
  };
  showUpdateWavenHandleOk =async ()=>{
    const { selectedRows,WAVENUM } = this.state;
    if(selectedRows.length ==0 ){
      message.error('至少选择一条数据');
      return;
    }
    if(!WAVENUM){
      message.error('请填写作业号'); 
      return;
    }
     const response = await updateOrderWavenum (selectedRows.map(e=>e.UUID),WAVENUM);
     if(response && response.success){
      message.success("修改成功");
      this.setState({showUpdateWaven:false})
      this.onSearch();
     }
    
  }

  remove = async record => {
    const { dispatchCenter } = this.state;
    return await removeOrder(record.UUID, dispatchCenter);
  };

  drawToolsButton = () => {
    const { showAuditPop, showCancelPop, selectedRows, dispatchCenter, showRemovePop,showUpdateWaven } = this.state;
    return (
      <>
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
        <Button
          hidden={!havePermission(this.state.authority + '.remove')}
          onClick={() => this.handleRemove()}
        >
          转仓
        </Button>
        <Button
          hidden={!havePermission(this.state.authority + '.updateWaven')}
          onClick={() =>this.handleUpdate()}
        >
          修改作业号
        </Button>
        <BatchProcessConfirm onRef={node => (this.batchProcessConfirmRef = node)} />
        <Modal
          title="转仓"
          visible={showRemovePop}
          onOk={() => {
            this.handleOk();
          }}
          onCancel={() => {
            this.setState({ showRemovePop: false });
          }}
        >
          <Form>
            <Form.Item label="转仓:" labelCol={{ span: 6 }} wrapperCol={{ span: 15 }}>
              <SimpleAutoComplete
                showSearch
                placeholder="请选择调度中心"
                dictCode="dispatchCenter"
                value={dispatchCenter}
                onChange={e => this.setState({ dispatchCenter: e })}
                noRecord
                style={{ width: 150 }}
                allowClear={true}
              />
            </Form.Item>
          </Form>
        </Modal>
        <Modal
          title="添加作业号"
          visible={showUpdateWaven}
          onOk={() => {
            this.showUpdateWavenHandleOk();
          }}
          onCancel={() => {
            this.setState({ showUpdateWaven: false });
          }}
        >
          <Form>
            <Form.Item label="作业号:" labelCol={{ span: 6 }} wrapperCol={{ span: 15 }}>
              <Input
                onChange={e =>{
                  this.setState({ WAVENUM: e.target.value })
                } }
              />
            </Form.Item>
          </Form>
        </Modal>
      </>
    );
  };

  //该方法用于写最上层的按钮 多个按钮用<span>包裹
  // drawTopButton = () => {
  //   return (
  //     <span>
  //       <Button
  //         hidden={!havePermission(this.state.authority + '.import')}
  //         type="primary"
  //         onClick={this.onUpload}
  //       >
  //         导入
  //       </Button>
  //     </span>
  //   );
  // };

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

  drawcell = e => {
    if (e.column.fieldName == 'STAT') {
      let color = this.colorChange(e.record.STAT, e.column.textColorJson);
      let textColor = color ? this.hexToRgb(color) : 'black';
      e.component = (
        <div style={{ backgroundColor: color, textAlign: 'center', color: textColor }}>{e.val}</div>
        // <div style={{ border: '1px solid ' + color, textAlign: 'center' }}>{e.val}</div>
      );
    }
  };
}
