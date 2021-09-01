import React, { PureComponent, createElement } from 'react';
import { connect } from 'dva';
import ReactDOM from 'react-dom';
import { Popover, Icon, Tabs, Badge, Spin, List, Breadcrumb } from 'antd';
import styles from './HistoryDrawer.less';
import pathToRegexp from 'path-to-regexp';
import { routerRedux, Link } from 'dva/router';
import IconFont from '@/components/IconFont';
import { urlToList } from '@/components/_utils/pathTools';
import BreadcrumbView from '@/components/PageHeader/breadcrumb';
import { loginOrg, loginCompany, loginUser, getMenuLayout, getUserBreadcrumb } from '@/utils/LoginContext';
import LoadingIcon from '@/components/MyComponent/LoadingIcon';
import classNames from 'classnames';

export const getBreadcrumb = (breadcrumbNameMap, url) => {
  let breadcrumb = breadcrumbNameMap[url];
  if (!breadcrumb) {
    Object.keys(breadcrumbNameMap).forEach(item => {
      if (pathToRegexp(item).test(url)) {
        breadcrumb = breadcrumbNameMap[item];
      }
    });
  }
  return breadcrumb || {};
};

const { TabPane } = Tabs;

@connect(({ collect, loading }) => ({
  collect,
  loading: loading.models.collect,
}))
export default class HistoryDrawer extends PureComponent {
  static Tab = TabPane;

  static defaultProps = {
    onItemClick: () => { },
    onPopupVisibleChange: () => { },
    onTabChange: () => { },
    onClear: () => { },
    loading: false,
  };

  state = {
    drawerVisible: false,
    radioGroupValue: 'history',
    history: [],
    collectionList: [],
  }

  onItemClick = (item, tabProps) => {
    const { onItemClick, clearClose } = this.props;
    if (clearClose) {
      this.popover.click();
    }
    onItemClick(item, tabProps);
  };

  onTabChange = tabType => {
    const { onTabChange } = this.props;
    onTabChange(tabType);
  };

  componentWillMount() {
    this.queryHistory();
    if (loginOrg() && loginUser()) {
      this.queryCollection();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.collect.data && nextProps.collect.data != this.props.collect.data) {
      this.state.collectionList.length = 0;

      const breadcrumb = getUserBreadcrumb();
      nextProps.collect.data.forEach(item => {
        if (breadcrumb && breadcrumb[item]) {
          this.state.collectionList.push(breadcrumb[item])
          this.setState({
            collectionList: this.state.collectionList
          })
        }
      })
    }
  }

  /**
   * 查询当前用户
   */
  queryHistory() {
    let history = sessionStorage.getItem('history') != null ? JSON.parse(sessionStorage.getItem('history')) : [];

    let toShowHistory = [];
    //校验数据是否有重复
    const newHistory = this.groupBy(history, function (item) {
      return [item.time, item.route, item.name];
    });
    newHistory.forEach(i => {
      if (i.length > 1) {
        toShowHistory.push(i[0]);
      } else {
        toShowHistory.push(i);
      }
    })

    this.setState({
      history: toShowHistory.slice(0, 12)
    });
  }

  /**
   * 查询当前用户的收藏
   */
  queryCollection() {
    this.props.dispatch({
      type: 'collect/queryCollection',
      payload: {
        orgId: loginOrg().uuid,
        userId: loginUser().uuid,
      }
    });
  }

  groupBy(array, f) {
    const groups = {};
    array.forEach(function (i) {
      const group = JSON.stringify(f(i));
      groups[group] = groups[group] || [];
      groups[group].push(i);
    });

    return Object.keys(groups).map(function (group) {
      return groups[group];
    });
  }

  /**
   * 选择 历史/收藏
   */
  changeRadio = (e) => {
    this.setState({
      radioGroupValue: e.target.value
    })
  }

