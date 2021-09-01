import { connect } from 'dva';
import React, { PureComponent, Fragment } from 'react';
import CheckReceiptSearchPage from './CheckReceiptSearchPage';
import { PRETYPE } from '@/utils/constants';
import PreType from '@/components/MyComponent/PreType';
import { loginOrg, getActiveKey } from '@/utils/LoginContext';
import { convertCodeName } from '@/utils/utils';
import { checkReceiptBillLocale } from './CheckReceiptBillLocale';
import { Checkbox, Input } from 'antd';
import { colWidth } from '@/utils/ColWidth';
import { commonLocale, placeholderLocale } from '@/utils/CommonLocale';
import { OrderBillType } from '../VehicleDispatching/VehicleDispatchingContants'

import Empty from '@/pages/Component/Form/Empty'
import PreTypeSelectForMore from '@/pages/Component/Select/PreTypeSelectForMore';
import styles from "../TransportOrder/transportOrder.less";
import TransportOrderSearchPage from "../TransportOrder/TransportOrderSearchPage";

@connect(({ checkReceiptBill, loading }) => ({
  checkReceiptBill,
  loading: loading.models.checkReceiptBill,
}))
export default class CheckReceiptBill extends PureComponent {
  constructor(props){
    super(props)
    this.state = {
      typeNames:[]
    }
  }
  handleExcelImportCallback = () => {
    this.props.dispatch({
      type: 'checkReceiptBill/showPage',
      payload: {
        showPage: 'query'
      }
    });
    this.queryPretype();
    
  }

  componentDidMount(){
    this.queryPretype();
  }

  queryPretype(){
    this.props.dispatch({
      type: 'pretype/queryType',
      payload: {
        preType: PRETYPE.dealMethod,
        orgUuid: loginOrg().uuid,
      },
      callback:response=>{
        if(response&&response.success){
          this.setState({
            typeNames:[...response.data]
          })
        }
      }
    });
  }
  render() {
    const { showPage } = this.props.checkReceiptBill;
    if (showPage === 'query') {
      return(
      <div className={styles.searchForm}>
        <CheckReceiptSearchPage pathname={this.props.location.pathname} typeNames={this.state.typeNames}/>
      </div>
      )
    }else if (showPage === 'type') {
      return (<PreType
        preType={PRETYPE.dealMethod}
        title={'回单处理方式'}
        backToBefore={this.handleExcelImportCallback}
      />);
		}
  }
}
