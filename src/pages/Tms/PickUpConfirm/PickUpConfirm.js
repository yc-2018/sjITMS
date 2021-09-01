import { connect } from 'dva';
import React, { Component, Fragment } from 'react';
import PickUpConfirmSearchPage from './PickUpConfirmSearchPage';
import { PRETYPE } from '@/utils/constants';
import {pickUpConfirmLocale} from './PickUpConfirmLocale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
@connect(({ pickUpConfirm, loading }) => ({
  pickUpConfirm,
  loading: loading.models.pickUpConfirm,
}))
export default class PickUpConfirm extends Component {
  
  render() {
    const { showPage,selectedRows } = this.props.pickUpConfirm;
    return <PickUpConfirmSearchPage pathname={this.props.location.pathname}/>;;
  }
}