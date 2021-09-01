import { PureComponent, Fragment } from "react";
import MoreAction from '@/pages/Component/Form/MoreAction';
import { Divider } from 'antd';
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm';

/**
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
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      uuid: '',
      record: {},
      count: 0
    }
  }

  componentWillReceiveProps(nextProps) {
    this.state.count++
    this.setState({
      visible: nextProps.visible,
      record: nextProps.record,
      uuid: nextProps.uuid
    })
  }

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
            <a disabled={visibleMenus[0].disabled} onClick={visibleMenus[0].onClick}>
              {visibleMenus[0].name}
            </a>
          }
          {
            visibleMenus && visibleMenus.length > 1 && <Divider type="vertical" />
          }
          {
            visibleMenus && visibleMenus.length > 1 && <MoreAction menus={visibleMenus.slice(-visibleMenus.length + 1)} />
          }
        </Fragment>
      )
    } else {
      return '';
    }
  }
}
