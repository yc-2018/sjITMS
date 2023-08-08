/*
 * @Author: Liaorongchang
 * @Date: 2023-08-08 17:06:51
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-08-08 17:28:45
 * @version: 1.0
 */
import React from 'react';
import { Form } from 'antd';
import { connect } from 'dva';
import Page from '@/pages/Component/Page/inner/Page';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import FreshPageHeaderWrapper from '@/components/PageHeaderWrapper/FullScreenPageWrapper';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { DndProvider } from 'react-dnd';

@connect(({ quick, deliveredConfirm, loading }) => ({
  quick,
  deliveredConfirm,
  loading: loading.models.quick,
}))
//继承QuickFormSearchPage Search页面扩展
@Form.create()
export default class CostBillSearchPage extends QuickFormSearchPage {
  render() {
    // let ret = this.state.canFullScreen ? (
    //   <FreshPageHeaderWrapper>{this.drawPage()}</FreshPageHeaderWrapper>
    // ) : this.state.isNotHd ? (
    //   <div>{this.drawPage()}</div>
    // ) : (
    //   <PageHeaderWrapper>
    //     <Page withCollect={true} pathname={this.props.pathname}>
    //       {this.drawPage()}
    //     </Page>
    //   </PageHeaderWrapper>
    // );
    let ret = (
      <PageHeaderWrapper>
        <Page withCollect={true} pathname={this.props.pathname}>
          {this.drawPage()}
        </Page>
      </PageHeaderWrapper>
    );
    if (this.state.isDrag) {
      return <DndProvider backend={HTML5Backend}>{ret}</DndProvider>;
    } else {
      return ret;
    }
  }
}
