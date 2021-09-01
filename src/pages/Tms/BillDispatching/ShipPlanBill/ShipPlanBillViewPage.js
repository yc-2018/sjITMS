import { connect } from 'dva';
import moment from 'moment';
import { Form, Select, Input, InputNumber, message,Modal, Row, Col, Tabs, Button, Icon } from 'antd';
import { commonLocale, notNullLocale, placeholderLocale, placeholderChooseLocale,tooLongLocale } from '@/utils/CommonLocale';
import { loginCompany, loginOrg, getDefOwner } from '@/utils/LoginContext';
import { orgType } from '@/utils/OrgType';
import { convertCodeName } from '@/utils/utils';
import { itemColWidth, colWidth } from '@/utils/ColWidth';
import FormPanel from '@/pages/Component/Form/FormPanel';
import CFormItem from '@/pages/Component/Form/CFormItem';
import Empty from '@/pages/Component/Form/Empty';
import UserSelect from '@/pages/Component/Select/UserSelect';
import SerialArchDispatchCenterSelect from '@/pages/Component/Select/SerialArchDispatchCenterSelect';
import styles from '../BillDispatching.less';
import { Fragment } from 'react';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import CreatePage from '../../VehicleDispatching/Utils/CreatePage';
import { vehicleDispatchingLocale } from '../../VehicleDispatching/VehicleDispatchingLocale';
import ItemEditTable from '../../VehicleDispatching/Utils/ItemEditTable';
import { MemberType } from '../../ShipPlanBillDispatch/ShipPlanBillDispatchContants';
import { accDiv, accMul } from '@/utils/QpcStrUtil';
import { TaskType } from '../../VehicleDispatching/VehicleDispatchingContants';
import StandardTable from '@/components/StandardTable';

const TabPane = Tabs.TabPane;

@connect(({ billDispatching,shipPlanBillDispatch, loading }) => ({
  billDispatching,shipPlanBillDispatch,
  loading: loading.models.shipPlanBillDispatch,
}))
@Form.create()
export default class ShipPlanBillViewPage extends CreatePage {
  constructor(props) {
    super(props);

    this.state = {
      title: vehicleDispatchingLocale.createShipPlanBillTitle,
      entity: {
        companyUuid:loginCompany().uuid,
        dispatchCenterUuid:loginOrg().uuid,
        scheduleBillByDeliveryPoints: [],
        memberDetails: [],
      },
      vendor: {},
      selectedRows:[],
      selectedRowKeys:[],
      selectedUserRows:[],
    }
  }

  componentDidMount() {
    this.props.onRef && this.props.onRef(this);

    if(this.props.shipPlanBill&&this.props.shipPlanBill.billNumber){
      this.setState({
        title: vehicleDispatchingLocale.shipPlanBill + '：' +this.props.shipPlanBill.billNumber
      });
    }

    if(this.props.shipPlanBill){
      this.refresh();
    }

  }


  componentWillReceiveProps(nextProps) {

    if(nextProps.shipPlanBill&&nextProps.shipPlanBill.uuid&&nextProps.shipPlanBill.uuid!=this.state.entity.uuid){
      this.setState({
        title: vehicleDispatchingLocale.shipPlanBill + '：' +nextProps.shipPlanBill.billNumber
      });
      this.refresh(nextProps.shipPlanBill.uuid)
    }

    if(nextProps.shipPlanBillDispatch.entity&&nextProps.shipPlanBillDispatch.entity!=this.props.shipPlanBillDispatch.entity){
      this.setState({
        entity:nextProps.shipPlanBillDispatch.entity,
        hasActionButton:false,
      });
      this.props.refreshShipPlanBill(nextProps.shipPlanBillDispatch.entity);

    }
  }

  getSelectedRows = (selectedRows,selectedRowKeys)=>{
    this.setState({
      selectedRows:selectedRows,
      selectedRowKeys:selectedRowKeys,
    })
  }

  getSelectedUserRows = (selectedRows)=>{
    this.setState({
      selectedUserRows:selectedRows
    })
  }

  handleRemove = ()=>{
    const { selectedRows,entity } = this.state;
    let orderBillNumberList = [];
    if(selectedRows.length==0){
      message.warning('请先选择行！');
      return;
    }

    selectedRows.forEach(row=>{
      orderBillNumberList.push(row.orderNumber);
    });
    this.props.dispatch({
      type:'billDispatching/removeonlyorderfromschedule',
      payload: {
        orderBillNumberList:orderBillNumberList,
        scheduleUuid:entity.uuid,
      },
      callback:response=>{
        if(response&&response.success){
          message.success('删除成功')
          this.refresh(entity.uuid);
          this.props.onReFreshNormal();
          this.props.refreshShipPlanBillPage();
        }
      }
    })
  }

  /**
   * 刷新
   */
  refresh = (uuid) => {
    this.setState({
      selectedRows:[],
      selectedRowKeys:[]
    })
    this.props.dispatch({
      type: 'shipPlanBillDispatch/getOnlyBillScheduleMerge',
      payload: uuid?uuid:this.props.shipPlanBill.uuid,
      callback:response=>{
        if(response&&response.success){
          this.setState({
            entity:response.data,
            title: vehicleDispatchingLocale.shipPlanBill + '：' +response.data.billNumber
          });
        }
      }
    });
  }

