import { PureComponent } from 'react';
import { connect } from 'dva';
import ProcessingSchemeSearchPage from './ProcessingSchemeSearchPage';
import ProcessingSchemeCreatePage from './ProcessingSchemeCreatePage';
import ProcessingSchemeViewPage from './ProcessingSchemeViewPage';

@connect(({ processingScheme, loading }) => ({
  processingScheme,
  loading: loading.models.processingScheme,
}))
export default class PocessingScheme extends PureComponent {
  render() {
    const { importTemplateUrl,importType,} = this.props.processingScheme;
    if (this.props.processingScheme.showPage === 'query') {
      return <ProcessingSchemeSearchPage pathname={this.props.location.pathname}/>;
    }else if (this.props.processingScheme.showPage === 'create') {
      return <ProcessingSchemeCreatePage pathname={this.props.location.pathname}/>
    }else if (this.props.processingScheme.showPage === 'view') {
      return <ProcessingSchemeViewPage entityUuid={this.props.processingScheme.uuid} pathname={this.props.location.pathname}/>
    }
  }
}
