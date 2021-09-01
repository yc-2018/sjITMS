import { PureComponent } from 'react';
import { connect } from 'dva';
import VehicleCreatePage from './VehicleCreatePage';
import VehicleSearchPage from './VehicleSearchPage';
import VehicleViewPage from './VehicleViewPage';

@connect(({ vehicle, loading }) => ({
    vehicle,
    loading: loading.models.vehicle,
}))
export default class Vehicle extends PureComponent {

    render() {
        if (this.props.vehicle.showPage === 'query') {
          return <VehicleSearchPage pathname={this.props.location.pathname}/>;
        } else if (this.props.vehicle.showPage === 'create')
          return <VehicleCreatePage pathname={this.props.location.pathname}/>;
        else if (this.props.vehicle.showPage === 'view')
          return <VehicleViewPage pathname={this.props.location.pathname}/>
    }
}
