import React, { PureComponent } from 'react';
import { formatMessage } from 'umi/locale';
import { Layout, message } from 'antd';
import Animate from 'rc-animate';
import { connect } from 'dva';
import router from 'umi/router';
import GlobalHeader from '@/components/GlobalHeader';
import TopNavHeader from '@/components/TopNavHeader';
import styles from './Header.less';
import Authorized from '@/utils/Authorized';
import ModifyPwd from '@/pages/Account/Login/ModifyPwd';
import SwitchOrg from '@/pages/Account/Login/SwitchOrg';
import { loginOrg, loginUser } from '@/utils/LoginContext';
import { getCookie } from '@/utils/Cookies';
import configs from '@/utils/config';
import defaultSettings from '../defaultSettings';

const { Header } = Layout;
class HeaderView extends PureComponent {
  state = {
    visible: true,
    modifyPasswdModalVisible: false,
    switchOrgModalVisible: false,
    confirmLoading: false,
    compelPasswd: false,
  };

  static getDerivedStateFromProps(props, state) {
    if (!props.autoHideHeader && !state.visible) {
      return {
        visible: true,
      };
    }
    return null;
  }

  componentDidMount() {
    document.addEventListener('scroll', this.handScroll, { passive: true });
    this.checkPassword();
  }

  componentWillUnmount() {
    document.removeEventListener('scroll', this.handScroll);
  }

  /**
   * 设置确认loading状态
   */
  setConfirmLoading = (loading) => {
    this.setState({
      confirmLoading: loading,
    })
  }
  getHeadWidth = () => {
    const { isMobile, collapsed, setting } = this.props;
    const { fixedHeader, layout } = setting;
    if (isMobile || !fixedHeader || layout === 'topmenu') {
      return '100%';
    }

    return collapsed ? `calc(100% - ${defaultSettings.closeSiderNavigatorWidth})` : `calc(100% - ${defaultSettings.openSiderNavigatorWidth})`;
  };

  handleNoticeClear = type => {
    message.success(
      `${formatMessage({ id: 'component.noticeIcon.cleared' })} ${formatMessage({
        id: `component.globalHeader.${type}`,
      })}`
    );

    const { dispatch } = this.props;
    if (type === 'notification') {
      dispatch({
        type: 'notice/clearNotice',
        payload: {
          orgUuid: loginOrg().uuid,
          userUuid: loginUser().uuid
        },
        callback: () => {
          this.props.refreshNotice();
        }
      });

      this.props.refreshNotice();
    } else {
      dispatch({
        type: 'notice/clearReplition',
        payload: {
          userUuid: loginUser().uuid,
        },
        callback: () => {
          this.props.refreshNotice();
        }
      });
    }
  };

  onAll = () => {
    this.props.dispatch({
      type: 'notice/onShowPage',
      payload: {
        showPage: 'query'
      }
    });
    router.push('/notice');
  }
  handleMenuClick = ({ key }) => {
    const { dispatch } = this.props;
    if (key === 'userCenter') {
      router.push('/account/center');
      return;
    } else if (key === 'version') {
      router.push('/account/version');
      return;
    }
    if (key === 'switch') {
      // 查询当前登录者的所有组织
      this.props.dispatch({
        type: 'user/get',
        payload: loginUser().uuid,
        callback: (response) => {
          if (response.data) {
            this.setState({
              switchOrgModalVisible: true,
              orgInfos: response.data.orgs
            });
          } else {
            message.error('获取用户组织信息失败！');
          }
        },
      });
    }
    if (key === 'modify') {
      // router.push('/account/settings/modifyPwd');
      this.setState({ modifyPasswdModalVisible: true });
    }
    if (key === 'logout') {
      dispatch({
        type: 'login/logout',
      });
    }
  };

