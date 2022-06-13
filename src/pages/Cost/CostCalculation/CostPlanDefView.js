/*
 * @Author: Liaorongchang
 * @Date: 2022-06-10 09:30:40
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-06-11 10:33:09
 * @version: 1.0
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Route, Switch } from 'react-router-dom';
import QuickViewPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickViewPage';
import { message } from 'antd';
import CreatePageModal from '@/pages/Component/RapidDevelopment/OnlForm/QuickCreatePageModal';
import CostProjectCreate from '@/pages/Cost/CostProject/CostProjectCreate';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
//View界面扩展
export default class CostPlanDefView extends QuickViewPage {
  state = { ...this.state, noActionCol: false, notNote: false, modalParam: {} }; // noActionCol: false

  onBack = () => {
    this.props.switchTab('view', {
      entityUuid: this.props.params.entityUuid,
    });
  };

  handleOnClick = record => {
    this.setState({
      modalParam: {
        entityUuid: record.UUID,
        title: record.ITEM_NAME,
      },
    });
    this.createPageModalRef.show();
  };

  renderOperateCol = record => {
    const { modalParam } = this.state;
    return (
      <div>
        <CreatePageModal
          modal={{ title: modalParam.title, width: 1000 }}
          page={{
            quickuuid: 'COST_PROJECT',
            params: modalParam,
            showPageNow: 'update',
            readOnly: true,
          }}
          customPage={CostProjectCreate}
          onRef={node => (this.createPageModalRef = node)}
        />
        <a onClick={() => this.handleOnClick(record)} style={{ color: '#3B77E3' }}>
          查看
        </a>
      </div>
    );
  };
}
