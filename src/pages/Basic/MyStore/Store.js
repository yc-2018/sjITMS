import { PureComponent } from 'react';
import { connect } from 'dva';
import StoreSearchPage from './StoreSearchPage';
import StoreCreatePage from './StoreCreatePage';
import StoreViewPage from './StoreViewPage';
import PreType from '@/components/MyComponent/PreType';
import { PRETYPE } from '@/utils/constants';
import ExcelImport from '@/components/ExcelImport';
import { ImportTemplateType } from '@/pages/Account/ImTemplate/ImTemplateContants';
import { storeLocale } from './StoreLocale';

@connect(({ store, loading }) => ({
  store,
  loading: loading.models.store,
}))
export default class Store extends PureComponent {
  /**
   * 用于从类型界面返回
   */
  onCancelType = () => {
    this.props.dispatch({
      type: 'store/onCancelType',
    })
  }
  handleExcelImportCallback = () => {
    this.props.dispatch({
      type: 'store/showPage',
      payload: {
        showPage: 'query'
      }
    });
  }
  render() {
    const { importTemplateUrl, importType, } = this.props.store;
    
    const uploadParams = {
      type: ImportTemplateType.STORE.name,
    }
    if (this.props.store.showPage === 'query') {
      return <StoreSearchPage pathname={this.props.location.pathname} />;
    } else if (this.props.store.showPage === 'create') {
      return <StoreCreatePage pathname={this.props.location.pathname} />
    } else if (this.props.store.showPage === 'view') {
      return <StoreViewPage pathname={this.props.location.pathname} />
    } else if (this.props.store.showPage === 'import') {
      return <ExcelImport
        title={ImportTemplateType.STORE.caption}
        templateType={ImportTemplateType.STORE.name}
        uploadType='store/batchImport'
        cancelCallback={this.handleExcelImportCallback}
        dispatch={this.props.dispatch}
      />;
    } else if (this.props.store.showPage === 'typeView') {
      return <PreType
        preType={PRETYPE['store']}
        title={storeLocale.typeTitle}
        backToBefore={
          () => {
            this.props.dispatch({
              type: 'store/onCancelType',
            })
          }
        }
      />
    } else if (this.props.store.showPage === 'operatingTypeView') {
      return <PreType
        preType={PRETYPE['storeOperating']}
        title={storeLocale.operatingTypeTitle}
        backToBefore={
          () => {
            this.props.dispatch({
              type: 'store/onCancelType',
            })
          }
        }
      />

    } else if (this.props.store.showPage === 'storeAreaView') {
      return <PreType
        preType={PRETYPE['storeArea']}
        title={'管理门店区域'}
        backToBefore={
          () => {
            this.props.dispatch({
              type: 'store/onCancelType',
            })
          }
        }
      />

    }
  }
}