import { PureComponent } from 'react';
import { connect } from 'dva';
import OwnerSearchPage from './OwnerSearchPage';
import OwnerCreatePage from './OwnerCreatePage';
import OwnerViewPage from './OwnerViewPage';
import ExcelImport from '@/components/ExcelImport';
import { importTemplateType } from '@/utils/ImportTemplateType';
@connect(({ owner, loading }) => ({
  owner,
  loading: loading.models.owner,
}))
export default class Owner extends PureComponent {
  showQuery = () => {
    this.props.dispatch({
      type: 'owner/showPage',
      payload: {
        showPage: 'query'
      }
    });
  }
  render() {
    const { importType,showPage } = this.props.owner;
    const uploadParams = {
      type: importType,
    }
    if (showPage === 'query') {
      return <OwnerSearchPage pathname={this.props.location.pathname} />;
    } else if (showPage === 'create' ) {
      return <OwnerCreatePage pathname={this.props.location.pathname} />
    } else if (showPage === 'view') {
      return <OwnerViewPage pathname={this.props.location.pathname} />
    }else if (showPage === 'import'){
      return (<ExcelImport
        title={importTemplateType[importType].caption}
        templateType={importType}
        uploadType='owner/batchImport'
        uploadParams={uploadParams}
        cancelCallback={this.showQuery}
        dispatch={this.props.dispatch}
      />);
    }
  }
}