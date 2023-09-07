import React from 'react';
import { Layout, Tabs, Tooltip } from 'antd';
import { routerRedux } from 'dva/router';
import { stringify } from 'qs';
import DocumentTitle from 'react-document-title';
import isEqual from 'lodash/isEqual';
import memoizeOne from 'memoize-one';
import { connect } from 'dva';
import { ContainerQuery } from 'react-container-query';
import classNames from 'classnames';
import pathToRegexp from 'path-to-regexp';
import { enquireScreen, unenquireScreen } from 'enquire-js';
import { formatMessage } from 'umi/locale';
import SiderMenu from '@/components/SiderMenu';
import Authorized from '@/utils/Authorized';
import {
  loginOrg,
  loginUser,
  loginCompany,
  setActiveKey,
  getMenuLayout,
  isLogin,
  setUserBreadcrumb,
} from '@/utils/LoginContext';
import SettingDrawer from '@/components/SettingDrawer';
import logo from '../assets/logo.svg';
import Footer from './Footer';
import Header from './Header';
import Context from './MenuContext';
import Exception403 from '../pages/Exception/403';
import styles from './BasicLayout.less';
import ReportPage from '@/pages/Report/ReportPage';
import defaultSettings from '../defaultSettings';
import IToolTip from '@/pages/Component/IToolTip';
// import { listenerData } from '@/utils/serial/SerialPort';

const { Content } = Layout;
const { TabPane } = Tabs;

// Conversion router to menu.
const formatter = (data, parentAuthority, parentName) => {
  return data
    .map(item => {
      if (!item.name || !item.path) {
        return null;
      }

      if (loginOrg() && item.org) {
        if (item.org.indexOf(loginOrg().type) === -1) return null;
      }

      let locale = 'menu';
      if (parentName) {
        locale = `${parentName}.${item.name}`;
      } else {
        locale = `menu.${item.name}`;
      }

      const result = {
        ...item,
        name: formatMessage({ id: locale, defaultMessage: item.name }),
        locale,
        authority: item.authority || parentAuthority,
      };
      if (item.routes) {
        const children = formatter(item.routes, item.authority, locale);
        // Reduce memory usage
        result.children = children;
      }
      delete result.routes;
      return result;
    })
    .filter(item => item);
};

const query = {
  'screen-xs': {
    maxWidth: 575,
  },
  'screen-sm': {
    minWidth: 576,
    maxWidth: 767,
  },
  'screen-md': {
    minWidth: 768,
    maxWidth: 991,
  },
  'screen-lg': {
    minWidth: 992,
    maxWidth: 1199,
  },
  'screen-xl': {
    minWidth: 1200,
    maxWidth: 1599,
  },
  'screen-xxl': {
    minWidth: 1600,
  },
};

class BasicLayout extends React.Component {
  constructor(props) {
    super(props);
    this.getPageTitle = memoizeOne(this.getPageTitle);
    this.breadcrumbNameMap = this.getBreadcrumbNameMap();
    this.matchParamsPath = memoizeOne(this.matchParamsPath, isEqual);
  }

  state = {
    rendering: true,
    isMobile: false,
    isCollapsed: false,
    menuData: this.getMenuData(),
    tabPanes: [],
    locations: {},
    reportUrls: {},
    activeKey: '',
    tabsVisible: 'none',
  };

  componentDidMount() {
    // listenerData((result, err) => {
    //   console.log(err);
    // });
    // console.log('链接id：' + sessionStorage.getItem('serialConnectionId'));

    const { dispatch } = this.props;
    if (isLogin() == false) {
      dispatch(
        routerRedux.push({
          pathname: '/user/login',
          search: stringify({
            redirect: window.location.href,
          }),
        })
      );
      return;
    }
    dispatch({
      type: 'setting/getSetting',
    });
    this.renderRef = requestAnimationFrame(() => {
      this.setState({
        rendering: false,
      });
    });
    this.enquireHandler = () =>
      enquireScreen(mobile => {
        const { isMobile } = this.state;
        if (isMobile !== mobile) {
          this.setState({
            isMobile: mobile,
          });
        }
      });
    if (sessionStorage.currentLocation) {
      dispatch(routerRedux.push(sessionStorage.currentLocation));
    }

    if (loginOrg() && loginUser()) {
      this.fetchReportMenu();
      this.refreshNotice();
      this.fetchOwner();
      this.getUserConfig();
      // this.fetchQueryBillDays();
    }
    dispatch({
      type: 'setting/changeSetting',
      payload: {
        layout: getMenuLayout(),
      },
    });

    // 如果 最后一个界面是大数据，刷新后回到首页
    if (this.props.location.pathname.indexOf('bigdata') > -1) {
      dispatch(
        routerRedux.push({
          pathname: '/',
        })
      );
    }
  }

