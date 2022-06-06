import React, { PureComponent } from 'react';
import { Table, Button, Input, Col, Row, Popconfirm, message, Modal } from 'antd';
import { colWidth } from '@/utils/ColWidth';
import OperateCol from '@/pages/Component/Form/OperateCol';
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import StandardTable from '@/components/StandardTable';
import { DndProvider, DragSource, DropTarget } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
// import FormPanel from '../Component/Form/FormPanel';
import FormPanel from '@/pages/Component/Form/FormPanel';
import CFormItem from '@/pages/Component/Form/CFormItem';
// import CreatePageModal from '../Component/RapidDevelopment/OnlForm/QuickCreatePageModal';
// import QuickView from '../Component/RapidDevelopment/OnlForm/QuickViewPageDefault';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
//继承QuickFormSearchPage Search页面扩展
export default class CostProjectSearch extends QuickFormSearchPage {
  //需要操作列的显示 将noActionCol设置为false
  //   state = { ...this.state, noActionCol: false, isShow: false, canDragTable: true };

  //该方法用于扩展查询
  exSearchFilter = () => {};
  //该方法用于更改State
  changeState = () => {};
  /**
   * 该方法用于自定义扩展列
     e={
       column:column
     }
   */
  drawExColumns = e => {};
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
    if (e.column.fieldName == 'ACCESSORY_NAME') {
      // const component = <p3 style={{ color: 'red' }}>{e.val}</p3>;
      const component = (
        <a onClick={this.test.bind(this, e.record)} style={{ color: 'red' }}>
          {e.val}
        </a>
      );
      e.component = component;
    }
  };

  aaaa = () => {
    this.aa.show();
  };

  bbb = () => {
    this.setState({ isShow: !this.state.isShow });
  };
  //该方法用于写最上层的按钮 多个按钮用<span>包裹
  drawTopButton = () => {};

  //该方法用于写中间的功能按钮 多个按钮用<span>包裹
  drawToolsButton = () => {};

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
  //操作列举例 具体看OperateCol内介绍
  fetchOperatePropsCommon = record => {
    return [
      {
        name: '111',
        onClick: this.test.bind(this, record),
      },
    ];
  };
  test = (a, b) => {
    console.log(a, b);
  };

  //该方法用于拖拽后触发事件 拖拽需要在state中canDragTable: true
  drapTableChange = list => {
    console.log('list', list);
  };
}
