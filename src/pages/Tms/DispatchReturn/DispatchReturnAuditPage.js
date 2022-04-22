import { Fragment } from 'react'
import { connect } from 'dva'
import { Form, Button, message } from 'antd'
import SearchPage from '@/pages/Component/Page/SearchPage'
import OperateCol from '@/pages/Component/Form/OperateCol';
import { colWidth } from '@/utils/ColWidth'
import { commonLocale } from '@/utils/CommonLocale'
import { havePermission } from '@/utils/authority'
import { convertCodeName } from '@/utils/utils'
import { loginOrg, loginCompany } from '@/utils/LoginContext'
import StoreModal from './StoreModal'
import Empty from '@/pages/Component/Form/Empty'
import styles from './DispatchReturn.less';
import { Subtr } from '@/utils/QpcStrUtil';
import { dispatchReturnLocale } from './DispatchReturnLocale';

@connect(({ dispatchReturn, loading }) => ({
  dispatchReturn,
  loading: loading.models.dispatchReturn
}))
@Form.create()
export default class DispatchReturnAuditPage extends SearchPage {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      title: dispatchReturnLocale.dispatchReturnAuditTitle,
      data:{
        list:props.dispatchReturn.selectedRows
      },
      
      selectedRows: [],
      types: props.types,
      scroll:{},
      width:0,
      storeModalVisible:false,
      shipBillTmsUuid:''
    }

    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    this.state.pageFilter.searchKeyValues.dispatchCenterUuid = loginOrg().uuid;
  }

  componentWillMount(){
    let totalWidth = 0;

    const {types,width} = this.state;
    let index = 8;

    let typeList = [];
    for(let i =0 ;i<types.length;i++){ // 所有的类型
      if(typeList.indexOf(types[i].type)==-1){
        typeList.push(types[i].type);
      }
    }

    for(let i = 0;i<typeList.length;i++){
      this.columns.splice(index, 0, {
        title:typeList[i],
        width:200,
        className:styles.childrenColumn,
        children:this.renderChildreColumns(typeList[i])
      });
      index +=1;
    }

    this.columns.forEach(e => {
      if (e.width) {
        totalWidth = totalWidth + e.width;
      }
    });
    if (totalWidth > width) {
      let tableScroll = {
        x: totalWidth
      }
      this.setState({
        scroll: tableScroll
      })
    }
  }

  componentDidMount() {
    this.refreshTable();
    this.setState({
      width:document.getElementsByClassName("ant-table-wrapper")[0].offsetWidth
    })
  }
  componentWillReceiveProps(nextProps) {
    if(nextProps.dispatchReturn.selectedRows&&nextProps.dispatchReturn.selectedRows!=this.props.dispatchReturn.selectedRows){
      this.setState({
        data: {
          list:[...nextProps.dispatchReturn.selectedRows]
        }
      });
    }
  }

  renderChildreColumns = (type)=>{
    const { types } = this.state;
    let list = [];
    for(let i =0 ;i<types.length;i++){ // 所有的类型
      if(types[i].type === type){
        list.push(
          {
            title: types[i].name,
            width: colWidth.billNumberColWidth + 50,
            className:styles.childColumn,
            render:record=>{
              let value = 0;
              if(record.feeItems){
                for(let j = 0;j<record.feeItems.length;j++){
                  if(record.feeItems[j].feeName   === types[i].name){
                    value = record.feeItems[j].amount
                  }
                }
              }
              return <span>{value}</span>
            }
          },
        )
      }
    }
    return list;
  }

  refreshTable = (filter) => {
    const { dispatch } = this.props;
    const { pageFilter } = this.state;

    if (!filter || !filter.changePage) {
      this.setState({
        selectedRows: [],
      });
    }
    let queryFilter = { ...pageFilter };
    if (filter) {
      queryFilter = { ...pageFilter, ...filter };
    }
    dispatch({
      type: 'dispatchReturn/query',
      payload: queryFilter,
    });
  };

  onSearch = (data) => {
    const {pageFilter} = this.state;
    pageFilter.page = 0;

    if (data) {
      pageFilter.searchKeyValues = {
        ...pageFilter.searchKeyValues,
        ...data,
      }
    } else {
      pageFilter.searchKeyValues = {
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid
      }
    }
    this.refreshTable();
  }

  onView=()=>{}
  onAudit=(name)=>{
    const { selectedRows } = this.state;
    let list = [];
    if(name){
      selectedRows.forEach(row=>{
        let list = []
        row.feeItems.forEach(item=>{
          if(item.feeType===name){
            list.push({
              feeType: item.feeType,
              feeName: item.feeName,
              amount: item.amount,
              checked: true
            });
          }
        })
        row.feeItems = list;
      });
    }
    this.props.dispatch({
      type: 'dispatchReturn/onAudit',
      payload: selectedRows,
      callback:response=>{
        if(response&&response.success){
          this.refreshTable();
          message.success(commonLocale.auditSuccessLocale);
        }
      }
    });

  }


  /**
   * 返回
   */
  onBack = () => {
    this.props.dispatch({
      type: 'dispatchReturn/showPage',
      payload: {
        showPage: 'query'
      }
    });
  }

  handleStoreModal = (uuid)=>{
    if(uuid){
      this.setState({
        shipBillTmsUuid : uuid
      });
    }
    this.setState({
      storeModalVisible:!this.state.storeModalVisible
    });
  }


  renderOperateCol = (record) => {
    return <OperateCol menus={this.fetchOperatePropsCommon(record)} />
  }

  columns = [
    {
      title: dispatchReturnLocale.shipPlanBillNumber,
      dataIndex: 'shipPlanBillNumber',
      width: colWidth.billNumberColWidth + 50,
    },
    {
      title: dispatchReturnLocale.shipBillNumber,
      dataIndex: 'shipBillNumber',
      width: colWidth.billNumberColWidth + 50,
    },
    {
      title: dispatchReturnLocale.vehicle,
      dataIndex: 'vehicle',
      width: colWidth.billNumberColWidth + 50,
      render:val=>val?convertCodeName(val):<Empty/>

    },
    {
      title: dispatchReturnLocale.driver,
      dataIndex: 'driver',
      width: colWidth.billNumberColWidth + 50,
      render:val=>val?convertCodeName(val):<Empty/>
    },
    {
      title: dispatchReturnLocale.lastReturnMileage,
      dataIndex: 'lastReturnMileage',
      width: colWidth.billNumberColWidth + 50,
    },
    {
      title: dispatchReturnLocale.dispatchMileage,
      dataIndex: 'dispatchMileage',
      width: colWidth.billNumberColWidth + 50,
    },
    {
      title: dispatchReturnLocale.returnMileage,
      dataIndex: 'returnMileage',
      width: colWidth.billNumberColWidth + 50,
    },
    {
      title: dispatchReturnLocale.targetMileage,
      width: colWidth.billNumberColWidth + 50,
      render:(record)=>{
        return (record.returnMileage&&record.dispatchMileage)?<span>{Subtr(record.returnMileage,record.dispatchMileage)}</span>:<Empty/>
      }
    },
    {
      title: dispatchReturnLocale.storeFee,
      width: colWidth.billNumberColWidth + 50,
      render:record=><a onClick = {()=>this.handleStoreModal(record.shipBillUuid)}>查看</a>
    },
  ];

  drawActionButton = () => {
    return (
      <Fragment>
        <Button onClick={() => this.onBack()}>
          {commonLocale.backLocale}
        </Button>
      </Fragment>
    );
    
  }

  drawButton(){
    const { types } = this.state;
    let typeNames = [];
    let bottons = [];
    types.forEach(item=>{
      if(typeNames.indexOf(item.type)==-1){
        typeNames.push(item.type)
      }
    });

    typeNames.forEach(name=>{
      bottons.push(
        <Button key={name} onClick={()=>this.onAudit(name)}>{'审核'+name}</Button>
      )
    })

    return bottons;
  }

  drawToolbarPanel() {
    return <div style={{display:'flex' ,justifyContent:'flex-end', marginTop:'15px'}}>
      {this.drawButton()}
      <Button key={'all'} onClick={()=>this.onAudit()}>
        {'全部审核'}
      </Button>
    </div>
    
  }

  drawOtherCom = ()=>{
    const { storeModalVisible,shipBillTmsUuid } = this.state;
    return <div>
      <StoreModal
        visible = {storeModalVisible}
        isView = {true}
        shipBillTmsUuid = {shipBillTmsUuid}
        handleModal = {this.handleStoreModal}
      />
    </div>
  }
  
}
