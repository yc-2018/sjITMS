import { PureComponent } from "react";
import { Fragment } from 'react';
import { connect } from 'dva';
import { version } from "moment";
import { Menu, Button, message,Icon } from 'antd';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { commonLocale } from '@/utils/CommonLocale';
import StoreDeliverycycle from '@/pages/Out/Deliverycycle/StoreDeliverycycle/StoreDeliverycycle';
import SiderPage from '@/pages/Component/Page/SiderPage';
import ConfirmModal from '@/pages/Component/Modal/ConfirmModal';
import { convertCodeName } from '@/utils/utils';
import { havePermission } from '@/utils/authority';
import { DELIVERYCYCLE_RES } from './DeliverycyclePermission';
import { deliverycycleLocale } from './DeliverycycleLocale'
import DeliveryCyclePage from './DeliveryCyclePage';
import StoreGroupCreateForm from './StoreGroupCreateForm';
import styles from './Deliverycycle.less';
import { getActiveKey} from '@/utils/LoginContext';

const { SubMenu } = Menu;

@connect(({ deliverycycle, loading }) => ({
  deliverycycle,
  loading: loading.models.deliverycycle,
}))
export default class DeliverycycleSearchPage extends SiderPage {

  constructor(props) {
    super(props);
    this.state = {
      siderWidth:'348',
      style: {
        marginBottom: '-24px',
      },
      siderStyle:{
        boxShadow: '2px 0px 3px -1px rgba(59,119,227,0.24)',
        overflow: 'auto',
        minHeight: document.body.clientHeight<650?document.body.clientHeight : document.body.clientHeight-210,
        height:  '100%',
      },
      contentStyle:{
        marginLeft:'20px',
        borderRadius:'4px',
      },
      selectedRows: [],
      pageFilter: {
        page: 0,
        pageSize: 10,
        sortFields: {},
        searchKeyValues: {},
      },

      deliveryCycleList:[], // 当前企业下的配送周期们
      storeGroupList: [], //门店组列表
      selectedCycle: {},
      selectedStoreGroup:{},
      selectedStoreGroupCycle: {}, //选中的一个门店组对应的周期
      showGroupView: false,
      createModalVisible: false, //新增 编辑门店组的modal
      editStoreGroup:{},
      operate: '',
      modalVisible: false,

      openKeys:[],//当前展开值
      key: 'deliveryCycle.search.table'

    };
  }

  componentDidMount() {
    this.queryCycle();
  }

  componentWillReceiveProps(nextProps){
    if (nextProps.deliverycycle.cycleList) {
      this.setState({
        deliveryCycleList: nextProps.deliverycycle.cycleList.length > 0 ? nextProps.deliverycycle.cycleList : [],
      });
      if (nextProps.deliverycycle.cycleList != this.props.deliverycycle.cycleList) {
        this.getGroupList(nextProps.deliverycycle.cycleList[0].uuid);
        this.setState({
          selectedCycle: nextProps.deliverycycle.cycleList[0],
        })
      }
    }else{
      this.setState({
        deliveryCycleList: [],
        selectedCycle:{},
      })
    }

    // 查询出当前配送周期下的全部门店组
    if (nextProps.deliverycycle.groupList) {
      let data = nextProps.deliverycycle.groupList;
      let firstEntity = data[0];
      if (nextProps.deliverycycle.groupList != this.props.deliverycycle.groupList) {
        //遍历配送周期 把方案组放入到配送周期里
        this.state.deliveryCycleList.map(cycle => {
          if (!cycle.storeGroupList && cycle.uuid === firstEntity.deliveryCycleUuid) {
            cycle.storeGroupList = data;
            this.setState({
              selectedCycle: cycle
            })
          }
        });
        this.setState({
          deliveryCycleList: [...this.state.deliveryCycleList]
        })
      }
    }
  }

  /**
   * 查询当前企业下全部的配送周期
   */
  queryCycle = ()=>{
    this.setState({
      openKeys:[]
    });
    this.props.dispatch({
      type: 'deliverycycle/getDeliveryCycleList',
      payload: {
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid
      }
    });
  }

