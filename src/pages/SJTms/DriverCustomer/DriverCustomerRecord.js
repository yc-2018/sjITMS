import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { Button } from 'antd';
import React from 'react';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class DriverCustomerRecord extends QuickFormSearchPage {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      // //设置弹出框的样式
      canDragTable: true,
      isNotHd: true,
      scrollValue: {
        y: 'calc(400vh)',
      },
      tableHeight: '80%',
      // tableHeight: 388.1,
      // isNotHd: true,
      // noToolbar:false
    };
  }

  //该方法会覆盖所有的中间功能按钮
  drawToolbarPanel = () => {
    return (
      <div style={{ margin: '10px 0 10px 0' }}>
        <Button type="primary" onClick={()=>{}}>
          添加货品
        </Button>
        <Button type="danger" onClick={()=>{}} style={{ marginLeft: 10 }}>
          清空货品
        </Button>
      </div>
    );
  };

  // //该方法会覆盖所有的上层按钮
  // drawActionButton = () => {
  //   const { getFieldDecorator } = this.props.form;
  //   return ();
  // };
}
