/*
 * @Author: guankongjin
 * @Date: 2022-03-09 10:31:16
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-06-28 16:16:01
 * @Description: file content
 * @FilePath: \iwms-web\src\pages\SJTms\LineSystem\LineSystemSearchPage.js
 */
import React, { Component } from 'react';
import linesStyles from './LineSystem.less';
import {Tabs,Button,Modal,Switch,message,Input} from 'antd'
import CreatePageModal from '@/pages/Component/RapidDevelopment/OnlForm/QuickCreatePageModal';
import LineShipAddress from './LineShipAddress';
const { TabPane } = Tabs;
import LineMap from './LineMap';
import {
    findLineSystemTree,
    deleteLines,
    deleteLineSystemTree,
    backupLineSystem,
    isEnable,
    updateState,
    findLineSystemTreeByStoreCode,
}from '@/services/sjtms/LineSystemHis';
import { loginKey, loginCompany, loginOrg } from '@/utils/LoginContext';
import { throttleSetter } from 'lodash-decorators';

export default class LineShipAddressSearchPage extends Component {
   
    state ={
        loading :false
    }
    componentDidMount (){
        this.setState({
            systemData : this.props.systemData,
            selectedKey: this.props.selectedKey,
            lineTreeData :this.lineTreeData,
            lineData :this.props.lineData,
            systemLineFlag :this.props.systemLineFlag  
        })
    }
    handleCancel =()=>{

    }
  componentWillReceiveProps (nextProps){
    console.log("componentWillReceiveProps",nextProps);
    if(nextProps.selectedKey!=this.props.selectedKey){
        console.log("componentWi",nextProps);
        this.setState({...this.state,...nextProps})
    }
   
  }
  /**
   * 批准
   * @param {} systemUuid 
   * @param {*} systemData 
   */
  onApproval = async (systemUuid, systemData) => {
    const status = systemData && systemData.STATUS == 'Approved' ? 'Revising' : 'Approved';
    if(status =='Revising'){
        Modal.confirm({
            title:'取消批准，是否需要确定备份？',
            onOk:  () => {
                this.onBackupAndUpdateApproved(systemUuid,status,systemData);
            },
            onCancel :()=>{
                this.updateApprovedState(systemUuid,status,systemData);
            }
          })
    }else{
        this.updateApprovedState(systemUuid,status,systemData);
    }
  };
  onBackupAndUpdateApproved = async (systemUuid,status,systemData) =>{
    await this.onBackup("取消批准备份");
    await this.updateApprovedState(systemUuid,status,systemData);
  } 
  updateApprovedState = async (systemUuid,  state,systemData)=>{
    await updateState(systemUuid,  state).then(result => {
        if (result.success) {
          message.success('操作成功');
          systemData.STATUS = state;
          this.setState({systemData:systemData});
          //this.queryLineSystem(systemUuid);
        } else {
          message.error('操作成功');
        }
      });
  }
  
