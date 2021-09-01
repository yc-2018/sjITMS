import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { Menu,Tabs,Button,message,Empty,Icon } from 'antd';
import emptySvg from '@/assets/common/img_empoty.svg';
import PageLoading from '@/components/PageLoading';
import SiderPage from '@/pages/Component/Page/SiderPage';
import ConfirmModal from '@/pages/Component/Modal/ConfirmModal';
import { loginCompany, loginOrg, loginUser } from '@/utils/LoginContext';
import { commonLocale } from '@/utils/CommonLocale';
import { havePermission } from '@/utils/authority';
import { convertCodeName } from '@/utils/utils';
import { PICKORDER_RES } from './PickOrderPermission';
import { pickOrderLocale } from './PickOrderLocale';
import PickOrderCreateForm from './PickOrderCreateForm';
import StorePickOrderPage from './StorePickOrderPage';
import PickOrderScheme from './PickOrderScheme';
import styles from './PickOrder.less';
import { getActiveKey} from '@/utils/LoginContext';

const TabPane = Tabs.TabPane;
const taskTypeMap = { delete: 'delete' };
const { SubMenu } = Menu;

@connect(({ storepickorder, loading }) => ({
  storepickorder,
  loading: loading.models.storepickorder,
}))
export default class PickOrderSearchPage extends SiderPage {

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
        borderRadius:'4px'
      },
      pickOrderSchemeList:[],// 当前企业下的方案们
      pickOrderList: [], //拣货顺序列表
      selectedSchme: {},
      selectedPickOrder: {}, //选中的一个拣货顺序
      selectedPickOrderSchme: {}, //选中的一个拣货顺序对应的方案
      showStoreView:false,
      createModalVisible:false,//新增 编辑顺序的modal
      operate: '',
      modalVisible: false,//确认删除提示框
      editPickOrder: {},//编辑所选的顺序

      openKeys:[],//当前展开值
      key: 'pickOrder.search.table'
    };
  }

  componentDidMount() {
    this.queryScheme();
  }

  componentWillReceiveProps(nextProps){
    if (nextProps.storepickorder.listSchemes&&nextProps.storepickorder.listSchemes.length > 0) {
      this.setState({
        pickOrderSchemeList: nextProps.storepickorder.listSchemes.length>0 ?nextProps.storepickorder.listSchemes:[],
      });
      if (nextProps.storepickorder.listSchemes!=this.props.storepickorder.listSchemes) {
        this.getPickOrderList(nextProps.storepickorder.listSchemes[0].uuid);
        this.setState({
          selectedSchme: nextProps.storepickorder.listSchemes[0],
        })
      }
    }else{
      this.setState({
        pickOrderSchemeList:[],
        selectedSchme: {},
      });
    }
    

    // 查询出当前方案下的全部拣货顺序
    if (nextProps.storepickorder.listOrders && nextProps.storepickorder.listOrders.data) {
      let data = nextProps.storepickorder.listOrders.data;
      let firstEntity = data[0];
      if (nextProps.storepickorder.listOrders!=this.props.storepickorder.listOrders) {
        //遍历方案 把顺序放入到方案里
        this.state.pickOrderSchemeList.map(scheme=>{
          if (!scheme.pickOrderList && scheme.uuid === firstEntity.schemeUuid) {
            scheme.pickOrderList = data;
            this.setState({
              selectedSchme: scheme
            })
          }
        });
        this.setState({
          pickOrderSchemeList: [...this.state.pickOrderSchemeList]
        })
      }
    }
  }

  /**
   * 查询当前企业下全部的方案
   */
  queryScheme = ()=>{
    this.setState({
      openKeys:[]
    });
    this.props.dispatch({
      type: 'storepickorder/listSchemes',
      payload: {
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid
      }
    });
  }

  /**
  * 查询当前方案下的所有拣货顺序
  */
  getPickOrderList = (defSchemeUuid) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'storepickorder/listOrders',
      payload: {
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid,
        schemeUuid: defSchemeUuid != '' ? defSchemeUuid:undefined
      }
    });
  }


  /**
   * 删除拣货顺序
   */
  handleRemovePickOrder = () => {
    const { dispatch } = this.props;
    const { selectedPickOrder } = this.state;
    dispatch({
      type: 'storepickorder/onRemoveOrder',
      payload: {
        uuid: selectedPickOrder.uuid,
        version: selectedPickOrder.version,
      },
      callback: response => {
        if (response && response.success) {
          message.success(commonLocale.removeSuccessLocale);
          this.queryScheme();
          this.setState({
            showStoreView:false
          })
        }
        this.setState({
          modalVisible: !this.state.modalVisible
        })
      },
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
    this.state.pickOrderSchemeList.map(scheme => {
      if (!scheme.pickOrderList && scheme.uuid === e.key) {
        this.getPickOrderList(e.key);
      }
      if (scheme.uuid === e.key){
        this.setState({
          showStoreView: false,
          selectedSchme:{...scheme}
        })
      }
    });
  }

  /**
   * 选中左侧二级菜单栏
   */
  handleClickMenuItem =(e,pickOrder)=>{
    this.setState({
      showStoreView:true,
      selectedPickOrder:pickOrder
    });
  }

  /**
   * 当鼠标浮在menu-item时调用
   */
  handleMouseEnterMenuItem =(e,pickOrder)=>{
    this.state.pickOrderSchemeList.map(scheme=>{
      if(scheme.uuid == pickOrder.schemeUuid){
        scheme.pickOrderList.map(order=>{
          if(order.uuid === e.key){
            order.display = 'inline'
          }
        })
      }
    });
    this.setState({
      pickOrderSchemeList:[...this.state.pickOrderSchemeList]
    })
  }
  /**
   * 当鼠标离开menu-item时调用
   */
  handleMouseLeaveMenuItem=(e,pickOrder)=>{
    this.state.pickOrderSchemeList.map(scheme => {
      if (scheme.uuid == pickOrder.schemeUuid) {
        scheme.pickOrderList.map(order => {
          if (order.uuid === e.key) {
            order.display = 'none'
          }
        })
      }
    });
    this.setState({
      pickOrderSchemeList: [...this.state.pickOrderSchemeList]
    })
  }

  /**
  * 渲染左侧菜单内容
  */
  renderSilderMenu = () => {
    const { pickOrderSchemeList } = this.state;
    let menuItems = [];
    pickOrderSchemeList.map((scheme) => {
      if(scheme.dcUuid===loginOrg().uuid){
        menuItems.push(
          <SubMenu
            onTitleClick={this.handleClickSubMenuItem}
            key={scheme.uuid}
            title={
              <span>
                <Icon type="folder"  style={{color: '#3B77E3' }}/>
                <span>{convertCodeName(scheme)}</span>
              </span>
            }
          >
            {
              scheme.pickOrderList ? scheme.pickOrderList.map(pickOrder=>{
                let entity={
                  uuid: pickOrder.uuid,
                  code: pickOrder.code,
                  name: pickOrder.name,
                }
                return <Menu.Item key = {pickOrder.uuid} 
                          onMouseEnter={(e)=>this.handleMouseEnterMenuItem(e,pickOrder)}
                          onMouseLeave={(e)=>this.handleMouseLeaveMenuItem(e,pickOrder)}
                          onClick={(e)=>this.handleClickMenuItem(e,pickOrder)}
                        >
                    <Icon type="swap" rotate={90} style={{color: '#3B77E3' }}/>
                    <span>{convertCodeName(entity)}</span>
                    {
                      pickOrder.display === 'inline'?
                        <span style = {{float: 'right'}}>
                          <a className={styles.menuItemA} 
                            onClick={()=>{this.handleCreateModalVisible(true,pickOrder,scheme)}}
                            disabled={!havePermission(PICKORDER_RES.EDIT)}
                          >
                            {commonLocale.editLocale}
                          </a>
                          &nbsp;
                          <a className={styles.menuItemA} 
                            onClick={()=>{this.handleModalVisible(commonLocale.deleteLocale,pickOrder)}}
                            disabled={!havePermission(PICKORDER_RES.DELETE)}
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


  /**
   * 显示拣货顺序方案新增界面
   */
  handleCreateScheme = () => {
    this.setState({
      selectedSchme:{},
      showStoreView:false,
    })
  }
  /**
   * 编辑拣货顺序的弹窗显示控制
   */
  handleCreateModalVisible = (flag, pickOrder,scheme) => {
    this.setState({
      createModalVisible: !!flag,
      editPickOrder: pickOrder,
    });
    if(scheme){
      this.setState({
        selectedPickOrderSchme: scheme
      })
    }
  };

  /**
  * 模态框显示/隐藏
  */
  handleModalVisible =(operate,pickOrder)=>{
    if (pickOrder){
      this.setState({
        selectedPickOrder: pickOrder
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
      this.handleRemovePickOrder();
    }
  }
  /**
   * 保存拣货顺序
   */
  handleSaveOrder = value => {
    const { dispatch } = this.props;
    let type = 'storepickorder/onSaveOrder';
    if (value.uuid) {
      type = 'storepickorder/onModifyOrder';
    }
    value['companyUuid'] = loginCompany().uuid;
    value['dcUuid'] = loginOrg().uuid;
    value.schemeUuid = value.schemeUuid
    dispatch({
      type: type,
      payload: value,
      callback: response => {
        if (response && response.success) {
          message.success(commonLocale.saveSuccessLocale);
          this.queryScheme();
          this.setState({
            createModalVisible: false,
          });
        }
      },
    });
  };

  // 重写部分 开始

  /**
   * 绘制菜单的右上角按钮
   */
  drawActionButton = () => {
    return (
      <Fragment>
        <Button type='primary' onClick={this.handleCreateScheme}
          disabled={!havePermission(PICKORDER_RES.CREATE)}
        >
          {pickOrderLocale.addScheme}
        </Button>
      </Fragment>
    )
  }

  /**
   * 绘制左侧导航栏
   */
  drawSider=()=>{
   return (
      <div>
        <div className={styles.navigatorPanelWrapper}>
          <span className={styles.title}>{pickOrderLocale.pickOrderScheme}</span>
          <div className={styles.action}>{this.drawActionButton()}</div>
        </div>
        <Menu
          defaultSelectedKeys={[this.state.selectedSchme?this.state.selectedSchme.uuid:'']}
          defaultOpenKeys = {[this.state.selectedSchme ? this.state.selectedSchme.uuid : '']}
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
   * 绘制右侧内容栏
   */
  drawContent=()=>{
    const {selectedSchme,showStoreView,selectedPickOrder} = this.state
    return(
      <div>
        {showStoreView?
          <StorePickOrderPage 
            selectedPickOrder={selectedPickOrder}
          />
          :<PickOrderScheme 
            scheme={selectedSchme.uuid?selectedSchme:undefined}
            reFreshSider={this.queryScheme}
            handleSaveOrder={this.handleSaveOrder}
          />
        }
      </div>
    );
  }
  
  /**
   * 绘制其他组件
   */
  drawOtherCom = () => {
    const { createModalVisible,selectedPickOrderSchme,editPickOrder,
      selectedPickOrder
    } = this.state;
    const createParentMethods = {
      handleSaveOrder: this.handleSaveOrder,
      handleCreateModalVisible: this.handleCreateModalVisible,
    };
    
    return (
      <div> 
        <PickOrderCreateForm
          {...createParentMethods}
          createModalVisible={createModalVisible}
          confirmLoading={false}
          pickOrder={editPickOrder}
          selectedSchme={selectedPickOrderSchme}
        />
       
        <div>
          <ConfirmModal 
            visible={this.state.modalVisible}
            operate={this.state.operate}
            object={pickOrderLocale.storeGroupTitle+':'+this.state.selectedPickOrder.name}
            onOk={this.handleOk}
            onCancel={this.handleModalVisible}
          />
        </div>
      </div>
    )
  }
  // 重写部分 结束
}