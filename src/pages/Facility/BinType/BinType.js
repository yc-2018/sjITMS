import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import BinTypeSearchPage from './BinTypeSearchPage';
import BinTypeCreatePage from './BinTypeCreatePage';
import BinTypeViewPage from './BinTypeViewPage';

@connect(({ binType, loading }) => ({
    binType,
    loading: loading.models.binType,
}))
export default class BinType extends PureComponent {
    render() {
        if (this.props.binType.showPage === 'query') {
return <BinTypeSearchPage pathname={this.props.location.pathname} />;
        } else if (this.props.binType.showPage === 'create') {
return <BinTypeCreatePage pathname={this.props.location.pathname} />
        } else if (this.props.binType.showPage === 'view') {
 return <BinTypeViewPage pathname={this.props.location.pathname} />
        }
    }
}