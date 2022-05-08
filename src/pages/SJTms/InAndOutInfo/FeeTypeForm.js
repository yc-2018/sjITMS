import FeeTypeInfo  from "./FeeTypeInfo";
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import QuickForm from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickForm';
@connect(({ quick, loading }) => ({
    quick,
    loading: loading.models.quick,
  }))
  export default class NocheckForm extends QuickForm {
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
        const component = <FeeTypeInfo {...e.props} style={{heigth:500}}/>;
        e.component = component;
      }
      
    };
  }
  