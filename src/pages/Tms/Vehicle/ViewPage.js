import { PureComponent } from "react";
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import ViewPageDetail from '@/pages/Component/Page/inner/ViewPageDetail';
import { Tabs, Spin } from 'antd';
import { formatMessage } from 'umi/locale';
import EntityLogTab from '@/pages/Component/Page/inner/EntityLogTab';
import styles from '@/pages/Component/Page/inner/ViewPageDetail.less';
import LoadingIcon from '@/pages/Component/Loading/LoadingIcon';
import { routerRedux } from 'dva/router';

const TabPane = Tabs.TabPane;


/**
 * 车辆查看界面中状态不是启用与禁用，而是禁用与空闲，所以不能继承通用的ViewPage组件
 */
export default class ViewPage extends PureComponent {

  componentWillUnmount(){
    if(this.props.pathname){
      let pathname = this.props.pathname;
      let namespace = pathname.substring(pathname.lastIndexOf('/') + 1, pathname.length);
      if(this.props[namespace]){
        this.props[namespace].showPage = 'query'
      }
    }
  }

  onViewArticle = (toViewArticleUuid) => {
    this.props.dispatch(routerRedux.push({
      pathname: '/basic/article',
      toViewArticleUuid: toViewArticleUuid
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
      refresh: this.refresh ? (number,uuid) => this.refresh(number,uuid) : undefined,
      onNew: this.onCreate ? () => this.onCreate() : undefined,
      billState: this.drawStateTag ? this.drawStateTag() : null,
      createPermission: this.state.createPermission,
      noUpDown: this.state.noUpDown,
      noShowInput: this.state.noShowInput,
      noShowBeforeNext: this.state.noShowBeforeNext
    };

    return (
      <PageHeaderWrapper>
        <Spin indicator={LoadingIcon('default')} tip="加载中..." spinning={this.props.loading} >
          <ViewPageDetail {...viewTitleProps}>
            <div className={styles.detailContent}>
              <Tabs className={styles.tabsWrapper} defaultActiveKey="1" onChange={this.tabsChangeCallback}>
                {this.drawTabPanes && this.drawTabPanes()}
                <TabPane tab={formatMessage({ id: 'company.detail.tab.operateInfo' })} key="3">
                  <EntityLogTab entityUuid={this.state.entityUuid} />
                </TabPane>
              </Tabs>
            </div>
          </ViewPageDetail>
        </Spin>
      </PageHeaderWrapper>
    );
  }
}
