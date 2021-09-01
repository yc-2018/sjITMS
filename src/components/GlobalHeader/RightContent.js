import React, { PureComponent } from 'react';
import { FormattedMessage, formatMessage } from 'umi/locale';
import { Spin, Tag, Menu, Icon, Dropdown, Avatar, Tooltip, Divider, Input, Select } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import groupBy from 'lodash/groupBy';
import NoticeIcon from '../NoticeIcon';
import HeaderSearch from '../HeaderSearch';
import SelectLang from '../SelectLang';
import styles from './index.less';
import HeaderDropdown from '../HeaderDropdown';
import { loginUser, loginOrg } from '../../utils/LoginContext';
import LoadingIcon from '@/components/MyComponent/LoadingIcon';
import IconFont from '@/components/IconFont';
import configs from '@/utils/config';
import dropdownSvg from '@/assets/header/ic_dropdown_dark.svg';
import router from 'umi/router';
import { havePermission } from '@/utils/authority';
import { getMenuLayout, addSearchMenu } from '@/utils/LoginContext';
import HistoryDrawer from '@/pages/Component/Page/inner/HistoryDrawer';
import { orgType } from '@/utils/OrgType';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { routerRedux } from 'dva/router';
import IToolTip from '@/pages/Component/IToolTip';
import { USER_RES } from '../../pages/Account/User/UserPermission';

const Search = Input.Search;

