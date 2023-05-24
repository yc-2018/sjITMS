/*
 * @Author: Liaorongchang
 * @Date: 2022-10-21 15:36:31
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-10-25 16:24:43
 * @version: 1.0
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { Button, Modal } from 'antd';
import HighWayAreaSearchPage from '@/pages/SJTms/HighWayArea/HighWayAreaSearchPage';
import { havePermission } from '@/utils/authority';
import CreatePageModal from '@/pages/Component/RapidDevelopment/OnlForm/QuickCreatePageModal';
import { loginOrg } from '@/utils/LoginContext';

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
          hidden={!havePermission(this.state.authority + '.maintenance')}
          onClick={() => {
            this.setState({ isModalVisible: true });
          }}
        >
          高速区域维护
        </Button>
        <Button
          hidden={!havePermission(this.state.authority + '.updateNumber')}
          onClick={() => {
            this.updateNumberRef?.show();
          }}
        >
          高速区域编号设置
        </Button>
        <Modal
          visible={isModalVisible}
          onOk={this.handleOk.bind()}
          onCancel={this.handleCancel.bind()}
          width={'80%'}
          bodyStyle={{ height: 'calc(80vh)', overflowY: 'auto' }}
        >
          <HighWayAreaSearchPage quickuuid="sj_itms_highwayarea" />
        </Modal>
        <CreatePageModal
          modal={{
            title: '编辑高速区域编号',
            width: 500,
            bodyStyle: { marginRight: '40px' },
            // afterClose: () => {
            //   this.refreshTable();
            // },
          }}
          // customPage={HighWayAreaCreatePage}
          page={{
            quickuuid: 'sj_itms_serialnumber',
            showPageNow: 'update',
            searchField: 'DISPATCHCENTERUUID',
            params: { entityUuid: loginOrg().uuid },
          }}
          onRef={node => (this.updateNumberRef = node)}
        />
      </span>
    );
  }; //扩展中间功能按钮
}
