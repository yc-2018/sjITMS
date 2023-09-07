import { PureComponent } from 'react';
import { connect } from 'dva';
import DCSearchPage from './DCSearchPage';
import DCCreatePage from './DCCreatePage';
import DCViewPage from './DCViewPage';

@connect(({ dc, loading }) => ({
    dc,
    loading: loading.models.dc,
}))
export default class DC extends PureComponent {

    render() {
        if (this.props.dc.showPage === 'query') {
            return <DCSearchPage pathname={this.props.location.pathname} />;
        } else if (this.props.dc.showPage === 'create') {
            return <DCCreatePage pathname={this.props.location.pathname} />
        } else if (this.props.dc.showPage === 'view') {
            return <DCViewPage pathname={this.props.location.pathname} />
        }
    }
}