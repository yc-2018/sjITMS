/*
 * @Author: guankongjin
 * @Date: 2023-09-26 14:30:27
 * @LastEditors: guankongjin
 * @LastEditTime: 2023-10-05 11:38:19
 * @Description: G7设备管理
 * @FilePath: \iwms-web\src\pages\SJTms\GpsDevice\GpsDeviceSearch.js
 */
import React from 'react';
import { Button, Form } from 'antd';
import { connect } from 'dva';
import { havePermission } from '@/utils/authority';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
@Form.create()
export default class GpsDeviceSearch extends QuickFormSearchPage {

  drawToolsButton = () => {
    return <>
      <Button
        hidden={!havePermission(this.state.authority + '.stopService')}
        onClick={() => this.onStopService()}
      >
        流量管理
      </Button>
      <Button
        hidden={!havePermission(this.state.authority + '.split')}
        type="danger"
        onClick={() => this.onSplit()}
      >
        拆除
      </Button>
      <Button
        hidden={!havePermission(this.state.authority + '.shift')}
        onClick={() => this.onShift()}
        type="primary"
      >
        移装
      </Button>
    </>
  }

  //停流量
  onStopService = () => {

  }

  //拆除
  onSplit = () => {

  }

  //移装
  onShift = () => {

  }
}
