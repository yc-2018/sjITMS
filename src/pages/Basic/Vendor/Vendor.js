import { PureComponent } from 'react';
import { connect } from 'dva';
import VendorSearchPage from './VendorSearchPage';
import VendorCreatePage from './VendorCreatePage';
import VendorViewPage from './VendorViewPage';
import { vendorLocale } from './VendorLocale';
import ExcelImport from '@/components/ExcelImport';
import {ImportTemplateType} from '@/pages/Account/ImTemplate/ImTemplateContants';
import PreType from '@/components/MyComponent/PreType';
import { PRETYPE } from '@/utils/constants';
@connect(({ vendor, loading }) => ({
  vendor,
  loading: loading.models.vendor,
}))
export default class Vendor extends PureComponent {
  handleExcelImportCallback = () => {
    this.props.dispatch({
      type: 'vendor/showPage',
      payload: {
        showPage: 'query'
      }
    });
  }
  render() {
    if (this.props.vendor.showPage === 'query') {
      return <VendorSearchPage pathname={this.props.location.pathname}/>;
    } else if (this.props.vendor.showPage === 'create') {
      return <VendorCreatePage pathname={this.props.location.pathname}/>
    } else if (this.props.vendor.showPage === 'view') {
      return <VendorViewPage pathname={this.props.location.pathname}/>
    } else if (this.props.vendor.showPage === 'import') {
      return <ExcelImport
        // title={vendorLocale.title}
        // templateUrl={this.props.vendor.importTemplateUrl}
        title={ImportTemplateType.VENDOR.caption}
        templateType ={ImportTemplateType.VENDOR.name}
        uploadType='vendor/batchImport'
        cancelCallback={this.handleExcelImportCallback}
        dispatch={this.props.dispatch}
      />
    } else if (this.props.vendor.showPage === 'unLoaderView') {
      return <PreType
        preType={PRETYPE['vendorUnLoader']}
        title={vendorLocale.unLoaderTitle}
        backToBefore={
          () => {
            this.props.dispatch({
              type: 'vendor/onCancelType',
            })
          }
        }
      />
    }
  }
}
