import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Table } from 'antd';
import { Route, Switch } from 'react-router-dom';
import QuickViewPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickViewPage';
import RyzeSettingDrowDown from '../Component/RapidDevelopment/CommonLayout/RyzeSettingDrowDown/RyzeSettingDrowDown';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
//View界面扩展
export default class TestView extends PureComponent {
  /**
   * state中增加viewStyle会去掉hd默认样式
   * noTitle：去除TabPane的Title
   * card:Pane使用card样式
   * hasOpt：是否显示操作日志
   */
  state = {
    ...this.state,
    viewStyle: { noTitle: false, card: false, hasOpt: true },
    columns: [
      {
        title: '查询异常',
        dataIndex: 'name',
        key: 'name',
        sorter: true,
        width: 100,
      },
      {
        title: '222',
        dataIndex: '222',
        key: '222',
        sorter: true,
        width: 100,
      },
      {
        title: '333',
        dataIndex: '333',
        key: '333',
        sorter: true,
        width: 100,
      },
      {
        title: '444',
        dataIndex: '444',
        key: '444',
        sorter: true,
        width: 100,
      },
      {
        title: '555',
        dataIndex: '555',
        key: '555',
        sorter: true,
        width: 50,
      },
    ],
  };

  componentDidMount() {
    this.setting.handleOK();
  }

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

  columns = [
    {
      title: '查询异常',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      width: 100,
    },
    {
      title: '222',
      dataIndex: '222',
      key: '222',
      sorter: true,
      width: 100,
    },
    {
      title: '333',
      dataIndex: '333',
      key: '333',
      sorter: true,
      width: 100,
    },
    {
      title: '444',
      dataIndex: '444',
      key: '444',
      sorter: true,
      width: 100,
    },
    {
      title: '555',
      dataIndex: '555',
      key: '555',
      sorter: true,
      width: 50,
    },
  ];

  getNewColumns = e => {
    // console.log('e', e);
    // console.log('this.columns', this.columns);
    // this.columns = e;
    this.setState({ columns: e });
  };

  /**
   * 组件RyzeSettingDrowDown
   * 传入columns(确保不可变)
   * 传入唯一comId用于缓存
   * 传入getNewColumns获取修改后的columns
   * ref用于调用this.setting.handleOK()做第一次缓存加载;
   * @returns
   */

  render() {
    return (
      <div style={{ height: '300px' }}>
        <RyzeSettingDrowDown
          columns={this.columns}
          comId={'woxiangyaokuaile'}
          getNewColumns={this.getNewColumns}
          onRef={c => (this.setting = c)}
        />
        <Table dataSource="" columns={this.state.columns} />;
      </div>
    );
  }
}
