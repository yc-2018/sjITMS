import { Fragment } from 'react'
import { connect } from 'dva'
import moment from 'moment'
import { Form, Button, message, InputNumber, } from 'antd'
import SearchPage from '@/pages/Component/Page/SearchPage'
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm'
import BadgeUtil from '@/pages/Component/BadgeUtil'
import OperateCol from '@/pages/Component/Form/OperateCol';
import { colWidth } from '@/utils/ColWidth'
import { commonLocale, placeholderLocale } from '@/utils/CommonLocale'
import { havePermission } from '@/utils/authority'
import { convertCodeName } from '@/utils/utils'
import { loginOrg, loginCompany } from '@/utils/LoginContext'
import PickUpConfirmSearchForm from './PickUpConfirmSearchForm'
import Empty from '@/pages/Component/Form/Empty'
import { Subtr, add, accAdd, accDiv } from '@/utils/QpcStrUtil'
import { pickUpConfirmLocale } from './PickUpConfirmLocale'
@connect(({ pickUpConfirm, loading }) => ({
  pickUpConfirm,
  loading: loading.models.pickUpConfirm
}))
@Form.create()
export default class PickUpConfirmSearchPage extends SearchPage {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      title: pickUpConfirmLocale.title,
      data: props.pickUpConfirm.data,
      selectedRows: [],
      key: 'pickUpConfirm.search.table'
    }

    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    this.state.pageFilter.searchKeyValues.dispatchCenterUuid = loginOrg().uuid;
    this.state.pageFilter.searchKeyValues.pickUpPoint = '';
    this.state.pageFilter.searchKeyValues.plateNumber = '';
    this.state.pageFilter.searchKeyValues.shipPlanBillNumber = '';
  }

  componentDidMount() {
    this.refreshTable();

  }
  componentWillReceiveProps(nextProps) {

    if(nextProps.pickUpConfirm.data&&this.props.pickUpConfirm.data!=nextProps.pickUpConfirm.data){
      this.setState({
        data: nextProps.pickUpConfirm.data
      });
    }
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
      type: 'pickUpConfirm/queryArticleItem',
      payload: queryFilter.searchKeyValues,
      callback:response=>{
        if(response.success && response.data){
          let data = response.data;
          data.forEach((item, index) => {
            item.factLine = index + 1
          });
        this.setState({
          data:{
            list:[ ...data ]
          }
        })
        } else {
          this.setState({
            data:{
              list:[]
            }
          })
        }
      }
    });
  };


  onSearch = (data) => {
    const {pageFilter} = this.state;
    pageFilter.page = 0;

    if (data) {
      let pickUpPoint = '';
      if(data.vendor){
        pickUpPoint = JSON.parse(data.vendor).code
      }
      pageFilter.searchKeyValues = {
        ...pageFilter.searchKeyValues,
        ...data,
        pickUpPoint:pickUpPoint
      }
    } else {
      pageFilter.searchKeyValues = {
        companyUuid: loginCompany().uuid,
        dispatchCenterUuid: loginOrg().uuid
      }
    }

    this.refreshTable();
  }

  onConfirm=()=>{
    const { selectedRows } = this.state
    let isReturn = 0;
    let line = 1;
    if(selectedRows.length==0){
      message.warning('请先勾选行！');
      return;
    }

    let shipTmsConfirmeds = [];

    selectedRows.forEach(row=>{
      line = row.line;
      if(row.confirmedQty == null) {
        message.error('第' + line + '行提货数量不能为空');
        isReturn = 1;
      }
      shipTmsConfirmeds.push(
        {
          billUuid: row.billUuid,
          orderNum: row.orderNum,
          confirmedQty: row.qty,
          qpcStr: row.qpcStr,
        }
      )
      line++;
    });

    if(isReturn == 1) {
      return;
    }
    this.props.dispatch({
      type: 'pickUpConfirm/onConfirm',
      payload:shipTmsConfirmeds,
      callback:response=>{
        if(response&&response.success){
          this.refreshTable();
          message.success(commonLocale.saveSuccessLocale);
        }
      }
    })
  }


  handleFieldChange = (e, fieldName, line)=>{
    const { data,pageFilter } = this.state;
    let target = data.list[line-1];
    if (fieldName === 'confirmedQty') {
      target.confirmedQty = e;
    }
    this.setState({
      data: data
    });

  }

  columns = [
    {
      title: pickUpConfirmLocale.orderNum,
      dataIndex: 'orderNum',
      width: colWidth.billNumberColWidth + 50,
    },
    {
      title: commonLocale.sourceBillNumberLocal,
      dataIndex: 'sourceOrderBillTms',
      width: colWidth.billNumberColWidth + 50,
      render:val=>val?val:<Empty/>
    },
    {
      title: commonLocale.articleLocale,
      dataIndex: 'article',
      width: colWidth.billNumberColWidth + 50,
      render:val=>val?convertCodeName(val):<Empty/>
    },
    {
      title: pickUpConfirmLocale.qty,
      dataIndex: 'qty',
      width: colWidth.billNumberColWidth + 50,
    },
    {
      title:pickUpConfirmLocale.confirmedQty,
      dataIndex: 'confirmedQty',
      width: colWidth.billNumberColWidth + 50,
      render:(val,record)=><InputNumber style={{width:'100%'}} max={record.qty} min={0} precision={3} value={val}
        onChange={e => this.handleFieldChange(e, 'confirmedQty', record.factLine)}
        placeholder={placeholderLocale(pickUpConfirmLocale.confirmedQty)}
      />
    },
  ];


  drawToolbarPanel() {
    return <div>
      <Button key={1} style={{float:'left',marginBottom:'5px'}} onClick={()=>this.onConfirm(this.state.selectedRows)}>
        {commonLocale.confirmLocale}
      </Button>

    </div>
  }

  drawSearchPanel = () => {
    return <PickUpConfirmSearchForm filterValue={this.state.pageFilter.searchKeyValues} refresh={this.onSearch}/>;
  }


}
