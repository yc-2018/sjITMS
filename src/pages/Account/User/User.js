import { PureComponent } from 'react';
import { connect } from 'dva';
import UserSearchPage from './UserSearchPage';
import UserCreatePage from './UserCreatePage';
import ExcelImport from '@/components/ExcelImport';
import { userLocale } from './UserLocale';
import {ImportTemplateType} from '@/pages/Account/ImTemplate/ImTemplateContants';
import UserViewPage from './UserViewPage';

@connect(({ user, loading }) => ({
    user,
    loading: loading.models.user,
}))
export default class User extends PureComponent {
  handleExcelImportCallback = () => {
    this.props.dispatch({
      type: 'user/showPage',
      payload: {
        showPage: 'query'
      }
    });
  }
  render() {
    const { importTemplateUrl,importType,entityUuid} = this.props.user;

    const uploadParams = {
      type: ImportTemplateType.USER.name,
    }
    if (this.props.user.showPage === 'query') {
      return <UserSearchPage pathname={this.props.location.pathname}/>;
    }else if (this.props.user.showPage === 'create') {
      return <UserCreatePage pathname={this.props.location.pathname}/>
    }else if (this.props.user.showPage === 'import') {
      return <ExcelImport
        title={ImportTemplateType.USER.caption}
        templateType ={ImportTemplateType.USER.name}
        // templateUrl={importTemplateUrl}
        uploadType='user/batchImport'
        cancelCallback={this.handleExcelImportCallback}
        dispatch={this.props.dispatch}
      />;
    }else{
      return <UserViewPage entityUuid={entityUuid} pathname={this.props.location.pathname}/>;
    }
  }
}
