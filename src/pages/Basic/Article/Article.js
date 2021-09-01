import { PureComponent } from "react";
import { connect } from 'dva';
import ArticleSearchPage from './ArticleSearchPage';
import ArticleCreatePage from './ArticleCreatePage';
import ArticleViewPage from './ArticleViewPage';
import ExcelImport from '@/components/ExcelImport';
import PreType from '@/components/MyComponent/PreType';
import { PRETYPE } from '@/utils/constants';
import { articleLocale } from './ArticleLocale';
import { loginOrg } from '@/utils/LoginContext';
import { orgType } from '@/utils/OrgType';
import { importTemplateType } from '@/utils/ImportTemplateType';
import { ImportTemplateType } from '@/pages/Account/ImTemplate/ImTemplateContants';

@connect(({ article, loading }) => ({
  article,
  loading: loading.models.article,
}))
export default class Article extends PureComponent {

  showQuery = () => {
    this.props.dispatch({
      type: 'article/showPage',
      payload: {
        showPage: 'query'
      }
    });
  }

  render() {
    const {
      showPage,
      entityUuid,
      importType,
    } = this.props.article;

    const uploadParams = {
      type: importType,
    }

    if (this.props.location && this.props.location.toViewArticleUuid) {
      //  const viewPage = (<ArticleViewPage entityUuid={this.props.location.toViewArticleUuid} />);
      this.props.article.entityUuid = this.props.location.toViewArticleUuid;
      this.props.article.showPage = 'view';
      this.props.location.toViewArticleUuid = null;
      return (<ArticleViewPage entityUuid={this.props.article.entityUuid} pathname={this.props.location.pathname} />);
    } else if (showPage === 'query')
      return (<ArticleSearchPage pathname={this.props.location.pathname} />);
    else if (showPage === 'create')
      return (<ArticleCreatePage pathname={this.props.location.pathname} />);
    else if (showPage === 'import')
      return (<ExcelImport
        title={importTemplateType[importType].caption}
        templateType={importType}
        uploadType='article/batchImport'
        uploadParams={uploadParams}
        cancelCallback={this.showQuery}
        dispatch={this.props.dispatch}
      />);
    else if (showPage === 'unLoadAdvice')
      if (loginOrg().type === orgType.dc.name) {
        return (<PreType
          preType={PRETYPE['unLoadAdvice']}
          title={articleLocale.manageUnloadAdvice}
          backToBefore={this.showQuery}
        />);
      } else {
        return (<ArticleSearchPage pathname={this.props.location.pathname}/>);
      }
    else
      return (<ArticleViewPage entityUuid={entityUuid} pathname={this.props.location.pathname}/>);
  }
}
