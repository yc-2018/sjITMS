import React, { PureComponent } from 'react';
import { Button, message, Modal, Tag, Popconfirm } from 'antd';
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import DeliveredNoCheck from './DeliveredNoCheck';
import DeliveredNoSchedule  from './DeliveredNoSchedule'
import { loginOrg, loginCompany } from '@/utils/LoginContext';
import { havePermission } from '@/utils/authority';
import { getConfigDataByParams } from '@/services/sjconfigcenter/ConfigCenter';
import { log } from 'lodash-decorators/utils';

@connect(({ quick, deliveredConfirm, loading }) => ({
  quick,
  deliveredConfirm,
  loading: loading.models.quick,
}))
//继承QuickFormSearchPage Search页面扩展
export default class DeliveredConfirmSearch extends QuickFormSearchPage {
  state = {
    ...this.state,
    storeItemConfirmModalVisible: false,
    isShowStandardTable: false,
    isNotHd: true,
    authority: this.props.authority,
    statistics:0,
    isShowScheduleInfo:false
  };
  drawTopButton = () => {};
  drawToolsButton = () => {};
  drawToolbarPanel = () => {
    return (
      <>
        <Modal
          visible={this.state.isShowStandardTable}
          onOk={this.handleCancel}
          onCancel={this.handleCancel}
          centered
          width={'90%'}
          // bodyStyle={{ margin: -12 }}
          bodyStyle={{ height: 'calc(80vh)', overflowY: 'auto' }}
          footer={
            <Button onClick={() => this.setState({ isShowStandardTable: false })}>取消</Button>
          }
        >
          <DeliveredNoCheck
            quickuuid="sj_schedule_order_no_check"
            pageFilters={this.props.pageFilters}
            isMerge={this.state.isMerge}
            // scroll={{
            //   x: 4000,
            //   y: 'calc(80vh)',
            // }}
          />
        </Modal>

        <Modal
          visible={this.state.isShowScheduleInfo}
          onOk={this.handleCancel}
          onCancel={this.handleCancel}
          centered
          width={'90%'}
          // bodyStyle={{ margin: -12 }}
          bodyStyle={{ height: 'calc(80vh)', overflowY: 'auto' }}
          footer={
            <Button onClick={() => this.setState({ isShowScheduleInfo: false })}>取消</Button>
          }
        >
          <DeliveredNoSchedule
            quickuuid="v_sj_itms_not_ship_billnumber"
          />
        </Modal>

        {/* <Button onClick={this.saveDelivered} type={'primary'}>
          保存门店送货
        </Button> */}
        <Popconfirm
          title="确定设置为待处理?"
          onConfirm={() => this.deliveredConfirmSchedule('Pending')}
          okText="确定"
          cancelText="取消"
        >
          <Button type={'primary'} hidden={!havePermission(this.state.authority + '.processed')}>
            待处理
          </Button>
        </Popconfirm>
        <Popconfirm
          title="确定设置为送达?"
          onConfirm={() => this.deliveredConfirmSchedule('Delivered')}
          okText="确定"
          cancelText="取消"
        >
          <Button type={'primary'} hidden={!havePermission(this.state.authority + '.ok')}>
            送达
          </Button>
        </Popconfirm>
        <Popconfirm
          title="确定设置为未送达?"
          onConfirm={() => this.deliveredConfirmSchedule('NotDelivered')}
          okText="确定"
          cancelText="取消"
        >
          <Button type={'danger'} hidden={!havePermission(this.state.authority + '.noOk')}>
            未送达
          </Button>
         
        </Popconfirm>
        <Popconfirm
          title="确定取消送达?"
          onConfirm={() => this.cancelDeliveredConfirm()}
          okText="确定"
          cancelText="取消"
        >
          <Button hidden={!havePermission(this.state.authority + '.qxOk')}>
            取消送达
          </Button>
        </Popconfirm>
       
      </>
    );
  };
  drawSearchPanel = () => {};
  componentWillReceiveProps(nextProps) {
    if (nextProps.pageFilters != this.props.pageFilters) {
      this.onSearch(nextProps.pageFilters);
      this.getStatistics();
    }
  }

