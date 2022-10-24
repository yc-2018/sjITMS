import React, { PureComponent } from 'react';
import { Button, Form, message, Modal, Popconfirm } from 'antd';
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { loginOrg, loginCompany } from '@/utils/LoginContext';
import { SimpleAutoComplete } from '@/pages/Component/RapidDevelopment/CommonComponent';
import { calculateMemberWage } from '@/services/cost/CostCalculation';
import { dynamicqueryById, dynamicDelete, dynamicQuery } from '@/services/quick/Quick';
import {
  savePlan
} from '@/services/sjtms/LineSystemHis';
@connect(({ quick, loading }) => ({
  quick,

  loading: loading.models.quick,
}))
@Form.create()
export default class LineShipAddressPlan extends QuickFormSearchPage {
  state = {
    ...this.state,
    tableHeight: 388.1,
    isNotHd: true,
    pageData: [],
    reasonModalVisible: false,
    deliveredDutyMdodalVisible: false,
    nocheckInfoVisible: false,
    checkRejectionResendMdodalVisible: false,
  };

  exSearchFilter = () => {
    this.getpageFilters();
  };
  componentWillReceiveProps(nextProps) {
    if (nextProps.lineuuid != this.props.lineuuid) {
      this.onSearch(this.state.params);
    }
  }

  getpageFilters =()=>{
    const param = {
      tableName: 'SJ_ITMS_LINE',
      condition: {
        params: [{ field: 'uuid', rule: 'eq', val: [this.props.lineuuid] }],
      },
    };
    let reslut ;
     dynamicqueryById(param).then(e=>{

      if(e.success){
        if (this.props.lineuuid) {
          reslut = [{field:"systemuuid", type:"VarChar", rule:"eq", val:e.result.records[0].SYSTEMUUID}];
        }
      }
    });
    return reslut;
    //pageFilters={{queryParams :[{field:"systemuuid", type:"VarChar", rule:"eq", val:"000000750000004"}]}}

  }


  //该方法会覆盖所有的上层按钮
  drawActionButton = () => {
    return (
      <>

      </>
    );
  };
  checkSave =async()=>{
    const {selectedRows} = this.state;
    if(selectedRows && selectedRows.length ==0){
      message.info("请至少选择一条记录");
    }
    const params = {
      addressIds:selectedRows.map(e=>{
        return e.UUID;
      }),
      lineuuid:this.props.lineuuid
    }
    await savePlan(params).then(result =>{
      if(result && result.success){
        message.success("添加成功");
        this.onSearch();
      }

    })
  }
  //该方法会覆盖所有的中间功能按钮
  drawToolbarPanel = () => {
    return (
      <div style={{ marginBottom: 10 }}>
       <Popconfirm
          title="确定添加?"
          onConfirm={this.checkSave}
          okText="确定"
          cancelText="取消"
          style={{ marginLeft: 10 }}
        >
          <Button type={'primary'} style={{ marginLeft: 10 }}>
            添加
          </Button>
        </Popconfirm>
      </div>
    );
  };
}