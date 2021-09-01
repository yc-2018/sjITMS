import { Fragment, PureComponent } from 'react';
import { connect } from 'dva';
import { Menu, Tabs, Button, message, Empty, Input, Spin, Select,Icon } from 'antd';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { commonLocale, placeholderChooseLocale, notNullLocale } from '@/utils/CommonLocale';
import { convertCodeName } from '@/utils/utils';
import StockAllocateSchemeSelect from '@/pages/Component/Select/StockAllocateSchemeSelect';
import SiderPage from '@/pages/Component/Page/SiderPage';
import ConfirmModal from '@/pages/Component/Modal/ConfirmModal';
import PageLoading from '@/components/PageLoading';
import emptySvg from '@/assets/common/img_empoty.svg';
import { havePermission } from '@/utils/authority';
import { STOCKORDER_RES } from './StockOrderPermission';
import StoreStockOrderPage from './StoreStockOrderPage';
import StockOrderScheme from './StockOrderScheme';
import { stockOrderLocale } from './StockOrderLocale';
import StockOrderCreateForm from './StockOrderCreateForm';
import styles from './StockOrder.less';
import { getActiveKey} from '@/utils/LoginContext';

const TabPane = Tabs.TabPane;
const taskTypeMap = { delete: 'delete' };
const { SubMenu } = Menu;

@connect(({ stockAllocateOrder, loading }) => ({
  stockAllocateOrder,
  loading: loading.models.stockAllocateOrder,
}))
export default class StockOrderSearchPage extends SiderPage {
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
      stockOrderSchemeList:[],// 当前企业下的所有方案
      selectedSchme:{},//选中方案
      showStoreView:false, 
      selectedStockOrder:{},// 选中的一个库存分配顺序
      createModalVisible: false, //新增 编辑顺序的modal
      operate: '',
      modalVisible: false, //确认删除提示框
      editStockOrder: {}, //编辑所选的顺序

