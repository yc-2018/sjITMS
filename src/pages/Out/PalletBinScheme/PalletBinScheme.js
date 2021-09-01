import React, { PureComponent } from "react";
import { connect } from 'dva';
import PalletBinSchemeSearchPage from './PalletBinSchemeSearchPage';
import PalletBinSchemeCreatePage from './PalletBinSchemeCreatePage';
import PalletBinSchemeViewPage from './PalletBinSchemeViewPage';


@connect(({ palletBinScheme, loading }) => ({
  palletBinScheme,
  loading: loading.models.palletBinScheme,
}))
export default class PalletBinScheme extends PureComponent {

  render() {
    const { showPage, entityUuid } = this.props.palletBinScheme;
    if (showPage === 'query') {
      return <PalletBinSchemeSearchPage pathname={this.props.location.pathname}/>;
    } else if (showPage === 'create') {
      return <PalletBinSchemeCreatePage pathname={this.props.location.pathname} entityUuid={entityUuid} />;
    }else {
      return <PalletBinSchemeViewPage pathname={this.props.location.pathname} entityUuid={entityUuid}/>;
    }
  }
}
