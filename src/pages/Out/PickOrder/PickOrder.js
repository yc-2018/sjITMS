import { PureComponent } from "react";
import { connect } from 'dva';
import Scheme from '@/components/MyComponent/Scheme';
import PickOrderSearchPage from './PickOrderSearchPage';
import { pickOrderLocale } from './PickOrderLocale'
import ExcelImport from '@/components/ExcelImport';
import {ImportTemplateType} from '@/pages/Account/ImTemplate/ImTemplateContants';


@connect(({ storepickorder, loading }) => ({
  storepickorder,
  loading: loading.models.storepickorder,
}))
export default class PickOrder extends PureComponent {
  handleExcelImportCallback = () => {
    this.props.dispatch({
      type: 'storepickorder/showPage',
      payload: {
        showPage: 'query'
      }
    });
  }

  render() {
    const { showPage, entityUuid, importAllocateOrderUuid } = this.props.storepickorder;
    const uploadParams = {
      schemeUuid: importAllocateOrderUuid,
    }
    if (showPage === 'query') {
      return <PickOrderSearchPage pathname={this.props.location.pathname}/>;
    }else if (showPage === 'import') {
      return <ExcelImport
        title={ImportTemplateType.STOREPICKORDER.caption}
        templateType ={ImportTemplateType.STOREPICKORDER.name}
        uploadParams={uploadParams}
        uploadType='storepickorder/batchImport'
        cancelCallback={this.handleExcelImportCallback}
        dispatch={this.props.dispatch}
      />;
    }
  }
}
