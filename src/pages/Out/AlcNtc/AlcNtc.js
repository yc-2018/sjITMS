import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import AlcNtcSearchPage from './AlcNtcSearchPage';
import AlcNtcCreatePage from './AlcNtcCreatePage';
import AlcNtcViewPage from './AlcNtcViewPage';
import PreType from '@/components/MyComponent/PreType';
import { PRETYPE } from '@/utils/constants';
import {alcNtcLocale} from './AlcNtcLocale';
import ExcelImport from '@/components/ExcelImport';
import {ImportTemplateType} from '@/pages/Account/ImTemplate/ImTemplateContants';
@connect(({ alcNtc, loading }) => ({
  alcNtc,
  loading: loading.models.alcNtc,
}))
export default class AlcNtc extends PureComponent {
  handleExcelImportCallback = () => {
    this.props.dispatch({
      type: 'alcNtc/showPage',
      payload: {
        showPage: 'query'
      }
    });
  }
  showQuery = () => {
    this.props.dispatch({
      type: 'alcNtc/showPage',
      payload: {
        showPage: 'query'
      }
    });
  }
  render() {
    const { importTemplateUrl } = this.props.alcNtc;
    if (this.props.alcNtc.showPage === 'query') {
      return <AlcNtcSearchPage pathname={this.props.location.pathname}/>;
    } else if (this.props.alcNtc.showPage === 'create') {
      return <AlcNtcCreatePage pathname={this.props.location.pathname}/>
    } else if (this.props.alcNtc.showPage === 'view') {
      return <AlcNtcViewPage pathname={this.props.location.pathname}/>
    }else if (this.props.alcNtc.showPage === 'type') {
      return (<PreType
        preType={PRETYPE.alcNtcType}
        title={alcNtcLocale.type}
        backToBefore={this.showQuery}
      />);
		} else if (this.props.alcNtc.showPage === 'import') {
      return <ExcelImport
        // title={alcNtcLocale.title}
        // templateUrl={importTemplateUrl}
        title={ImportTemplateType.ALCNTCBILL.caption}
        templateType ={ImportTemplateType.ALCNTCBILL.name}
        uploadType='alcNtc/batchImport'
        cancelCallback={this.handleExcelImportCallback}
        dispatch={this.props.dispatch}
      />;
    }
  }
}
