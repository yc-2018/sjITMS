import React, { Component } from 'react';
import { Card, message, Button, Icon, Tooltip } from 'antd';
import styles from './Page.less';
import { connect } from 'dva';
import IconFont from '@/components/IconFont';
import {
  getActiveKey,
  getCollectData,
  loginOrg,
  loginUser,
  addCollectData,
  removeCollectData,
} from '@/utils/LoginContext';

@connect(({ collect, loading }) => ({
  collect,
  collectLoading: loading.models.collect,
}))
export default class Page extends Component {
  handleCollect = () => {
    this.props.dispatch({
      type: 'collect/onCollect',
      payload: {
        orgId: loginOrg().uuid,
        userId: loginUser().uuid,
        module: window.location.pathname,
      },
      callback: response => {
        if (response.success) {
          message.success('收藏成功');
          addCollectData(window.location.pathname);
        }
      },
    });
  };

  handleCancle = () => {
    this.props.dispatch({
      type: 'collect/onCancle',
      payload: {
        orgId: loginOrg().uuid,
        userId: loginUser().uuid,
        module: window.location.pathname,
      },
      callback: response => {
        if (response.success) {
          message.success('取消成功');
          removeCollectData(window.location.pathname);
        }
      },
    });
  };

  render() {
    let collected = false;
    const collectedData = getCollectData();
    if (collectedData && collectedData.indexOf(this.props.pathname) > -1) {
      collected = true;
    }
    return (
      <Card bordered={false} className={styles.contentWrapper}>
        {this.props.withCollect && (
          <div className={styles.collect}>
            <div className={styles.collectIcon}>
              {collected ? (
                <Tooltip title="取消收藏">
                  <a onClick={() => this.handleCancle()}>
                    <IconFont type="icon-collected" style={{ fontSize: '14px', color: 'white' }} />{' '}
                  </a>
                </Tooltip>
              ) : (
                <Tooltip title="收藏">
                  <a onClick={() => this.handleCollect()}>
                    <IconFont type="icon-collect" style={{ fontSize: '14px', color: 'white' }} />
                  </a>
                </Tooltip>
              )}
            </div>
          </div>
        )}
        <div>{this.props.children}</div>
      </Card>
    );
  }
}
