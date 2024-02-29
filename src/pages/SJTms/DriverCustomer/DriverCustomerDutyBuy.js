/*
* 责任买单组件
*/
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { connect } from 'dva';
import { Button, message } from 'antd';
import React from 'react';


@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class DriverCustomerDutyBuy extends QuickFormSearchPage {
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


  //货品回填确认
  backfillGoods = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length === 0) {
      message.error('请至少选中一条货品数据!');
    }
    for (let i = 0; i < selectedRows.length; i++) {
      if(selectedRows[0].STORENAME!==selectedRows[i].STORENAME){
        message.error('只能选择同一家门店的货品数据!');
        return;
      }
    }
    //关闭遮罩层并回传数据
    this.props.getGoodsDetailDatas(false,selectedRows);
    this.setState({selectedRows:[]})
  };

  //该方法会覆盖所有的上层按钮
  drawActionButton = () => {
    return (
      <></>
    );
  };

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
