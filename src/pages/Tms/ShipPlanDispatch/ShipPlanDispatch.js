import { PureComponent } from 'react';
import { connect } from 'dva';
import ShipPlanDispatchMainPage from './ShipPlanDispatchMainPage';
import ShipplandispatchPanel from './ShipPlanDispatchPanel';
import ShipPlanDeliveryTaskPage from './ShipPlanDeliveryTaskPage';

@connect(({ shipPlanDispatch, loading }) => ({
    shipPlanDispatch,
    loading: loading.models.shipPlanDispatch,
}))
export default class ShipPlanDispatch extends PureComponent {

    render() {
        if (this.props.shipPlanDispatch.showPage === 'query') {
            return <ShipplandispatchPanel />;
        }else if (this.props.shipPlanDispatch.showPage === 'deliveryTaskView') {
            return <ShipPlanDeliveryTaskPage />;
        }
    }
}