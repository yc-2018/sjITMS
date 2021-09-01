import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import StoreRtnNtcBillSearchPage from './StoreRtnNtcBillSearchPage';
import StoreRtnNtcBillCreatePage from './StoreRtnNtcBillCreatePage';
import StoreRtnNtcBillViewPage from './StoreRtnNtcBillViewPage';
import ExcelImport from '@/components/ExcelImport';
import { storeRtnNtcLocal } from './StoreRtnNtcBillLocale';
import PreType from '@/components/MyComponent/PreType';
import { PRETYPE } from '@/utils/constants';
import {ImportTemplateType} from '@/pages/Account/ImTemplate/ImTemplateContants';

@connect(({ storeRtnNtc, loading }) => ({
    storeRtnNtc,
    loading: loading.models.storeRtnNtc,
}))
export default class Order extends Component {
    handleExcelImportCallback = () => {
        this.props.dispatch({
            type: 'storeRtnNtc/showPage',
            payload: {
                showPage: 'query'
            }
        });
    }
    render() {
        const { importTemplateUrl } = this.props.storeRtnNtc;

        if (this.props.storeRtnNtc.showPage === 'query') {
            return <StoreRtnNtcBillSearchPage pathname={this.props.location.pathname}/>;
        }
        else if (this.props.storeRtnNtc.showPage === 'create') {
            return <StoreRtnNtcBillCreatePage pathname={this.props.location.pathname}/>
        }
        else if (this.props.storeRtnNtc.showPage === 'rtnType') {
            return (<PreType
              preType={PRETYPE['rtnType']}
              title='退仓原因'
              backToBefore={this.handleExcelImportCallback}
            />);
          } 
        else if (this.props.storeRtnNtc.showPage === 'import') {
            return <ExcelImport
                // title={storeRtnNtcLocal.title}
                // templateUrl={importTemplateUrl}
                title={ImportTemplateType.RTNNTCBILL.caption}
                templateType ={ImportTemplateType.RTNNTCBILL.name}
                uploadType='storeRtnNtc/batchImport'
                cancelCallback={this.handleExcelImportCallback}
                dispatch={this.props.dispatch}
            />;
        }
        else {
            return (<StoreRtnNtcBillViewPage pathname={this.props.location.pathname}
                entityUuid={this.props.storeRtnNtc.entityUuid} />);
        }
    }
}
