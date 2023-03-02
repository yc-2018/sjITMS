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
import { Tabs, Button, Modal, Switch, message, Input } from 'antd';
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
  YDSiparea
} from '@/services/sjtms/LineSystemHis';
import { loginKey, loginCompany, loginOrg } from '@/utils/LoginContext';
import { havePermission } from '@/utils/authority';
import { throttleSetter } from 'lodash-decorators';
import LineSystem from './LineSystem.less';

export default class LineShipAddressSearchPage extends Component {
  state = {
    loading: false,
    lineApprovedVisible: false,
    approvedLoading: false,
    authority: this.props.authority,
  };
  componentDidMount() {
    this.setState({
      systemData: this.props.systemData,
      selectedKey: this.props.selectedKey,
      lineTreeData: this.lineTreeData,
      lineData: this.props.lineData,
      systemuuid: this.props.systemuuid,
    });
  }
  handleCancel = () => {};
  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedKey != this.props.selectedKey) {
      this.setState({ ...this.state, ...nextProps });
    }
  }
  /**
   * 批准
   * @param {} systemUuid
   * @param {*} systemData
   */
  onApproval = async (systemUuid, systemData) => {
    const status = systemData && systemData.STATUS == 'Approved' ? 'Revising' : 'Approved';
      if(loginOrg().uuid=='000000750000005' ||loginOrg().uuid=='000000750000005' ){
        await YDSiparea({systemUUID:systemUuid}).then(result =>{
          console.log(result);
          if(result.success && result.data?.length>0){
            Modal.confirm({
              title: result.data[0]+',存在不同的区域组合，确定批准吗?',
              onOk: () => {
                this.updateApprovedState(systemUuid, status, systemData);
              },
            });
          }
        
        })
       
      }else{
        await this.updateApprovedState(systemUuid, status, systemData);
      }
        
    
   
  };
  //取消批准并备份
  notApprovalAndBackup = async (systemUuid, systemData) => {
    this.setState({ approvedLoading: true });
    const status = systemData && systemData.STATUS == 'Approved' ? 'Revising' : 'Approved';
    if (status == 'Revising') {
      this.onBackupAndUpdateApproved(systemUuid, status, systemData);
    } else {
      message.error('状态异常');
    }
    //
  };

  onBackupAndUpdateApproved = async (systemUuid, status, systemData) => {
    const params = {
      systemUuid: this.state.selectedKey,
      note: '取消批准备份',
      companyUuid: loginCompany().uuid,
      dispatchcenterUuid: loginOrg().uuid,
    };
    await backupLineSystem(params).then(result => {
      if (result.success) {
        this.updateApprovedState(systemUuid, status, systemData);
        this.setState({ approvedLoading: false });
      } else {
        message.error('备份失败！');
      }
    });
  };

  updateApprovedState = async (systemUuid, state, systemData) => {
    this.setState({ loading: true });
    await updateState(systemUuid, state).then(result => {
      if (result.success) {
        message.success('操作成功');
        systemData.STATUS = state;
        this.setState({ systemData: systemData, loading: false, lineApprovedVisible: false });
        //this.queryLineSystem(systemUuid);
      }
    });
  };

  onInvalid = async (systemUuid, systemData) => {
    await updateState(systemUuid, 'Discard').then(result => {
      if (result && result.success) {
        message.success('作废成功！');
        systemData.STATUS = 'Discard';
        this.setState({ systemData: systemData });
        this.props.queryLineSystem();
      } else {
        message.error('作废失败！');
      }
    });
  };
  /**
   * 备份
   */
  onBackup = async bfValue => {
    const note = bfValue ? bfValue : this.state.bfValue;
    if (!note) {
      message.info('请填写备注');
      return;
    }
    const params = {
      systemUuid: this.state.selectedKey,
      note: note,
      companyUuid: loginCompany().uuid,
      dispatchcenterUuid: loginOrg().uuid,
    };
    this.setState({ loading: true });
    await backupLineSystem(params).then(result => {
      this.setState({ loading: false });
      if (result.success) {
        message.success('备份成功！');
        this.setState({ visible: false });
      } else {
        message.error('备份失败！');
      }
    });
  };

  swithChange = async (systemUuid, systemData) => {
    const enable = systemData && systemData.ISENABLE == 1 ? 0 : 1;
    isEnable(systemUuid, enable).then(result => {
      if (result && result.success) {
        message.success('操作成功！');
        systemData.ISENABLE = enable;
        this.setState({ systemData: systemData });
        //this.queryLineSystem(systemUuid);
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
  render() {
    const { systemData, selectedKey, lineTreeData, sdf, lineData, systemuuid } = this.state;
    return (
      <>
        {systemuuid && (
          <div>
            <div className={linesStyles.navigatorPanelWrapper}>
              <span className={linesStyles.sidertitle}>线路体系</span>
              <div className={linesStyles.action}>
                <Switch
                  hidden={!havePermission(this.state.authority + '.isOpen')}
                  checkedChildren="启用"
                  checked={systemData && systemData.ISENABLE == 1}
                  unCheckedChildren="禁用"
                  onClick={() => {
                    Modal.confirm({
                      title: systemData && systemData.ISENABLE == 1 ? '确定禁用?' : '确定启用',
                      onOk: () => {
                        this.swithChange(selectedKey, systemData);
                      },
                    });
                  }}
                />
                <Switch
                  hidden={!havePermission(this.state.authority + '.isApprove')}
                  checkedChildren="已批准"
                  checked={systemData && systemData.STATUS == 'Approved'}
                  unCheckedChildren="未批准"
                  onClick={
                    () => this.setState({ lineApprovedVisible: true })
                    // Modal.confirm({
                    //   title:
                    //     systemData && systemData.STATUS == 'Approved' ? '确定取消批准?' : '确定已批准?',
                    //     footer: <><Button>取消</Button><Button>确定</Button><Button>确定并备份</Button></>,
                    //     onOk: () => {
                    //     this.onApproval(
                    //       selectedKey,
                    //       systemData
                    //     );
                    //   },
                    // });
                  }
                />
                <Button
                  hidden={!havePermission(this.state.authority + '.abort')}
                  type="danger"
                  onClick={() => {
                    Modal.confirm({
                      title: '确定作废?',
                      onOk: () => {
                        this.onInvalid(selectedKey, systemData);
                      },
                    });
                  }}
                >
                  作废
                </Button>
                <Button
                  type="primary"
                  icon="plus"
                  onClick={() => this.lineCreatePageModalRef.show()}
                >
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
                <Button
                  type="primary"
                  onClick={() => {
                    this.setState({ visible: true });
                  }}
                >
                  配置对调线路
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
              title="对调线路配置"
              visible={this.state.visible}
              onOk={() => this.onBackup()}
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
            <Modal
              title={'提示'}
              visible={this.state.lineApprovedVisible}
              footer={
                <>
                  <Button onClick={() => this.setState({ lineApprovedVisible: false })}>
                    取消
                  </Button>
                  <Button type="primary" onClick={() => this.onApproval(selectedKey, systemData)}>
                    确定
                  </Button>
                  {systemData &&
                    systemData.STATUS == 'Approved' && (
                      <Button
                        type="primary"
                        loading={this.state.approvedLoading}
                        onClick={() => this.notApprovalAndBackup(selectedKey, systemData)}
                      >
                        确定并备份
                      </Button>
                    )}{' '}
                </>
              }
              //onOk={()=>this.onBackup()}
              onCancel={() => this.setState({ lineApprovedVisible: false })}
              loading={this.state.approvedLoading}
              onRef={node => (this.lineApprovedModalRef = node)}
            >
              {systemData && systemData.STATUS == 'Approved' ? '确定取消批准?' : '确定已批准?'}
            </Modal>
          </div>
        )}
        <div>
          <Tabs defaultActiveKey={'lineShipAddress'}  
          className = {!systemuuid&&LineSystem.tabsTop}>
            <TabPane tab="线路门店" key="1">
              <LineShipAddress
                key="lineShipAddress"
                quickuuid="sj_itms_line_shipaddress"
                lineuuid={selectedKey}
                lineTreeData={lineTreeData}
                systemLineFlag={systemuuid}
                //showadfa={() => this.queryLineSystem(this.state.selectLineUuid)}
                canDragTables={sdf && sdf.children ? false : true}
                linecode={
                  lineData?.length > 0 ? lineData?.find(x => x.uuid == selectedKey).code : ''
                }
                systemData={systemData}
              />
            </TabPane>
            {!systemuuid && (
              <TabPane tab="门店地图" key="2">
                <LineMap key="storeMap" lineuuid={selectedKey} />
              </TabPane>
            )}
          </Tabs>
        </div>
      </>
    );
  }
}
