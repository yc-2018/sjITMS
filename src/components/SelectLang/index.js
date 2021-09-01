import React, { PureComponent } from 'react';
import { formatMessage, setLocale, getLocale } from 'umi/locale';
import { Menu, Icon, Dropdown } from 'antd';
import classNames from 'classnames';
import styles from './index.less';
import IconFont from '@/components/IconFont';
import { getMenuLayout } from '@/utils/LoginContext';

export default class SelectLang extends PureComponent {
  changLang = ({ key }) => {
    setLocale(key);
  };

  render() {
    const { className } = this.props;
    const selectedLang = getLocale();
    let menuLayout = getMenuLayout();

    const langMenu = (
      <Menu className={styles.menu} selectedKeys={[selectedLang]} onClick={this.changLang}>
        <Menu.Item key="zh-CN">
          <span role="img" aria-label="简体中文">
            🇨🇳
          </span>{' '}
          简体中文
        </Menu.Item>
        <Menu.Item key="zh-TW">
          <span role="img" aria-label="繁体中文">
            🇭🇰
          </span>{' '}
          繁体中文
        </Menu.Item>
        <Menu.Item key="en-US">
          <span role="img" aria-label="English">
            🇬🇧
          </span>{' '}
          English
        </Menu.Item>
      </Menu>
    );
    return (
      <Dropdown overlay={langMenu} placement="bottomRight">
        <span className={className}>
          <IconFont
            type='icon-language2'
            title={formatMessage({ id: 'navBar.lang' })}
            style={{ fontSize: '20px', 'marginTop': '-5px', color: menuLayout === 'topmenu' ? '#FFFFFF' : '' }} />
        </span>
      </Dropdown>
    );
  }
}
