import { PureComponent } from 'react';
import { connect } from 'dva';
import DispatchCenterSearchPage from './DispatchCenterSearchPage';
import DispatchCenterCreatePage from './DispatchCenterCreatePage';
import DispatchCenterViewPage from './DispatchCenterViewPage';

@connect(({ dispatchCenter, loading }) => ({
  dispatchCenter,
  loading: loading.models.dispatchCenter,
}))
export default class DispatchCenter extends PureComponent {

    render() {
        if (this.props.dispatchCenter.showPage === 'query') {
            return <DispatchCenterSearchPage pathname={this.props.location.pathname} />;
        } 
        else if (this.props.dispatchCenter.showPage === 'create') {
            return <DispatchCenterCreatePage pathname={this.props.location.pathname} />
        } 
        else if (this.props.dispatchCenter.showPage === 'view') {
            return <DispatchCenterViewPage pathname={this.props.location.pathname} />
        }
    }
}