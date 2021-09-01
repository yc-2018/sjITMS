import { PureComponent, Component } from "react";
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import ViewPageDetail from '@/pages/Component/Page/inner/ViewPageDetail';
import { Tabs, Spin } from 'antd';
import { formatMessage } from 'umi/locale';
import EntityLogTab from '@/pages/Component/Page/inner/EntityLogTab';
import styles from './inner/ViewPageDetail.less';
import LoadingIcon from '@/pages/Component/Loading/LoadingIcon';
import { routerRedux } from 'dva/router';

const TabPane = Tabs.TabPane;
let i = 0;
let key = '';
/**
 * 按时捷需求修改后的浏览界面基类
 * 界面loading ：当不想让界面进行loaing时 在子类状态中设置suspendLoading属性（是否暂停界面loading）
 */
export default class ViewPage extends Component {

  shouldComponentUpdate() {
    if (this.props.pathname && this.props.pathname !== window.location.pathname) {
      return false;
    } else {
      return true;
    }
  }

  componentWillUpdate(nextprops, nextState) {
    key = nextState.entityUuid + key;
    i++;
  }

  onViewDC = (dcUuid) => {
    this.props.dispatch(routerRedux.push({
      pathname: '/basic/dc',
      payload: {
        showPage: 'view',
        entityUuid: dcUuid
      }
    }));
  }

  onViewArticle = (articleUuid) => {
    this.props.dispatch(routerRedux.push({
      pathname: '/basic/article',
      payload: {
        showPage: 'view',
        entityUuid: articleUuid
      }
    }));
  }

  onViewVendor = (vendorUuid) => {
    this.props.dispatch(routerRedux.push({
      pathname: '/basic/vendor',
      payload: {
        showPage: 'view',
        entityUuid: vendorUuid
      }
    }));
  }

  onViewStore = (storeUuid) => {
    this.props.dispatch(routerRedux.push({
      pathname: '/basic/store',
      payload: {
        showPage: 'view',
        entityUuid: storeUuid
      }
    }));
  }

  onViewOwner = (ownerUuid) => {
    this.props.dispatch(routerRedux.push({
      pathname: '/basic/owner',
      payload: {
        showPage: 'view',
        entityUuid: ownerUuid
      }
    }));
  }

  onViewContainer = (barcode) => {
    this.props.dispatch(routerRedux.push({
      pathname: '/facility/container',
      payload: {
        showPage: 'view',
        entityUuid: barcode
      }
    }));
  }

  onViewWrh = (wrhUuid) => {
    this.props.dispatch(routerRedux.push({
      pathname: '/facility/wrh',
      payload: {
        showPage: 'view',
        entityUuid: wrhUuid
      }
    }));
  }

  onViewCarrier = (carrierUuid) => {
    this.props.dispatch(routerRedux.push({
      pathname: '/tms/carrier',
      payload: {
        showPage: 'view',
        entityUuid: carrierUuid
      }
    }));
  }

  onViewVehicle = (vehicleUuid) => {
    this.props.dispatch(routerRedux.push({
      pathname: '/tms/vehicle',
      payload: {
        showPage: 'view',
        uuid: vehicleUuid
      }
    }));
  }

  render() {
    const viewTitleProps = {
      title: this.state.title,
      action: this.drawActionButtion(),
      state: this.state.entityState,
      stateCaption: this.state.stateCaption,
      onChangeState: this.onChangeState,
      stateDisabled: this.state.disabledChangeState,
      realStateCaption: this.state.realStateCaption,
      realChecked: this.state.realChecked,
      billState: this.drawStateTag ? this.drawStateTag() : null
    };

    return (
      <PageHeaderWrapper>
        <Spin indicator={LoadingIcon('default')} tip="加载中..." spinning={this.state.suspendLoading ? false : this.props.loading} >
          {this.drawOthers && this.drawOthers()}
          <ViewPageDetail {...viewTitleProps}>
            <div className={styles.detailContent}>
              <Tabs className={styles.tabsWrapper} defaultActiveKey="1" onChange={this.tabsChangeCallback}>
                {this.drawTabPanes && this.drawTabPanes()}
                <TabPane tab={formatMessage({ id: 'company.detail.tab.operateInfo' })} key="3">
                  <EntityLogTab entityUuid={this.state.entityUuid} key={key} />
                </TabPane>
              </Tabs>
            </div>
          </ViewPageDetail>
        </Spin>
      </PageHeaderWrapper>
    );
  }
}