  onInvalid = async systemUuid => {
    await updateState(systemUuid, 'Discard').then(result => {
      if (result && result.success) {
        message.success('作废成功！');
        this.queryLineSystem();
      } else {
        message.error('作废失败！');
      }
    });
  };
  /**
   * 备份
   */
  onBackup = async (bfValue) => {
   const note =  bfValue?bfValue:this.state.bfValue;
   if(!note){
    message.info("请填写备注")
    return;
   }
    const params = {
      systemUuid: this.state.selectedKey,
      note: note,
      companyUuid: loginCompany().uuid,
      dispatchcenterUuid: loginOrg().uuid,
    };
    this.setState({loading:true})
    await backupLineSystem(params).then(result => {
        this.setState({loading:false})
      if (result.success) {
        message.success('备份成功！');
        this.setState({ visible: false });
      } else {
        message.error('备份失败！');
      }
    });
  };
  swithChange = async (systemUuid, enable) => {
    isEnable(systemUuid, enable).then(result => {
      if (result && result.success) {
        message.success('操做成功！');
        this.queryLineSystem(systemUuid);
      } else {
        message.error('操做失败！');
      }
    });
  };
  swithCom = async (system, selectedKeys) => {
    if (system) {
      const param = {
        tableName: 'SJ_ITMS_LINESYSTEM',
        condition: {
          params: [{ field: 'UUID', rule: 'eq', val: [selectedKeys] }],
        },
      };
      let isenable = await dynamicQuery(param);
      return isenable.result?.records[0];
    }
  };
    render(){
        console.log("redds",this.state);
        const {systemData,selectedKey,lineTreeData,sdf,lineData,systemLineFlag} = this.state;
        return <>
        {systemLineFlag && 
          <div>
          <div className={linesStyles.navigatorPanelWrapper}>
            <span className={linesStyles.sidertitle}>线路体系</span>
            <div className={linesStyles.action}>
              <Switch
                checkedChildren="启用"
                checked={systemData && systemData.ISENABLE == 1}
                unCheckedChildren="禁用"
                onClick={() => {
                  Modal.confirm({
                    title: systemData && systemData.ISENABLE == 1 ? '确定禁用?' : '确定启用',
                    onOk: () => {
                      this.swithChange(
                        selectedKey,
                        systemData && systemData.ISENABLE == 1 ? 0 : 1
                      );
                    },
                  });
                }}
              />
              <Switch
                checkedChildren="已批准"
                checked={systemData && systemData.STATUS == 'Approved'}
                unCheckedChildren="未批准"
                onClick={() => {
                  Modal.confirm({
                    title:
                      systemData && systemData.STATUS == 'Approved' ? '确定未批准?' : '确定已批准',
                    onOk: () => {
                      this.onApproval(
                        selectedKey,
                        systemData
                      );
                    },
                  });
                }}
              />
              <Button
                type="danger"
                onClick={() => {
                  Modal.confirm({
                    title: '确定作废?',
                    onOk: () => {
                      this.onInvalid(selectedKey);
                    },
                  });
                }}
              >
                作废
              </Button>
              <Button type="primary" icon="plus" onClick={() => this.lineCreatePageModalRef.show()}>
                添加路线
              </Button>
              <Button
                type="primary"
                onClick={() => {
                  this.setState({ visible: true });
                }}
               
              >
                备份
              </Button>
            </div>
          </div>
          <CreatePageModal
              modal={{
                title: '添加线路',
                width: 500,
                bodyStyle: { marginRight: '40px' },
                afterClose: this.handleCancel,
              }}
              page={{ quickuuid: 'sj_itms_create_lines', noCategory: true }}
              onRef={node => (this.lineCreatePageModalRef = node)}
            />
            <Modal
              title="备份"
              visible={this.state.visible}
              onOk={()=>this.onBackup()}
              onCancel={() => this.setState({ visible: false })}
              confirmLoading={this.state.loading}
            >
              备注：
              <Input
                style={{ width: 200 }}
                onChange={value => {
                  this.setState({ bfValue: value.target.value });
                }}
              />
            </Modal>
        </div>
        }
      <div>
      <Tabs defaultActiveKey={"lineShipAddress"}>
        <TabPane tab="线路门店" key="1">
          <LineShipAddress
            key="lineShipAddress"
            quickuuid="sj_itms_line_shipaddress"
            lineuuid={selectedKey}
            lineTreeData={lineTreeData}
            systemLineFlag = {systemLineFlag}
            //showadfa={() => this.queryLineSystem(this.state.selectLineUuid)}
            canDragTables={sdf && sdf.children ? false : true}
            linecode={
              lineData?.length > 0 ? lineData?.find(x => x.uuid == selectedKey).code : ''
            }
          />
        </TabPane>
       {!systemLineFlag && <TabPane tab="门店地图" key="2">
          <LineMap key="storeMap" lineuuid={selectedKey} />
        </TabPane>} 
      </Tabs>
      </div>
    
      </>
    }
}
