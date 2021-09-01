import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import PackageBillSearchPage from './PackageBillSearchPage';
import PackageBillCreatePage from './PackageBillCreatePage';
import PackageBillViewPage from './PackageBillViewPage.js';
import PackageBillAuditPage from './PackageBillAuditPage.js';
import ExcelImport from '@/components/ExcelImport';
import { orderLocale } from './PackageBillLocale';
import {ImportTemplateType} from '@/pages/Account/ImTemplate/ImTemplateContants';
import { PRETYPE } from '@/utils/constants';

@connect(({ packageBill, loading }) => ({
  packageBill,
  loading: loading.models.packageBill,
}))
export default class Order extends Component {
  handleExcelImportCallback = () => {
    this.props.dispatch({
      type: 'packageBill/showPage',
      payload: {
        showPage: 'query'
      }
    });
  }
  render() {
    const { importTemplateUrl, billNumber } = this.props.packageBill;

    if (this.props.packageBill.showPage === 'query') {
      return <PackageBillSearchPage pathname={this.props.location.pathname} billNumber={billNumber}/>;
    }
    else if (this.props.packageBill.showPage === 'create') {
      return <PackageBillCreatePage pathname={this.props.location.pathname} entityUuid={this.props.packageBill.entityUuid} billNumber={billNumber}/>
    }
    else if (this.props.packageBill.showPage === 'audit') {
      return <PackageBillAuditPage pathname={this.props.location.pathname} entityUuid={this.props.packageBill.entityUuid} billNumber={billNumber}/>
    }
    else if (this.props.packageBill.showPage === 'import') {
      return <ExcelImport
        title={ImportTemplateType.PACKAGEBILL.caption}
        templateType ={ImportTemplateType.PACKAGEBILL.name}
        uploadType='packageBill/batchImport'
        cancelCallback={this.handleExcelImportCallback}
        dispatch={this.props.dispatch}
      />;
    }
    else {
      return (<PackageBillViewPage pathname={this.props.location.pathname} entityUuid={this.props.packageBill.entityUuid} billNumber={billNumber}/>);
    }
  }
}
