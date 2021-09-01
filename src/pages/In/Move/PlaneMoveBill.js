import { PureComponent } from "react";
import { connect } from "dva";
import PlaneMoveBillSearchPage from './PlaneMoveBillSearchPage';
import PlaneMoveBillViewPage from './PlaneMoveBillViewPage';

@connect(({ planeMove, loading }) => ({
    planeMove,
    loading: loading.models.planeMove,
}))
export default class PlaneMoveBill extends PureComponent {

    render() {
        if (this.props.planeMove.showPage === 'query') {
            return <PlaneMoveBillSearchPage pathname={this.props.location.pathname}/>;
        } else {
            return <PlaneMoveBillViewPage pathname={this.props.location.pathname} entityUuid={this.props.planeMove.entityUuid} billNumber={this.props.planeMove.billNumber}/>
        }
    }
}
