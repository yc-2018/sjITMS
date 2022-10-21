/*
 * @Author: Liaorongchang
 * @Date: 2022-04-15 16:05:33
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-10-20 16:41:44
 * @version: 1.0
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import QuickForm from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickForm';
import HighWayAreaGroupCreatePage from './HighWayAreaGroupCreatePage';
import HighWayAreaGroupViewPage from './HighWayAreaGroupViewPage';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class HighWayAreaGroupForm extends QuickForm {
  drawTab = e => {
    if (e.showPageNow == 'create') {
      const component = <HighWayAreaGroupCreatePage {...e.props} />;
      e.component = component;
    } else if (e.showPageNow == 'update') {
      const component = <HighWayAreaGroupCreatePage {...e.props} />;
      e.component = component;
    } else if (e.showPageNow == 'view') {
      const component = <HighWayAreaGroupViewPage {...e.props} />;
      e.component = component;
    }
  };
}
