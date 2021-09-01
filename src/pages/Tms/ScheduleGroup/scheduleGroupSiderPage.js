import { PureComponent, Fragment } from "react";
import styles from '@/pages/Out/PickOrder/PickOrder.less';
import { Menu, Icon, Button, message } from "antd";
import { connect } from 'dva';
import { convertCodeName } from "@/utils/utils";
import { commonLocale, notNullLocale, tooLongLocale, placeholderLocale } from '@/utils/CommonLocale';
import { loginCompany, loginOrg } from "@/utils/LoginContext";
import { SerialArchLocale } from '../SerialArch/SerialArchLocale';
import ScheduleGroupEdit from './ScheduleGroupEdit';

const { SubMenu } = Menu;
@connect(({ scheduleGroup, loading }) => ({
  scheduleGroup,
  loading: loading.models.scheduleGroup,
}))
export default class ScheduleGroupSiderPage extends PureComponent {
  constructor(props){
    super(props);
    this.state = {
      openKeys:[],
      scheduleGroupList:[],
      selectedScheduleGroup:props.selectedScheduleGroup,
      createModalVisible: false,
      showGroup: false
    }

  }

  componentDidMount(){
    this.props.onRef && this.props.onRef(this);
    this.queryScheduleGroupList();
  }

  queryScheduleGroupList = (data)=>{
    this.props.dispatch({
      type: 'scheduleGroup/query',
      callback:response=>{
        if(response&&response.success&&response.data){
          this.setState({
            scheduleGroupList:response.data,
            selectedScheduleGroup:data?data:response.data[0]
          });
          this.props.handleSetSelectedScheduleGroup(data?data:response.data[0])
        }
      }
    })
  }

  handleClickMenuItem = (e,data)=>{
    this.setState({
      selectedScheduleGroup:data
    });
    this.props.handleSetSelectedScheduleGroup(data)
  }

  /**
   * 当鼠标浮在menu-item时调用
   */
  handleMouseEnterMenuItem = (e, data) => {
    this.state.scheduleGroupList.map(item => {
      if (item.uuid === e.key) {
        item.display = 'inline'
      }
    });
    this.setState({
      selectedScheduleGroup:data,
      scheduleGroupList: [...this.state.scheduleGroupList]
    })
  }
  /**
   * 当鼠标离开menu-item时调用
   */
  handleMouseLeaveMenuItem = (e, data) => {
    this.state.scheduleGroupList.map(item => {
      if (item.uuid === e.key) {
        item.display = 'none'
      }
    });
    this.setState({
      selectedScheduleGroup:data,
      scheduleGroupList: [...this.state.scheduleGroupList]
    })
  }

  /**
   * 编辑库存分配顺序的弹窗显示控制
   */
  handleCreateModalVisible = (flag, data) => {
    if(data) {
      this.setState({
        showGroup: true
      })
    } else {
      this.setState({
        showGroup: false
      })
    }
    this.setState({
      createModalVisible: !!flag,
      selectedScheduleGroup: data
    });
  };

  renderSilderMenu (){
    const {scheduleGroupList} = this.state;
    let menuItems = [];
    scheduleGroupList.forEach((item,index)=>{
      menuItems.push(
          <Menu.Item key = {item.uuid}
                   onMouseEnter={(e) => this.handleMouseEnterMenuItem(e, item)}
                   onMouseLeave={(e) => this.handleMouseLeaveMenuItem(e, item)}
          onClick={(e)=>this.handleClickMenuItem(e,item)}
        >
          <Icon type="folder" style={{color: '#3B77E3' }}/>
          <span>{'[' +item.scheduleGroupNum+']' + (item.note && item.note.length >10 ? item.note.slice(0,10)+"..." : item.note && (item.note.length < 10  || item.note.length === 10) ? item.note : '')}</span>
          {
            item.display === 'inline' ?
              <span style={{ float: 'right' }}>
                                            <a className={styles.menuItemA}
                                               onClick={() => { this.handleCreateModalVisible(true, item) }}
                                            >
                                                {'编辑'}
                                            </a>
                                        </span> : null
          }
          </Menu.Item>
      )
    });
    return menuItems;
  }

  handleCreateScheduleGroup = () => {
    this.props.dispatch({
      type:'scheduleGroup/onSave',
      payload:{
        companyUuid:loginCompany().uuid,
        dispatchCenterUuid:loginOrg().uuid,
        items:[]
      },
      callback:response=>{
        if(response&&response.success){
          if(response.data) {
            this.setState({
              uuid: response.data
            })
          }
          this.queryScheduleGroupList();
          this.handleCreateModalVisible(true, null)
        }
      }
    })
  }

  /**
   * 保存排车组号
   */
  handleSaveScheduleGroup = value => {
    const { dispatch } = this.props;
    const { selectedScheduleGroup, uuid } = this.state;
    let type = 'scheduleGroup/onModify';
    if(uuid) {
      value['uuid'] = uuid
    }
    value['companyUuid'] = loginCompany().uuid;
    value['dispatchCenterUuid'] = loginOrg().uuid;
    value['scheduleGroupNum'] = value.scheduleGroupNum;
    value['note'] = value.note;
    value['items'] = [];
    dispatch({
      type: type,
      payload: value,
      callback: response => {
        if (response && response.success) {
          message.success(commonLocale.saveSuccessLocale);
          this.queryScheduleGroupList();
          this.setState({
            createModalVisible: false,
          });
        }
      },
    });
  };

  render(){
    const {createModalVisible,selectedScheduleGroup,showGroup} = this.state;
    const createParentMethods = {
      handleScheduleGroup: this.handleScheduleGroup,
      handleCreateModalVisible: this.handleCreateModalVisible,
    };
    return <div>
      <div className={styles.navigatorPanelWrapper}>
        <span className={styles.title}>{'排车组号'}</span>
        <div className={styles.action}>
          <Fragment>
            <Button type='primary' onClick={this.handleCreateScheduleGroup}
            >
              新建排车组
            </Button>
        </Fragment>
        </div>

      </div>
      <Menu
        selectedKeys={[selectedScheduleGroup && selectedScheduleGroup.uuid ? selectedScheduleGroup.uuid : '']}
        forceSubMenuRender={true}
        mode = 'inline'
        theme = 'light'
        style={{ marginTop:'5%',height: '95%',marginLeft:'-24px',width:'107%' }}
      >
        {this.renderSilderMenu()}
      </Menu>
      <div>
        <ScheduleGroupEdit
          {...createParentMethods}
          createModalVisible={createModalVisible}
          confirmLoading={false}
          selectedScheduleGroup={selectedScheduleGroup}
          handleSaveScheduleGroup={this.handleSaveScheduleGroup}
          showGroup={showGroup}
        />
      </div>
    </div>
  }
}

