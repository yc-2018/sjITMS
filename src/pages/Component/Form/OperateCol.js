import { PureComponent, Fragment } from "react";
import MoreAction from './MoreAction';
import PropTypes from 'prop-types';
import { Divider, Button } from 'antd';
import { commonLocale } from '@/utils/CommonLocale';
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm';
import { isNotEmpty } from '@/utils/utils';

/**
 * @param {boolean} noMore: 展开所有的操作
 *
 * 操作列定义，传入menus作为操作项集合，每个操作项属性：
 * {
 *    name: 操作名称，界面展示
 *    onClick：操作事件
 *    disabled：是否禁用，用于权限控制，默认否
 *    disVisible：是否展示该选项，默认否即展示，传入true则不展示，根据实体状态决定该操作是否展示
 *    confirm: 默认为false，如果设为true，展示确认提示框
 *    confirmCaption：确认提示框的实体名称，仅当confirm为true时有效，比如：配送中心、门店等等
 * }
 */
export default class OperateCol extends PureComponent {

  filterMenus = (menus) => {
    const visibleMenus = [];
    if (!menus) {
      return visibleMenus;
    } else {
      menus.forEach(menu => {
        if (!menu.disVisible) {
          visibleMenus.push(menu);
        }
      });
      return visibleMenus;
    }
  }

  render() {
    const { viewProps, menus } = this.props;

    const visibleMenus = this.filterMenus(menus);

    const otherActions = [];
    if (isNotEmpty(visibleMenus) && visibleMenus.length > 1) {
      for (let i = 1; i < visibleMenus.length;i ++) {
        if (visibleMenus[i].confirm) {
          otherActions.push(<span>
              <IPopconfirm onConfirm={visibleMenus[i].onClick} operate={visibleMenus[i].name} object={visibleMenus[i].confirmCaption}>
                <a disabled={visibleMenus[i].disabled} >
                  {visibleMenus[i].name}
                </a>
              </IPopconfirm>
            </span>)
        }
      }
    }

    if (visibleMenus && visibleMenus.length > 0) {
      return (
        <Fragment>
          {
            visibleMenus[0].confirm &&
            <span>
              <IPopconfirm onConfirm={visibleMenus[0].onClick} operate={visibleMenus[0].name} object={visibleMenus[0].confirmCaption}>
                <a disabled={visibleMenus[0].disabled} >
                  {visibleMenus[0].name}
                </a>
              </IPopconfirm>
            </span>
          }
          {
            !visibleMenus[0].confirm &&
            (visibleMenus[0].button ? <Button type='primary' onClick={visibleMenus[0].onClick} disabled={visibleMenus[0].disabled}>{visibleMenus[0].name}</Button> :
              <a disabled={visibleMenus[0].disabled} onClick={visibleMenus[0].onClick}>
                {visibleMenus[0].name}
              </a>)
          }
          {
            <span style={{ padding: '0px 3px' }}> </span>
          }
          {
            visibleMenus && visibleMenus.length > 1 && !this.props.noMore && <MoreAction menus={visibleMenus.slice(-visibleMenus.length + 1)} />
          }
          {
            this.props.noMore && isNotEmpty(otherActions) ? otherActions : null
          }
        </Fragment>
      )
    } else {
      return '';
    }
  }
}
