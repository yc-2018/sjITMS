import { PureComponent, Component } from "react";
import { connect } from 'dva';
import WrhNewSearchPage from './WrhSearchPage';
import WrhCreatePage from './WrhCreatePage';
import WrhViewPage from './WrhViewDetail';

@connect(({ wrh, loading }) => ({
    wrh,
    loading: loading.models.wrh,
}))
export default class Wrh extends Component {
    render() {
        const { showPage, entityUuid, entity } = this.props.wrh;
        if (showPage === 'query')
            return (<WrhNewSearchPage pathname={this.props.location.pathname} />);
        else if (showPage === 'create')
            return (<WrhCreatePage entity={entity} pathname={this.props.location.pathname} />);
        else
            return (<WrhViewPage pathname={this.props.location.pathname} entityUuid={entityUuid}/>);
    }
}
