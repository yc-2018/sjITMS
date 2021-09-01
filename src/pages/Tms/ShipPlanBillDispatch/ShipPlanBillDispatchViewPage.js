import { connect } from 'dva';
import { Fragment } from 'react';
import moment from 'moment';
import { Button, Tabs, message, Tooltip, Row, Col } from 'antd';
import ViewPage from '@/pages/Component/Page/ViewPage';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import ViewTablePanel from '@/pages/Component/Form/ViewTablePanel';
import TagUtil from '@/pages/Component/TagUtil';
import Empty from '@/pages/Component/Form/Empty';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { convertCodeName } from '@/utils/utils';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { commonLocale,placeholderLocale } from '@/utils/CommonLocale';
import { Type, MemberType, State } from './ShipPlanBillDispatchContants';
import styles from './ShipPlanBillDispatch.less';
import ConfirmModal from '@/pages/Component/Modal/ConfirmModal';
import { shipPlanBillDispatchLocale } from './ShipPlanBillDispatchLocale';

const TabPane = Tabs.TabPane;

@connect(({ shipPlanBillDispatch, loading }) => ({
  shipPlanBillDispatch,
  loading: loading.models.shipPlanBillDispatch,
}))
export default class ShipPlanBillDispatchViewPage extends ViewPage {
  constructor(props) {
    super(props);
    this.state = {
      entity: {},
      entityUuid: props.shipPlanBillDispatch.entityUuid,
      title: '',
      operate: '',
      modalVisible: false,
    }
  }

