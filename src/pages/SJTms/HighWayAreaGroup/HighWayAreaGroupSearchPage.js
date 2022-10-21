/*
 * @Author: Liaorongchang
 * @Date: 2022-10-21 15:36:31
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-10-21 15:46:38
 * @version: 1.0
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { Button, Modal } from 'antd';
import HighWayAreaSearchPage from '@/pages/SJTms/HighWayArea/HighWayAreaSearchPage';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class HighWayAreaGroupSearchPage extends QuickFormSearchPage {
  state = {
    ...this.state,
    isModalVisible: false,
  };

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
        <Button
          onClick={() => {
            this.setState({ isModalVisible: true });
          }}
        >
          高速区域维护
        </Button>
        <Modal
          visible={isModalVisible}
          onOk={this.handleOk.bind()}
          onCancel={this.handleCancel.bind()}
          width={'80%'}
          bodyStyle={{ height: 'calc(70vh)', overflowY: 'auto' }}
        >
          <HighWayAreaSearchPage quickuuid="sj_itms_highwayarea" />
        </Modal>
      </span>
    );
  }; //扩展中间功能按钮
}
