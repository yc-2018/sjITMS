import { connect } from 'dva';
import { Form, Tabs } from 'antd';
import { commonLocale, notNullLocale, placeholderLocale, placeholderChooseLocale,tooLongLocale } from '@/utils/CommonLocale';
import { loginCompany, loginOrg, getDefOwner } from '@/utils/LoginContext';
import { orgType } from '@/utils/OrgType';
import { convertCodeName } from '@/utils/utils';
import { itemColWidth, colWidth } from '@/utils/ColWidth';
import Empty from '@/pages/Component/Form/Empty';
import CreatePage from './CreatePage';
import ItemEditTable from './ItemEditTable';
import { vehicleDispatchingLocale } from './DispatchCenterShipPlanBillLocale';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';

const TabPane = Tabs.TabPane;

@connect(({ dispatchCenterShipPlanBill, loading }) => ({
  dispatchCenterShipPlanBill,
  loading: loading.models.dispatchCenterShipPlanBill,
}))
@Form.create()
export default class DispatchCenterShipPlanBillViewPage extends CreatePage {
  constructor(props) {
    super(props);

    this.state = {
      entity: {
        companyUuid:loginCompany().uuid,
        dispatchCenterUuid:loginOrg().uuid,
        orderDetails:[],
      },
      vendor: {},
      selectedRowKeys:[],
      selectedUserRows:[],
      selectedUserRowsKeys:[]
    }
  }

  componentDidMount() {
    this.props.onRef && this.props.onRef(this);
    if(this.props.selectedRows && this.props.selectedRows[0]){
      this.setState({
        title: vehicleDispatchingLocale.shipPlanBill + '：' +this.props.selectedRows[0].billNumber,
        selectedData: this.props.selectedRows[0],
        selectedRows:this.props.selectedRows,
      });
      this.refresh(this.props.selectedRows[0].uuid)
    }
    if(this.props.viewData) {
      this.setState({
        title: vehicleDispatchingLocale.shipPlanBill + '：' +this.props.dispatchCenterShipPlanBill.billNumber,
        selectedData: this.props.viewData,
        viewData:this.props.viewData,
      });
      this.refresh(this.props.viewData.uuid)
    }
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.dispatchCenterShipPlanBill&&nextProps.dispatchCenterShipPlanBill.uuid&&nextProps.dispatchCenterShipPlanBill!=this.props.dispatchCenterShipPlanBill){
      this.setState({
        title: vehicleDispatchingLocale.shipPlanBill + '：' +nextProps.dispatchCenterShipPlanBill.billNumber
      });
      this.refresh(nextProps.dispatchCenterShipPlanBill.uuid)
    }

    if(nextProps.viewData && nextProps.viewData!=this.props.viewData){
      this.setState({
        title: vehicleDispatchingLocale.shipPlanBill + '：' +nextProps.viewData.billNumber
      });
      this.refresh(nextProps.viewData.uuid)
    }
  }

  refresh = (uuid) => {
    const { selectedRows, viewData } = this.state;
    this.props.dispatch({
      type: 'shipPlanBillDispatch/getMerge',
      payload: uuid ? uuid : selectedRows && selectedRows[0] && selectedRows[0].uuid ? selectedRows[0].uuid : viewData && viewData.uuid ? viewData.uuid : '',
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

  drawTable = () => {
    const { getFieldDecorator } = this.props.form;
    const { entity, vendorArticle,selectedRowsKeys,selectedRows } = this.state;
    let cols = [
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
        title: '订单数',
        width: 100,
        render:(val,record)=> val?<span >{record.orderNumbers?record.orderNumbers.length:0}</span>:<Empty/>
      },
      {
        title: '单号',
        dataIndex: 'orderNumbers',
        width: 200,
        render:val=>val?<EllipsisCol colValue={val.join('、')}/>:<Empty/>
      },
      {
        title: '物流来源单号',
        dataIndex: 'sourceNumbers',
        width: 200,
        render:val=>val?<EllipsisCol colValue={val.join('、')}/>:<Empty/>
      }
    ];

    return (
      <Tabs defaultActiveKey="resource">
        <TabPane tab={vehicleDispatchingLocale.orderDetails} key={"orderDetails"}>
          <ItemEditTable
            columns={cols}
            tableSize="small"
            noAddandDelete={true}
            notNote={true}
            noRowSelection
            data={this.state.entity.orderDetails ? this.state.entity.orderDetails : []}
            scroll={{
              y:this.state.entity.orderDetails&&this.state.entity.orderDetails.length>0?"calc(50vh)":null,
              x:1500
            }}
          />
        </TabPane>
      </Tabs>
    )
  }

}
