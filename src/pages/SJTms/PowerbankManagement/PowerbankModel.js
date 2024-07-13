/*
 * 弹窗搜索页面
 */

import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { connect } from 'dva';
import { Button } from 'antd';
import React from 'react';

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

  /**
   * 电宝数据回填确认
   * @author ChenGuangLong
   * @since 2024/7/13 17:53
  */
  confirmSubmission = () => {
    let { selectedRows } = this.state;

    console.log("███████>>>>🔴", '这里先查询有没有重复的,再请求添加',"🔴<<<<██████")

    //关闭遮罩层并刷新
    this.props.modelClose(true);
    this.setState({ selectedRows: [] });
  };

  //该方法会覆盖所有的上层按钮
  drawActionButton = () => {  };

  //该方法会覆盖所有的中间功能按钮
  drawToolbarPanel = () => {
    return (
      <div style={{ marginBottom: 10 }}>
        <Button type={'primary'}  style={{ marginLeft: 10 }} onClick={this.confirmSubmission}>
          货品回填
        </Button>
      </div>
    );
  };


}
