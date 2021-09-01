import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import PickareaSearchPage from './PickareaSearchPage';
import PickAreaCreatePage from './PickAreaCreatePage';
import PickAreaViewPage from './PickAreaViewPage.js';

@connect(({ pickArea, loading }) => ({
  pickArea,
  loading: loading.models.pickArea,
}))
export default class PickArea extends Component {
  render() {
    if (this.props.pickArea.showPage === 'query') {
      return <PickareaSearchPage pathname={this.props.location.pathname} />;
    } else if (this.props.pickArea.showPage === 'create') {
      return <PickAreaCreatePage pathname={this.props.location.pathname} />
    } else {
      return (<PickAreaViewPage entityUuid={this.props.pickArea.entityUuid} pathname={this.props.location.pathname} />);
    }
  }
}