import React from 'react'
import { connect } from 'dva'
import EmployeeSearch from './EmployeeSearch'
import QuickForm from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickForm'

/**
 * 低代码设置入口
 * @author ChenGuangLong
 * @since 2024/5/30 17:14
*/
@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class EmployeeForm extends QuickForm {
  onCancel = () => {
    this.switchTab('query');
  };

  /**
   * 页面切换
   * @author ChenGuangLong
   * @since 2024/6/19 17:34
   */
  drawTab = e => {
    if (e.showPageNow === 'query')
      return e.component = <EmployeeSearch {...e.props} showStoreByReview={this.props.showStoreByReview}/>

  };
}
