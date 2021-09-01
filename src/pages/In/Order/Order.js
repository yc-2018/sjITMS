import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import OrderSearchPage from './OrderSearchPage';
import OrderCreatePage from './OrderCreatePage';
import OrderViewPage from './OrderViewPage.js';
import ExcelImport from '@/components/ExcelImport';
import { orderLocale } from './OrderLocale';
import {ImportTemplateType} from '@/pages/Account/ImTemplate/ImTemplateContants';
import PreType from '@/components/MyComponent/PreType';
import { PRETYPE } from '@/utils/constants';
import PreviewBillCreatePage from '@/pages/In/Preview/PreviewBillCreatePage';
@connect(({ order, loading }) => ({
  order,
  loading: loading.models.order,
}))
export default class Order extends Component {
  handleExcelImportCallback = () => {
    this.props.dispatch({
      type: 'order/showPage',
      payload: {
        showPage: 'query'
      }
    });
  }
  render() {
    const { importTemplateUrl, billNumber } = this.props.order;

    if (this.props.order.showPage === 'query') {
      return <OrderSearchPage pathname={this.props.location.pathname} billNumber={billNumber}/>;
    }
    else if (this.props.order.showPage === 'create') {
      return <OrderCreatePage pathname={this.props.location.pathname} billNumber={billNumber}/>
    }
    else if (this.props.order.showPage === 'import') {
      return <ExcelImport
        // title={orderLocale.title}
        // templateUrl={importTemplateUrl}
        title={ImportTemplateType.ORDERBILL.caption}
        templateType ={ImportTemplateType.ORDERBILL.name}
        uploadType='order/batchImport'
        cancelCallback={this.handleExcelImportCallback}
        dispatch={this.props.dispatch}
      />;
    }else if (this.props.order.showPage === 'type') {
      return (<PreType
        preType={PRETYPE.orderType}
        title={orderLocale.type}
        backToBefore={this.handleExcelImportCallback}
      />);
		}
    else if (this.props.order.showPage === 'createPreview') {
      return <PreviewBillCreatePage pathname={this.props.location.pathname}/>
    }
    else {
      return (<OrderViewPage pathname={this.props.location.pathname} entityUuid={this.props.order.entityUuid} billNumber={billNumber}/>);
    }
  }
}