  fetchQueryBillDays = () => {
    this.props.dispatch({
      type: 'queryBillDateConfig/getByCompanyUuidAndDcUuid',
    });
  };

  getUserConfig = () => {
    this.props.dispatch({
      type: 'userConfig/getByUserUuid',
      payload: {
        userUuid: loginUser().uuid,
        companyUuid: loginCompany().uuid,
      },
      callback: res => {
        sessionStorage.setItem('searchPageLine', res.data.searchPageLine);
        sessionStorage.setItem('viewPageLine', res.data.viewPageLine);
      },
    });
  };

  fetchOwner = () => {
    this.props.dispatch({
      type: 'owner/getDefOwner',
      payload: loginCompany().uuid,
    });
  };

  fetchReportMenu = () => {
    const { menuData } = this.state;
    this.props.dispatch({
      type: 'report/getReportMenu',
    });
  };

  refreshNotice = () => {
    this.props.dispatch({
      type: 'unRead/getUnReadedNotice',
    });
    this.props.dispatch({
      type: 'unRead/getUnReadedReplition',
    });
  };

  clearTabPanes = () => {
    this.state.tabPanes.length = 0;
    this.setState({
      activeKey: '',
      tabPanes: this.state.tabPanes,
      tabsVisible: 'none',
    });
  };

  componentWillReceiveProps(nextProps) {
    let menuData = this.getMenuData();
    let { reportMenu } = nextProps;
    const reportUrls = {};
    if (Array.isArray(reportMenu) && reportMenu.length >= 1) {
      reportMenu.forEach(function(menu) {
        menu.path = '/bigdata/' + menu.uuid;
        menu.children &&
          menu.children.forEach(function(submenu) {
            submenu.path = '/bigdata/' + menu.uuid + '/' + submenu.uuid;
            reportUrls[submenu.path] = submenu.url;
          });
      });
      menuData.forEach(function(menu) {
        if (menu.path === '/bigdata') {
          menu.children = reportMenu;
        }
      });
    }
    this.setState({
      menuData: [...menuData],
      reportUrls: reportUrls,
    });
    this.breadcrumbNameMap = this.getBreadcrumbNameMap();

    if (this.props.location != nextProps.location) {
      this.setState({
        activeKey: nextProps.location.pathname,
      });
    }
  }

  componentDidUpdate(preProps) {
    const { isMobile } = this.state;
    const { collapsed } = this.props;
    if (isMobile && !preProps.isMobile && !collapsed) {
      this.handleMenuCollapse(false);
    }
  }
  componentWillUnmount() {
    cancelAnimationFrame(this.renderRef);
    unenquireScreen(this.enquireHandler);
  }

  getContext() {
    const { location } = this.props;
    const { activeKey, locations } = this.state;
    const loc = activeKey ? locations[activeKey] : location;
    return {
      location: loc,
      breadcrumbNameMap: this.breadcrumbNameMap,
    };
  }

  getMenuData() {
    const {
      route: { routes },
    } = this.props;
    return formatter(routes);
  }

  /**
   * 获取面包屑映射
   * @param {Object} menuData 菜单配置
   */
  getBreadcrumbNameMap() {
    const routerMap = {};
    const mergeMenuAndRouter = data => {
      data.forEach(menuItem => {
        if (menuItem.children) {
          mergeMenuAndRouter(menuItem.children);
        }
        routerMap[menuItem.path] = menuItem;
      });
    };
    const { menuData } = this.state;
    mergeMenuAndRouter(menuData);
    setUserBreadcrumb(routerMap);
    return routerMap;
  }

