/*
 * @Author: Liaorongchang
 * @Date: 2023-06-26 14:41:13
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-08-09 14:08:27
 * @version: 1.0
 */
import React from 'react';
import { connect } from 'dva';
import CostPlanDefCreate from './CostPlanDefCreate';
import CostPlanView from './CostPlanView';
import QuickForm from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickForm';
import CostPlanIndex from './CostPlanIndex';
import CostCalculationSearchPage from '@/pages/NewCost/CostCalculation/CostCalculationSearch';
import Create from '@/pages/Component/RapidDevelopment/OnlForm/QuickCreatePageDefault';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/QuickFormSearchPageDefault';
import QuickViewPage from '@/pages/Component/RapidDevelopment/OnlForm/QuickViewPageDefault';
import ExcelImport from '@/components/ExcelImport';
import CostBillSearchPage from './CostBillSearchPage';

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
      const component = <CostPlanIndex {...e.props} />;
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
    if (e.showPageNow == 'import') {
      e.props.quickuuid = 'cost_calculation';
      const component = <CostCalculationSearchPage {...e.props} />;
      e.component = component;
    }
    if (e.showPageNow == 'queryBill') {
    // if (e.showPageNow == 'query') {
      e.props.quickuuid = 'v_cost_bill';
      const component = <CostBillSearchPage {...e.props} />;
      e.component = component;
    }
  };

  render() {
    const { showPageNow, quickuuid, tableName, onlFormField, params } = this.state;
    const { location } = this.props;
    const props = {
      showPageNow: showPageNow,
      quickuuid: quickuuid,
      onlFormField: onlFormField,
      params: params,
      tableName: tableName,
      pathname: location.pathname,
      ...this.fixedProps,
      route: this.props.route,
    };
    let component;
    let e;
    switch (showPageNow) {
      case 'create':
        component = <Create {...props} />;
        e = {
          component: component,
          showPageNow: showPageNow,
          props: props,
        };
        this.drawTab(e);
        return e.component;
      case 'update':
        component = <Create {...props} />;
        e = {
          component: component,
          showPageNow: showPageNow,
          props: props,
        };
        this.drawTab(e);
        return e.component;
      case 'query':
        component = <QuickFormSearchPage {...props} />;
        e = {
          component: component,
          showPageNow: showPageNow,
          props: props,
        };
        this.drawTab(e);
        return e.component;
      case 'view':
        component = <QuickViewPage {...props} />;
        e = {
          component: component,
          showPageNow: showPageNow,
          props: props,
        };
        this.drawTab(e);
        return e.component;
      case 'import':
        component = <ExcelImport {...props} />;
        e = {
          component: component,
          showPageNow: showPageNow,
          props: props,
        };
        this.drawTab(e);
        return e.component;
      case 'queryBill':
        component = <QuickFormSearchPage {...props} />;
        e = {
          component: component,
          showPageNow: showPageNow,
          props: props,
        };
        this.drawTab(e);
        return e.component;
      default:
        return null;
    }
  }
}