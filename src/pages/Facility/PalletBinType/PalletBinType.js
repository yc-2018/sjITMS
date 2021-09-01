import { PureComponent } from 'react';
import { connect } from 'dva';
import PalletBinTypeSearchPage from './PalletBinTypeSearchPage';
import PalletBinTypeView from './PalletBinTypeView';
import PalletBinTypeCreate from './PalletBinTypeCreate';

@connect(({ palletBinType, loading }) => ({
  palletBinType,
  loading: loading.models.palletBinType,
}))
export default class PalletBinType extends PureComponent {

  render() {
    if (this.props.palletBinType.showPage === 'query') {
      return <PalletBinTypeSearchPage pathname={this.props.location.pathname} />;
    } else if (this.props.palletBinType.showPage === 'view') {
      return <PalletBinTypeView pathname={this.props.location.pathname} />;
    } else if (this.props.palletBinType.showPage === 'create') {
      return <PalletBinTypeCreate pathname={this.props.location.pathname} />;
    }
  }
}
