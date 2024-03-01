/*
 * 少货买单组件
 */

import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { connect } from 'dva';
import { Button, message } from 'antd';
import React from 'react';
import { loginUser } from '@/utils/LoginContext'

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class DriverCustomerLessBuy extends QuickFormSearchPage {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      //设置弹出框的样式
      tableHeight: 388.1,
      isNotHd: true,
      noToolbar:false
    };
  }

  /** 监控storeCode变化 去改变搜索 */
  componentWillReceiveProps(nextProps) {
    // 检查 storeCode 是否发生变化
    if (this.props.storeCode !== nextProps.storeCode) {
      let {queryConfig}=this.state;
      let creatorCol = queryConfig.columns.find(x => x.fieldName === 'STORE');
      creatorCol.searchDefVal = nextProps.storeCode;
      this.setState({queryConfigColumns:queryConfig.columns,queryConfig,pageFilters:{}});
      this.onSearch('reset', false);  // 重置查询条件
      this.onSearch('first', false);  // 查询数据
    }
  }


  /* 设置默认查询条件 */
  editColumns = queryConfig => {
    let creatorCol = queryConfig.columns.find(x => x.fieldName === 'STORE');
    creatorCol.searchDefVal = this.props.storeCode;
    return queryConfig;
  };

  //货品回填确认
  backfillGoods = () => {
    let { selectedRows } = this.state;
    if (selectedRows.length === 0) return message.error('请至少选中一条货品数据!')
    for (let i = 0; i < selectedRows.length; i++) {
      if (selectedRows[0].STORENAME !== selectedRows[i].STORENAME) return message.error('只能选择同一家门店的货品数据!');
    }
    selectedRows = selectedRows?.map(row => {
      return {
        ...row,
        SKU: `[${row.ARTICLECODE}]${row.ARTICLENAME}`,
        SKUCODE: row.ARTICLECODE,
        SKUNAME: row.ARTICLENAME
      }
    });
    //关闭遮罩层并回传数据
    this.props.getGoodsDetail(false, selectedRows);
    this.setState({ selectedRows: [] });
  };

  //该方法会覆盖所有的上层按钮
  drawActionButton = () => {  };

  //该方法会覆盖所有的中间功能按钮
  drawToolbarPanel = () => {
    return (
      <div style={{ marginBottom: 10 }}>
        <Button type={'primary'}  style={{ marginLeft: 10 }} onClick={this.backfillGoods}>
          货品回填
        </Button>
      </div>
    );
  };


}