      openKeys:[],//当前展开值
      key: 'stockOrder.search.table'
    };
  }

  componentDidMount() {
    this.queryScheme();
  }
  
  componentWillReceiveProps(nextProps) {
    if (nextProps.stockAllocateOrder.data&&nextProps.stockAllocateOrder.data.length > 0) {
      this.setState({
        stockOrderSchemeList: nextProps.stockAllocateOrder.data.length>0 ?nextProps.stockAllocateOrder.data:[],
      });
      if (nextProps.stockAllocateOrder.data!=this.props.stockAllocateOrder.data) {
        this.getStockOrderList(nextProps.stockAllocateOrder.data[0].uuid);
        this.setState({
          selectedSchme: nextProps.stockAllocateOrder.data[0]
        })
      }
    }else{
      this.setState({
        stockOrderSchemeList:[],
        selectedSchme: {},
      });
    }

    // 查询出当前方案下的全部库存分配顺序
      if (nextProps.stockAllocateOrder.allocateOrders!=this.props.stockAllocateOrder.allocateOrders) {
        let data = nextProps.stockAllocateOrder.allocateOrders;
        let firstEntity = data.length>0?data[0]:data;
        //遍历方案 把顺序放入到方案里
        this.state.stockOrderSchemeList.map(scheme=>{
          if (!scheme.stockOrderList && scheme.uuid === firstEntity.schemeUuid) {
            scheme.stockOrderList = data;
            this.setState({
              selectedSchme: scheme
            })
          }
        });
        this.setState({
          stockOrderSchemeList: [...this.state.stockOrderSchemeList]
        })
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
      type: 'stockAllocateOrder/queryScheme',
      payload: {
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid
      }
    });
  }

  /**
  * 查询当前方案下的所有库存分配顺序
  */
  getStockOrderList = (defSchemeUuid) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'stockAllocateOrder/queryAllocateOrder',
      payload: {
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid,
        schemeUuid: defSchemeUuid != '' ? defSchemeUuid:undefined
      }
    });
  }

   /**
   * 显示 库存分配顺序方案新增界面
   */
  handleCreateScheme = () => {
    this.setState({
      selectedSchme: {},
      showStoreView:false
    })
  }

  /**
   * 编辑库存分配顺序的弹窗显示控制
   */
  handleCreateModalVisible = (flag, stockOrder,scheme) => {
    this.setState({
      createModalVisible: !!flag,
      editStockOrder: stockOrder,
    });
    if(scheme){
      this.setState({
        selectedStockOrderSchme: scheme
      })
    }
  };

  /**
  * 模态框显示/隐藏
  */
  handleModalVisible =(operate,stockOrder)=>{
    if (stockOrder){
      this.setState({
        selectedStockOrder: stockOrder
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
      this.handleRemoveStockOrder();
    }
  }

  /**
   * 删除库存分配顺序
   */
  handleRemoveStockOrder = () => {
    const { dispatch } = this.props;
    const { selectedStockOrder } = this.state;
    dispatch({
      type: 'stockAllocateOrder/removeAllocateOrder',
      payload: {
        uuid: selectedStockOrder.uuid,
        version: selectedStockOrder.version,
      },
      callback: response => {
        if (response && response.success) {
          message.success(commonLocale.removeSuccessLocale);
          this.queryScheme();
          this.setState({
            showStoreView: false
          })
        }
        this.setState({
          modalVisible: !this.state.modalVisible
        })
      },
    });
  }

  /**
   * 保存库存分配顺序
   */
  handleSaveOrder = value => {
    const { dispatch } = this.props;
    let type = 'stockAllocateOrder/saveAllocateOrder';
    if (value.uuid) {
      type = 'stockAllocateOrder/modifyAllocateOrder';
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
    this.state.stockOrderSchemeList.map(scheme => {
      if (!scheme.stockOrderList && scheme.uuid === e.key) {
        this.getStockOrderList(e.key);
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
  handleClickMenuItem =(e,stockOrder)=>{
    this.setState({
      showStoreView:true,
      selectedStockOrder:stockOrder
    });
  }

  /**
   * 当鼠标浮在menu-item时调用
   */
  handleMouseEnterMenuItem =(e,stockOrder)=>{
    this.state.stockOrderSchemeList.map(scheme=>{
      if(scheme.uuid == stockOrder.schemeUuid){
        scheme.stockOrderList.map(order=>{
          if(order.uuid === e.key){
            order.display = 'inline'
          }
        })
      }
    });
    this.setState({
      stockOrderSchemeList:[...this.state.stockOrderSchemeList]
    })
  }
  /**
   * 当鼠标离开menu-item时调用
   */
  handleMouseLeaveMenuItem=(e,stockOrder)=>{
    this.state.stockOrderSchemeList.map(scheme => {
      if (scheme.uuid == stockOrder.schemeUuid) {
        scheme.stockOrderList.map(order => {
          if (order.uuid === e.key) {
            order.display = 'none'
          }
        })
      }
    });
    this.setState({
      stockOrderSchemeList: [...this.state.stockOrderSchemeList]
    })
  }

  /**
   * 渲染菜单列表
   */
  renderSilderMenu = () => {
    const { stockOrderSchemeList } = this.state;
    let menuItems = [];
    stockOrderSchemeList.map((scheme) => {
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
              scheme.stockOrderList ? scheme.stockOrderList.map(stockOrder=>{
                let entity={
                  uuid: stockOrder.uuid,
                  code: stockOrder.code,
                  name: stockOrder.name,
                }
                return <Menu.Item key = {stockOrder.uuid} 
                          onMouseEnter={(e)=>this.handleMouseEnterMenuItem(e,stockOrder)}
                          onMouseLeave={(e)=>this.handleMouseLeaveMenuItem(e,stockOrder)}
                          onClick={(e)=>this.handleClickMenuItem(e,stockOrder)}
                        >
                    <Icon type="swap" rotate={90} style={{color: '#3B77E3' }}/>
                    <span>{convertCodeName(entity)}</span>
                    {
                      stockOrder.display === 'inline'?
                        <span style = {{float: 'right'}}>
                          <a className={styles.menuItemA} 
                            onClick={()=>{this.handleCreateModalVisible(true,stockOrder,scheme)}}
                            disabled={!havePermission(STOCKORDER_RES.EDIT)}
                          >
                            {commonLocale.editLocale}
                          </a>
                          &nbsp;
                          <a className={styles.menuItemA} 
                            onClick={()=>{this.handleModalVisible(commonLocale.deleteLocale,stockOrder)}}
                            disabled={!havePermission(STOCKORDER_RES.DELETE)}
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

  // 重写部分---开始----
  /**
   * 绘制左侧菜单栏
   */
  drawSider = () => {
    return (
      <div>
        <div className={styles.navigatorPanelWrapper}>
          <span className={styles.title}>{stockOrderLocale.title}</span>
          <div className={styles.action}>{this.drawActionButton()}</div>
        </div>
        <Menu
          defaultSelectedKeys={[this.state.stockOrderSchemeList.length>0?this.state.stockOrderSchemeList[0].uuid:'']}
          defaultOpenKeys = {[this.state.selectedSchme ? this.state.selectedSchme.uuid : '']}
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
   * 绘制菜单的右上角按钮
   */
  drawActionButton = () => {
    return (
      <Fragment>
        <Button type='primary' onClick={this.handleCreateScheme} disabled={!havePermission(STOCKORDER_RES.CREATE)}>
          {stockOrderLocale.addScheme}
        </Button>
      </Fragment>
    )
  }

  /**
   * 绘制右侧内容栏
   */
  drawContent=()=>{
    const {selectedSchme,showStoreView,selectedStockOrder} = this.state
    return(
      <div>
        {showStoreView?
          <StoreStockOrderPage 
            selectedStockOrder={selectedStockOrder}
          />
          :<StockOrderScheme 
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
    const { createModalVisible,selectedStockOrderSchme,editStockOrder,
      selectedStockOrder
    } = this.state;
    const createParentMethods = {
      handleSaveOrder: this.handleSaveOrder,
      handleCreateModalVisible: this.handleCreateModalVisible,
    };
    
    return (
      <div> 
        <StockOrderCreateForm
          {...createParentMethods}
          createModalVisible={createModalVisible}
          confirmLoading={false}
          stockOrder={editStockOrder}
          selectedSchme={selectedStockOrderSchme}
        />
       
        <div>
          <ConfirmModal 
            visible={this.state.modalVisible}
            operate={this.state.operate}
            object={stockOrderLocale.storeGroupTitle+':'+this.state.selectedStockOrder.name}
            onOk={this.handleOk}
            onCancel={this.handleModalVisible}
          />
        </div>
      </div>
    )
  }

  // 重写部分---结束----
}