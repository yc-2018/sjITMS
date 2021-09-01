import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import VendorRtnNtcBillSearchPage from './VendorRtnNtcBillSearchPage';
import VendorRtnNtcBillCreatePage from './VendorRtnNtcBillCreatePage';
import VendorRtnNtcBillViewPage from './VendorRtnNtcBillViewPage';
import ExcelImport from '@/components/ExcelImport';
import { vendorRtnNtcLocale } from './VendorRtnNtcBillLocale';
import PreType from '@/components/MyComponent/PreType';
import { PRETYPE } from '@/utils/constants';
import { ImportTemplateType } from '@/pages/Account/ImTemplate/ImTemplateContants';

@connect(({ vendorRtnNtc, loading }) => ({
    vendorRtnNtc,
    loading: loading.models.vendorRtnNtc,
}))
export default class Order extends Component {
    handleExcelImportCallback = () => {
        this.props.dispatch({
            type: 'vendorRtnNtc/showPage',
            payload: {
                showPage: 'query'
            }
        });
    }
    render() {
        const { importTemplateUrl } = this.props.vendorRtnNtc;

        if (this.props.vendorRtnNtc.showPage === 'query') {
            return <VendorRtnNtcBillSearchPage pathname={this.props.location.pathname} />;
        }
        else if (this.props.vendorRtnNtc.showPage === 'create') {
            return <VendorRtnNtcBillCreatePage pathname={this.props.location.pathname} />
        }
        else if (this.props.vendorRtnNtc.showPage === 'import') {
            return <ExcelImport
                // title={storeRtnNtcLocal.title}
                // templateUrl={importTemplateUrl}
                title={ImportTemplateType.VENDORRTNNTCBILL.caption}
                templateType={ImportTemplateType.VENDORRTNNTCBILL.name}
                uploadType='vendorRtnNtc/batchImport'
                cancelCallback={this.handleExcelImportCallback}
                dispatch={this.props.dispatch}
            />;
        }
        else {
            return (<VendorRtnNtcBillViewPage pathname={this.props.location.pathname}
                entityUuid={this.props.vendorRtnNtc.entityUuid} />);
        }
    }
}
