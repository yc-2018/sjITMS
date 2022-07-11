import React from 'react';
import { connect } from 'dva';
import CostPlanDefCreate from './CostPlanDefCreate';
import CostPlanView from './CostPlanView';
import QuickForm from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickForm';
import CostPlanIndexSearch from './CostPlanIndexSearch';
@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class CostPlanFrom extends QuickForm {
  //继承QuickForm 重写drawTab方法 该方法用于重写跳转的界面
  /**
   * 
   * e的对象格式为{
      component: component,
      showPageNow: showPageNow,
      props: props,
   * }
   * props为{
   *  showPageNow: showPageNow,
      quickuuid: quickuuid,
      onlFormField: onlFormField,
      switchTab: (tab, param) => this.switchTab(tab, param),
      onlFormField: onlFormField,
      params: params,
      tableName: tableName,
      pathname: location.pathname,
   * }
   */
  drawTab = e => {
    if (e.showPageNow == 'query') {
      const component = <CostPlanIndexSearch {...e.props} />;
      e.component = component;
    }
    if (e.showPageNow == 'create') {
      const component = <CostPlanDefCreate {...e.props} />;
      e.component = component;
    }
    if (e.showPageNow == 'update') {
      const component = <CostPlanDefCreate {...e.props} />;
      e.component = component;
    }
    if (e.showPageNow == 'view') {
      const component = <CostPlanView {...e.props} />;
      e.component = component;
    }
  };
}
