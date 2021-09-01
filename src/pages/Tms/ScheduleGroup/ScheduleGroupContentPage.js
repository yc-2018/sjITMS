import { PureComponent, Fragment } from "react";
import styles from '@/pages/Out/PickOrder/PickOrder.less';
import { Menu, Icon, Button, Form, Tabs,Table, message } from "antd";
import { connect } from 'dva';
import { convertCodeName } from "@/utils/utils";
import { loginCompany, loginOrg } from "@/utils/LoginContext";
import { commonLocale } from "@/utils/CommonLocale";
import IPopconfirm from "@/pages/Component/Modal/IPopconfirm";
import AddWaveModal from './AddWaveModal';
import Empty from "@/pages/Component/Form/Empty";
const TabPane = Tabs.TabPane;

@connect(({ scheduleGroup, loading }) => ({
  scheduleGroup,
  loading: loading.models.scheduleGroup,
}))
@Form.create()
export default class ScheduleGroupContentPage extends PureComponent {
  constructor(props){
    super(props)
    this.state={
      entity:props.entity?props.entity:{
        items:[]
      },
      addWaveModalVisible:false,
      selectedRowKeys:[],
      defSerialArch:{}
    }
  }
  componentDidMount(){
    this.getSerialArch();

    if(this.props.entity.uuid){
      this.refresh(this.props.entity.uuid)
    }
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.entity == undefined&&nextProps.entity!=this.props.entity){
      this.setState({
        entity:{
          items:[]
        }
      })
    }else if(nextProps.entity&&nextProps.entity.uuid&&nextProps.entity!=this.props.entity){
      this.setState({
        entity:nextProps.entity
      },()=>{
        this.refresh(nextProps.entity.uuid)
      })
    }

  }

  getSerialArch = ()=>{
    this.props.dispatch({
      type :'dispatchSerialArch/getSerialArch',
      callback:response=>{
        if(response&&response.success){
          this.setState({
            defSerialArch:response.data
          })
        }
      }
    })
  }

  async refresh(uuid){
    await this.props.dispatch({
      type:'scheduleGroup/get',
      payload:uuid,
      callback:response=>{
        if(response&&response.success&&response.data){
          this.setState({
            entity:response.data
          })
        }
      }
    })
  }

  handleAddWaveModalVisible =(flag)=>{
    this.setState({
      addWaveModalVisible:flag
    })
  }

  querySider =()=>{
    this.props.dispatch({
      type: 'scheduleGroup/query',
      callback:response=>{
        if(response&&response.success&&response.data){
          this.setState({
            scheduleGroupList:response.data
          });
        }
      }
    })
}

  handleBatchRemove = ()=>{
    const {selectedRowKeys,entity} = this.state;
    if(selectedRowKeys.length<1){
      message.warning('请先选择行');
      return;
    }
    this.props.dispatch({
      type:'scheduleGroup/deleteByUuids',
      payload:selectedRowKeys,
      callback:response=>{
        if(response&&response.success){
          message.success(commonLocale.removeSuccessLocale)
          this.refresh(this.state.entity.uuid);
          // this.props.queryAll(this.state.entity);
         this.querySider();
        }
      }
    })

  }
  onSelectChange = (selectedRowKeys, selectedRows) => {
    this.setState({
      selectedRowKeys,
      selectedRows: selectedRows
    });
  };
  handleRemoveWave = (record)=>{
    this.props.dispatch({
      type:'scheduleGroup/onRemove',
      payload:record,
      callback:response=>{
        if(response&&response.success){
          message.success(commonLocale.removeSuccessLocale)
          this.refresh(this.state.entity.uuid);
          // this.props.queryAll(this.state.entity);
          this.querySider();
        }
      }
    })
  }
  handleSaveWave = (record)=>{
    const { entity } = this.state;
    let type = '';
    let data = {
      companyUuid:loginCompany().uuid,
      dispatchCenterUuid:loginOrg().uuid,
      
    }
    data.items = [];
      record.forEach(item=>{
        data.items.push({
          waveNum:item
        });
      })
    if(entity&&entity.uuid){
      type = 'scheduleGroup/onModify';
      data.note = entity.note;
      data.scheduleGroupNum = entity.scheduleGroupNum;
      data.uuid = entity.uuid;
      data.version = entity.version;
    }else{
      type = 'scheduleGroup/onSave';
      
    }
    
    this.props.dispatch({
      type:type,
      payload:data,
      callback:response=>{
        if(response&&response.success){
          message.success('添加成功');
          if(entity&&entity.uuid){
            this.refresh(entity.uuid);
          }else{
            this.refresh(response.data).then(response=>{
              this.props.queryAll(this.state.entity);
            });
          }

          this.setState({
            addWaveModalVisible:false
          })

        }
      }
    })
  }
  columns = [
    {
      title:'波次号',
      dataIndex:'waveNum'
    },
    {
      title: commonLocale.operateLocale,
      width:100,
      render: (text, record) => (
        <Fragment>
          <IPopconfirm onConfirm={() => this.handleRemoveWave(record, true, false)}
            operate={commonLocale.deleteLocale}
            object={'波次'}>
            <a >
              {commonLocale.deleteLocale}
            </a>
          </IPopconfirm>
        </Fragment>
      ),
    },
  ]
  render() {
    const { entity,selectedRowKeys,addWaveModalVisible,defSerialArch } = this.state;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
    };
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };
    const addStoreModalProps = {
      entity: entity,
      confirmLoading: this.props.loading,
      dispatch: this.props.dispatch,
      addWaveModalVisible: addWaveModalVisible,
      handleAddWaveCancel: this.handleAddWaveModalVisible,
      handleSaveWave: this.handleSaveWave,
      component: 'scheduleGroup',
    }
    return (
      <div>
        <div style={{display:'flex',justifyContent:'space-between'}} className={styles.navigatorPanelWrapper}>
          <p style={{fontSize:'14px',fontWeight:600,marginLeft:'24px'}}>{entity&&entity.uuid?entity.scheduleGroupNum+'-'+((JSON.stringify(defSerialArch)=='{}'||defSerialArch==undefined)?'暂无默认线路':defSerialArch.name):'新建排车组'+'-'+((JSON.stringify(defSerialArch)=='{}'||defSerialArch==undefined)?'暂无默认线路':defSerialArch.name)}</p>
          <div>
            <Fragment>
              <Button type="primary" style={{marginRight:'6px'}}
                onClick={() => this.handleAddWaveModalVisible(true)}
              >
                添加波次
              </Button>
              <Button 
                onClick={() => this.handleBatchRemove(commonLocale.deleteLocale)}
              >
                {commonLocale.batchRemoveLocale}
              </Button>
            </Fragment>
          </div>
        </div>
        
        <div className={styles.content}>
              <Table
                rowKey={record => record.uuid}
                className={styles.standardTable}
                columns={this.columns}
                dataSource={entity.items}
                rowSelection={rowSelection}
              />
            
        </div>
        {addWaveModalVisible && <AddWaveModal {...addStoreModalProps} />}
      </div>
    );
  }
}
