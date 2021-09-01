import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import PutawaySearchPage from './PutawaySearchPage';
import PutawayCreatePage from './PutawayCreatePage';
import PutawayViewPage from './PutawayViewPage';

@connect(({ putaway, loading }) => ({
  putaway,
  loading: loading.models.putaway,
}))
export default class Putaway extends Component {
  render() {
    const { importTemplateUrl } = this.props.putaway;

    if (this.props.putaway.showPage === 'query') {
      return <PutawaySearchPage pathname={this.props.location.pathname} billNumber={this.props.putaway.billNumber}/>;
    } 
    else if (this.props.putaway.showPage === 'create') {
      return <PutawayCreatePage pathname={this.props.location.pathname} ownerUuid={this.props.putaway.ownerUuid} billNumber={this.props.putaway.billNumber}/>
    } 
    else {
      return (<PutawayViewPage pathname={this.props.location.pathname} entityUuid={this.props.putaway.entityUuid} billNumber={this.props.putaway.billNumber}/>);
    }
  }
}
