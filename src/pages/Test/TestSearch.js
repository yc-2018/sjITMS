import React, { PureComponent } from 'react';
import { Table, Button, Input, Col, Row, Popconfirm, message } from 'antd';
import { colWidth } from '@/utils/ColWidth';
import OperateCol from '@/pages/Component/Form/OperateCol';
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
//继承QuickFormSearchPage Search页面扩展
export default class TestSearch extends QuickFormSearchPage {
  //该方法用于更改State
  changeState = () => {
    this.setState({ title: '' });
    this.setState({ noActionCol: false });
  };
  /**
   * 该方法用于自定义扩展列
     e={
       column:column
     }
   */
  drawExColumns = e => {
    if (e.column.fieldName == 'CODE') {
      const c = {
        title: 'CODE前扩展',
        dataIndex: 'name',
        key: 'name',
        sorter: true,
        width: colWidth.codeColWidth,
        render: (val, record) => {
          return (
            <a onClick={this.onView.bind(this, record)} style={{ color: 'red' }}>
              {111}
            </a>
          );
        },
      };
      return c;
    }
  };
  /**
   该方法用于修改table的render

   e的对象结构为{
      column   //对应的column
      record,  //对应的record
      component, //render渲染的组件
      val  //val值
   }  
   */
  drawcell = e => {
    //找到fieldName为CODE这一列 更改它的component
    if (e.column.fieldName == 'CODE') {
      // const component = <p3 style={{ color: 'red' }}>{e.val}</p3>;
      const component = (
        <a onClick={this.onView.bind(this, e.record)} style={{ color: 'red' }}>
          {e.val}
        </a>
      );
      e.component = component;
    }
  };

  //该方法用于写最上层的按钮 多个按钮用<span>包裹
  drawTopButton = () => {
    return <Button type="primary">1111</Button>;
  };

  //该方法用于写中间的功能按钮 多个按钮用<span>包裹
  drawToolsButton = () => {
    return (
      <span>
        <Button>阿巴阿巴</Button>
        <Button>111</Button>
      </span>
    );
  };

  //该方法会覆盖所有的上层按钮
  //drawActionButton = () => {};

  //该方法会覆盖所有的中间功能按钮
  //drawToolbarPanel = () => {};

  // 该方法会覆盖所有的搜索查询
  // drawSearchPanel=()=>{}

  //该方法用于写操作列的render
  renderOperateCol = record => {
    return <OperateCol menus={this.fetchOperatePropsCommon(record)} />;
  };
  fetchOperatePropsCommon = record => {
    return [
      {
        name: '操作功能名称',
        onClick: this.test.bind(this, record),
      },
    ];
  };
  test = (a, b) => {};
}
