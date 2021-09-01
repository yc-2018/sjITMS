import { connect } from 'dva';
import React, { Component, Fragment } from 'react';
import DispatchReturnSearchPage from './DispatchReturnSearchPage';
import DispatchReturnAuditPage from './DispatchReturnAuditPage';
import { PRETYPE } from '@/utils/constants';
import FeeType from './FeeType';
import {dispatchReturnLocale} from './DispatchReturnLocale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { Spin } from 'antd';
@connect(({ dispatchReturn,feeType, loading }) => ({
  dispatchReturn,feeType,
  loading: loading.models.dispatchReturn,
}))
export default class DispatchReturn extends Component {
  constructor(props) {
    super(props);
    this.state = {
      types:undefined
    }
  }
  componentDidMount(){
    this.queryFeeType();
  }
  componentWillReceiveProps(nextProps){
    if(nextProps.feeType.data&&this.props.feeType.data!=nextProps.feeType.data){
      this.setState({
        types:nextProps.feeType.data.list
      })
    }
    if(this.props.dispatchReturn.showPage!=nextProps.dispatchReturn.showPage&&nextProps.dispatchReturn.showPage=='query'){
      this.queryFeeType();
    }
  }

  handleExcelImportCallback = () => {
    this.props.dispatch({
      type: 'dispatchReturn/showPage',
      payload: {
        showPage: 'query'
      }
    });
  }
  queryFeeType = ()=>{
    this.props.dispatch({
      type: 'feeType/query',
      payload: {
        page: 0,
        pageSize: 1000,
        sortFields: {},
        searchKeyValues: {
          companyUuid:loginCompany().uuid,
          dispatchCenterUuid:loginOrg().uuid,
        },
      },
    });
  }
  
  drawInfo=()=>{
    const { showPage,selectedRows } = this.props.dispatchReturn;

    if (showPage === 'query'&&this.state.types!=undefined) {
      return <DispatchReturnSearchPage pathname={this.props.location.pathname} types={this.state.types}/>;
    }else if (showPage === 'audit') {
      return <DispatchReturnAuditPage pathname={this.props.location.pathname} types={this.state.types} selectedRows = {selectedRows}/>;
    }else if (showPage === 'type') {
      return (<FeeType
        title={dispatchReturnLocale.feeTypeTitle}
        backToBefore={this.handleExcelImportCallback}
      />);
    }else {
      return null
    }
  }
  render() {
    const { showPage,selectedRows } = this.props.dispatchReturn;
    return <div>
      {this.drawInfo()}
    </div>;
  }
}
