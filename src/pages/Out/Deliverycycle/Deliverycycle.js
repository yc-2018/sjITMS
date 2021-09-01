import { PureComponent } from "react";
import { connect } from 'dva';
import PreType from '@/components/MyComponent/PreType';
import { PRETYPE } from '@/utils/constants';
import DeliverycycleSearchPage from './DeliverycycleSearchPage';
import {deliverycycleLocale} from './DeliverycycleLocale'
import ExcelImport from '@/components/ExcelImport';
import {ImportTemplateType} from '@/pages/Account/ImTemplate/ImTemplateContants';


@connect(({ deliverycycle, loading }) => ({
  deliverycycle,
  loading: loading.models.deliverycycle,
}))
export default class Deliverycycle extends PureComponent {
  handleExcelImportCallback = () => {
    this.props.dispatch({
      type: 'deliverycycle/showPage',
      payload: {
        showPage: 'query'
      }
    });
  }
  render() {
    const { showPage, entityUuid, importStoreGroupUuid } = this.props.deliverycycle;
    const uploadParams = {
      deliveryCycleGroupUuid: importStoreGroupUuid,
    }
    if (showPage === 'query') {
      return <DeliverycycleSearchPage pathname={this.props.location.pathname}/>;
    }else if (showPage === 'deliverycycleTypeView') {
      return <PreType
        preType = {
          PRETYPE['deliverycycleType']
        }
        title = {deliverycycleLocale.deliverycyclePreserveWave}
        backToBefore = {
          () => {
            this.props.dispatch({
              type: 'deliverycycle/onCancelDeliverycycleType',
            })
          }
        }
      />
    }else if (this.props.deliverycycle.showPage === 'import') {
      return <ExcelImport
        title={ImportTemplateType.STOREDELIVERYCYCLE.caption}
        templateType ={ImportTemplateType.STOREDELIVERYCYCLE.name}
        uploadParams={uploadParams}
        uploadType='deliverycycle/batchImport'
        cancelCallback={this.handleExcelImportCallback}
        dispatch={this.props.dispatch}
      />;
    }
  }
}
