import React, { PureComponent, Component } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import NavigatorPanel from '@/pages/Component/Page/inner/NavigatorPanel';
import Page from '@/pages/Component/Page/inner/Page';
import { Layout } from 'antd';
import styles from './inner/SiderPage.less';

const { Content, Sider } = Layout;

/**
 * 左右布局基类，子类可同state.siderWidth设计左边宽度，不设置默认为240
 * 自定义左侧导航栏、 右侧内内容样式 在子类state 设置siderStyle, contentStyle, style
 */
export default class SiderPage extends Component {

  constructor(props) {
    super(props);

    this.state = {
      title: ''
    };
  }

  shouldComponentUpdate() {
    if (this.props.location && this.props.location.pathname && this.props.location.pathname !== window.location.pathname) {
      return false;
    } else {
      return true;
    }

  }

  leftSearchStyle = {width: '240px', 'marginTop': '10px'};

  leftMenuProps = {
    forceSubMenuRender: true,
    mode: 'inline',
    theme: 'light',
    style: { 'marginTop': '12px', 'marginLeft': '-24px','position':"relative" }
  };

  render() {
    const { title, siderTitle, siderWidth, noData, siderStyle, contentStyle, style } = this.state;
    const contentPanel = this.drawContent();
    return (
      <PageHeaderWrapper>
        <Page withCollect={true} pathname={this.props.location ? this.props.location.pathname : ''}>
          {this.drawOtherCom && this.drawOtherCom()}
          {noData && this.drawNoData()}
          {!noData && <div style={{height:'100%',overflow:'hidden'}}>
            {title && <NavigatorPanel title={title} action={this.drawActionButton ? this.drawActionButton() : ''} />}
            <Content className={styles.contentWrapper} style={this.state.contentStyle ? this.state.contentStyle : {}}>
              <Layout >
                <Sider style={siderStyle ?
                  {...siderStyle } : {}} width={siderWidth ? siderWidth : 280} className={styles.leftWrapper}>
                  {this.drawSider()}
                </Sider>
                <Content style={{ marginLeft: '8px',height:'100%',overflow:'hidden' }} className={styles.rightWrapper}>
                  {contentPanel}
                </Content>
              </Layout>
            </Content>
          </div>}
        </Page>
      </PageHeaderWrapper>
    );
  }
}