  componentDidMount() {
    this.refresh();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.shipPlanBillDispatch.entity&&nextProps.shipPlanBillDispatch.entity!=this.props.shipPlanBillDispatch.entity) {
      this.setState({
        entity: nextProps.shipPlanBillDispatch.entity,
        entityUuid: nextProps.shipPlanBillDispatch.entity.uuid,
        title:shipPlanBillDispatchLocale.title+ ':' + nextProps.shipPlanBillDispatch.entity.billNumber,
      });
    }
    if(this.props.shipPlanBillDispatch.entityUuid!=nextProps.shipPlanBillDispatch.entityUuid){
      this.setState({
        entityUuid: nextProps.shipPlanBillDispatch.entityUuid,
      },()=>{
        this.refresh();
      });
    }
  }

  refresh() {
    const { entityUuid } = this.state;
    this.props.dispatch({
      type: 'shipPlanBillDispatch/get',
      payload: entityUuid
    });
  }

  onBack = () => {
    this.props.dispatch({
      type: 'shipPlanBillDispatch/showPage',
      payload: {
        showPage: 'query'
      }
    });
  }

  onEdit = () => {
    this.props.dispatch({
      type: 'shipPlanBillDispatch/showPage',
      payload: {
        showPage: 'create',
        entityUuid: this.state.entityUuid
      }
    });
  }


  onApprove = ()=>{
    const { entity } = this.state
    this.props.dispatch({
      type: 'shipPlanBillDispatch/onApprove',
      payload: {
        billUuid: entity.uuid,
        version: entity.version,

      },
      callback: (response) => {
        if (response && response.success) {
          this.refresh();
          message.success(commonLocale.approveSuccessLocale)
        }
      }
    })
    this.setState({
      modalVisible: !this.state.modalVisible
    });
  }
  onAbort = ()=>{
    const { entity } = this.state
    this.props.dispatch({
      type: 'shipPlanBillDispatch/onAbort',
      payload: {
        billUuid: entity.uuid,
        version: entity.version,

      },
      callback: (response) => {
        if (response && response.success) {
          this.refresh();
          message.success(commonLocale.abortSuccessLocale)
        }
      }
    })
    this.setState({
      modalVisible: !this.state.modalVisible
    });
  }
  onRollBack = ()=>{
    const { entity } = this.state
    this.props.dispatch({
      type: 'shipPlanBillDispatch/onRollBack',
      payload: {
        billUuid: entity.uuid,
        version: entity.version,
      },
      callback: (response) => {
        if (response && response.success) {
          this.refresh();
          message.success(commonLocale.rollBackSuccessLocale)
        }
      }
    })
    this.setState({
      modalVisible: !this.state.modalVisible
    });
  }


  /**
   * 模态框确认操作
   */
  handleOk = () => {
    const { operate } = this.state;
    if (operate === commonLocale.approveLocale) {
      this.onApprove();
    } else if (operate == shipPlanBillDispatchLocale.rollBack) {
      this.onRollBack();
    } else if (operate === commonLocale.abortLocale) {
      this.onAbort();
    }
  }
  drawStateTag = () => {
    if (this.state.entity.state) {
      return <TagUtil value={this.state.entity.state} />;
    }
  }

  /**
   * 模态框显示/隐藏
   */
  handleModalVisible = (operate) => {
    if (operate != undefined) {
      this.setState({
        operate: operate
      })
    }

    this.setState({
      modalVisible: !this.state.modalVisible
    });
  }


  drawActionButtion = () => {
    const {entity} = this.state;
    return (
      <Fragment>
        <Button onClick={this.onBack}>
          {commonLocale.backLocale}
        </Button>
        {(entity.stat === State.Saved.name||entity.stat === State.Approved.name)?<Button onClick={this.onEdit}>
          {commonLocale.editLocale}
        </Button>:null}
        {entity.stat === State.Saved.name?<Button onClick={() => this.handleModalVisible(commonLocale.approveLocale)} type="primary">
          {commonLocale.approveLocale}
        </Button>:null}
        {(entity.stat === State.Approved.name||entity.stat === State.Shiped.name
          ||entity.stat === State.Delivering.name||entity.stat === State.Returned.name
          )?<Button onClick={() => this.handleModalVisible(commonLocale.abortLocale)}>
          {commonLocale.abortLocale}
        </Button>:null}
        {entity.stat === State.Approved.name?<Button onClick={() => this.handleModalVisible(shipPlanBillDispatchLocale.rollBack)} >
          {shipPlanBillDispatchLocale.rollBack}
        </Button>:null}
      </Fragment>
    )
  }

  drawInfoTab = () => {
    const { entity } = this.state;

    const items = entity.items;

    let profileItems = [
      {
        label: shipPlanBillDispatchLocale.billNumber,
        value: entity.billNumber ? entity.billNumber : <Empty />
      },
      {
        label: shipPlanBillDispatchLocale.vehicle,
        value: entity.vehicle ? convertCodeName(entity.vehicle) : <Empty />
      },
      {
        label: shipPlanBillDispatchLocale.vehicleType,
        value: entity.vehicleType ? convertCodeName(entity.vehicleType) : <Empty />
      },
      {
        label: shipPlanBillDispatchLocale.carrier,
        value: entity.carrier ? convertCodeName(entity.carrier) : <Empty />
      },
      {
        label: shipPlanBillDispatchLocale.serialArch,
        value: entity.serialArch ? convertCodeName(entity.serialArch) : <Empty />
      },
      {
        label: shipPlanBillDispatchLocale.order,
        value: entity.order ? entity.order : <Empty />
      },
      {
        label: shipPlanBillDispatchLocale.type,
        value: entity.type ? Type[entity.type].caption: <Empty />
      },
      {
        label: shipPlanBillDispatchLocale.relationPlanBillNum,
        value: entity.relationPlanBillNum ? entity.relationPlanBillNum: <Empty />
      },
      {
        label: shipPlanBillDispatchLocale.oldBillNumber,
        value: entity.oldBillNumber ? entity.oldBillNumber: <Empty />
      },
    ];

    let orderDetailsCols = [
      {
        title: commonLocale.lineLocal,
        key: 'line',
        dataIndex:'line',
        width: itemColWidth.lineColWidth,
      },
      {
        title: shipPlanBillDispatchLocale.orderNumber,
        key: 'orderNumber',
        dataIndex:'orderNumber',
        width: 200,
      },
      {
        title: shipPlanBillDispatchLocale.pickUpPoint,
        key: 'pickUpPoint',
        dataIndex:'pickUpPoint',
        width: 200,
        render:val=>{
          let data;
          if(val){
            data = {
              uuid:val.uuid,
              code:val.code,
              name:val.name,
            }
            return val?convertCodeName(data):<Empty/>
          }
        }
      },
      {
        title: shipPlanBillDispatchLocale.deliveryPoint,
        key: 'deliveryPoint',
        dataIndex:'deliveryPoint',
        width: 200,
        render:val=>{
          let data;
          if(val){
            data = {
              uuid:val.uuid,
              code:val.code,
              name:val.name,
            }
            return val?convertCodeName(data):<Empty/>
          }
        }
      },
      {
        title: shipPlanBillDispatchLocale.cartonCount,
        key: 'cartonCount',
        dataIndex:'cartonCount',
        width: 100,
      },
      {
        title: '整箱数(复核)',
        key: 'realCartonCount',
        dataIndex:'realCartonCount',
        width: 100,
      },
      {
        title: shipPlanBillDispatchLocale.containerCount,
        key: 'containerCount',
        dataIndex:'containerCount',
        width: 100,
      },
      {
        title: shipPlanBillDispatchLocale.weight,
        key: 'weight',
        dataIndex:'weight',
        width: 100,
      },
      {
        title: shipPlanBillDispatchLocale.volume,
        key: 'volume',
        dataIndex:'volume',
        width: 100,
      },
    ];
    let memberDetailsCols = [
      {
        title: commonLocale.lineLocal,
        key: 'line',
        dataIndex:'line',
        width: itemColWidth.lineColWidth,
      },
      {
        title: shipPlanBillDispatchLocale.member,
        key: 'member',
        dataIndex:'member',
        width: itemColWidth.lineColWidth,
        render:val=>val?convertCodeName(val):<Empty/>
      },
      {
        title: shipPlanBillDispatchLocale.memberType,
        key: 'memberType',
        dataIndex:'memberType',
        width: itemColWidth.lineColWidth,
        render:val=>val?MemberType[val].caption:<Empty/>
      },
    ];

    let noteItems = [{
      value: entity.note
    }];
    let tabs = <Tabs className={styles.ItemTabs} defaultActiveKey="orderBill" >
      <TabPane tab={shipPlanBillDispatchLocale.orderDetails} key="orderBill">
        <ViewTablePanel
          title={commonLocale.itemsLocale}
          columns={orderDetailsCols}
          data={this.state.entity.orderDetails?this.state.entity.orderDetails:[]}
        />
      </TabPane>
      <TabPane tab={shipPlanBillDispatchLocale.memberDetails} key="member">
        <ViewTablePanel
          title={commonLocale.itemsLocale}
          columns={memberDetailsCols}
          data={this.state.entity.memberDetails?this.state.entity.memberDetails:[]}
        />
      </TabPane>
    </Tabs>;
    return (
      <TabPane key='basicInfo' tab={shipPlanBillDispatchLocale.title}>
        <ViewPanel items={profileItems} title={commonLocale.profileItemsLocale} />
        <ViewPanel children={tabs} title={commonLocale.itemsLocale} />
        <ViewPanel items={noteItems} title={commonLocale.noteLocale} />
      </TabPane>
    );
  }

  drawTabPanes = () => {
    let tabPanes = [
      this.drawInfoTab(),
    ];
    return tabPanes;
  }
  /**
   * 绘制订单状态tag
   */
  drawStateTag = () => {
    if (this.state.entity.stat) {
      return (
        <TagUtil value={this.state.entity.stat.toUpperCase()} />
      );
    }
  }
  drawOthers = () => {
    return (
      <div>
        <ConfirmModal
          visible={this.state.modalVisible}
          operate={this.state.operate}
          object={shipPlanBillDispatchLocale.title + ':' + this.state.entity.billNumber}
          onOk={this.handleOk}
          onCancel={this.handleModalVisible}
        />
      </div>
    );
  }
  
}
