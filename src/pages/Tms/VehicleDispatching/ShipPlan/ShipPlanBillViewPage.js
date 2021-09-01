import { connect } from 'dva';
import moment from 'moment';
import { Form, Select, Input, InputNumber, message, Modal, Row, Col, Tabs, Button, Icon } from 'antd';
import { commonLocale, notNullLocale, placeholderLocale, placeholderChooseLocale, tooLongLocale } from '@/utils/CommonLocale';
import { loginCompany, loginOrg, getDefOwner } from '@/utils/LoginContext';
import { orgType } from '@/utils/OrgType';
import { convertCodeName } from '@/utils/utils';
import { itemColWidth, colWidth } from '@/utils/ColWidth';
import FormPanel from '@/pages/Component/Form/FormPanel';
import CFormItem from '@/pages/Component/Form/CFormItem';
import Empty from '@/pages/Component/Form/Empty';
import UserSelect from '@/pages/Component/Select/UserSelect';
import SerialArchDispatchCenterSelect from '@/pages/Component/Select/SerialArchDispatchCenterSelect';
import { Type, MemberType } from '../../ShipPlanBillDispatch/ShipPlanBillDispatchContants';
import VehicleSelect from '../Utils/VehicleSelect';
import CreatePage from '../Utils/CreatePage';
import ItemEditTable from '../Utils/ItemEditTable';
import styles from '../VehicleDispatching.less';
import { vehicleDispatchingLocale } from '../VehicleDispatchingLocale';
import { Fragment } from 'react';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import SearchPage from '../Utils/SearchPage';
import { OrderBillPendingTag } from '../VehicleDispatchingContants';
const TabPane = Tabs.TabPane;
@connect(({ vehicleDispatching, shipPlanBillDispatch, loading }) => ({
  vehicleDispatching, shipPlanBillDispatch,
  loading: loading.models.vehicleDispatching,
}))
@Form.create()
export default class ShipPlanBillViewPage extends SearchPage {
  constructor(props) {
    super(props);
    this.state = {
      title: vehicleDispatchingLocale.createShipPlanBillTitle,
      entity: {
        companyUuid: loginCompany().uuid,
        dispatchCenterUuid: loginOrg().uuid,
        scheduleBillByDeliveryPoints: [],
        memberDetails: [],
      },
      vendor: {},
      selectedRows: [],
      selectedRowKeys: [],
      selectedRowsNest:{},
      selectedRowKeysForNest:[],
      expand: true,
      nestRowSelect: true,
      noFixed: true,
      selectedUserRows:[],
      selectedUserRowsKeys:[],
      data: [],
      createModalVisible: false,
      suspendLoading: false,
      width: "100%",
      key:'vehicleDispatchingShipPlanBill.search.page',
      pageFilter:{
        page: 0,
        pageSize: 20,
        sortFields: {},
        searchKeyValues: {},
        likeKeyValues: {}
      },
      scrollValue:{
        x:2000,
        y:400
      },
    }
    this.state.pageFilter.searchKeyValues.uuid = this.props.shipPlanBill.uuid;
  }
  componentDidMount() {
    this.setState({
      selectedRows:[],
      selectedRowsNest:{},
      selectedRowKeysForNest:[],
    })
    this.props.onRef && this.props.onRef(this);
    if (this.props.shipPlanBill && this.props.shipPlanBill.billNumber) {
      this.setState({
        title: vehicleDispatchingLocale.shipPlanBill + '：' + this.props.shipPlanBill.billNumber
      });
    }
    if (this.props.shipPlanBill) {
      this.refresh();
    }
  }
  componentWillReceiveProps(nextProps) {
    if ((nextProps.shipPlanBill && nextProps.shipPlanBill.uuid && nextProps.shipPlanBill != this.props.shipPlanBill)) {
      this.setState({
        title: vehicleDispatchingLocale.shipPlanBill + '：' + nextProps.shipPlanBill.billNumber,
      });
      this.refresh(nextProps.shipPlanBill.uuid)
    }
    if (nextProps.shipPlanBillDispatch.entity && nextProps.shipPlanBillDispatch.entity != this.props.shipPlanBillDispatch.entity) {
      this.setState({
        entity: nextProps.shipPlanBillDispatch.entity,
        data: {list: nextProps.shipPlanBillDispatch.entity.scheduleBillByDeliveryPoints},
        title: vehicleDispatchingLocale.shipPlanBill + '：' + nextProps.shipPlanBillDispatch.entity.billNumber,
        hasActionButton: false,
        // entity: nextProps.shipPlanBillDispatch.entity,
        // data: {list: nextProps.shipPlanBillDispatch.entity.orderDetails},
        // title: vehicleDispatchingLocale.shipPlanBill + '：' + nextProps.shipPlanBillDispatch.entity.billNumber,
        // hasActionButton: false,
      });
      // this.props.refreshShipPlanBill(nextProps.shipPlanBillDispatch.entity);
    }
  }
  getSelectedRows = (selectedRows, selectedRowKeys) => {
    this.setState({
      selectedRows: selectedRows,
      selectedRowKeys: selectedRowKeys
    })
  }
  getSelectedUserRows = (selectedRows, selectedRowKeys) => {
    this.setState({
      selectedUserRows: selectedRows,
      selectedUserRowsKeys: selectedRowKeys,
    })
  }
  handleRemove = () => {
    const { selectedRows, entity } = this.state;
    let orderBillNumberList = [];
    if (selectedRows.length == 0) {
      message.warning('请先选择行！');
      return;
    }
    selectedRows.forEach(row => {
      orderBillNumberList.push(...row.sourceNumbers);
    });
    this.props.dispatch({
      type: 'vehicleDispatching/removeorderfromschedule',
      payload: {
        orderBillNumberList: orderBillNumberList,
        scheduleUuid: entity.uuid,
      },
      callback: response => {
        if (response && response.success) {
          this.refresh(entity.uuid);
          this.setState({
            selectedRows: [],
            selectedRowKeys: [],
            selectedRowsNest:[]
          });
          this.props.onReFreshPending();
          this.props.onReFreshNormal();
          this.props.refreshShipPlanBillPage();
        }
      }
    })
  }
  refresh = (uuid) => {
    this.setState({
      selectedRows: [],
      selectedRowsKeys: [],
      selectedRowsNest:[],
      selectedRowKeysForNest:[]
    })
    this.props.dispatch({
      type: 'shipPlanBillDispatch/getDeliveryScheduleMerge',
      payload: uuid ? uuid : this.props.shipPlanBill.uuid,
      callback: response => {
      }
    });
  }
  onCancel = () => {
    this.props.dispatch({
      type: 'vehicleDispatching/showPage',
      payload: {
        showPage: 'queryShip'
      }
    });
  }
  handleFieldChange(e, fieldName, line) {
    const { entity } = this.state;
    if (fieldName === 'member') {
      let member = {
        uuid: JSON.parse(e).uuid,
        code: JSON.parse(e).code,
        name: JSON.parse(e).name,
      }
      entity.memberDetails[line - 1].member = member;
    } else if (fieldName === 'memberType') {
      entity.memberDetails[line - 1].memberType = e;
    }
    this.setState({
      entity: { ...entity }
    });
  }
  handleDown = (record) => {
    const { entity: { scheduleBillByDeliveryPoints } } = this.state;
    if (record.line == scheduleBillByDeliveryPoints.length) {
      message.warning('当前行已经是最后一行！');
      return;
    }
    this.props.dispatch({
      type: 'shipPlanBillDispatch/onAdjust',
      payload: {
        line: record.line,
        upDown: false,
        billUuid: this.state.entity.uuid,
      },
      callback: response => {
        if (response && response.success) {
          this.refresh(this.state.entity.uuid);
        }
      }
    })
  }
  handleUp = (record) => {
    if (record.line == 1) {
      message.warning('当前行已经是第一行！');
      return;
    }
    this.props.dispatch({
      type: 'shipPlanBillDispatch/onAdjust',
      payload: {
        line: record.line,
        upDown: true,
        billUuid: this.state.entity.uuid,
      },
      callback: response => {
        if (response && response.success) {
          this.refresh(this.state.entity.uuid);
        }
      }
    })
  }
  handleToNormal = ()=>{
    const { selectedRows,selectedRowsNest, entity } = this.state;
    let orderBillNumberList = [];
    if(selectedRows.length==0&&Object.keys(selectedRowsNest).length==0){
      message.warning('请先选择行！');
      return;
    }
    selectedRows.forEach(row=>{
      orderBillNumberList.push(...row.sourceNumbers);
    });
    for(let key in selectedRowsNest){
      selectedRowsNest[key].length>0&&selectedRowsNest[key].forEach(row=>{
        orderBillNumberList.push(row.billNumber);
      });
    }
    this.props.dispatch({
      type:'vehicleDispatching/removeorderfromschedule',
      payload: {
        orderBillNumberList:Array.from(new Set(orderBillNumberList)),
        scheduleUuid:entity.uuid
      },
      callback:response=>{
        if(response&&response.success){
          this.refresh(entity.uuid);
          this.setState({
            selectedRows: [],
            selectedRowKeys: [],
            selectedRowsNest:[],
            selectedRowKeysForNest:[]
          });
          this.props.onReFreshNormal();
          this.props.refreshShipPlanBillPage();
        }
      }
    })
  }
  columns = [
    {
      title: '操作',
      width: 110,
      render: record => {
        return <div className={styles.moveButton}>
          <Icon className={styles.down} type="down" onClick={() => this.handleDown(record)} />
          &nbsp;
          <Icon className={styles.up} type="up" onClick={() => this.handleUp(record)} />
        </div>
      }
    },
    {
      title: '序号',
      dataIndex: 'line',
      width: 110,
    },
    {
      title: '送货点',
      dataIndex: 'deliveryPoint',
      width: 220,
      render: val => {
        let data = {
          uuid: val.uuid,
          code: val.code,
          name: val.name,
        }
        return val ? <EllipsisCol colValue={convertCodeName(data)} /> : <Empty />
      }
    },
    {
      title: '线路',
      dataIndex: 'archLine.code',
      width: 200,
      sorter: (a, b) => {
        if (a.archLine && b.archLine && a.archLine.code < b.archLine.code) {
          return -1;
        } else if (a.archLine && b.archLine && a.archLine.code > b.archLine.code) {
          return 1;
        } else {
          return 0;
        }
      },
      sortDirections: ['descend', 'ascend'],
    },
    {
      title: '物流来源单号',
      dataIndex: 'sourceWmsNums',
      width: 130,
      render: val => val ? <EllipsisCol colValue={val.join('、')} /> : <Empty />
    },
    {
      title: vehicleDispatchingLocale.cartonCount,
      dataIndex: 'cartonCount',
      width: 130,
    },
    {
      title: vehicleDispatchingLocale.scatteredCount,
      dataIndex: 'scatteredCount',
      width: 130,
    },
    {
      title: vehicleDispatchingLocale.containerCount,
      dataIndex: 'containerCount',
      width: 150,
    },
    {
      title: vehicleDispatchingLocale.realCartonCount,
      dataIndex: 'realCartonCount',
      width: 150,
      render: (val, record) => val && val != 0 ? val : (record.realCartonCount != undefined ? record.realCartonCount : <Empty />)
    },
    {
      title: vehicleDispatchingLocale.realScatteredCount,
      dataIndex: 'realScatteredCount',
      width: 150,
      render: (val, record) => val && val != 0 ? val : (record.realScatteredCount != undefined ? record.realScatteredCount : <Empty />)
    },
    {
      title: vehicleDispatchingLocale.realContainerCount,
      dataIndex: 'realContainerCount',
      width: 150,
      render: (val, record) => val && val != 0 ? val : (record.containerCount != undefined ? record.containerCount : <Empty />)
    },
    {
      title: vehicleDispatchingLocale.volume,
      dataIndex: 'volume',
      width: 80,
    },
    {
      title: vehicleDispatchingLocale.weight,
      dataIndex: 'weight',
      width: 80,
    },
    {
      title: commonLocale.ownerLocale,
      dataIndex: 'owner',
      width: 150,
      render: val => val ? <EllipsisCol colValue={convertCodeName(val)} /> : <Empty />
    },
    {
      title: '订单数',
      width: 100,
      render: (val, record) => val ? <span >{record.sourceNumbers ? record.sourceNumbers.length : 0}</span> : <Empty />
    },
    {
      title: '单号',
      dataIndex: 'sourceNumbers',
      width: 200,
      render: val => val ? <EllipsisCol colValue={val.join('、')} /> : <Empty />
    }
  ];
  nestColumns = [
    {
      title: '物流来源单号',
      dataIndex: 'sourceWmsNum',
      width: 120,
      render: val => val ? val : <Empty/>
    },
    {
      title: '来源单号',
      dataIndex: 'sourceNumber',
      width: 120,
      render:(val,record)=> val?val:<Empty/>
    },
    {
      title: '运输单号',
      dataIndex: 'billNumber',
      width: 120,
      render:(val,record)=> val?val:<Empty/>
    },
    {
      title: vehicleDispatchingLocale.cartonCount,
      dataIndex: 'cartonCount',
      width: 100,
      render:(val,record)=>val!=undefined?<span  >{val}</span>:<Empty  />,
    },
    {
      title: vehicleDispatchingLocale.realCartonCount,
      dataIndex: 'realCartonCount',
      width: 110,
      render:(val,record)=>val&&val!=0?val:(record.realCartonCount!=undefined?record.realCartonCount:<Empty/>)
    },
    {
      title: vehicleDispatchingLocale.scatteredCount,
      dataIndex: 'scatteredCount',
      width: 110,
      render:(val,record)=>val!=undefined?<span  >{val}</span>:<Empty  />
    },
    {
      title: vehicleDispatchingLocale.realScatteredCount,
      dataIndex: 'realScatteredCount',
      width: 120,
      render:(val,record)=>val&&val!=0?val:(record.realScatteredCount!=undefined?record.realScatteredCount:<Empty/>)
    },
    {
      title: vehicleDispatchingLocale.volume,
      dataIndex: 'volume',
      width: 80,
      render:(val,record)=>val?<span  >{val}</span>:<Empty  />
    },
    {
      title: vehicleDispatchingLocale.weight,
      dataIndex: 'weight',
      width: 80,
      render:(val,record)=>val?<span  >{val}</span>:<Empty  />
    },
    {
      title: vehicleDispatchingLocale.containerCount,
      dataIndex: 'containerCount',
      width: 110,
      render:(val,record)=>val!=undefined?<span >{val}</span>:<Empty  />
    },
    {
      title: vehicleDispatchingLocale.realContainerCount,
      dataIndex: 'realContainerCount',
      width: 130,
      render:(val,record)=>val&&val!=0?val:(record.containerCount!=undefined?record.containerCount:<Empty/>)
    },
  ];
  /**
   * 绘制按钮
   */
  drawOther = () => {
    return <div style={{ marginBottom: '10px' }}>
      <Fragment>
        <Button onClick={() => this.handleToNormal()}>{'删除'}</Button>
      </Fragment>
    </div>
  }
}
