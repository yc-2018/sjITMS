/*
 * @Author: Liaorongchang
 * @Date: 2023-06-26 14:41:13
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-10-25 16:12:16
 * @version: 1.0
 */
/*
 * @Author: Liaorongchang
 * @Date: 2023-06-26 14:41:13
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-08-17 08:53:50
 * @version: 1.0
 */
import React from 'react';
import { connect } from 'dva';
import CostPlanDefCreate from './CostPlanDefCreate';
import CostPlanView from './CostPlanView';
import QuickForm from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickForm';
import CostPlanIndex from './CostPlanIndex';
import CostCalculationSearchPage from '@/pages/NewCost/CostCalculation/CostCalculationSearch';
import CostBillEdit from '@/pages/NewCost/CostCalculation/CostBillEdit';
import CostBillEditView from '@/pages/NewCost/CostCalculation/CostBillEditView';
import Create from '@/pages/Component/RapidDevelopment/OnlForm/QuickCreatePageDefault';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/QuickFormSearchPageDefault';
import QuickViewPage from '@/pages/Component/RapidDevelopment/OnlForm/QuickViewPageDefault';
import ExcelImport from '@/components/ExcelImport';
import CostBillSearchPage from './CostBillSearchPage';
import CostPlanDefView from './CostPlanDefView';

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
      //首页
      const component = <CostPlanIndex {...e.props} />;
      e.component = component;
    }
    if (e.showPageNow == 'create') {
      //编辑方案界面
      const component = <CostPlanDefCreate {...e.props} />;
      e.component = component;
    }
    if (e.showPageNow == 'update') {
      //编辑方案界面
      const component = <CostPlanDefCreate {...e.props} />;
      e.component = component;
    }
    if (e.showPageNow == 'view') {
      const component = <CostPlanView {...e.props} />;
      e.component = component;
    }
    if (e.showPageNow == 'calculation') {
      //计算页面
      e.props.quickuuid = 'cost_calculation';
      const component = <CostCalculationSearchPage {...e.props} />;
      e.component = component;
    }
    if (e.showPageNow == 'updateBill') {
      //计费结果编辑页面
      const component = <CostBillEdit {...e.props} />;
      e.component = component;
    }
    if (e.showPageNow == 'queryBill') {
      //台账界面
      e.props.quickuuid = 'v_cost_bill';
      const component = <CostBillSearchPage {...e.props} />;
      e.component = component;
    }
    if (e.showPageNow == 'defView') {
      //方案详细查看界面
      const component = <CostPlanDefView {...e.props} />;
      e.component = component;
    } else if (e.showPageNow == 'checkView') {
      const component = <CostBillEditView {...e.props} />;
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
      case 'defView':
        component = <QuickViewPage {...props} />;
        e = {
          component: component,
          showPageNow: showPageNow,
          props: props,
        };
        this.drawTab(e);
        return e.component;
      case 'checkView':
        component = <QuickViewPage {...props} />;
        e = {
          component: component,
          showPageNow: showPageNow,
          props: props,
        };
        this.drawTab(e);
        return e.component;
      case 'calculation':
        component = <QuickViewPage {...props} />;
        e = {
          component: component,
          showPageNow: showPageNow,
          props: props,
        };
        this.drawTab(e);
        return e.component;
      case 'updateBill':
        component = <QuickViewPage {...props} />;
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