  matchParamsPath = pathname => {
    const pathKey = Object.keys(this.breadcrumbNameMap).find(key =>
      pathToRegexp(key).test(pathname)
    );
    return this.breadcrumbNameMap[pathKey];
  };

  getPageTitle = pathname => {
    const currRouterData = this.matchParamsPath(pathname);

    if (!currRouterData) {
      window.parent && window.parent.changeTitle && window.parent.changeTitle('TimeExpress TMS');
      return 'TimeExpress TMS';
    }
    const message = formatMessage({
      id: currRouterData.locale || currRouterData.name,
      defaultMessage: currRouterData.name,
    });
    window.parent &&
      window.parent.changeTitle &&
      window.parent.changeTitle(`${message} - TimeExpress TMS`);
    return `${message} - TimeExpress TMS`;
  };

  getLayoutStyle = () => {
    const { isMobile } = this.state;
    const { fixSiderbar, collapsed, layout } = this.props;
    if (fixSiderbar && layout !== 'topmenu' && !isMobile) {
      return {
        paddingLeft: collapsed
          ? defaultSettings.closeSiderNavigatorWidth
          : defaultSettings.openSiderNavigatorWidth,
      };
    }
    return null;
  };

  getContentStyle = () => {
    const { fixedHeader, layout } = this.props;
    const { isCollapsed, isMobile } = this.state;
    let marginStr = 0;
    if (this.state.tabPanes.length > 1) {
      if (layout == 'topmenu') {
        marginStr = 0;
      } else {
        if (isCollapsed) {
          marginStr = `0px 0px 0 ${defaultSettings.closeSiderNavigatorWidth}`;
        } else {
          marginStr = `0px 0px 0 ${defaultSettings.openSiderNavigatorWidth}`;
        }
      }
    } else {
      if (layout == 'topmenu') {
        // marginStr = '24px 24px 0';
      } else {
        if (isCollapsed) {
          marginStr = `0px 0px 0 ${defaultSettings.closeSiderNavigatorWidth}`;
        } else {
          marginStr = `0px 0px 0 ${defaultSettings.openSiderNavigatorWidth}`;
        }
      }
    }
    return {
      margin: marginStr,
      paddingTop: fixedHeader ? 78 : 0,
    };
  };
  getTabsStyle = () => {
    return {
      backgroundColor: 'white',
      height: '32px',
      position: 'fixed',
      top: '46px',
      right: 0,
      // width: '100%',
      zIndex: '10',
      transition: 'width 0.2s',
      left:
        getMenuLayout() === 'topmenu'
          ? '0px'
          : this.props.collapsed
            ? defaultSettings.closeSiderNavigatorWidth
            : defaultSettings.openSiderNavigatorWidth,
    };
  };

  handleMenuCollapse = collapsed => {
    const { dispatch } = this.props;
    this.setState({
      isCollapsed: collapsed,
    });

    dispatch({
      type: 'global/changeLayoutCollapsed',
      payload: collapsed,
    });
  };

  renderSettingDrawer() {
    // Do not render SettingDrawer in production
    // unless it is deployed in preview.pro.ant.design as demo
    const { rendering } = this.state;
    if ((rendering || process.env.NODE_ENV === 'production') && APP_TYPE !== 'site') {
      return null;
    }
    return <SettingDrawer />;
  }

  onEdit = (targetKey, action) => {
    this[action](targetKey);
  };
  remove = targetKey => {
    let { activeKey } = this.state;
    let lastIndex;

    this.state.tabPanes.forEach((pane, i) => {
      if (pane.key === targetKey) {
        lastIndex = i;
      }
    });

    let panes = this.state.tabPanes.filter(pane => pane.key !== targetKey);
    if (panes.length && activeKey === targetKey) {
      if (lastIndex > panes.length) {
        activeKey = panes[panes.length - 1].key;
      } else if (lastIndex == panes.length && panes.length == 1) {
        activeKey = panes[0].key;
      } else if (lastIndex == panes.length && panes.length != 1) {
        activeKey = panes[panes.length - 1].key;
      } else {
        activeKey = panes[lastIndex].key;
      }
    }

    this.setState({ tabPanes: [...panes], activeKey: panes.length == 0 ? '/' : activeKey });

    this.props.dispatch(
      routerRedux.push({
        pathname: panes.length == 0 ? '/' : activeKey,
      })
    );
  };

