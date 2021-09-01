import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { moveBillLocale } from './MoveBillLocale';
import PreType from '@/components/MyComponent/PreType';
import { PRETYPE } from '@/utils/constants';
import MoveBillSearchPage from './MoveBillSearchPage';
import MoveBillViewPage from './MoveBillViewPage';
import MoveBillCreatePage from './MoveBillCreatePage';

@connect(({ movebill, loading }) => ({
  movebill,
  loading: loading.models.movebill,
}))
export default class MoveBill extends Component {
  render() {
    if (this.props.movebill.showPage === 'query') {
      return <MoveBillSearchPage pathname={this.props.location.pathname} />;
    } else if (this.props.movebill.showPage === 'view') {
      return <MoveBillViewPage pathname={this.props.location.pathname} />;
    } else if (this.props.movebill.showPage === 'create') {
      return <MoveBillCreatePage pathname={this.props.location.pathname} />;
    } else if (this.props.movebill.showPage === 'reasonView') {
      return <PreType
        preType={
          PRETYPE['moveType']
        }
        title={moveBillLocale.moveTypeTitle}
        backToBefore={
          () => {
            this.props.dispatch({
              type: 'movebill/onCancelReason',
            })
          }
        }
      />
    }
  }
}