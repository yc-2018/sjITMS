import React, { PureComponent } from 'react';
import { Button, Form, message, Modal, Popconfirm } from 'antd';
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { loginOrg, loginCompany } from '@/utils/LoginContext';
import { SimpleAutoComplete } from '@/pages/Component/RapidDevelopment/CommonComponent';
import { calculateMemberWage } from '@/services/cost/CostCalculation';
import { dynamicqueryById, dynamicDelete, dynamicQuery } from '@/services/quick/Quick';
import {
  savePlan,
  deleteAddressPlanByUuids,
  checkShipArea
} from '@/services/sjtms/LineSystemHis';
import { havePermission } from '@/utils/authority';
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
    noToolbar:false
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
  onBatchDelete  = async ()=>{
    const {selectedRows} = this.state;
    if(selectedRows && selectedRows.length ==0){
      message.info("请至少选择一条记录");
    }
   await deleteAddressPlanByUuids({uuids:selectedRows.map(e=>e.UUID)}).then(result =>{
      if(result.success){
        message.success("移除成功！");
        this.onSearch();
      }
    });

  }
  checkSave =async()=>{
    const {selectedRows} = this.state;
    const {lineuuid,ischeckArea} = this.props;
    if(selectedRows && selectedRows.length ==0){
      message.info("请至少选择一条记录");
    }
    const params = {
      addressIds: selectedRows.map(e=>{
        return e.UUID;
      }),
      lineuuid:lineuuid
    }
    if(ischeckArea){
      const shipArea = await checkShipArea(
        { lineuuid:lineuuid,
          addressIds:selectedRows.map(e=>e.STOREUUID)
        }
      );
      if(!shipArea.data){
        Modal.confirm({
          title:"存在门店配送区域不一致，确定加入到同一个线路吗？",
          onOk:()=> this.savePlan(params)
        })
        return;
      }
    }else{
      this.savePlan(params);
    }
    
  
   
  }

  savePlan = async(params)=>{
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
        <span style={{fontSize:14,fontWeigth:600}}>{'已选择：'+this.state.selectedRows.length}</span>
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
        <Popconfirm
          title="你确定要删除所选中的内容吗?"
          onConfirm={() => this.onBatchDelete()}
          okText="确定"
          cancelText="取消"
        >
          <Button >批量移除</Button>
          {/* //hidden={!havePermission(this.state.authority + '.delete')} */}
        </Popconfirm>
      </div>
    );
  };
}
