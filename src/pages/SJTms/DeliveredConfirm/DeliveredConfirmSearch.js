import React, { PureComponent } from 'react';
import { Button, Modal } from 'antd';
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import DeliveredNoCheck from './DeliveredNoCheck';
import { loginOrg, loginCompany } from '@/utils/LoginContext';
import { commonLocale } from '@/utils/CommonLocale';
import { SimpleAutoComplete } from '@/pages/Component/RapidDevelopment/CommonComponent';
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
    billData: { list: [] }, // 票据核对
    isNotHd: true,
  };
  drawTopButton = () => {};
  drawToolsButton = () => {};
  drawToolbarPanel = () => {};
  drawSearchPanel = () => {};
  componentWillReceiveProps(nextProps) {
    if (nextProps.pageFilters != this.props.pageFilters) {
      this.onSearch(nextProps.pageFilters);
    }
  }

  drawcell = e => {
    //找到fieldName为CODE这一列 更改它的component
    if (e.column.fieldName == 'DELIVERED') {
      const component = (
        <SimpleAutoComplete
          style={{ width: 100 }}
          dictCode={'delivered'}
          value={e.record.DELIVERED}
          onChange={this.deliveredChage.bind(this, e.record, e.column)}
        />
      );
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

  //保存门店送货
  saveDelivered = () => {
    this.props.dispatch({
      type: 'deliveredConfirm1/deliveredConfirmSchedule',
      payload: this.state.selectedRows,
      callback: response => {
        if (response && response.success) {
          this.refreshTable();
          message.success(commonLocale.saveSuccessLocale);
        }
      },
    });
  };

  // 全部送达
  deliveredConfirmSchedule = () => {
    const { selectedRows } = this.state;
    console.log('selectRow', selectedRows);
    selectedRows.forEach(e => {
      e.DELIVERED = 'Delivered';
      e.companyUuid = loginCompany().uuid;
      e.dispatchCenterUuid = loginOrg().uuid;
    });
    this.setState({ selectedRows });
  };

  // 全部未送达
  unDeliveredConfirmSchedule = () => {
    const { selectedRows } = this.state;
    selectedRows.forEach(e => {
      e.DELIVERED = 'NotDelivered';
      e.companyUuid = loginCompany().uuid;
      e.dispatchCenterUuid = loginOrg().uuid;
    });
    this.setState({ selectedRows });
  };
  //取消
  handleCancel = () => {
    this.setState({ isShowStandardTable: false });
  };
  //显示回车未送达确认弹出框
  showNoDelivered = () => {
    this.setState({ isShowStandardTable: true });
  };

  drawActionButton = () => {
    const {
      storeSelectedRows,
      billSelectedRows,
      billData,
      storeData,
      targetTabKey,
      storeItemConfirmModalVisible,
      storeUuid,
      storeCode,
      storeName,
      storeAddress,
      scheduleBillNumber,
      selectedRows,
    } = this.state;
    return (
      <>
        <Modal
          visible={this.state.isShowStandardTable}
          onOk={this.handleCancel}
          onCancel={this.handleCancel}
          centered
          width={1200}
          bodyStyle={{ margin: -12 }}
        >
          <DeliveredNoCheck
            quickuuid="sj_schedule_order_no_check"
            pageFilters={this.props.pageFilters}
          />
        </Modal>
        <Button onClick={this.showNoDelivered}>回车未送达确认</Button>
        <Button onClick={this.saveDelivered} type={'primary'}>
          保存门店送货
        </Button>
        <Button onClick={this.deliveredConfirmSchedule}>全部送达</Button>
        <Button onClick={this.unDeliveredConfirmSchedule}>全部未送达</Button>
      </>
    );
  };
}