  drawcell = e => {
    //找到fieldName为CODE这一列 更改它的component
    if (e.column.fieldName == 'DELIVERED') {
      let component = <span>{'<空>'}</span>;
      if (e.record.DELIVERED === 'Delivered') {
        component = <Tag color="green">{e.record.DELIVERED_CN}</Tag>;
      } else if (e.record.DELIVERED === 'NotDelivered') {
        component = <Tag color="red">{e.record.DELIVERED_CN}</Tag>;
      } else if (e.record.DELIVERED === 'Pending') {
        component = <Tag color="cyan">{e.record.DELIVERED_CN}</Tag>;
      }
      e.component = component;
    }
  };

  handleModal = record => {
    if (record) {
      this.setState({
        storeUuid: record.DELIVERYPOINTUUID,
        storeCode: record.STORECODE,
        storeName: record.DELIVERYPOINTNAME,
        storeAddress: record.DELIVERYPOINTADDRESS,
        scheduleBillNumber: record.SHIPPLANBILLNUMBER,
      });
    } else {
      this.refreshTable();
    }
    this.setState({
      storeItemConfirmModalVisible: !this.state.storeItemConfirmModalVisible,
    });
  };

  deliveredChage = (records, colum, e) => {
    records[colum.fieldName] = e.value;
  };
  // 全部送达/未送达/待处理
  deliveredConfirmSchedule = value => {
    if (!value) {
      return;
    }
    if (this.state.selectedRows.length == 0) {
      message.info('至少选择一条数据！');
      return;
    }
    this.props.dispatch({
      type: 'deliveredConfirm1/deliveredConfirmSchedule',
      payload: this.state.selectedRows.map(e => {
        return {
          ...e,
          DELIVERED: value,
          companyUuid: loginCompany().uuid,
          dispatchCenterUuid: loginOrg().uuid,
        };
      }),
      callback: response => {
        if (response && response.success) {
          this.refreshTable();
          message.success('保存成功');
        }
      },
    });
  };
  cancelDeliveredConfirm  = ()=>{
    if (this.state.selectedRows.length == 0) {
      message.info('至少选择一条数据！');
      return;
    }
    this.props.dispatch({
      type: 'deliveredConfirm1/cancelDeliveredConfirm',
      payload: this.state.selectedRows.map(e => {
        return {
          ...e,
          companyUuid: loginCompany().uuid,
          dispatchCenterUuid: loginOrg().uuid,
        };
      }),
      callback: response => {
        if (response && response.success) {
          this.refreshTable();
          message.success('保存成功');
        }
      },
    });
  }
  //取消
  handleCancel = () => {
    this.setState({ isShowStandardTable: false ,isShowScheduleInfo:false});
  };
  //显示回车未送达确认弹出框
  showNoDelivered = () => {
    this.setState({ isShowStandardTable: true });
  };
  showNoDeliveredSchedule = () => {
    this.setState({ isShowScheduleInfo: true });
  };
  changeState = async () => {
    //增加是否合并配置
    let res = await getConfigDataByParams('DeliveredConfirm', loginOrg().uuid, 'isMerge');
    let isMerge = res.data[0].isMerge == 1 ? true : false;
    this.setState({ title: '', isMerge });
    this.getStatistics();
  }; //扩展state
  getStatistics =()=>{
     this.props.dispatch({
      type: 'deliveredConfirm1/pendingStatistics',
      payload: {
          companyUuid: loginCompany().uuid,
          dispatchCenterUuid: loginOrg().uuid
        },
      callback: response => {
        this.setState({statistics:response?.data})
      },
    })
  }
  drawActionButton = () => {
    return (
      <>
      <span style={{fontSize:14,color:'#0000ff'}}>待处理排车单数：</span><a 
      style={{fontSize:19,color:'#e33b3b',fontWeight:'bold'}}
      onClick={()=>this.showNoDeliveredSchedule()}
      >{
      this.state.statistics
      }</a>
      <Button
        type="primary"
        onClick={this.showNoDelivered}
        hidden={!havePermission(this.state.authority + '.backNoOk')}
      >
        回车未送达确认
      </Button>
      </>
    );
    
  };
}
