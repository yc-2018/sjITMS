import { PureComponent } from "react";
import { connect } from 'dva';
import SiderPage from "@/pages/Component/Page/SiderPage";
import styles from '@/pages/Out/PickOrder/PickOrder.less';
import ScheduleGroupSiderPage from "./scheduleGroupSiderPage";
import ScheduleGroupContentPage from "./ScheduleGroupContentPage";


@connect(({ scheduleGroup, loading }) => ({
  scheduleGroup,
  loading: loading.models.scheduleGroup,
}))
export default class ScheduleGroup extends SiderPage {
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
        height: '100%',
      },
      contentStyle:{
        marginLeft:'20px',
        borderRadius:'4px'
      },
      selectedScheduleGroup:{},
      showCreateView:false
  
    };
  }
  /**
   * 获取运输订单列表的具柄
   */
  onSiderRef = (ref)=>{
    this.siderRef=ref;
  }

  queryAllSider =(data)=>{
    this.siderRef&&this.siderRef.queryScheduleGroupList&&this.siderRef.queryScheduleGroupList(data);

  }

  handleSetSelectedScheduleGroup = (data)=>{
    if(data==undefined){
      this.setState
    }

    this.setState({
      selectedScheduleGroup:data,
      showCreateView:data==undefined?true:false
    })
  }

  /**
   * 绘制左侧导航栏
   */
  drawSider=()=>{
    return <ScheduleGroupSiderPage
      onRef={this.onSiderRef}
      selectedScheduleGroup={this.state.selectedScheduleGroup}
      handleSetSelectedScheduleGroup = {this.handleSetSelectedScheduleGroup}
    />
  }

    /**
   * 绘制右侧内容栏
   */
  drawContent=()=>{
    const { showCreateView } = this.state;
    return <ScheduleGroupContentPage
      entity = {this.state.selectedScheduleGroup}
      showCreateView = {showCreateView}
      queryAll = {this.queryAllSider}
    />
  }
}