  /**
   * 绘制 历史面包屑
   */
  renderHistoryBreadcrumb = (item) => {
    const pathSnippets = item ? urlToList(item.route) : [];
    const extraBreadcrumbItems = pathSnippets.map((url, index) => {
      const currentBreadcrumb = getBreadcrumb(JSON.parse(sessionStorage.getItem('userBreadcrumb')).breadcrumbNameMap, url);
      if (currentBreadcrumb.inherited) {
        return null;
      }
      const isLinkable = index !== pathSnippets.length - 1 && currentBreadcrumb.component;
      const name = currentBreadcrumb.name;

      return currentBreadcrumb.name && !currentBreadcrumb.hideInBreadcrumb ? (
        <Breadcrumb.Item key={url}>
          {
            currentBreadcrumb.children
              ? <span className={styles.name}>{name}</span>
              : <Link  style={{ color: '#3B77E3' }} to={url}>{name}</Link>
          }
        </Breadcrumb.Item>
      ) : null;
    });
    return (

      <div>
        <span className={styles.time}>{item ? item.time : null}</span>
        <Breadcrumb className={styles.breadcrumb} separator='>'>
          {extraBreadcrumbItems}
        </Breadcrumb>
      </div>

    );
  }

  /**
   * 绘制 收藏面包屑
   */
  renderColletionBreadcrumb = (item) => {
    const pathSnippets = urlToList(item.path);
    const extraBreadcrumbItems = pathSnippets.map((url, index) => {
      const currentBreadcrumb = sessionStorage.getItem('userBreadcrumb') !=null && getBreadcrumb(JSON.parse(sessionStorage.getItem('userBreadcrumb')).breadcrumbNameMap, url);
      if (currentBreadcrumb.inherited) {
        return null;
      }
      const isLinkable = index !== pathSnippets.length - 1 && currentBreadcrumb.component;
      const name = currentBreadcrumb.name;
      return currentBreadcrumb.name && !currentBreadcrumb.hideInBreadcrumb ? (
        <Breadcrumb.Item key={url}>
          {
            currentBreadcrumb.children
              ? <span className={styles.name}>{name}</span>
              : <Link style={{ color: '#3B77E3' }} to={url}>{name}</Link>
          }
        </Breadcrumb.Item>
      ) : null;
    });
    return (
      <Breadcrumb className={styles.breadcrumb} separator='>' >
        {extraBreadcrumbItems}
      </Breadcrumb>
    );
  };

  getBox() {
    const { loading } = this.props;
    const { drawerVisible, radioGroupValue, history, collectionList } = this.state;

    let collectList = [];
    const newcollectionList = this.groupBy(collectionList, function (item) {
      return [item];
    });
    newcollectionList.forEach(i => {
      if (i.length > 1) {
        collectList.push(i[0]);
      } else if (i.length == 1) {
        collectList.push(i);
      }
    });

    return (
      <div className={styles.historyDiv}>
        <Spin spinning={loading} indicator={LoadingIcon('default')} delay={0}>
          <Tabs className={styles.tabs} onChange={this.onTabChange}>
            <TabPane tab={'浏览历史'} key={'1'}>
              <List
                dataSource={history}
                split={false}
                renderItem={item => (
                  <List.Item>
                    {JSON.parse(sessionStorage.getItem('userBreadcrumb')) ? this.renderHistoryBreadcrumb(item[0]) : null}
                  </List.Item>
                )}
              />
            </TabPane>
            <TabPane tab={'收藏模块'} key={'2'}>
              <List
                dataSource={collectList}
                split={false}
                renderItem={item => (
                  <List.Item >
                    {this.renderColletionBreadcrumb(item[0])}
                  </List.Item>
                )}
              />
            </TabPane>
          </Tabs>
        </Spin>
      </div>
    );
  }

  handlePopupVisibleChange = (visible) => {
    const { onPopupVisibleChange } = this.props;

    if (visible) {
      this.queryCollection();
      this.queryHistory();
    }

    onPopupVisibleChange && onPopupVisibleChange(visible);
  }

  render() {
    const { className, popupAlign } = this.props;

    const historyClassName = classNames(className);
    const popoverProps = {};
    if ('popupVisible' in this.props) {
      popoverProps.visible = popupVisible;
    }

    let menuLayout = getMenuLayout();

    return (
      <Popover
        placement="bottomRight"
        content={this.getBox()}
        popupClassName={styles.popHistory}
        trigger="click"
        arrowPointAtCenter
        popupAlign={popupAlign}
        onVisibleChange={this.handlePopupVisibleChange}
        {...popoverProps}
        ref={node => { this.popover = ReactDOM.findDOMNode(node) }} // eslint-disable-line
      >
        <span className={historyClassName} >
          <IconFont
            type='icon-history1'
            style={{ fontSize: '20px', 'marginTop': '-5px', color: menuLayout === 'topmenu' ? '#FFFFFF' : '' }}
          />
        </span>
      </Popover>
    );
  }
}
