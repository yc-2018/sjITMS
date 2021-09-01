import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import RtnPutawayBillSearchPage from './RtnPutawayBillSearchPage';
import RtnPutawayBillCreatePage from './RtnPutawayBillCreatePage';
import RtnPutawayBillViewPage from './RtnPutawayBillViewPage';
@connect(({ rtnPutaway, loading }) => ({
    rtnPutaway,
    loading: loading.models.rtnPutaway,
}))
export default class RtnPutawayBill extends PureComponent {
    render() {
        if (this.props.rtnPutaway.showPage === 'query') {
            return <RtnPutawayBillSearchPage pathname={this.props.location.pathname}/>;
        } else if (this.props.rtnPutaway.showPage === 'create') {
            return <RtnPutawayBillCreatePage pathname={this.props.location.pathname}
                entityUuid={this.props.rtnPutaway.entityUuid} />
        } else if (this.props.rtnPutaway.showPage === 'view') {
            return <RtnPutawayBillViewPage pathname={this.props.location.pathname}/>
        }
    }
}