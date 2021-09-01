import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import TransportOrderSearchPage from './TransportOrderSearchPage';
import TransportOrderCreatePage from './TransportOrderCreatePage';
import TransportOrderViewPage from './TransportOrderViewPage';
import TransportOrderSplitPage from './TransportOrderSplitPage';
import { PRETYPE } from '@/utils/constants';
import ExcelImport from '@/components/ExcelImport';
import {ImportTemplateType} from '@/pages/Account/ImTemplate/ImTemplateContants';
import styles from './transportOrder.less';
import ExportConfigPage from './ExportConfigPage';
@connect(({ transportOrder, loading }) => ({
  transportOrder,
  loading: loading.models.transportOrder,
}))
export default class TransportOrder extends PureComponent {
  handleExcelImportCallback = () => {
    this.props.dispatch({
      type: 'transportOrder/showPage',
      payload: {
        showPage: 'query'
      }
    });
  }
  showQuery = () => {
    this.props.dispatch({
      type: 'transportOrder/showPage',
      payload: {
        showPage: 'query'
      }
    });
  }
  render() {
    if (this.props.transportOrder.showPage === 'query') {
      return(
        <div className={styles.searchForm}>
          <TransportOrderSearchPage pathname={this.props.location.pathname}/>;
        </div>
      )
    } else if (this.props.transportOrder.showPage === 'create') {
      return <TransportOrderCreatePage pathname={this.props.location.pathname}/>
    } else if (this.props.transportOrder.showPage === 'view') {
      return <TransportOrderViewPage pathname={this.props.location.pathname}/>
    } else if (this.props.transportOrder.showPage === 'split') {
      return <TransportOrderSplitPage pathname={this.props.location.pathname}/>
    } else if (this.props.transportOrder.showPage === 'exportCreate') {
      return <ExportConfigPage />;
    }else if (this.props.transportOrder.showPage === 'import') {
      return <ExcelImport
        title={ImportTemplateType.TMSORDERBILL.caption}
        templateType ={ImportTemplateType.TMSORDERBILL.name}
        uploadType='transportOrder/batchImport'
        cancelCallback={this.handleExcelImportCallback}
        dispatch={this.props.dispatch}
      />;
    }
  }
}
