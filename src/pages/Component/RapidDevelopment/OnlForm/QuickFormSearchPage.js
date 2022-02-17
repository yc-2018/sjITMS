import React, { PureComponent } from 'react';
import { Table, Button, Input, Col, Row, Popconfirm, message } from 'antd';
import { connect } from 'dva';
import { Route, Switch } from 'react-router-dom';
import QuickSearchExpand from './QuickSearchExpand';
import SearchPage from '@/pages/Component/Page/SearchPage';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class QuickFormSearchPage extends QuickSearchExpand {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      title: 'test',
      data: [],
      suspendLoading: false,
      columns: [],
      key: this.props.quickuuid + 'quick.search.table', //用于缓存用户配置数据
    };
  }

  /**
   * 绘制右上角按钮
   */
  drawActionButton = () => {
    //额外的菜单选项
    const menus = [];
    menus.push({
      // disabled: !havePermission(STORE_RES.CREATE), //权限认证
      name: '测试', //功能名称
      onClick: this.test, //功能实现
    });
    return (
      <div>
        <Button onClick={this.onCreate} type="primary" icon="plus">
          新建
        </Button>
        <Button onClick={this.onUpdate} type="primary">
          编辑
        </Button>
        <Button onClick={this.onView} type="primary">
          查看
        </Button>
        <Button onClick={this.port} type="primary">
          导出
        </Button>
      </div>
    );
  };

  /**
   * 绘制批量工具栏
   */
  drawToolbarPanel = () => {
    return (
      <Popconfirm
        title="你确定要删除所选中的内容吗?"
        onConfirm={() => this.onBatchDelete()}
        okText="确定"
        cancelText="取消"
      >
        <Button>删除</Button>
      </Popconfirm>
    );
  };
}
