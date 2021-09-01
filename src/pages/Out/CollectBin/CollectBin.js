import { PureComponent } from "react";
import { connect } from 'dva';
import CollectBinSearchPage from './CollectBinSearchPage';
import CollectBinCreatePage from './CollectBinCreatePage';
import CollectBinViewPage from './CollectBinViewPage';
import { collectBinLocale } from './CollectBinLocale';


@connect(({ collectBinScheme, loading }) => ({
  collectBinScheme,
  loading: loading.models.collectBinScheme,
}))
export default class CollectBin extends PureComponent {

  render() {
    const { showPage, entityUuid } = this.props.collectBinScheme;
    if (showPage === 'query') {
      return <CollectBinSearchPage pathname={this.props.location.pathname}/>;
    } else if (showPage === 'create') {
      return <CollectBinCreatePage pathname={this.props.location.pathname} entityUuid={entityUuid} />;
    }else {
      return (<CollectBinViewPage pathname={this.props.location.pathname} entityUuid={entityUuid}/>);
    }
  }
}