  tabsOnchange = activeKey => {
    this.setState({
      activeKey: activeKey,
    });
    setActiveKey(activeKey);
    this.props.dispatch(
      routerRedux.push({
        pathname: activeKey,
      })
    );
  };

  drawTabPaneTitle = title => {
    // let name = title;
    // if (title.length > 8) {
    //   name = title.substring(0, 8) + '...';
    // }
    return <IToolTip>{title}</IToolTip>;
  };

  render() {
    const {
      navTheme,
      layout: PropsLayout,
      children,
      location: { pathname },
    } = this.props;
    const { isMobile, menuData, reportUrls } = this.state;
    const { notices, replitions } = this.props;
    const isTop = getMenuLayout() === 'topmenu';

    const { tabPanes, activeKey, locations } = this.state;
    let routerConfig = this.matchParamsPath(activeKey ? activeKey : pathname);

    let currentActiceKey = activeKey;

    var currentPanes = tabPanes.filter(function(t) {
      return t.key === pathname;
    });
    if (currentPanes.length == 0 && routerConfig) {
      this.state.tabsVisible = 'block';
      this.state.tabPanes.push(
        <TabPane tab={this.drawTabPaneTitle(routerConfig.name)} key={currentActiceKey}>
          <div className={styles.content} id={currentActiceKey}>
            <Authorized
              authority={routerConfig && routerConfig.authority}
              noMatch={<Exception403 />}
            >
              {activeKey.indexOf('bigdata') > -1 ? (
                <ReportPage url={reportUrls[activeKey]} />
              ) : (
                children
              )}
            </Authorized>
            <Footer />
          </div>
        </TabPane>
      );

      currentActiceKey = pathname;
      locations[pathname] = { ...this.props.location };
      this.state.activeKey = pathname;
    } else {
      if (currentPanes.length > 0) {
        currentActiceKey = currentPanes[0].key;
      }
    }

    // 删除重复tabs页
    for (let i = this.state.tabPanes.length - 1; i >= 0; i--) {
      if (this.state.tabPanes[i].key == '') {
        this.state.tabPanes.splice(i, 1);
      }
    }
    setActiveKey(currentActiceKey);

    const layout = (
      <Layout>
        {isTop && !isMobile ? null : (
          <SiderMenu
            logo={logo}
            Authorized={Authorized}
            theme={navTheme}
            onCollapse={this.handleMenuCollapse}
            menuData={menuData}
            isMobile={isMobile}
            {...this.props}
          />
        )}
        <Layout
          style={{
            ...this.getLayoutStyle(),
            // height: '100vh',
          }}
        >
          <Header
            menuData={menuData}
            handleMenuCollapse={this.handleMenuCollapse}
            logo={logo}
            isMobile={isMobile}
            notices={notices}
            replitions={replitions}
            fetchReportMenu={this.fetchReportMenu}
            refreshNotice={this.refreshNotice}
            clearTabPanes={this.clearTabPanes}
            {...this.props}
          />
          <Content style={this.getContentStyle()}>
            <div className={styles.tabsBody} style={{ display: this.state.tabsVisible }}>
              <Tabs
                activeKey={currentActiceKey}
                tabBarStyle={this.getTabsStyle()}
                tabBarGutter={1}
                type="editable-card"
                hideAdd
                onChange={this.tabsOnchange}
                onEdit={this.onEdit}
              >
                {tabPanes}
              </Tabs>
            </div>
          </Content>
        </Layout>
      </Layout>
    );
    return (
      <React.Fragment>
        <DocumentTitle title={this.getPageTitle(currentActiceKey)}>
          <ContainerQuery query={query}>
            {params => (
              <Context.Provider value={this.getContext()}>
                <div className={classNames(params)}>{layout}</div>
              </Context.Provider>
            )}
          </ContainerQuery>
        </DocumentTitle>
      </React.Fragment>
    );
  }
}

export default connect(({ global, setting, report, unRead }) => ({
  collapsed: global.collapsed,
  reportMenu: report.data,
  replitions: unRead?.replitions,
  notices: unRead?.notices,
  layout: setting.layout,
  ...setting,
}))(BasicLayout);
