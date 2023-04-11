/*
 * @Author: Liaorongchang
 * @Date: 2022-06-30 09:27:20
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-04-11 09:23:59
 * @version: 1.0
 */
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { Button, Icon, Upload, message, Modal, Spin } from 'antd';
import configs from '@/utils/config';
import { loginKey, loginCompany, loginOrg } from '@/utils/LoginContext';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import FreshPageHeaderWrapper from '@/components/PageHeaderWrapper/FullScreenPageWrapper';
import Page from '@/pages/Component/Page/inner/Page';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
//继承QuickFormSearchPage Search页面扩展
export default class DifAmountSearch extends QuickFormSearchPage {
  //需要操作列的显示 将noActionCol设置为false
  state = { ...this.state, noActionCol: false, isShow: false, isLoading: false };

  upLoading = () => {
    this.props.switchTab('import');
  };

  //该方法用于写最上层的按钮 多个按钮用<span>包裹
  drawToolsButton = () => {
    const { isLoading } = this.state;
    return (
      <span>
        <Button
          onClick={this.upLoading.bind()}
          hidden={!havePermission(this.state.authority + '.import')}
        >
          <Icon type="upload" loading={isLoading} />
          导入
        </Button>
      </span>
    );
  };

  render() {
    let ret = this.state.canFullScreen ? (
      <FreshPageHeaderWrapper>{this.drawPage()}</FreshPageHeaderWrapper>
    ) : this.state.isNotHd ? (
      <div>{this.drawPage()}</div>
    ) : (
      <PageHeaderWrapper>
        <Spin spinning={this.state.isLoading}>
          <Page withCollect={true} pathname={this.props.pathname}>
            {this.drawPage()}
          </Page>
        </Spin>
      </PageHeaderWrapper>
    );
    if (this.state.isDrag) {
      return <DndProvider backend={HTML5Backend}>{ret}</DndProvider>;
    } else {
      return ret;
    }
  }
}
