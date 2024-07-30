import React from 'react'
import { Button, message, Modal } from 'antd'
import { colWidth } from '@/utils/ColWidth'
import OperateCol from '@/pages/Component/Form/OperateCol'
import { connect } from 'dva'
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage'
import CreatePageModal from '../Component/RapidDevelopment/OnlForm/QuickCreatePageModal'
import TestView from './TestView'
// import FormPanel from '../Component/Form/FormPanel';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
/** 继承QuickFormSearchPage Search页面扩展 */
export default class TestSearch extends QuickFormSearchPage {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,            // 继承父组件的state
      tableHeight: 480,         // 【覆】表格高度
      isNotHd: true,            // 【覆】是没有最外层的边框收藏
      noActionCol: false,       // 【覆】需要操作列的显示 将noActionCol设置为false
      canDragTable: true,       // 【覆】启动拖拽
      noTable: false,           // 【覆】框架的表格显示(默认)
      isRadio: true,            // 【覆】表行是否单选
      isShow: false,
    };
  }

  // ↓↓↓↓——————————————————🟢🟢🟢画界面方法🟢🟢🟢————————————————————↓↓↓↓

  /** 该方法会覆盖所有的上层按钮 */
  drawActionButton = () => {}

  /** 该方法用于写最上层的按钮 多个按钮用<span>包裹 */
  drawTopButton = () => {
    return (
      <span>
        <Button onClick={this.aaaa} type="primary">在最上面的查看按钮旁边</Button>
        <CreatePageModal page={{ quickuuid: '20220125', noCategory: true }} onRef={c => (this.aa = c)}/>
        <Button onClick={this.bbb} type="primary">gotoView</Button>

        <Modal
          title="Basic Modal"
          visible={this.state.isShow}
          //  onOk={this.handleOk}
          onCancel={this.bbb}
        >
          <div style={{ overflow: 'scroll', height: '300px' }}>
            <TestView
              quickuuid="20220124"
              params={{ entityUuid: '1507171023747653633' }}
              pathname={this.props.pathname}
            />
          </div>
        </Modal>
      </span>
    );
  };

  /** 该方法会覆盖所有的中间功能按钮（就是高级查询那里） */
  drawToolbarPanel = () => {}

  /** 该方法用于写中间的功能按钮 多个按钮用<span>包裹 （就是在高级查询后面追加） */
  drawToolsButton = () =>
    (
      <span>
        <Button>审核</Button>
        <Button>驳回</Button>
      </span>
    )

  /** 该方法会覆盖所有的搜索查询 */
  drawSearchPanel = () => {}

  /**
   该方法用于修改table的render
   e的对象结构为{
   column       // 对应的column
   record,      // 对应的record
   component,   // render渲染的组件
   val          // val值
   }
   */
  drawcell = e => {
    //找到fieldName为CODE这一列 更改它的component
    if (e.column.fieldName === 'CODE') {
      // const component = <p3 style={{ color: 'red' }}>{e.val}</p3>;
      const component = <a onClick={this.onView.bind(this, e.record)} style={{ color: 'red' }}>{e.val}</a>
      e.component = component;
    }
  };

  /**
   * 该方法用于自定义扩展列
   * e={column:column}
   */
  drawExColumns = e => {
    if (e.column.fieldName === 'CODE') {
      return {
        title: 'CODE前扩展',
        dataIndex: 'name',
        key: 'name',
        sorter: true,
        width: colWidth.codeColWidth,
        render: (_val, record) => {
          return (
            <a onClick={this.onView.bind(this, record)} style={{ color: 'red' }}>
              {111}
            </a>
          );
        },
      };
    }
  };



  // ↓↓↓↓——————————————————🟢🟢🟢操作方法🟢🟢🟢————————————————————↓↓↓↓

  /** 删除后事件 */
  afterDelete = response => {
    console.log('response', response);
  };
  /** 删除前处理，返回false就不进行后面删除操作了 */
  beforeDelete = e => {
    console.log('e', e);
    message.error('不允许删除');
    return false;
  };

  /** 该方法用于扩展查询 */
  exSearchFilter = () => {
    let testS = [
      // {
      //   field: 'CODE',
      //   type: 'VarChar',
      //   rule: 'eq',
      //   val: '1037',
      // },
    ];
    return testS;
  };
  //该方法用于更改State
  changeState = () => {
    this.setState({ title: '' });
  };



  aaaa = () => {
    this.aa.show();
  };

  bbb = () => {
    this.setState({ isShow: !this.state.isShow });
  };




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
  test = (a, b) => {};

  //该方法用于拖拽后触发事件 拖拽需要在state中canDragTable: true
  drapTableChange = list => {
    console.log('list', list);
  };
}
