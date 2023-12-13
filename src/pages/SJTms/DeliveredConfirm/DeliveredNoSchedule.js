import React, { PureComponent } from 'react';
import { Button, Form, message, Modal, Popconfirm } from 'antd';
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { confirmOrder } from '@/services/sjtms/DeliveredConfirm';
import { loginOrg, loginCompany } from '@/utils/LoginContext';
import NocheckForm from './NoCheckForm';
import { SimpleAutoComplete } from '@/pages/Component/RapidDevelopment/CommonComponent';
import { calculateMemberWage } from '@/services/cost/CostCalculation';
@connect(({ quick, deliveredConfirm, loading }) => ({
  quick,
  deliveredConfirm,
  loading: loading.models.quick,
}))
@Form.create()
export default class DeliveredNoSchedule extends QuickFormSearchPage {
  state = {
    ...this.state,
    tableHeight: 388.1,
    isNotHd: true,
    pageData: [],
    reasonModalVisible: false,
    deliveredDutyMdodalVisible: false,
    nocheckInfoVisible: false,
    checkRejectionResendMdodalVisible: false,
    batchLoading: false,
    //selectRows中是否包含父类 默认falst
    parentRows: true,
  };




  
  changeState = () => {
    this.setState({
      isMerge: this.props.isMerge,
    });
  };
  
  };


   



