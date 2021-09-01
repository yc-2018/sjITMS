import { PureComponent } from "react";
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import ViewPageDetail from '@/pages/Component/Page/inner/ViewPageDetail';
import { Tabs, Spin } from 'antd';
import { formatMessage } from 'umi/locale';
import EntityLogTab from '@/pages/Component/Page/inner/EntityLogTab';
import styles from '@/pages/Component/Page/inner/ViewPageDetail.less';
import LoadingIcon from '@/pages/Component/Loading/LoadingIcon';

const TabPane = Tabs.TabPane;

export default class VendorDispatchBasicViewPage extends PureComponent {

  componentWillUnmount(){
    if(this.props.pathname){
      let pathname = this.props.pathname;
      let namespace = pathname.substring(pathname.lastIndexOf('/') + 1, pathname.length);
      if(this.props[namespace]){
        this.props[namespace].showPage = 'query'
      }
    }
  }

  render() {
    const viewTitleProps = {
      title: this.state.title,
      action: this.drawActionButtion(),
      refresh: ()=>this.refresh(),
    };

    return (
      <PageHeaderWrapper>
        <Spin indicator={LoadingIcon('default')} tip="加载中..." spinning={this.props.loading} >
          <ViewPageDetail {...viewTitleProps}>
            <div className={styles.detailContent}>
              <Tabs className={styles.tabsWrapper} defaultActiveKey="1" onChange={this.tabsChangeCallback}>
                {this.drawTabPanes && this.drawTabPanes()}
              </Tabs>
            </div>
          </ViewPageDetail>
        </Spin>
      </PageHeaderWrapper>
    );
  }
}
