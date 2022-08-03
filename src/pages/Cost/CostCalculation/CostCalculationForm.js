/*
 * @Author: Liaorongchang
 * @Date: 2022-06-08 10:38:44
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-06-10 15:15:22
 * @version: 1.0
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import QuickForm from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickForm';
import CostPlanSearchPage from './CostPlanSearch';
import CostCalculationSearchPage from './CostCalculationSearch';
// import CostPlanDefCreate from '@/pages/Cost/CostPlan/CostPlanDefCreate';
import CostPlanDefView from './CostPlanDefView';
import CostBillEdit from './CostBillEdit';
import CostBillEditView from './CostBillEditView'

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class CostProjectForm extends QuickForm {
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
    console.log(e)
    if (e.showPageNow == 'query') {
      const component = <CostPlanSearchPage {...e.props} />;
      e.component = component;
    } else if (e.showPageNow == 'view') {
      e.props.quickuuid = 'cost_calculation';
      const component = <CostCalculationSearchPage {...e.props} />;
      e.component = component;
    } else if (e.showPageNow == 'update') {
      e.props.quickuuid = 'cost_plan';
      const component = <CostPlanDefView {...e.props} />;
      e.component = component;
    } else if (e.showPageNow == 'create') {
      const component = <CostBillEdit {...e.props} />;
      e.component = component;
    }else if(e.showPageNow =='import'){
      const component = <CostBillEditView {...e.props}/>
      e.component = component;
    }
  };
}