export default class GlobalHeaderRight extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      mouseEnterDelay: 0.1,
      userAvatar: ''
    }
  }
  getNoticeData() {
    const { notices = [] } = this.props;
    if (notices.length === 0) {
      return {};
    }
    const newNotices = notices.map(notice => {
      const newNotice = { ...notice };
      if (newNotice.datetime) {
        newNotice.datetime = moment(notice.datetime).fromNow();
      }
      if (newNotice.id) {
        newNotice.key = newNotice.id;
      }
      if (newNotice.extra && newNotice.status) {
        const color = {
          todo: '',
          processing: 'blue',
          urgent: 'red',
          doing: 'gold',
        }[newNotice.status];
        newNotice.extra = (
          <Tag color={color} style={{ marginRight: 0 }}>
            {newNotice.extra}
          </Tag>
        );
      }
      return newNotice;
    });
    return groupBy(newNotices, 'type');
  }

  onChangeMemuLayout = () => {
    if (getMenuLayout() === 'topmenu') {
      this.props.dispatch({
        type: 'setting/changeSetting',
        payload: {
          layout: 'sidermenu'
        }
      });
    } else {
      this.props.dispatch({
        type: 'setting/changeSetting',
        payload: {
          layout: 'topmenu'
        }
      });
    }
  }
  componentDidUpdate() {
    this.fetchUserInfo();
  }
  fetchUserInfo = () => {
    const { dispatch } = this.props;

    dispatch({
      type: 'user/get',
      payload: loginUser().uuid,
      callback: response => {
        if (response && response.success) {
          let currentUser = response.data;
          if (currentUser) {
            if (currentUser.avatar) {
              dispatch({
                type: 'oss/get',
                payload: currentUser.avatar,
                callback: response => {
                  if (response && response.success) {
                    this.setState({
                      userAvatar: response.data,
                    })
                  }
                }
              });
            }
          }
        }
      }
    });
  }

  onVisibleChange = (visible) => {
    if (!visible) {
      return;
    }
    const orgDom = document.getElementById("loginOrgNameSpan");
    let clientWidth = orgDom.clientWidth;
    let scrollWidth = orgDom.scrollWidth;
    const { mouseEnterDelay } = this.state;
    if (clientWidth < scrollWidth && mouseEnterDelay > 0.1) {
      this.setState({
        mouseEnterDelay: 0.1
      });
    }

    if (clientWidth >= scrollWidth && mouseEnterDelay === 0.1) {
      this.setState({
        mouseEnterDelay: 10000
      });
    }
  }

  render() {
    const {
      currentUser,
      fetchingNotices,
      onNoticeVisibleChange,
      onMenuClick,
      onNoticeClear,
      onAll,
      theme,
      notices,
      replitions
    } = this.props;

    const orgStyle = {
      'width': '160px',
      'height': '44px',
      'fontSize': '12px',
      'fontWeight': 500,
      'color': '#354052',
      'lineHeight': '44px',
      'verticalAlign': 'top'
    };

    const noticeCount = (notices ? notices.length : 0) + (replitions ? replitions.length : 0);
    const menu = (
      <Menu className={styles.menu} selectedKeys={[]} onClick={onMenuClick}>
        <Menu.Item key="userCenter">
          <IconFont type='icon-ic_geren' className={styles.iconFont} style={{ fontSize: '16px' }} />
          <FormattedMessage id="menu.account.center" defaultMessage="个人中心" />
        </Menu.Item>
        <Menu.Item key="modify">
          <IconFont type='icon-ic_xiugaimima' className={styles.iconFont} style={{ fontSize: '16px' }} />
          <FormattedMessage id="menu.account.modify" defaultMessage="修改密码" />
        </Menu.Item>
        <Menu.Item key="switch">
          <IconFont type='icon-ic_qiehuan' className={styles.iconFont} style={{ fontSize: '16px' }} />
          <FormattedMessage id="menu.account.switch" defaultMessage="切换组织" />
        </Menu.Item>
        <Menu.Item key="version">
          <IconFont type='icon-banben' className={styles.iconFont} style={{ fontSize: '16px' }} />
          <FormattedMessage id="menu.account.version" defaultMessage="版本信息" />
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="logout">
          <IconFont type='icon-ic_tuichu' className={styles.iconFont} style={{ fontSize: '16px' }} />
          <FormattedMessage id="menu.account.logout" defaultMessage="退出登录" />
        </Menu.Item>
      </Menu>
    );
    let className = styles.right;
    if (theme === 'dark') {
      className = `${styles.right}  ${styles.dark}`;
    }

    let flag = '';
    if (havePermission('iwms.system.notice.view') == false && havePermission('iwms.system.notice.create') == false) {
      flag = 'none'
    } else {
      flag = 'inline'
    }

    let menuLayout = getMenuLayout();
    let currentOrg = '';
    if (loginOrg() && loginOrg().type) {
      if(loginOrg().type === 'DISPATCH_CENTER') {
        currentOrg = orgType['dispatchCenter'].caption + "：[" + loginOrg().code + "]" + loginOrg().name;
      } else {
        currentOrg = orgType[loginOrg().type.toLowerCase()].caption + "：[" + loginOrg().code + "]" + loginOrg().name;
      }
    }
    return (
      <div className={className}>
        <HeaderSearch
          className={`${styles.action} ${styles.search}`}
          onChange={value => {
            this.props.dispatch(routerRedux.push({
              pathname: value,
            }));
            addSearchMenu(value);
          }}
          onMenuSearchChange={this.props.onMenuSearchChange}
        />

        <Divider type="vertical" />
        {loginUser() ? (
          <HeaderDropdown overlay={menu}>
            <span className={`${styles.action} ${styles.account}`}>
              <Avatar
                size="small"
                className={styles.avatar}
                src={this.state.userAvatar ? this.state.userAvatar : configs[API_ENV]['avatar.default.url']}
                alt="avatar"
              />
              <span style={{ color: menuLayout === 'sidermenu' ? '#354052' : '#FFFFFF' }} className={styles.name}>{loginUser().name}</span>
              <img src={dropdownSvg} />
            </span>
          </HeaderDropdown>
        ) : (
          <Spin indicator={LoadingIcon('small')} style={{ marginLeft: 8, marginRight: 8 }} />
        )}

        {menuLayout === 'sidermenu' && loginOrg().type &&
        <IToolTip  style={orgStyle}>{currentOrg}</IToolTip>}
        <Divider type="vertical" />
        <div className={styles.operate}>
          <HistoryDrawer style={{ 'marginTop': '5px' }} className={styles.action} />

          <NoticeIcon
            className={styles.action}
            count={noticeCount}
            onItemClick={(item, tabProps) => {
              let uuid;
              if (tabProps.name === 'notification') {
                uuid = item.uuid;
              } else {
                uuid = item.noticeUuid;
              }
              router.push('/notice');

              this.props.dispatch({
                type: 'notice/onShowPageIcon',
                payload: {
                  showPage: 'query',
                  currentNoticeUuid: uuid
                }
              });
            }}
            locale={{
              emptyText: formatMessage({ id: 'component.noticeIcon.empty' }),
              clear: formatMessage({ id: 'component.noticeIcon.clear' }),
            }}
            onClear={onNoticeClear}
            onPopupVisibleChange={onNoticeVisibleChange}
            loading={fetchingNotices}
            popupAlign={{ offset: [20, -16] }}
            clearClose
            onAll={onAll}
          >
            <NoticeIcon.Tab
              list={notices}
              title={formatMessage({ id: 'component.globalHeader.notification' })}
              name="notification"
              emptyText={formatMessage({ id: 'component.globalHeader.notification.empty' })}
              emptyImage="https://gw.alipayobjects.com/zos/rmsportal/wAhyIChODzsoKIOBHcBk.svg"
            />
            <NoticeIcon.Tab
              list={replitions}
              title={formatMessage({ id: 'component.globalHeader.message' })}
              name="message"
              emptyText={formatMessage({ id: 'component.globalHeader.message.empty' })}
              emptyImage="https://gw.alipayobjects.com/zos/rmsportal/sAuJeJzSKbUmHfBQRzmZ.svg"
            />
          </NoticeIcon>

          <SelectLang className={styles.action} />
          <span className={styles.action} style={{'paddingRight': '20px'}} onClick={this.onChangeMemuLayout}>
            <IconFont
              style={{ fontSize: '20px', 'marginTop': '-5px', color: menuLayout === 'topmenu' ? '#FFFFFF' : '' }}
              type={menuLayout === 'topmenu' ? 'icon-navleft1' : 'icon-navtop1'}
            />
          </span>
        </div>
      </div>
    );
  }


}
