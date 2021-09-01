import { PureComponent } from "react";
import { connect } from 'dva';
import CarrierSearchPage from './CarrierSearchPage';
import CarrierCreatePage from './CarrierCreatePage';
import CarrierViewPage from './CarrierViewPage';
import ExcelImport from '@/components/ExcelImport';
import { carrierLocale } from './CarrierLocale';
@connect(({ carrier, loading }) => ({
  carrier,
  loading: loading.models.carrier,
}))
export default class Carrier extends PureComponent {
  handleExcelImportCallback = () => {
    this.props.dispatch({
      type: 'carrier/showPage',
      payload: {
        showPage: 'query'
      }
    });
  }

  render() {
    const { showPage, entityUuid, importTemplateUrl } = this.props.carrier;
    if (showPage === 'query') {
      return <CarrierSearchPage pathname={this.props.location.pathname} />;
    } else if (showPage === 'create') {
      return <CarrierCreatePage pathname={this.props.location.pathname} />;
    } else if (showPage === 'view') {
      return <CarrierViewPage entityUuid={entityUuid} pathname={this.props.location.pathname} />;
    } else {
      return <ExcelImport
        title={carrierLocale.title}
        templateUrl={importTemplateUrl}
        uploadType='carrier/batchImport'
        cancelCallback={this.handleExcelImportCallback}
        dispatch={this.props.dispatch}
      />
    }
  }
}