  handScroll = () => {
    const { autoHideHeader } = this.props;
    const { visible } = this.state;
    if (!autoHideHeader) {
      return;
    }
    const scrollTop = document.body.scrollTop + document.documentElement.scrollTop;
    if (!this.ticking) {
      this.ticking = true;
      requestAnimationFrame(() => {
        if (this.oldScrollTop > scrollTop) {
          this.setState({
            visible: true,
          });
        }
        if (scrollTop > 300 && visible) {
          this.setState({
            visible: false,
          });
        }
        if (scrollTop < 300 && !visible) {
          this.setState({
            visible: true,
          });
        }
        this.oldScrollTop = scrollTop;
        this.ticking = false;
      });
    }
  };
  // 修改密码
  modifyPasswd = (values) => {
    this.setConfirmLoading(true);
    this.props.dispatch({
      type: 'login/modifyPassword',
      payload: values,
      callback: (response) => {
        if (response.success) {
          message.success(formatMessage({ id: 'user.modify.password.success' }));
          this.setState({ modifyPasswdModalVisible: false });
          this.props.dispatch({ type: 'login/logout' });
        }
        this.setConfirmLoading(false);
      },
    });
  }
  // 取消修改密码
  hidePwdModifyModal = (flag) => {
    this.setState({
      modifyPasswdModalVisible: !!flag,
    });
  }
  // 切换组织
  switchOrg = (orgUuid, userUuid) => {
    this.setConfirmLoading(true);
    this.props.dispatch({
      type: 'login/switchOrg',
      payload: {
        orgUuid,
        userUuid,
      },
      callback: (response) => {
        if (response.success) {
          this.setState({ switchOrgModalVisible: false });
          message.success(formatMessage({ id: 'user.modify.checkOrg.success' }));
          this.props.fetchReportMenu();
          this.props.refreshNotice();
          this.props.clearTabPanes();
        } else {
          this.setState({ switchOrgModalVisible: false });
          message.error(response.message);
        }
        this.setConfirmLoading(false);
      },
    });
  }
  // 取消切换组织
  hideOrgModifyModal = (flag) => {
    this.setState({
      switchOrgModalVisible: !!flag,
    });
  }

  //校验密码强度
  checkPassword = () => {
    if (loginUser()?.name.indexOf("刷卡") == -1 && configs[API_ENV].PRO_ENV == 1) {
      const passwordUsable = getCookie("passwordUsable");
      if (passwordUsable == 0 && passwordUsable != undefined) {
        this.setState({ modifyPasswdModalVisible: true, compelPasswd: true });
      }
    }
  }

  // 强制修改密码
  modifyNewPassword = (values) => {
    this.setConfirmLoading(true);
    this.props.dispatch({
      type: 'login/modifyNewPassword',
      payload: values,
      callback: (response) => {
        if (response.success) {
          message.success(formatMessage({ id: 'user.modify.password.success' }));
          this.setState({ modifyPasswdModalVisible: false });
          this.props.dispatch({ type: 'login/logout' });
        }
        this.setConfirmLoading(false);
      },
    });
  }

  render() {
    const { isMobile, handleMenuCollapse, setting, notices, replitions } = this.props;
    const { navTheme, layout, fixedHeader } = setting;
    const { visible, compelPasswd, modifyPasswdModalVisible, switchOrgModalVisible, orgInfos, confirmLoading } = this.state;
    const isTop = layout === 'topmenu';
    const width = this.getHeadWidth();
    const HeaderDom = visible ? (
      <Header style={{ padding: 0, width }} className={fixedHeader ? styles.fixedHeader : ''}>
        {isTop && !isMobile ? (
          <TopNavHeader
            theme={navTheme}
            mode="horizontal"
            Authorized={Authorized}
            onCollapse={handleMenuCollapse}
            onNoticeClear={this.handleNoticeClear}
            onAll={this.onAll}
            onMenuClick={this.handleMenuClick}
            onNoticeVisibleChange={this.handleNoticeVisibleChange}
            notices={notices}
            replitions={replitions}
            {...this.props}
          />
        ) : (
          <GlobalHeader
            onCollapse={handleMenuCollapse}
            onNoticeClear={this.handleNoticeClear}
            onMenuClick={this.handleMenuClick}
            onNoticeVisibleChange={this.handleNoticeVisibleChange}
            {...this.props}
          />
        )}
        <ModifyPwd
          modifyPasswdModalVisible={modifyPasswdModalVisible}
          hideModifyModal={this.hidePwdModifyModal}
          modifyPasswd={compelPasswd ? this.modifyNewPassword : this.modifyPasswd}
          compel={compelPasswd}
          confirmLoading={confirmLoading}
        >
        </ModifyPwd>
        <SwitchOrg
          switchOrgModalVisible={switchOrgModalVisible}
          hideOrgModal={this.hideOrgModifyModal}
          switchOrg={this.switchOrg}
          orgInfos={orgInfos}
          confirmLoading={confirmLoading}
        >
        </SwitchOrg>
      </Header>
    ) : null;
    return (
      <Animate component="" transitionName="fade">
        {HeaderDom}
      </Animate>
    );
  }
}

export default connect(({ user, global, setting, loading }) => ({
  currentUser: user.currentUser,
  collapsed: global.collapsed,
  // fetchingNotices: loading.effects['global/fetchNotices'],
  // notices: global.notices,
  setting,
}))(HeaderView);
