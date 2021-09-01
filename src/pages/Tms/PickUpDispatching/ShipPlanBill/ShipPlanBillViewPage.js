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
import styles from '../PickUpDispatching.less';
import { Fragment } from 'react';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import CreatePage from '../../VehicleDispatching/Utils/CreatePage';
import { vehicleDispatchingLocale } from '../../VehicleDispatching/VehicleDispatchingLocale';
import ItemEditTable from '../../VehicleDispatching/Utils/ItemEditTable';
import { MemberType } from '../../ShipPlanBillDispatch/ShipPlanBillDispatchContants';
import { accDiv, accMul } from '@/utils/QpcStrUtil';
import StandardTable from '@/components/StandardTable';

const TabPane = Tabs.TabPane;

@connect(({ vehicleDispatching,shipPlanBillDispatch, loading }) => ({
  vehicleDispatching,shipPlanBillDispatch,
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
        orderDetails: [],
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

    if(nextProps.shipPlanBill&&nextProps.shipPlanBill.uuid&&nextProps.shipPlanBill!=this.props.shipPlanBill){
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
    let scheduleArticleUuids = [];
    if(selectedRows.length==0){
      message.warning('请先选择行！');
      return;
    }

    selectedRows.forEach(row=>{
      scheduleArticleUuids.push(row.uuid);
    });
    this.props.dispatch({
      type:'pickUpDispatching/removeorderarticlesfromschedule',
      payload: {
        scheduleArticleUuids:scheduleArticleUuids,
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
      type: 'shipPlanBillDispatch/getTakeDeliveryScheduleMerge',
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
    let cols = [
      {
        title:'操作',
        width:50,
        fixed:"left",
        render:record=>{
          return <div className={styles.moveButton}>
           <Icon className={styles.down} type="down" onClick={()=>this.handleDown(record)}/>
           &nbsp;
           <Icon className={styles.up} type="up" onClick={()=>this.handleUp(record)}/>
          </div>
        }

      },
      {
        title:'序号',
        dataIndex:'line',
        width:50,
        fixed:"left",
      },
      {
        title:'客户单号',
        dataIndex:'sourceBillNumber',
        width:140,
        render:val=>val?val:<Empty/>
      },
      {
        title: commonLocale.articleLocale,
        dataIndex: 'article',
        width: 150,
        render:val=>val?convertCodeName({
          uuid:val.uuid,
          code:val.code,
          name:val.name,
        }):<Empty/>
      },
      {
        title:  '商品二级条码',
        dataIndex: 'barcode',
        width: 100,
        render:val=>val?val:<Empty/>

      },
      {
        title:  '件数',
        dataIndex: 'qtyStr',
        width: 80,
      },
      {
        title: vehicleDispatchingLocale.volume+'(m3)',
        dataIndex: 'volume',
        width: 80,
        render:(val,record)=>{
          // let volume =Number(accDiv(accMul(record.qty,record.volume),1000000)).toFixed(4);
          return val;
        }
      },
      {
        title: vehicleDispatchingLocale.weight+'(kg)',
        dataIndex: 'weight',
        width: 80,
        render:(val,record)=>{
          // let weight =Number(accDiv(accMul(record.qty,record.weight),1000)).toFixed(4);
          return val;
        }
      },
      {
        title: commonLocale.inStoreLocale,
        dataIndex: 'deliveryPoint',
        width: 140,
        render:val=>{
          let data = {
            uuid:val.uuid,
            code:val.code,
            name:val.name,
          }
        return<EllipsisCol colValue={convertCodeName(data)}/>;
        }
      },
    ];

    let orderCols = [
      {
        title:'序号',
        dataIndex:'line',
        width:50,
        fixed:"left",
      },
      {
        title: commonLocale.inStoreLocale,
        dataIndex: 'deliveryPoint',
        width: 150,
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
        title:'线路',
        dataIndex:'archLine',
        width:140,
        render:val=>{
          return val?<EllipsisCol colValue={convertCodeName(val)}/>:<Empty/>
        },
        sorter: (a, b) =>{
          if ( a.archLine.code < b.archLine.code ) {
            return -1;
          } else if (a.archLine.code  > b.archLine.code ) {
            return 1;
          } else {
            return 0;
          }
        } ,
        sortDirections: ['descend', 'ascend'],
      },

      {
        title: vehicleDispatchingLocale.cartonCount,
        dataIndex: 'cartonCount',
        width: 110,
      },
      {
        title: vehicleDispatchingLocale.scatteredCount,
        dataIndex: 'scatteredCount',
        width: 110,
      },
      {
        title: vehicleDispatchingLocale.containerCount,
        dataIndex: 'containerCount',
        width: 130,
      },
      {
        title: vehicleDispatchingLocale.realCartonCount,
        dataIndex: 'realCartonCount',
        width: 130,
        render:(val,record)=>val&&val!=0?val:(record.cartonCount!=undefined?record.cartonCount:<Empty/>)
      },
      {
        title: vehicleDispatchingLocale.realScatteredCount,
        dataIndex: 'realScatteredCount',
        width: 140,
        render:(val,record)=>val&&val!=0?val:(record.scatteredCount!=undefined?record.scatteredCount:<Empty/>)
      },
      {
        title: vehicleDispatchingLocale.realContainerCount,
        dataIndex: 'realContainerCount',
        width: 140,
        render:(val,record)=>val&&val!=0?val:(record.containerCount!=undefined?record.containerCount:<Empty/>)
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
        title: '单号',
        dataIndex: 'orderNumber',
        width: 200,
        render:val=>val?<EllipsisCol colValue={val}/>:<Empty/>
      }
    ]
    let userCols = [
      {
        title: commonLocale.lineLocal,
        key: 'line',
        dataIndex:'line',
        width: itemColWidth.lineColWidth,
      },
      {
        title: vehicleDispatchingLocale.member,
        dataIndex: 'member',
        width: colWidth.codeNameColWidth,
        render:(val,record)=>{
        return record.member?<span>{convertCodeName(record.member)}</span>:<Empty/>;
        }
      },
      {
        title: vehicleDispatchingLocale.memberType,
        dataIndex: 'memberType',
        width: colWidth.enumColWidth,
        render :(val,record)=>{
          return record.memberType?<span>{MemberType[record.memberType].caption}</span>:<Empty/>
        }
      },
    ];
    return (
        <Tabs defaultActiveKey="resource">
          <TabPane tab={'订单商品明细'} key={"orderArticleDetails"}>
            <div style={{ marginBottom: '5px', marginTop: '-5px' }}>
              <Fragment>
                <Button onClick={() => this.handleRemove()}>{'删除'}</Button>
              </Fragment>
            </div>
            <StandardTable
              tableClassName={styles.tableClassName}
              selectedRows = {selectedRows}
              selectedRowKeys = {selectedRowKeys}
              columns={cols}
              noSettingColumns
              unShowRow={this.state.unShowRow ? this.state.unShowRow : false}
              // tableSize="small"
              // noAddandDelete={true}
              // notNote={true}
              data={ this.state.entity.orderArticleDetails ? this.state.entity.orderArticleDetails : [] }
              onSelectRow = {this.getSelectedRows}
              scroll={{
                x:1000
              }}
            />
          </TabPane>
          <TabPane tab={'订单明细'} key={"orderDetails"}>
            <StandardTable
              tableClassName={styles.tableClassName}
              columns={orderCols}
              // tableSize="small"
              // noAddandDelete={true}
              // noRowSelection={true}
              // notNote={true}
              noSettingColumns
              unShowRow={true}
              data={this.state.entity.orderDetails ? this.state.entity.orderDetails : []}
              // getSelectedRows = {this.getSelectedUserRows}
            />
          </TabPane>
          {/* <TabPane tab={vehicleDispatchingLocale.memberDetails} key={"memberDetails"}>
            <ItemEditTable
              columns={userCols}
              tableSize="small"
              noAddandDelete={true}
              noRowSelection={true}
              notNote={true}
              data={this.state.entity.memberDetails ? this.state.entity.memberDetails : []}
              getSelectedRows = {this.getSelectedUserRows}
            />
          </TabPane> */}
        </Tabs>
    )
  }
}
