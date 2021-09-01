import { PureComponent } from 'react';
import { connect } from 'dva';
import CategorySearchPage from './CategorySearchPage';
import PreType from '@/components/MyComponent/PreType';
import { PRETYPE } from '@/utils/constants';
import ExcelImport from '@/components/ExcelImport';
import { categoryLocale } from './CategoryLocale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import CategoryCreatePage from './CategoryCreatePage';
import CategoryViewPage from './CategoryViewPage';
import {ImportTemplateType} from '@/pages/Account/ImTemplate/ImTemplateContants';
@connect(({ category, loading }) => ({
  category,
  loading: loading.models.category,
}))
export default class Category extends PureComponent {
  /**
   * 用于从类型界面返回
   */
  onCancelType = () => {
    this.props.dispatch({
      type: 'category/onCancelType',
    })
  }
  handleExcelImportCallback = () => {
    this.props.dispatch({
      type: 'category/showPage',
      payload: {
        showPage: 'query'
      }
    });
  }
  render() {
    const { importTemplateUrl, importType, } = this.props.category;

    const uploadParams = {
      type: ImportTemplateType.CATEGORY.name,
    }
    if (this.props.category.showPage === 'query') {
      return <CategorySearchPage pathname={this.props.location.pathname}/>;
    } else if (this.props.category.showPage === 'create') {
      return <CategoryCreatePage pathname={this.props.location.pathname}/>;
    } else if (this.props.category.showPage === 'view') {
      return <CategoryViewPage pathname={this.props.location.pathname}/>
    } else if (this.props.category.showPage === 'import') {
      return <ExcelImport
        title={ImportTemplateType.CATEGORY.caption}
        templateType ={ImportTemplateType.CATEGORY.name}
        uploadType='category/batchImport'
        // uploadParams={uploadParams}
        cancelCallback={this.handleExcelImportCallback}
        dispatch={this.props.dispatch}
      />;
    } else if (this.props.category.showPage === 'levelView') {
      return <PreType
        preType={PRETYPE['categoryLevel']}
        title={categoryLocale.levelTitle}
        backToBefore={
          () => {
            this.props.dispatch({
              type: 'category/onCancelType',
            })
          }
        }
      />
    }
  }
}
