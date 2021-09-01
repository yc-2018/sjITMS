import React, { PureComponent } from 'react';
import { Menu, Icon } from 'antd';
import Link from 'umi/link';
import isEqual from 'lodash/isEqual';
import memoizeOne from 'memoize-one';
import pathToRegexp from 'path-to-regexp';
import { urlToList } from '../_utils/pathTools';
import styles from './index.less';
import IconFont from '@/components/IconFont';
import {getMenuLayout} from '@/utils/LoginContext';

const { SubMenu } = Menu;

export const getMenuMatches = (flatMenuKeys, path) =>
  flatMenuKeys.filter(item => {
    if (item) {
      return pathToRegexp(item).test(path);
    }
    return false;
  });

const overflowedIndicator = 'overflowed-indicator';
const subMenuIndicator = 'submenu-indicator';

export default class BaseMenu extends PureComponent {

  constructor(props) {
    super(props);
    this.getSelectedMenuKeys = memoizeOne(this.getSelectedMenuKeys, isEqual);
    this.flatMenuKeys = this.getFlatMenuKeys(props.menuData);
  }

  componentWillReceiveProps(nextProps) {
    this.flatMenuKeys = this.getFlatMenuKeys(nextProps.menuData);
  }

  // Allow menu.js config icon as string or ReactNode
  //   icon: 'setting',
  //   icon: 'http://demo.com/icon.png',
  //   icon: <Icon type="setting" />,
  //   icon: 'icon-' <IconFont type={checkIcon} />
  getIcon = icon => {
    if (typeof icon === 'string' && icon.indexOf('http') === 0) {
      return <img src={icon} alt="icon" className={styles.icon} />;
    }
    if (typeof icon === 'string' && icon.startsWith('icon-')) {
      return <IconFont type={icon} className={styles.icon} style={{ fontSize: '20px' }} />;
    }
    if (typeof icon === 'string') {
      return <Icon type={icon} />;
    }
    return icon;
  };

  /**
   * Recursively flatten the data
   * [{path:string},{path:string}] => {path,path2}
   * @param  menus
   */
  getFlatMenuKeys(menus) {
    let keys = [];
    menus.forEach(item => {
      if (item.children) {
        keys = keys.concat(this.getFlatMenuKeys(item.children));
      }
      keys.push(item.path);
    });
    return keys;
  }

  /**
   * 获得菜单子节点
   * @memberof SiderMenu
   */
  getNavMenuItems = (menusData, parent) => {
    if (!menusData) {
      return [];
    }
    return menusData
      .filter(item => item.name && !item.hideInMenu)
      .map(item => {
        // make dom
        const ItemDom = this.getSubMenuOrItem(item, parent);
        return this.checkPermissionItem(item.authority, ItemDom);
      })
      .filter(item => item);
  };

  // Get the currently selected menu
  getSelectedMenuKeys = pathname => {
    return urlToList(pathname).map(itemPath => getMenuMatches(this.flatMenuKeys, itemPath).pop());
  }

  getPopupOffset = (length) => {
    const isTop = getMenuLayout() === 'topmenu';
    if (!isTop) {
      return length > 2 ? [4, -3] : [4, -1];
    } else {
      return length > 2 ? [4, -4] : [4, -14]
    }
  }

  /**
   * get SubMenu or Item
   */
  getSubMenuOrItem = item => {
    // doc: add hideChildrenInMenu
    if (item.children && !item.hideChildrenInMenu && item.children.some(child => child.name)) {
      const { name } = item;
      return (
        <SubMenu
          popupOffset={this.getPopupOffset(item.path.split('/').length)}
          title={
            item.icon ? (
              <span>
                {this.getIcon(item.icon)}
                <span>{name}</span>
              </span>
            ) : (
              name
            )
          }
          key={item.path}
        >
          {this.getNavMenuItems(item.children)}
        </SubMenu>
      );
    }
    return <Menu.Item key={item.path}
                      onMouseLeave={this.onItemMouseLeave}
                      onMouseEnter={this.onItemMouseEnter}
                      divider={item.divider && item.divider.toString()}>
      {this.getMenuItemPath(item)}
    </Menu.Item>;
  };

  /**
   * 判断是否是http链接.返回 Link 或 a
   * Judge whether it is http link.return a or Link
   * @memberof SiderMenu
   */
  getMenuItemPath = item => {
    const { name } = item;
    const itemPath = this.conversionPath(item.path);
    const icon = this.getIcon(item.icon);
    const { target } = item;
    // Is it a http link
    if (/^https?:\/\//.test(itemPath)) {
      return (
        <a href={itemPath} target={target}>
          {icon}
          <span>{name}</span>
        </a>
      );
    }
    const { location, isMobile, onCollapse } = this.props;
    return (
      <Link
        to={itemPath}
        target={target}
        replace={itemPath === location.pathname}
        onClick={
          isMobile
            ? () => {
              onCollapse(true);
            }
            : undefined
        }
      >
        {icon}
        <span>{name}</span>
      </Link>
    );
  };

  // permission to check
  checkPermissionItem = (authority, ItemDom) => {
    const { Authorized } = this.props;
    if (Authorized && Authorized.check) {
      const { check } = Authorized;
      let arr = check(authority, ItemDom);
      if (arr && arr.props && arr.props.children && Array.isArray(arr.props.children)) {
        for (let i = 0; i < arr.props.children.length; i++) {
          if (arr.props.children[i].props.divider) {
            arr.props.children.splice(i + 1, 0, <Menu.Divider key={arr.props.children[i].key+'divider'} />);
          }
        }
      }
      return arr;
    }
    return ItemDom;
  };

  conversionPath = path => {
    if (path && path.indexOf('http') === 0) {
      return path;
    }
    return `/${path || ''}`.replace(/\/+/g, '/');
  };

  render() {
    const {
      openKeys,
      theme,
      mode,
      location: { pathname },
    } = this.props;
    // if pathname can't match, use the nearest parent's key
    let selectedKeys= this.getSelectedMenuKeys(pathname);
    if (!selectedKeys.length && openKeys) {
      selectedKeys = [openKeys[openKeys.length - 1]];
    }
    let props = {};
    if (openKeys) {
      props = {
        openKeys,
      };
    }
    const { handleOpenChange, style, menuData } = this.props;
    return (
      <Menu
        key="Menu"
        mode={mode}
        theme={theme}
        onOpenChange={this.handleMenuOpenChange}
        selectedKeys={selectedKeys}
        onSelect={this.onMenuSelect}
        style={style}
        subMenuCloseDelay={0.5}
        className={mode === 'horizontal' ? 'top-nav-menu' : ''}
        {...props}
      >
        {this.getNavMenuItems(menuData)}
      </Menu>
    );
  }
}
