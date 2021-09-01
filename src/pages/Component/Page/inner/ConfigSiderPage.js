import React, { PureComponent } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import NavigatorPanel from '@/pages/Component/Page/inner/NavigatorPanel';
import Page from '@/pages/Component/Page/inner/Page';
import { Layout } from 'antd';
import styles from './SiderPage.less';
import { Tabs } from 'antd';
import { formatMessage } from 'umi/locale';
import { loginOrg } from '@/utils/LoginContext';
import EntityLogTab from '@/pages/Component/Page/inner/EntityLogTab';
import { commonLocale } from '@/utils/CommonLocale';
import ResourceDescHeader from '@/pages/Component/Page/inner/ResourceDescHeader';
const { TabPane } = Tabs;
const { Content, Sider } = Layout;

/**
 * 左右布局基类，子类可同state.siderWidth设计左边宽度，不设置默认为240
 */
export default class ConfigSiderPage extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      keyLog: 0
    };

  }
  /**
   * 切换tab页
   */
  handleChangeTab = (key) => {
    if (key == "2") {
      this.setState({
        keyLog: this.state.keyLog + 1
      })
    }
  }
  render() {
    const { title, siderTitle, siderWidth, noData } = this.state;
    // console.log(title,this.drawActionButton)
    return (
      <div style={{height:'100%',overflow:'hidden',width:'100%',}}>
        {this.drawOtherCom && this.drawOtherCom()}
        {noData && this.drawNoData()}
        {!noData &&
        <div style={{height:'100%',overflow:'hidden',display:'flex',flexDirection:'column'}}>
          {/* <div className={styles.topWrapper} style={{marginTop:'0px',zoom:'1',display:'inline-block'}}>
              <span className={styles.title}>{this.state.title}</span>
            </div> */}
          {(title || this.drawActionButton) &&
          <div className={styles.topWrapper}>
            {title && <ResourceDescHeader title={this.state.title} />}
            <div className={styles.action}>
              {this.drawActionButton && this.drawActionButton()}
            </div>
          </div>
          }
          <div  className={styles.contentBox} style={{display:'inline-block'}}>
            <Tabs defaultActiveKey="1" onChange={this.handleChangeTab} >
              <TabPane tab={commonLocale.congfigLocale} key="1">
                <Content className={styles.innerContent}>
                  <Layout>
                    <Sider width={siderWidth ? siderWidth : 240} className={styles.leftWrapper}>
                      {this.drawSider()}
                    </Sider>
                    <Content className={styles.rightWrapper}>
                      {this.drawContent()}
                    </Content>
                  </Layout>
                </Content>
              </TabPane>
              <TabPane tab={formatMessage({ id: 'company.detail.tab.operateInfo' })} key="2">
                <EntityLogTab entityUuid={loginOrg().uuid + this.state.logCaption} key={this.state.keyLog} />
              </TabPane>
            </Tabs>
          </div>
        </div>}
      </div>
    );
  }
}



