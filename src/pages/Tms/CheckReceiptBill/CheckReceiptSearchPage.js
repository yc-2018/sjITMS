import { Fragment } from 'react'
import { connect } from 'dva'
import { Form, Button, message, Input, Checkbox, Modal, Select} from 'antd'
import SearchPage from '@/pages/Component/Page/SearchPage'
import OperateCol from '@/pages/Component/Form/OperateCol';
import { colWidth } from '@/utils/ColWidth'
import { commonLocale, placeholderLocale, notNullLocale, placeholderChooseLocale } from '@/utils/CommonLocale'
import { havePermission } from '@/utils/authority'
import { convertCodeName } from '@/utils/utils'
import { loginOrg, loginCompany } from '@/utils/LoginContext'
import CheckReceiptBillSearchForm from './CheckReceiptSearchForm';
import CheckReceiptBillHistoryDrawer from './CheckReceiptBillHistoryDrawer';
import Empty from '@/pages/Component/Form/Empty'
import PreTypeSelect from './PreTypeSelect'
import { PRETYPE } from '@/utils/constants'
import { checkReceiptBillLocale } from './CheckReceiptBillLocale'
import { OrderBillType } from '../VehicleDispatching/VehicleDispatchingContants'
import { getQueryBillDays } from '@/utils/LoginContext';
@connect(({ checkReceiptBill, loading, pretype }) => ({
  checkReceiptBill, pretype,
  loading: loading.models.checkReceiptBill,
}))
@Form.create()
export default class CheckReceiptSearchPage extends SearchPage {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      title: checkReceiptBillLocale.title,
      noPagination:true,
      data:{},
      selectedRows: [],
      indeterminate:false, // 是否有选择
      checkAll:false,// 是否全选
      drawerVisble:false,
      modalVisible:false,
      historyBillNumber:undefined,
      isCheckReceipt:true,
      typeNames:props.typeNames,
      newPagination:{
        total:0,
        showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`,
        defaultPageSize:20,
        defaultCurrent:1,
      },
      key: 'checkReceipt.search.table',
      noActionCol: false
    }
    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    this.state.pageFilter.searchKeyValues.dispatchCenterUuid = loginOrg().uuid;
    this.state.pageFilter.searchKeyValues.receipted = "0";
  }
  componentWillMount(){
    if(this.state.pageFilter.searchKeyValues.receipted=="0"){
      this.columns = [
        {
          title:checkReceiptBillLocale.orderBillType,
          dataIndex: 'orderBillType',
          width: colWidth.enumColWidth,
          render:val=>val?OrderBillType[val].caption:<Empty/>
        },
        {
          title: checkReceiptBillLocale.shipPlanBillNumber,
          dataIndex: 'shipPlanBillNumber',
          width: colWidth.billNumberColWidth,
          render:val=>val?val:<Empty/>
        },
        {
          title: "物流来源单号",
          dataIndex: 'orderSourceNumber',
          width: colWidth.billNumberColWidth,
          render:val=>val?val:<Empty/>
        },
        {
          title: checkReceiptBillLocale.orderBillNumber,
          dataIndex: 'orderBillNumber',
          width: colWidth.billNumberColWidth,
        },
        {
          title: checkReceiptBillLocale.wmsNumber,
          dataIndex: 'wmsNumber',
          width: colWidth.billNumberColWidth,
        },
        {
          title: commonLocale.inStoreLocale,
          dataIndex: 'store',
          width: colWidth.billNumberColWidth,
          render:val=>val?convertCodeName(val):<Empty/>
        },
        {
          title: checkReceiptBillLocale.vehicle,
          dataIndex: 'vehicle',
          width: colWidth.billNumberColWidth,
          render:val=>val?convertCodeName(val):<Empty/>
        },
        {
          title: checkReceiptBillLocale.driver,
          dataIndex: 'driver',
          width: colWidth.billNumberColWidth,
          render:val=>val?convertCodeName(val):<Empty/>
        },
        {
          title: checkReceiptBillLocale.archLine,
          dataIndex: 'archLine',
          width: colWidth.billNumberColWidth,
          render:val=>val?convertCodeName(val):<Empty/>
        },
        {
          title: checkReceiptBillLocale.dealMethod,
          dataIndex:'dealMethod',
          width: 300,
          render:(val,record)=>{
            return <PreTypeSelect
              value = {record.dealMethod?record.dealMethod:undefined}
              placeholder={placeholderChooseLocale(checkReceiptBillLocale.dealMethod)}
              onChange={e => this.handleFieldChange(e, 'dealMethod', record.line)}
            />
          }
        },
        {
          title: checkReceiptBillLocale.orderNo,
          dataIndex: 'orderNo',
          width: colWidth.billNumberColWidth,
        },
        {
          title:()=>{
            return <Checkbox
              indeterminate={this.state.indeterminate}
              onChange={this.onCheckAllChange}
              checked={this.state.checkAll}
            >
              {checkReceiptBillLocale.receipted}
            </Checkbox>
          },
          dataIndex: 'receipted',
          width: colWidth.enumColWidth,
          render:(val,record)=>{
            return  <Checkbox checked={val} onChange={e => this.handleFieldChange(e, 'receipted', record.line)}>
              {checkReceiptBillLocale.receipted}
            </Checkbox>;
          }
        },
        {
          title: commonLocale.noteLocale,
          dataIndex: 'note',
          width: colWidth.billNumberColWidth,
          render:(val,record)=>{
            return <Input value = {record.note} placeholder={placeholderLocale('备注')} onChange={e => this.handleFieldChange(e, 'note', record.line)}/>
          }
        },
        {
          title: commonLocale.operateLocale,
          width: colWidth.operateColWidth,
          render: record => (
            this.renderOperateCol(record)
          ),
        }
      ];
    }
  }
  shouldComponentUpdate(nextProps,nextState){
    if(this.state.pageFilter.searchKeyValues.receipted=="1"){
      this.columns = [
        {
          title:checkReceiptBillLocale.orderBillType,
          dataIndex: 'orderBillType',
          width: colWidth.enumColWidth,
          render:val=>val?OrderBillType[val].caption:<Empty/>
        },
        {
          title: checkReceiptBillLocale.shipPlanBillNumber,
          dataIndex: 'shipPlanBillNumber',
          width: colWidth.billNumberColWidth,
          render:val=>val?val:<Empty/>
        },
        {
          title: "物流来源单号",
          dataIndex: 'orderSourceNumber',
          width: colWidth.billNumberColWidth,
          render:val=>val?val:<Empty/>
        },
        {
          title: checkReceiptBillLocale.orderBillNumber,
          dataIndex: 'orderBillNumber',
          width: colWidth.billNumberColWidth,
        },
        {
          title: checkReceiptBillLocale.wmsNumber,
          dataIndex: 'wmsNumber',
          width: colWidth.billNumberColWidth,
        },
        {
          title: commonLocale.inStoreLocale,
          dataIndex: 'store',
          width: colWidth.billNumberColWidth,
          render:val=>val?convertCodeName(val):<Empty/>
        },
        {
          title: checkReceiptBillLocale.vehicle,
          dataIndex: 'vehicle',
          width: colWidth.billNumberColWidth,
          render:val=>val?convertCodeName(val):<Empty/>
        },
        {
          title: checkReceiptBillLocale.driver,
          dataIndex: 'driver',
          width: colWidth.billNumberColWidth,
          render:val=>val?convertCodeName(val):<Empty/>
        },
        {
          title: checkReceiptBillLocale.archLine,
          dataIndex: 'archLine',
          width: colWidth.billNumberColWidth,
          render:val=>val?convertCodeName(val):<Empty/>
        },
        {
          title: checkReceiptBillLocale.orderNo,
          dataIndex: 'orderNo',
          width: colWidth.billNumberColWidth,
        },
        {
          title: <Checkbox
              indeterminate={this.state.indeterminate}
              onChange={this.onCheckAllChange}
              checked={nextState.checkAll}
            >
              {checkReceiptBillLocale.receipted}
            </Checkbox>,
          dataIndex: 'receipted',
          width: colWidth.enumColWidth,
          render:(val,record)=>{
            return  <Checkbox checked={val} onChange={e => this.handleFieldChange(e, 'receipted', record.line)}>
              {checkReceiptBillLocale.receipted}
            </Checkbox>;
          }
        },
        {
          title: commonLocale.noteLocale,
          dataIndex: 'note',
          width: colWidth.billNumberColWidth,
          render:(val,record)=>{
            return <Input value = {record.note} placeholder={placeholderLocale('备注')} onChange={e => this.handleFieldChange(e, 'note', record.line)}/>
          }
        },
        {
          title: commonLocale.operateLocale,
          width: colWidth.operateColWidth,
          render: record => (
            this.renderOperateCol(record)
          ),
        }
      ];
    }
    if(this.state.pageFilter.searchKeyValues.receipted=="0"){
      this.columns = [
        {
          title:checkReceiptBillLocale.orderBillType,
          dataIndex: 'orderBillType',
          width: colWidth.enumColWidth,
          render:val=>val?OrderBillType[val].caption:<Empty/>
        },
        {
          title: checkReceiptBillLocale.shipPlanBillNumber,
          dataIndex: 'shipPlanBillNumber',
          width: colWidth.billNumberColWidth,
          render:val=>val?val:<Empty/>
        },
        {
          title: "物流来源单号",
          dataIndex: 'orderSourceNumber',
          width: colWidth.billNumberColWidth,
          render:val=>val?val:<Empty/>
        },
        {
          title: checkReceiptBillLocale.orderBillNumber,
          dataIndex: 'orderBillNumber',
          width: colWidth.billNumberColWidth,
        },
        {
          title: checkReceiptBillLocale.wmsNumber,
          dataIndex: 'wmsNumber',
          width: colWidth.billNumberColWidth,
        },
        {
          title: commonLocale.inStoreLocale,
          dataIndex: 'store',
          width: colWidth.billNumberColWidth,
          render:val=>val?convertCodeName(val):<Empty/>
        },
        {
          title: checkReceiptBillLocale.vehicle,
          dataIndex: 'vehicle',
          width: colWidth.billNumberColWidth,
          render:val=>val?convertCodeName(val):<Empty/>
        },
        {
          title: checkReceiptBillLocale.driver,
          dataIndex: 'driver',
          width: colWidth.billNumberColWidth,
          render:val=>val?convertCodeName(val):<Empty/>
        },
        {
          title: checkReceiptBillLocale.archLine,
          dataIndex: 'archLine',
          width: colWidth.billNumberColWidth,
          render:val=>val?convertCodeName(val):<Empty/>
        },
        {
          title: checkReceiptBillLocale.dealMethod,
          dataIndex:'dealMethod',
          width: 300,
          render:(val,record)=>{
            return <PreTypeSelect
              value = {record.dealMethod?record.dealMethod:undefined}
              placeholder={placeholderChooseLocale(checkReceiptBillLocale.dealMethod)}
              onChange={e => this.handleFieldChange(e, 'dealMethod', record.line)}
            />
          }
        },
        {
          title: checkReceiptBillLocale.orderNo,
          dataIndex: 'orderNo',
          width: colWidth.billNumberColWidth,
        },
        {
          title: <Checkbox
            indeterminate={this.state.indeterminate}
            onChange={this.onCheckAllChange}
            checked={nextState.checkAll}
          >
            {checkReceiptBillLocale.receipted}
          </Checkbox>,
          dataIndex: 'receipted',
          width: colWidth.enumColWidth,
          render:(val,record)=>{
            return  <Checkbox checked={val} onChange={e => this.handleFieldChange(e, 'receipted', record.line)}>
              {checkReceiptBillLocale.receipted}
            </Checkbox>;
          }
        },
        {
          title: commonLocale.noteLocale,
          dataIndex: 'note',
          width: colWidth.billNumberColWidth,
          render:(val,record)=>{
            return <Input value = {record.note} placeholder={placeholderLocale('备注')} onChange={e => this.handleFieldChange(e, 'note', record.line)}/>
          }
        },
        {
          title: commonLocale.operateLocale,
          width: colWidth.operateColWidth,
          render: record => (
            this.renderOperateCol(record)
          ),
        }
      ];
    }
    return true
  }
  componentDidMount() {
    this.refreshTable();
  }
  componentWillReceiveProps(nextProps) {
    if(nextProps.checkReceiptBill.data&&nextProps.checkReceiptBill.data!=this.props.checkReceiptBill.data){
      let flag = false;
      let count = 0;
      for(let i = 0;i<nextProps.checkReceiptBill.data.list.length;i++){
        if(nextProps.checkReceiptBill.data.list[i].receipted){
          count +=1;
          flag = true;
        }
      }
      this.setState({
        data: nextProps.checkReceiptBill.data,
        indeterminate:flag?(count== nextProps.checkReceiptBill.data.list.length?false:true):false,
        checkAll:count== nextProps.checkReceiptBill.data.list.length?true:false,
        newPagination:{
          showSizeChanger:true,
          total:nextProps.checkReceiptBill.data.list.length,
          showTotal:(total, range) => `共 ${total} 条`,
          defaultPageSize:20,
          defaultCurrent:1,
        }
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
      if(pageFilter.searchKeyValues && !pageFilter.searchKeyValues.days) {
        pageFilter.searchKeyValues.days = getQueryBillDays()
      }
    }
    let queryFilter = { ...pageFilter };
    if (filter) {
      queryFilter = { ...pageFilter, ...filter };
    }
    dispatch({
      type: 'checkReceiptBill/query',
      payload: queryFilter,
    });
  };
  onSearch = (data) => {
    const {pageFilter} = this.state;
    pageFilter.page = 0;
    if (data) {
      let driverCodeName = '';
      let storeCodeName = '';
      if(data.driverCodeName){
        driverCodeName = JSON.parse(data.driverCodeName).code
      }
      if(data.storeCodeName){
        storeCodeName = JSON.parse(data.storeCodeName).code
      }
      pageFilter.searchKeyValues = {
        ...pageFilter.searchKeyValues,
        ...data,
        driverCodeName:driverCodeName,
        storeCodeName:storeCodeName,
      }
    } else {
      pageFilter.searchKeyValues = {
        companyUuid: loginCompany().uuid,
        dispatchCenterUuid: loginOrg().uuid,
        receipted :"0"
      }
    }
    this.refreshTable();
  }
  renderOperateCol = (record) => {
    return <OperateCol menus={this.fetchOperatePropsCommon(record)} />
  }
  fetchOperatePropsCommon = (record) => {
    return [{
      name: checkReceiptBillLocale.viewHistory,
      onClick: this.onViewHistory.bind(this, record)
    }];
  }
  onType = () => {
    this.props.dispatch({
      type: 'checkReceiptBill/showPage',
      payload: {
        showPage: 'type'
      }
    });
  }
  onViewHistory = (record)=>{
    if(record){
      this.setState({
        historyBillNumber:record.orderBillNumber
      })
    }
    this.setState({
      drawerVisble:!this.state.drawerVisble
    })
  }
  /**
   * 表格变化时
   * @param {*} e
   * @param {*} fieldName
   * @param {*} key
   */
  handleFieldChange(e, fieldName, line) {
    const { data,pageFilter } = this.state;
    let target = data.list[line-1];
    let count = 0;
    if (fieldName === 'receipted') {
      target.receipted = e.target.checked;
      target.dealMethod  = undefined;
      data.list.forEach(item=>{
        if(item.receipted){
          count++
        }
      });
      if(count == data.list.length){// 所有条数
        this.setState({
          indeterminate:false,
          checkAll:true,
        })
      }else if(count>0 &&count<data.list.length){
        this.setState({
          indeterminate:true,
          checkAll:false,
        })
      }else if(count ==0 ){
        this.setState({
          indeterminate:false,
          checkAll:false,
        })
      }
    } else if(fieldName === 'dealMethod'){
      target.dealMethod  = e;
      target.receipted  = false;
      data.list.forEach(item=>{
        if(item.receipted){
          count++
        }
      });
      if(count == data.list.length){// 所有条数
        this.setState({
          indeterminate:false,
          checkAll:true,
        })
      }else if(count>0 &&count<data.list.length){
        this.setState({
          indeterminate:true,
          checkAll:false,
        })
      }else if(count ==0 ){
        this.setState({
          indeterminate:false,
          checkAll:false,
        })
      }
    } else if(fieldName === 'note'){
      target.note  = e.target.value;
    }
    this.setState({
      data: data
    });
  }
  onSaveAllTargetPage = ()=>{
    const { data } = this.state
    let list = [];
    if(data.list.length==0){
      return;
    }
    data.list.forEach(row=>{
      let data = {
        receipted: row.receipted,
        uuid: row.uuid,
        dealMethod: row.dealMethod!=undefined?row.dealMethod:false,
        note: row.note
      }
      list.push(data);
    })
    this.props.dispatch({
      type: 'checkReceiptBill/confirm',
      payload:list,
    })
  }
  onSave = ()=>{
    const { selectedRows } = this.state
    let list = [];
    if(selectedRows.length==0){
      message.warning('请先勾选行！');
      return;
    }
    selectedRows.forEach(row=>{
      let data = {
        receipted: row.receipted,
        uuid: row.uuid,
        dealMethod: row.dealMethod,
        note: row.note
      }
      list.push(data);
    })
    this.props.dispatch({
      type: 'checkReceiptBill/confirm',
      payload:list,
      callback:response=>{
        if(response&&response.success){
          this.refreshTable();
          message.success(commonLocale.saveSuccessLocale);
        }
      }
    })
  }
  handleSubmit = ()=>{
    const { selectedRows,data } = this.state
    const { form } = this.props;
    let count = 0;
    form.validateFields((errors, fieldsValue) => {
      if (errors) return;
      selectedRows.forEach(row=>{
        data.list[row.line-1].dealMethod = fieldsValue.dealMethod
        data.list[row.line-1].receipted = false
      });
      data.list.forEach(item=>{
        if(item.receipted){
          count++
        }
      });
      if(count == data.list.length){// 所有条数
        this.setState({
          indeterminate:false,
          checkAll:true,
        })
      }else if(count>0 &&count<data.list.length){
        this.setState({
          indeterminate:true,
          checkAll:false,
        })
      }else if(count ==0 ){
        this.setState({
          indeterminate:false,
          checkAll:false,
        })
      }
      this.setState({
        data:data,
        modalVisible:!this.state.modalVisible
      })
    });
  }
  onBatchSetDealMethodVisible = (flag)=>{
    if(flag!=false&&this.state.selectedRows.length==0){
      message.warning('请先勾选行！');
      return;
    }
    this.setState({
      modalVisible:!this.state.modalVisible
    })
  }
  onCheckAllChange = (e)=>{
    const { data } = this.state;
    data.list.forEach(item=>{
      item.receipted = e.target.checked;
      item.dealMethod = undefined;
    });
    this.setState({
      indeterminate: false,
      checkAll: e.target.checked,
      data:data
    });
  }
  drawActionButton = () => {
    return (
      <Fragment>
        <Button onClick={() => this.onType()}>
          管理回单处理方式
        </Button>
      </Fragment>
    );
  }
  drawToolbarPanel() {
    return [
      <Button style={this.state.pageFilter.searchKeyValues.receipted== true?{visibility:'hidden'}:null} key={3} onClick={() => this.onBatchSetDealMethodVisible()}>
        {'批量设置回单处理'}
      </Button>,
      <Button key={4} style={{float:'left'}} onClick={()=>this.onSave()}>
        {commonLocale.saveLocale}
      </Button>,
    ];
  }
  drawSearchPanel = () => {
    return <CheckReceiptBillSearchForm filterValue={this.state.pageFilter.searchKeyValues} refresh={this.onSearch}/>;
  }
  drawOtherCom = ()=>{
    const { drawerVisble,historyBillNumber } = this.state;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
    };
    const { getFieldDecorator } = this.props.form;
    return <div>
      <CheckReceiptBillHistoryDrawer
        visible = {drawerVisble}
        handleCancel = {this.onViewHistory}
        billNumber = {historyBillNumber}
      />
      <Modal
        visible={this.state.modalVisible}
        onCancel={()=>this.onBatchSetDealMethodVisible(false)}
        onOk={this.handleSubmit}
        title={'批量设置回单处理'}
      >
        <Form {...formItemLayout}>
          <Form.Item label={checkReceiptBillLocale.dealMethod}>
            { getFieldDecorator('dealMethod', {
              initialValue: this.state.dealMethodBatch,
              rules: [
                { required: true, message: notNullLocale(checkReceiptBillLocale.dealMethod) },
              ],
            })(
              <PreTypeSelect
                preType={PRETYPE.dealMethod}
                orgUuid={loginOrg().uuid}
                placeholder={placeholderLocale(checkReceiptBillLocale.dealMethod)}
              />
            )}
          </Form.Item>
        </Form>
      </Modal>
    </div>;
  }
}