  handleDown = (record)=>{
    const { entity:{ orderArticleDetails } } = this.state;
    if(record.line == orderArticleDetails.length){
      message.warning('当前行已经是最后一行！');
      return;
    }
    this.props.dispatch({
      type:'pickUpDispatching/onAdjust',
      payload:{
        line:record.line,
        upDown:false,
        uuid:this.state.entity.uuid,
      },
      callback:response=>{
        if(response&&response.success){
          this.refresh(this.state.entity.uuid);
        }
      }
    })
  }
  handleUp = (record)=>{
    if(record.line == 1){
      message.warning('当前行已经是第一行！');
      return;
    }
    this.props.dispatch({
      type:'pickUpDispatching/onAdjust',
      payload:{
        line:record.line,
        upDown:true,
        uuid:this.state.entity.uuid,
      },
      callback:response=>{
        if(response&&response.success){
          this.refresh(this.state.entity.uuid);
        }
      }
    })
  }

  drawTable = () => {
    const { getFieldDecorator } = this.props.form;
    const { entity, vendorArticle,selectedRows,selectedRowKeys } = this.state;
    let billCols = [
      {
        title: commonLocale.lineLocal,
        width: itemColWidth.lineColWidth,
        render:(text,record,index)=>`${index+1}`
      },
      {
        title:'订单号',
        dataIndex:'orderNumber',
        width:140,
        render:val=>val?<EllipsisCol colValue={val}/>:<Empty/>
      },
      {
        title: commonLocale.inStoreLocale,
        dataIndex: 'deliveryPoint',
        width: 130,
        render:val=>{
          let data = {
            uuid:val.uuid,
            code:val.code,
            name:val.name,
          }
        return convertCodeName(data);
        }
      },
      {
        title: vehicleDispatchingLocale.volume+'(m3)',
        dataIndex: 'volume',
        width: 80,

      },
      {
        title: vehicleDispatchingLocale.weight+'(kg)',
        dataIndex: 'weight',
        width: 80,

      },
      {
        title:'下单日期',
        dataIndex:'orderTime',
        width:130,
        render: val => <span>{val ? moment(val).format('YYYY-MM-DD') : <Empty />}</span>,

      },
      {
        title:  '订单类型',
        dataIndex: 'taskType',
        width: 80,
        render:val=>val?TaskType[val].caption:<Empty/>
      },
      {
        title:  '客户单号',
        dataIndex: 'orderNumber',
        width: 130,
      },

    ];

    let itemsCols = [
      // {
      //   title:'顺序号',
      //   dataIndex:'line',
      //   width:50,
      //   // fixed:"left",
      // },
      {
        title: commonLocale.lineLocal,
        width: itemColWidth.lineColWidth,
        render:(text,record,index)=>`${index+1}`
      },
      {
        title: commonLocale.inStoreLocale,
        dataIndex: 'deliveryPoint',
        width: 130,
        render:val=>{
          let data = {
            uuid:val.uuid,
            code:val.code,
            name:val.name,
          }
        return val?<EllipsisCol colValue={convertCodeName(data)}/>:<Empty/>
        }
      },
      {
        title: vehicleDispatchingLocale.volume,
        dataIndex: 'volume',
        width: 70,
      },
      {
        title: vehicleDispatchingLocale.weight,
        dataIndex: 'weight',
        width: 70,
      },
      {
        title: commonLocale.ownerLocale,
        dataIndex: 'owner',
        width: 140,
        render :val=>val?<EllipsisCol colValue={convertCodeName(val)}/>:<Empty/>

      },
      {
        title: '订单数',
        dataIndex: 'sourceNumbers',
        width: 200,
        render :val=>val?val.length:<Empty/>

      }
    ]
    return (
        <Tabs defaultActiveKey="onlyBillorderDetails">
          <TabPane tab={'单据明细'} key={"onlyBillorderDetails"}>
            <div id="onlyBillorderDetails">
              <div style={{ marginBottom: '5px', marginTop: '-5px' }}>
                <Fragment>
                  <Button onClick={() => this.handleRemove()}>{'删除'}</Button>
                </Fragment>
              </div>
              <StandardTable
                tableClassName={styles.tableClassName}
                noSettingColumns
                unShowRow={this.state.unShowRow ? this.state.unShowRow : false}
                selectedRows = {selectedRows}
                selectedRowKeys = {selectedRowKeys}
                columns={billCols}
                // tableSize="small"
                // noAddandDelete={true}
                // notNote={true}
                data={ this.state.entity.onlyBillorderDetails ? this.state.entity.onlyBillorderDetails : [] }
                onSelectRow = {this.getSelectedRows}
                scroll={{
                  y:this.state.entity.onlyBillorderDetails&&this.state.entity.onlyBillorderDetails.length>0?"calc(35vh)":null,
                  x:1000
                }}
                noPagination={true}
              />
            </div>
          </TabPane>
          <TabPane tab={'排车单明细'} key={"scheduleBillByDeliveryPoints"}>
            <div id="scheduleBillByDeliveryPoints">
              <StandardTable
                tableClassName={styles.tableClassName}
                unShowRow={true}
                columns={itemsCols}
                noSettingColumns
                // tableSize="small"
                // noAddandDelete={true}
                // noRowSelection={true}
                // notNote={true}
                data={this.state.entity.scheduleBillByDeliveryPoints ? this.state.entity.scheduleBillByDeliveryPoints : []}
                // getSelectedRows = {this.getSelectedUserRows}
              />
            </div>
          </TabPane>

        </Tabs>
    )
  }
}
