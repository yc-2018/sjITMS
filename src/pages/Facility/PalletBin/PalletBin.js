import { PureComponent } from 'react';
import { connect } from 'dva';
import PalletBinSearchPage from './PalletBinSearchPage';
import PalletBinViewPage from './PalletBinViewPage';

@connect(({ palletBin, loading }) => ({
    palletBin,
    loading: loading.models.palletBin,
}))
export default class PalletBin extends PureComponent {

    render() {
        if (this.props.palletBin.showPage === 'query') {
            return <PalletBinSearchPage pathname={this.props.location.pathname} />;
        } else if (this.props.palletBin.showPage === 'view') {
            return <PalletBinViewPage pathname={this.props.location.pathname} />
        }
    }
}
