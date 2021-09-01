import React, { PureComponent } from 'react';
import { Tabs, Skeleton, message, Icon } from 'antd';
import { connect } from 'dva';
import classNames from 'classnames';
import styles from './index.less';
import BreadcrumbView from './breadcrumb';
import { loginOrg, loginCompany, loginUser, setCollectData, setUserBreadcrumb } from '@/utils/LoginContext';
import IconFont from '@/components/IconFont';


const { TabPane } = Tabs;

@connect(({ collect, loading }) => ({
  collect,
  collectLoading: loading.models.collect,
}))
export default class PageHeader extends PureComponent {
  state = {
    collectionList: [],
    locationPath: '',
    hasCollected: false
  }
  onChange = key => {
    const { onTabChange } = this.props;
    if (onTabChange) {
      onTabChange(key);
    }
  };

  componentWillMount() {
    this.setHistory();
    this.queryCollection();
  }


  componentWillReceiveProps(nextProps) {
    if (nextProps.collect.data && nextProps.collect.data != this.props.collect.data) {
      this.setState({
        collectionList: nextProps.collect.data,
        locationPath: this.props.location ? this.props.location.pathname : ''
      });

      setCollectData(nextProps.collect.data);

      sessionStorage.setItem('userBreadcrumb', JSON.stringify({
        breadcrumbNameMap: this.props.breadcrumbNameMap,
        location: this.props.location,
      }));

      nextProps.collect.data.forEach(item => {
        if (this.props.location && this.props.breadcrumbNameMap[item] && this.props.breadcrumbNameMap[item].path === this.props.location.pathname) {
          this.setState({
            hasCollected: true
          });
          return false;
        }
      });
    }
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
   * 设置历史
   */
  setHistory() {
    let history = sessionStorage.getItem('history') != null ? JSON.parse(sessionStorage.getItem('history')) : [];
    let date = new Date();
    let Hour = date.getHours();
    let Minutes = date.getMinutes();
    let Seconds = date.getSeconds();
    if (Hour < 10) {
      Hour = '0' + Hour;
    } else {
      Hour = Hour;
    }
    if (Minutes < 10) {
      Minutes = '0' + Minutes;
    } else {
      Minutes = Minutes;
    }
    if (Seconds < 10) {
      Seconds = '0' + Seconds;
    } else {
      Seconds = Seconds;
    }
    let map = {
      time: Hour + ':' + Minutes + ':' + Seconds,
      route: this.props.location ? this.props.location.pathname : '',
    }

    for (var h = 0; h < history.length; h++) {
      if (history[h].route == map.route) {
        history.splice(h, 1);
        h--;
      }
    }

    history.unshift(map);

    sessionStorage.setItem('history', JSON.stringify(history));
  }

  /**
   * 查询收藏
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

  /**
   * 收藏/取消收藏
   */
  handleCollect = () => {
    let type = 'collect/onCollect';
    if (this.state.hasCollected) {
      type = 'collect/onCancle'
    }

    this.props.dispatch({
      type: type,
      payload: {
        orgId: loginOrg().uuid,
        userId: loginUser().uuid,
        module: this.state.locationPath
      },
      callback: response => {
        if (response.success) {
          if (type == 'collect/onCancle') {
            message.success('取消成功');
            this.setState({
              hasCollected: !this.state.hasCollected
            });
          } else {
            message.success('添加成功');
            this.setState({
              hasCollected: !this.state.hasCollected
            });
          }
        }
      }
    });
  }

  render() {
    const {
      title,
      logo,
      action,
      content,
      extraContent,
      tabList,
      className,
      tabActiveKey,
      tabDefaultActiveKey,
      tabBarExtraContent,
      loading = false,
      wide = false,
      hiddenBreadcrumb = false,
      collectLoading,
    } = this.props;

    const clsString = classNames(styles.pageHeader, className);
    const activeKeyProps = {};
    if (tabDefaultActiveKey !== undefined) {
      activeKeyProps.defaultActiveKey = tabDefaultActiveKey;
    }
    if (tabActiveKey !== undefined) {
      activeKeyProps.activeKey = tabActiveKey;
    }
    return (
      <div className={clsString}>
        <div className={wide ? styles.wide : ''}>
          <Skeleton
            loading={loading}
            title={false}
            active
            paragraph={{ rows: 3 }}
            avatar={{ size: 'large', shape: 'circle' }}
          >
            {/* <div style={{ height: '24px' }}>
              {!hiddenBreadcrumb &&
                <div style={{ float: "left", width: '75%' }}>
                  <BreadcrumbView {...this.props} />
                </div>
              }
              {collectLoading ?
                <Icon type="loading" style={{ float: 'right', fontSize: '20px', color: '#08c' }} />
                :
                <div>
                  {!this.state.hasCollected ?
                    <div style={{ width: '120px', float: 'right', position: 'relative', top: 2, textAlign: 'center' }}>
                      <IconFont type='icon-ic_addfavorite' />
                      <a style={{ fontSize: '12px', color: '#848C96' }} onClick={this.handleCollect}>加入收藏</a>
                    </div>
                    : <div style={{ width: '120px', float: 'right', position: 'relative', top: 2, textAlign: 'center' }}>
                      <IconFont type='icon-ic_delefavorite' />
                      <a style={{ fontSize: '12px' }} onClick={this.handleCollect}>取消收藏</a>
                    </div>
                  }
                </div>
              }
            </div> */}

            <div className={styles.detail}>
              {logo && <div className={styles.logo}>{logo}</div>}
              <div className={styles.main}>
                <div className={styles.row}>
                  {title && <h1 className={styles.title}>{title}</h1>}
                  {action && <div className={styles.action}>{action}</div>}
                </div>
                <div className={styles.row}>
                  {content && <div className={styles.content}>{content}</div>}
                  {extraContent && <div className={styles.extraContent}>{extraContent}</div>}
                </div>
              </div>
            </div>
            {tabList && tabList.length ? (
              <Tabs
                className={styles.tabs}
                {...activeKeyProps}
                onChange={this.onChange}
                tabBarExtraContent={tabBarExtraContent}
              >
                {tabList.map(item => (
                  <TabPane tab={item.tab} key={item.key} />
                ))}
              </Tabs>
            ) : null}
          </Skeleton>
        </div>
      </div>
    );
  }
}
