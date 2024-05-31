import React from 'react'
import { connect } from 'dva'
import ReleaseSlipsSearch from './ReleaseSlipsSearch'
import QuickForm from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickForm'
import ReleaseSlipsPermissionsSearch from '@/pages/SJTms/ReleaseSlips/ReleaseSlipsPermissionsSearch'

/**
 * 低代码设置入口
 * @author ChenGuangLong
 * @since 2024/5/30 17:14
*/
@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class ReleaseSlipsForm extends QuickForm {
  onCancel = () => {
    this.switchTab('query');
  };

  /**
   * 页面切换
   * @author ChenGuangLong
   * @since 2024/5/23 14:51
   */
  drawTab = e => {
    if (e.showPageNow === 'query')
      return e.component = <ReleaseSlipsSearch {...e.props} showStoreByReview={this.props.showStoreByReview}/>

    if (e.showPageNow === 'permission')
      return e.component = <ReleaseSlipsPermissionsSearch {...e.props} showStoreByReview={this.props.showStoreByReview}/>

  };
}
