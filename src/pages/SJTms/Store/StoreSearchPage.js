import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button, Modal } from 'antd';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { havePermission } from '@/utils/authority';
import AddressAreaSearchPage from '@/pages/SJTms/AddressArea/AddressAreaSearchPage';
@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class StoreSearchPage extends QuickFormSearchPage {
  drawTopButton = () => {
    return (
      <Button
        hidden={!havePermission(this.state.authority + '.DeliveryArea')}
        onClick={() => this.setState({ isModalVisible: true })}
        type="primary"
      >
        配送区域
      </Button>
    );
  }; //扩展最上层按钮
  handleOk = () => {
    this.setState({ isModalVisible: false });
  };

  handleCancel = () => {
    this.setState({ isModalVisible: false });
  };

  drawToolsButton = () => {
    const { isModalVisible } = this.state;
    return (
      <span>
        <Modal
          visible={isModalVisible}
          onOk={this.handleOk.bind()}
          onCancel={this.handleCancel.bind()}
          width={'80%'}
          bodyStyle={{ height: 'calc(80vh)', overflowY: 'auto' }}
        >
          <AddressAreaSearchPage quickuuid="sj_itms_ship_address_area" />
        </Modal>
      </span>
    );
  };
}
