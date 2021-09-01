import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import DeliveredConfirmSearchPage from './DeliveredConfirmSearchPage';
import ExcelImport from '@/components/ExcelImport';
import {ImportTemplateType} from '@/pages/Account/ImTemplate/ImTemplateContants';
import PreType from '@/components/MyComponent/PreType';
import { PRETYPE } from '@/utils/constants';
import PreviewBillCreatePage from '@/pages/In/Preview/PreviewBillCreatePage';
import UnDeliveredConfirmSearchPage from './UnDeliveredConfirmSearchPage';
import { deliveredConfirmLocale } from './DeliveredConfirmLocale';
@connect(({ deliveredConfirm, loading }) => ({
  deliveredConfirm,
  loading: loading.models.deliveredConfirm,
}))
export default class DeliveredConfirm extends Component {
  handleExcelImportCallback = () => {
    this.props.dispatch({
      type: 'deliveredConfirm/showPage',
      payload: {
        showPage: 'unDeliveredConfirm'
      }
    });
  }
  handleUnCallback = ()=>{
    this.props.dispatch({
      type: 'deliveredConfirm/showPage',
      payload: {
        showPage: 'query'
      }
    });
  }
  render() {
    if (this.props.deliveredConfirm.showPage === 'query') {
      return <DeliveredConfirmSearchPage pathname={this.props.location.pathname}/>;
    }else if(this.props.deliveredConfirm.showPage === 'unDeliveredConfirm'){
      return <UnDeliveredConfirmSearchPage pathname={this.props.location.pathname} backToBefore={this.handleUnCallback}/>;
    }else if(this.props.deliveredConfirm.showPage === 'type'){
      return (<PreType
                preType={PRETYPE.unDeliveredReason}
                title={deliveredConfirmLocale.unDeliveredReason}
                backToBefore={this.handleExcelImportCallback}
              />);
    }
  }
}
