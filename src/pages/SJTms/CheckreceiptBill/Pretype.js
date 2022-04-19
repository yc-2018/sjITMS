/*
 * @Author: Liaorongchang
 * @Date: 2022-04-16 10:39:47
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-04-18 15:16:01
 * @version: 1.0
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button, Drawer } from 'antd';
import CreatePageModal from '@/pages/Component/RapidDevelopment/OnlForm/QuickCreatePageModal';
import PretypeSearch from './PretypeSearch';
import PretypeCreatePage from './PretypeCreatePage';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class Pretype extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { ...this.state, params: {} };
  }

  memberModalClick = () => {
    this.newPretypeModalRef.show();
  };

  updatePretypeModalClick = record => {
    this.setState({
      params: { entityUuid: record.UUID, title: '1' },
    });
    this.updatePretypeModalRef.show();
  };

  render() {
    const { params } = this.state;
    return (
      <div>
        <PretypeSearch
          {...this.props}
          memberModalClick={this.memberModalClick}
          updatePretypeModalClick={this.updatePretypeModalClick}
        />
        <CreatePageModal
          modal={{
            title: '新建回单处理方式',
            width: 500,
            bodyStyle: { marginRight: '40px' },
          }}
          page={{ quickuuid: 'sj_itms_pretype', noCategory: true }}
          onRef={node => (this.newPretypeModalRef = node)}
        />
        <CreatePageModal
          modal={{
            title: '编辑回单处理方式',
            width: 500,
            bodyStyle: { marginRight: '40px' },
          }}
          customPage={PretypeCreatePage}
          page={{ quickuuid: 'sj_itms_pretype', params: params }}
          onRef={node => (this.updatePretypeModalRef = node)}
        />
      </div>
    );
  }
}
