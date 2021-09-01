import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import { Popover, Icon, Tabs, Badge, Spin } from 'antd';
import classNames from 'classnames';
import List from './NoticeList';
import styles from './index.less';
import IconFont from '@/components/IconFont';
import LoadingIcon from '@/components/MyComponent/LoadingIcon';

const { TabPane } = Tabs;

export default class NoticeIcon extends PureComponent {
  static Tab = TabPane;

  static defaultProps = {
    onItemClick: () => {},
    onPopupVisibleChange: () => {},
    onTabChange: () => {},
    onClear: () => {},
    loading: false,
    clearClose: false,
    locale: {
      emptyText: 'No notifications',
      clear: 'Clear',
    },
    emptyImage: 'https://gw.alipayobjects.com/zos/rmsportal/wAhyIChODzsoKIOBHcBk.svg',
  };

  onItemClick = (item, tabProps) => {
    const { onItemClick,clearClose } = this.props;
    if (clearClose) {
      this.popover.click();
    }
    onItemClick(item, tabProps);
  };

  onClear = (name) => {
    const { onClear, clearClose } = this.props;
    onClear(name);
    if (clearClose) {
      this.popover.click();
    }
  }
  onAll=()=>{
    const { onAll,clearClose} = this.props;
    onAll();
    if (clearClose) {
      this.popover.click();
    }
  }
  onTabChange = tabType => {
    const { onTabChange } = this.props;
    onTabChange(tabType);
  };

  getNotificationBox() {
    const { children, loading, locale } = this.props;
    if (!children) {
      return null;
    }
    const panes = React.Children.map(children, child => {
      const title =
        child.props.list && child.props.list.length > 0
          ? `${child.props.title} (${child.props.list.length})`
          : child.props.title;
      return (
        <TabPane tab={title} key={child.props.name}>
          <List
            {...child.props}
            data={child.props.list}
            onClick={item => this.onItemClick(item, child.props)}
            onClear={() => this.onClear(child.props.name)}
            title={child.props.title}
            locale={locale}
            onAll={this.onAll}
          />
        </TabPane>
      );
    });
    return (
      <Spin spinning={loading} indicator={LoadingIcon('default')} delay={0}>
        <Tabs className={styles.tabs} onChange={this.onTabChange}>
          {panes}
        </Tabs>
      </Spin>
    );
  }

  render() {
    const { className, count, popupAlign, popupVisible, onPopupVisibleChange, bell } = this.props;
    const noticeButtonClass = classNames(className, styles.noticeButton);
    const notificationBox = this.getNotificationBox();
    const NoticeBellIcon = bell || <IconFont type='icon-news1' className={styles.icon} style={{ fontSize: '20px' }} />;
    const trigger = (
      <span className={noticeButtonClass}>
        <Badge count={count} style={{ boxShadow: 'none' }} className={styles.badge}>
          {NoticeBellIcon}
        </Badge>
      </span>
    );
    if (!notificationBox) {
      return trigger;
    }
    const popoverProps = {};
    if ('popupVisible' in this.props) {
      popoverProps.visible = popupVisible;
    }
    return (
      <Popover
        placement="bottomRight"
        content={notificationBox}
        popupClassName={styles.popover}
        trigger="click"
        arrowPointAtCenter
        popupAlign={popupAlign}
        onVisibleChange={onPopupVisibleChange}
        {...popoverProps}
        ref={node => { this.popover = ReactDOM.findDOMNode(node)}} // eslint-disable-line
      >
        {trigger}
      </Popover>
    );
  }
}
