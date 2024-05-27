import React from 'react'
import { connect } from 'dva'
import AddrReportSearch from './AddrReportSearch'
import QuickForm from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickForm'

/**
 * 低代码设置入口
 * @author ChenGuangLong
 * @since 2024/5/23 14:51
*/
@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class AddrReportForm extends QuickForm {
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
      return e.component = <AddrReportSearch {...e.props} showStoreByReview={this.props.showStoreByReview}/>;

  };
}