  /**
  * 查询当前配送周期下的所有门店组
  */
  getGroupList = (defCycleUuid) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'deliverycycle/getStoreGroups',
      payload: {
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid,
        deliveryCycleUuid: defCycleUuid != '' ? defCycleUuid : undefined
      }
    });
  }
  /**
   * 显示配送周期方案新增界面
   */
  handleCreateScheme = () => {
    this.setState({
      selectedCycle: {},
      showGroupView: false,
    })
  }

 /**
   * 编辑配送周期的弹窗显示控制
   */
  handleCreateModalVisible = (flag, storeGroup,cycle) => {
    this.setState({
      createModalVisible: !!flag,
      editStoreGroup: storeGroup,
    });
    if(cycle){
      this.setState({
        selectedStoreGroupCycle: cycle
      })
    }
  };

  /**
  * 模态框显示/隐藏
  */
  handleModalVisible =(operate,storeGroup)=>{
    if (storeGroup){
      this.setState({
        selectedStoreGroup: storeGroup
      })
    }
    if(operate){
      this.setState({
        operate:operate
      })
    }
    this.setState({
      modalVisible:!this.state.modalVisible
    });
  }
  /**
  * 模态框确认操作
  */
  handleOk = () =>{
    const {operate} = this.state;
    if (operate === commonLocale.deleteLocale){
      this.handleRemoveStoreGroup();
    }
  }
  /**
   * 保存门店组
   */
  handleSaveGroup  = value => {
    const { dispatch } = this.props;
    let type = 'deliverycycle/onSaveStoreGroup';
    if (value.uuid) {
      type = 'deliverycycle/onModifyStoreGroup';
    }
    value['companyUuid'] = loginCompany().uuid;
    value['dcUuid'] = loginOrg().uuid;
    value.deliveryCycleUuid = value.deliveryCycleUuid
    dispatch({
      type: type,
      payload: value,
      callback: response => {
        if (response && response.success) {
          message.success(commonLocale.saveSuccessLocale);
          this.queryCycle();
          this.setState({
            createModalVisible: false,
          });
        }
      },
    });
  };

  /**
   * 删除门店组
   */
  handleRemoveStoreGroup = () => {
    const { dispatch } = this.props;
    const { selectedStoreGroup } = this.state;
    dispatch({
      type: 'deliverycycle/onRemoveStoreGroup',
      payload: {
        uuid: selectedStoreGroup.uuid,
        version: selectedStoreGroup.version,
      },
      callback: response => {
        if (response && response.success) {
          message.success(commonLocale.removeSuccessLocale);
          this.queryCycle();
          this.setState({
            showGroupView:false
          })
        }
        this.setState({
          modalVisible: !this.state.modalVisible
        })
      },
    });
  }

  /**
  * 显示波次类型管理界面
  */
  onShowTypeView = () => {
    let { dispatch } = this.props;
    dispatch({
      type: 'deliverycycle/onShowTypeView',
    });
  }

  // 菜单相关---开始---
   /**
   * 展开/收回一级菜单栏
   */
  handleChangeMenuItem=(e)=>{
    this.setState({
      openKeys:e
    })
  }

  /**
   * 选中左侧一级菜单栏
   */
  handleClickSubMenuItem = (e) => {
    this.state.deliveryCycleList.map(cycle => {
      if (!cycle.storeGroupList && cycle.uuid === e.key) {
        this.getGroupList(e.key);
      }
      if (cycle.uuid === e.key){
        this.setState({
          showGroupView: false,
          selectedCycle:{...cycle}
        })
      }
    });
  }

  /**
   * 选中左侧二级菜单栏
   */
  handleClickMenuItem =(e,storeGroup)=>{
    this.setState({
      showGroupView:true,
      selectedStoreGroup:storeGroup
    });
  }

  /**
   * 当鼠标浮在menu-item时调用
   */
  handleMouseEnterMenuItem =(e,storeGroup)=>{
    this.state.deliveryCycleList.map(cycle=>{
      if(cycle.uuid == storeGroup.deliveryCycleUuid){
        cycle.storeGroupList.map(order=>{
          if(order.uuid === e.key){
            order.display = 'inline'
          }
        })
      }
    });
    this.setState({
      deliveryCycleList:[...this.state.deliveryCycleList]
    })
  }
  /**
   * 当鼠标离开menu-item时调用
   */
  handleMouseLeaveMenuItem=(e,storeGroup)=>{
    this.state.deliveryCycleList.map(cycle => {
      if (cycle.uuid == storeGroup.deliveryCycleUuid) {
        cycle.storeGroupList.map(order => {
          if (order.uuid === e.key) {
            order.display = 'none'
          }
        })
      }
    });
    this.setState({
      deliveryCycleList: [...this.state.deliveryCycleList]
    })
  }

  /**
  * 渲染左侧菜单内容
  */
  renderSilderMenu = () => {
    const { deliveryCycleList } = this.state;
    let menuItems = [];
    deliveryCycleList.map((cycle) => {
      if(cycle.dcUuid===loginOrg().uuid){
        menuItems.push(
          <SubMenu
            onTitleClick={this.handleClickSubMenuItem}
            key={cycle.uuid}
            title={
              <span>
                <Icon type="folder"  style={{color: '#3B77E3' }}/>
                <span>{convertCodeName(cycle)}</span>
              </span>
            }
          >
            {
              cycle.storeGroupList ? cycle.storeGroupList.map(storeGroup=>{
                let entity={
                  uuid: storeGroup.uuid,
                  code: storeGroup.code,
                  name: storeGroup.name,
                }
                return <Menu.Item key = {storeGroup.uuid} 
                          onMouseEnter={(e)=>this.handleMouseEnterMenuItem(e,storeGroup)}
                          onMouseLeave={(e)=>this.handleMouseLeaveMenuItem(e,storeGroup)}
                          onClick={(e)=>this.handleClickMenuItem(e,storeGroup)}
                        >
                    <Icon type="swap" rotate={90} style={{color: '#3B77E3' }}/>
                    <span>{convertCodeName(entity)}</span>
                    {
                      storeGroup.display === 'inline'?
                        <span style = {{float: 'right'}}>
                          <a className={styles.menuItemA} 
                            disabled={!havePermission(DELIVERYCYCLE_RES.EDIT)}
                            onClick={()=>{this.handleCreateModalVisible(true,storeGroup,cycle)}}
                          >
                            {commonLocale.editLocale}
                          </a>
                          &nbsp;
                          <a className={styles.menuItemA} 
                            disabled={!havePermission(DELIVERYCYCLE_RES.DELETE)}
                            onClick={()=>{this.handleModalVisible(commonLocale.deleteLocale,storeGroup)}}
                          >
                            {commonLocale.deleteLocale}
                          </a>
                        </span>:null
                    }
                  </Menu.Item>
              }):null
            }
          </SubMenu>
        )
      }
    });

    return menuItems;
  }

  // 菜单相关---结束---

  // 重写部分 开始

  /**
   * 绘制左侧导航栏
   */
  drawSider=()=>{
   return (
      <div>
        <div className={styles.navigatorPanelWrapper}>
          <span className={styles.title}>{deliverycycleLocale.title}</span>
          <div className={styles.action}>{this.drawActionButton()}</div>
        </div>
        <Menu
          defaultSelectedKeys={[this.state.selectedCycle?this.state.selectedCycle.uuid:'']}
          defaultOpenKeys = {[this.state.selectedCycle ? this.state.selectedCycle.uuid : '']}
          forceSubMenuRender={true}
          mode = 'inline'
          theme = 'light'
          style={{ marginTop:'5%',height: '95%',marginLeft:'-24px',width:'107%' }}
          onOpenChange={this.handleChangeMenuItem}
          openKeys={this.state.openKeys}
        >
          {this.renderSilderMenu()}
        </Menu>
      </div>
    );
  }
    /**
   * 绘制其他组件
   */
  drawOtherCom = () => {
    const { createModalVisible,selectedStoreGroupCycle,editStoreGroup,
      selectedStoreGroup
    } = this.state;
    const createParentMethods = {
      handleSaveGroup: this.handleSaveGroup,
      handleCreateModalVisible: this.handleCreateModalVisible,
    };
    
    return (
      <div> 
        <StoreGroupCreateForm
          {...createParentMethods}
          createModalVisible={createModalVisible}
          confirmLoading={false}
          storeGroup={editStoreGroup}
          selectedCycle={selectedStoreGroupCycle}
        />
       
        <div>
          <ConfirmModal 
            visible={this.state.modalVisible}
            operate={this.state.operate}
            object={deliverycycleLocale.storeGroupTitle+':'+selectedStoreGroup.name}
            onOk={this.handleOk}
            onCancel={this.handleModalVisible}
          />
        </div>
      </div>
    )
  }

  /**
   * 绘制右侧内容栏
   */
  drawContent = () => {
    const {selectedCycle,showGroupView,selectedStoreGroup,selectedStoreGroupCycle} = this.state
    return(
      <div>
        {
          showGroupView?
          <StoreDeliverycycle 
            selectedStoreGroup={selectedStoreGroup}
          />
          :
          <DeliveryCyclePage 
            cycle={selectedCycle.uuid?selectedCycle:undefined}
            reFreshSider={this.queryCycle}
            handleSaveGroup={this.handleSaveGroup}
          />
        }
      </div>
    );
  }


  /**
   * 绘制右上角按钮
   */
  drawActionButton = () => {
    return (
      <Fragment>
        <Button type='primary' onClick={this.handleCreateScheme} disabled={!havePermission(DELIVERYCYCLE_RES.CREATE)}>
          {deliverycycleLocale.addDeliverycycle}
        </Button>
      </Fragment>
    )
  }
    // 重写部分 结束
}