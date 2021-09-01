import React, { Component } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import ViewPageDetail from '@/pages/Component/Page/inner/ViewPageDetail';
import { Spin, Tabs } from 'antd';
import { formatMessage } from 'umi/locale';
import EntityLogTab from '@/pages/Component/Page/inner/EntityLogTab';
import styles from './inner/ViewPageDetail.less';
import LoadingIcon from '@/pages/Component/Loading/LoadingIcon';
import { routerRedux } from 'dva/router';
import ViewTabPanel from '@/pages/Component/Page/inner/ViewTabPanel';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const TabPane = Tabs.TabPane;
let i = 0;
let key = '';

/**
 * 详情界面基类<br>
 * 界面loading ：当不想让界面进行loaing时 在子类状态中设置suspendLoading属性（是否暂停界面loading）
 * @param {string} pathname:
 * @param  loading:
 */
export default class ViewPage extends Component {

  shouldComponentUpdate() {
    if (this.props.pathname && this.props.pathname !== window.location.pathname) {
      return false;
    } else {
      return true;
    }
  }

  componentWillUnmount() {
    if (this.props.pathname) {
      let pathname = this.props.pathname;
      let namespace = pathname.substring(pathname.lastIndexOf('/') + 1, pathname.length);
      if (this.props[namespace]) {
        this.props[namespace].showPage = 'query';
      }
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
        entityUuid: dcUuid,
      },
    }));
  };

  onViewArticle = (articleUuid) => {
    this.props.dispatch(routerRedux.push({
      pathname: '/basic/article',
      payload: {
        showPage: 'view',
        entityUuid: articleUuid,
      },
    }));
  };

  onViewVendor = (vendorUuid) => {
    this.props.dispatch(routerRedux.push({
      pathname: '/basic/vendor',
      payload: {
        showPage: 'view',
        entityUuid: vendorUuid,
      },
    }));
  };

  onViewStore = (storeUuid) => {
    this.props.dispatch(routerRedux.push({
      pathname: '/basic/store',
      payload: {
        showPage: 'view',
        entityUuid: storeUuid,
      },
    }));
  };

  onViewOwner = (ownerUuid) => {
    this.props.dispatch(routerRedux.push({
      pathname: '/basic/owner',
      payload: {
        showPage: 'view',
        entityUuid: ownerUuid,
      },
    }));
  };

  onViewContainer = (barcode) => {
    if (!barcode || '-' === barcode)
      return;
    this.props.dispatch(routerRedux.push({
      pathname: '/facility/container',
      payload: {
        showPage: 'view',
        entityUuid: barcode,
      },
    }));
  };

  onViewWrh = (wrhUuid) => {
    this.props.dispatch(routerRedux.push({
      pathname: '/facility/wrh',
      payload: {
        showPage: 'view',
        entityUuid: wrhUuid,
      },
    }));
  };

  onViewCarrier = (carrierUuid) => {
    this.props.dispatch(routerRedux.push({
      pathname: '/tms/carrier',
      payload: {
        showPage: 'view',
        entityUuid: carrierUuid,
      },
    }));
  };

  onViewVehicle = (vehicleUuid) => {
    this.props.dispatch(routerRedux.push({
      pathname: '/tms/vehicle',
      payload: {
        showPage: 'view',
        uuid: vehicleUuid,
      },
    }));
  };

  render() {
    const pathname = this.props.pathname;
    const viewTitleProps = {
      title: this.state.title,
      action: this.drawActionButtion(),
      state: this.state.entityState,
      stateCaption: this.state.stateCaption,
      onChangeState: this.onChangeState,
      stateDisabled: this.state.disabledChangeState,
      realStateCaption: this.state.realStateCaption,
      realChecked: this.state.realChecked,
      refresh: this.refresh ? (number,uuid) => this.refresh(number,uuid) : undefined,
      onNew: this.onCreate ? () => this.onCreate() : undefined,
      billState: this.drawStateTag ? this.drawStateTag() : null,
      namespace: pathname.substring(pathname.lastIndexOf('/') + 1, pathname.length),
      createPermission: this.state.createPermission,
      noUpDown: this.state.noUpDown,
      noShowInput: this.state.noShowInput,
      noShowBeforeNext: this.state.noShowBeforeNext
    };

    let ret = (
      <PageHeaderWrapper>
        <Spin indicator={LoadingIcon('default')} tip="加载中..."
              spinning={this.state.suspendLoading ? false : this.props.loading}>
          {this.drawOthers && this.drawOthers()}
          <ViewPageDetail {...viewTitleProps}>
            <div className={styles.detailContent}>
              <Tabs className={styles.tabsWrapper} defaultActiveKey="1" onChange={this.tabsChangeCallback}>
                {this.drawTabPanes && this.drawTabPanes()}
                <TabPane tab={formatMessage({ id: 'company.detail.tab.operateInfo' })} key="3">
                  {/* <ViewTabPanel> */}
                  <EntityLogTab entityUuid={this.state.entityUuid} key={key}/>
                  {/* </ViewTabPanel> */}
                </TabPane>
              </Tabs>
            </div>
          </ViewPageDetail>
        </Spin>
      </PageHeaderWrapper>
    );
    if (this.state.isDrag) {
      return (
        <DndProvider backend={HTML5Backend}>
          {ret}
        </DndProvider>
      );
    } else {
      return ret;
    }
  }

  onCollapse = () => {
    this.setState({
      viewPanelCollapse: !this.state.viewPanelCollapse
    });
  }
}
