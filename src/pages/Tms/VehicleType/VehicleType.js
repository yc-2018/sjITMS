import { PureComponent } from 'react';
import { connect } from 'dva';
import VehicleTypeCreatePage from './VehicleTypeCreatePage';
import VehicleTypeSearchPage from './VehicleTypeSearchPage';
import VehicleTypeViewPage from './VehicleTypeViewPage';

@connect(({ vehicleType, loading }) => ({
    vehicleType,
    loading: loading.models.vehicleType,
}))
export default class VehicleType extends PureComponent {

    render() {
        if (this.props.vehicleType.showPage === 'query') {
          return <VehicleTypeSearchPage pathname={this.props.location.pathname}/>;
        } else if (this.props.vehicleType.showPage === 'create')
          return <VehicleTypeCreatePage pathname={this.props.location.pathname}/>;
        else if (this.props.vehicleType.showPage === 'view')
          return <VehicleTypeViewPage pathname={this.props.location.pathname}/>
    }
}
