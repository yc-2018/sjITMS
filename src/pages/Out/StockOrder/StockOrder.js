import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import StockOrderSearchPage from './StockOrderSearchPage';
import { stockOrderLocale } from './StockOrderLocale';
import ExcelImport from '@/components/ExcelImport';
import {ImportTemplateType} from '@/pages/Account/ImTemplate/ImTemplateContants';
@connect(({ stockAllocateOrder, loading }) => ({
  stockAllocateOrder,
  loading: loading.models.stockAllocateOrder,
}))
export default class StockOrder extends PureComponent {
  showQuery = () => {
    this.props.dispatch({
      type: 'stockAllocateOrder/showPage',
      payload: {
        showPage: 'query'
      }
    });
  }

  handleExcelImportCallback = () => {
    this.props.dispatch({
      type: 'stockAllocateOrder/showPage',
      payload: {
        showPage: 'query'
      }
    });
  }
  render() {
    const {
      importAllocateOrderUuid
    } = this.props.stockAllocateOrder;

    const uploadParams = {
      stockAllocateSchemeUuid: importAllocateOrderUuid,
    }
    if (this.props.stockAllocateOrder.showPage === 'query') {
      return <StockOrderSearchPage pathname={this.props.location.pathname} />;
    }else if (this.props.stockAllocateOrder.showPage === 'import') {
      return <ExcelImport
        title={ImportTemplateType.STOCKALLOCATESCHEME.caption}
        templateType ={ImportTemplateType.STOCKALLOCATESCHEME.name}
        uploadParams={uploadParams}
        uploadType='stockAllocateOrder/batchImport'
        cancelCallback={this.handleExcelImportCallback}
        dispatch={this.props.dispatch}
      />;
    }
  }
}
