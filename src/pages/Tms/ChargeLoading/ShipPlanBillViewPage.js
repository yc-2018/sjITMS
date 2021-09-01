import { Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Form, Button, Modal,message, Dropdown, Menu} from 'antd';
import Empty from '@/pages/Component/Form/Empty';
import { colWidth } from '@/utils/ColWidth';
import { commonLocale } from '@/utils/CommonLocale';
import { havePermission } from '@/utils/authority';
import { convertCodeName } from '@/utils/utils';
import { loginOrg, loginCompany, getActiveKey } from '@/utils/LoginContext';
import { State, MemberType } from '@/pages/Tms/ShipPlanBillDispatch/ShipPlanBillDispatchContants';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import SearchPage from './SearchPage';
import { orderBillType } from './ChargeLoadingContants';


@connect(({ chargeLoading, loading }) => ({
  chargeLoading,
  loading: loading.models.chargeLoading,
}))
@Form.create()
export default class ShipPlanBillViewPage extends SearchPage {
  constructor(props) {
    super(props);
    this.state = {
      title: '排车单明细',
      key:'chargeLoading.search.table',
      data:{},
      unShowRow: true,
      width:"100%",
      scrollValue:{
        x:1200,
        y:props.shipPlanBill && props.shipPlanBill.orderDetails && props.shipPlanBill.orderDetails.length>0?"calc(50vh)":null
      }
    }
  }

  componentDidMount() {
    if(this.props.shipPlanBill && this.props.shipPlanBill.orderDetails){
      if(this.props.shipPlanBill.orderDetails) {
        this.setState({
          data: {
            list: this.props.shipPlanBill.orderDetails
          }
        })
      }
      // this.refresh();
    } else {
      this.setState({
        data: {
          list: []
        }
      })
    }
  }

  componentWillReceiveProps(nextProps) {
    if(this.props.shipPlanBill && this.props.shipPlanBill.orderDetails){
      if(this.props.shipPlanBill.orderDetails) {
        this.setState({
          data: {
            list: this.props.shipPlanBill.orderDetails
          }
        })
      }
      // this.refresh();
    } else {
      this.setState({
        data: {
          list: []
        }
      })
    }
  }

  columns = [
    {
      title: '序号',
      dataIndex: 'line',
      width: 80,
      render:(val)=>val?val:<Empty/>
    },
    {
      title: '顺序号',
      dataIndex: 'orderNo',
      width: 80,
      render:(val)=>val?val:<Empty/>
    },
    {
      title:'订单号',
      dataIndex: 'orderNumber',
      width:150,
      render:(val)=>val?val:<Empty/>
    },
    {
      title: '门店代码',
      dataIndex: 'deliveryPoint.code',
      width: 80,
      render:(val)=>val?val:<Empty/>
    },
    {
      title: '门店名称',
      dataIndex: 'deliveryPoint.name',
      width: 100,
      render:(val)=>val?val:<Empty/>
    },
    // {
    //   title: '下单日期',
    //   dataIndex: 'realScatteredCount',
    //   width: 150,
    //   render:(val,record)=>val&&val!=0?val:(record.scatteredCount!=undefined?record.scatteredCount:<Empty/>)
    // },
    {
      title: '件数',
      dataIndex: 'realCartonCount',
      width: 70,
      render:val=>val? <EllipsisCol colValue={val}/>:0
    },
    {
      title: '周转箱数',
      dataIndex: 'realContainerCount',
      width: 90,
      render:val=>val? <EllipsisCol colValue={val}/>:0
    },
    {
      title: '体积(m³)',
      dataIndex: 'volume',
      width: 70,
      render:val=>val? <EllipsisCol colValue={val}/>:0
    },
    {
      title: '重量(吨)',
      dataIndex: 'weight',
      width: 70,
      render:val=>val? <EllipsisCol colValue={val}/>:0
    },
    {
      title: '订单类型',
      dataIndex: 'orderType',
      width: 90,
      render:(val,record)=>{
        return val?<span>{orderBillType[record.orderType].caption}</span>:<Empty />
      }
    },
    {
      title: '货主',
      dataIndex: 'owner',
      width: 100,
      render: val => val ? <EllipsisCol colValue={convertCodeName(val)} /> : <Empty/>
    }
  ];

}
