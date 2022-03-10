import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Route, Switch } from 'react-router-dom';
import QuickViewPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickViewPage';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
//View界面扩展
export default class TestView extends QuickViewPage {
  /**
   该方法用于重写view界面的render
   ps：一对一、一对多的component写法有点不同
   一对一：
    e={
        onlFormHead
        onlFormField
        component
        val
    }
    component写法：
    component = {
        label: e.onlFormField.dbFieldTxt,
        value: <p3 style={{ color: 'red' }}>{e.val}</p3>,
    };
    一对多:
    e={
      onlFormField
      onlFormHead
      record
      component
      val
    }
    component写法：
    component = {
        <p3 style={{ color: 'blue' }}>{e.val}</p3>
    };
      
   */
  drawcell = e => {
    if (e.onlFormField.dbFieldName == 'CODE') {
      e.component = {
        label: e.onlFormField.dbFieldTxt,
        value: <p3 style={{ color: 'red' }}>{e.val}</p3>,
      };
    }

    if (e.onlFormField.dbFieldName == 'EMPCODE') {
      e.component = <p3 style={{ color: 'blue' }}>{e.val}</p3>;
    }
  };
}
