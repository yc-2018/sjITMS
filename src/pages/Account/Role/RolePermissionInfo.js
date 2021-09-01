import React, { PureComponent } from 'react';
import AuthorizeCom from '@/pages/Component/Authorize/AuthorizeCom';
import { RESOURCE_IWMS_ACCOUNT_ROLE_AUTHORIZE, RESOURCE_IWMS_ACCOUNT_ROLE_CHILD_AUTHORIZE } from '@/utils/constants';
import { loginUser } from '@/utils/LoginContext';
import PropTypes from 'prop-types';
import { Spin } from 'antd';
import LoadingIcon from '@/pages/Component/Loading/LoadingIcon';
import ViewTabPanel from '@/pages/Component/Page/inner/ViewTabPanel';

class RolePermissionInfo extends PureComponent {

  static propTypes = {
    data: PropTypes.array,
    checkedKeys: PropTypes.array,
    handleAuthorize: PropTypes.func,
  }

  /**
   * 检测认证组件是否可用，返回true，代表可用；返回false，代表不可用
   */
  checkEnabled = (key1, key2) => {
    if (loginUser().resources) {
      if (!Array.isArray(loginUser().resources) || loginUser().resources.length === 0) {
        return false;
      }

      return loginUser().resources.indexOf(key1) == -1 && loginUser().resources.indexOf(key2) == -1 ? false : true;
    }

    return false;
  }

  render() {
    const {
      data,
      checkedKeys,
      handleAuthorize,
      disable,
      loading, orgType,
    } = this.props;

    let enabled = this.checkEnabled(RESOURCE_IWMS_ACCOUNT_ROLE_AUTHORIZE, RESOURCE_IWMS_ACCOUNT_ROLE_CHILD_AUTHORIZE);
    const style = {
      // 'marginTop': '12px',
      overflow:'hidden',
      height:this.props.height?this.props.height:'100%',
    }
    return (
      <Spin indicator={LoadingIcon('default')} tip="处理中..." spinning={loading} style={{height:'100%'}}>
        <ViewTabPanel style={style} withoutTable={true}>
          <AuthorizeCom data={data} disabled={disable ? disable : !enabled} checkedKeys={checkedKeys} authorize={handleAuthorize}
                        orgType={orgType} />
        </ViewTabPanel>
      </Spin>
    )
  }
}

export default RolePermissionInfo;
