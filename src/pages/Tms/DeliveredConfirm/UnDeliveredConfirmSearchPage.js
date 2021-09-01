import { Fragment } from 'react'
import { connect } from 'dva'
import moment from 'moment'
import { Form, Button, message, Tabs, Checkbox,Input, Select, Icon,Modal } from 'antd'
import { PRETYPE } from '@/utils/constants'
import { colWidth } from '@/utils/ColWidth'
import { havePermission } from '@/utils/authority'
import { convertCodeName } from '@/utils/utils'
import { loginOrg, loginCompany } from '@/utils/LoginContext'
import { commonLocale, placeholderLocale, placeholderChooseLocale, notNullLocale } from '@/utils/CommonLocale'
import SearchPage from '@/pages/Component/Page/SearchPage'
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm'
import BadgeUtil from '@/pages/Component/BadgeUtil'
import OperateCol from '@/pages/Component/Form/OperateCol';
import StandardTable from '@/components/StandardTable'
import Empty from '@/pages/Component/Form/Empty'
import PreTypeSelect from '@/pages/Component/Select/PreTypeSelect'
import { OrderType, DeliveredType,UnDeliveredDuty,UnDeliveredType } from './DeliveredConfirmContants'
import DeliveredConfirmSearchForm from './DeliveredConfirmSearchForm'
import { deliveredConfirmLocale } from './DeliveredConfirmLocale'

const { TabPane } = Tabs;

const dutyOptions = [];
Object.keys(UnDeliveredDuty).forEach(function (key) {
  dutyOptions.push(<Select.Option key={UnDeliveredDuty[key].name} value={UnDeliveredDuty[key].name}>{UnDeliveredDuty[key].caption}</Select.Option>);
});

const typeOptions = [];
Object.keys(UnDeliveredType).forEach(function (key) {
  typeOptions.push(<Select.Option key={UnDeliveredType[key].name} value={UnDeliveredType[key].name}>{UnDeliveredType[key].caption}</Select.Option>);
});

@connect(({ deliveredConfirm, loading }) => ({
  deliveredConfirm,
  loading: loading.models.deliveredConfirm
}))
@Form.create()
export default class UnDeliveredConfirmSearchPage extends SearchPage {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      title: deliveredConfirmLocale.unTitle,
      data:{
        list:[]
      },

      selectedRows: [],
      reasonModalVisible: false,
      dutyModalVisible: false,
    }

    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    this.state.pageFilter.searchKeyValues.dispatchCenterUuid = loginOrg().uuid;
  }

  componentDidMount() {
    this.refreshTable();
  }
  componentWillReceiveProps(nextProps) {
    if(nextProps.deliveredConfirm.orderUndelivereData)
      this.setState({
        data: nextProps.deliveredConfirm.orderUndelivereData
      });
  }

  refreshTable = (filter) => {
    const { dispatch } = this.props;
    const { pageFilter,targetTabKey } = this.state;

    if (!filter || !filter.changePage) {
      this.setState({
        selectedRows: [],
      });
    }
    let queryFilter = { ...pageFilter };

    if (filter) {
      queryFilter = { 
        ...pageFilter,
        ...filter,
      };
    }

    dispatch({
      type: 'deliveredConfirm/queryOrderUndelivered',
      payload: queryFilter,
    });
  };

  onSearch = (data) => {
    const { pageFilter,targetTabKey } = this.state;
    pageFilter.page = 0;

    if (data) {
      let vehicleCodeName = '';
      let driverUuid = '';
      if(data.vehicle){
        vehicleCodeName = JSON.parse(data.vehicle).code
      }

      if(data.driver){
        driverUuid = JSON.parse(data.driver).code
      }
      pageFilter.searchKeyValues = {
        ...pageFilter.searchKeyValues,
        ...data,
        vehicleCodeName:vehicleCodeName,
        driverUuid:driverUuid
      }
    } else {
      pageFilter.searchKeyValues = {
        companyUuid: loginCompany().uuid,
        dispatchCenterUuid: loginOrg().uuid
      }
    }
      this.refreshTable();

  }

  onUnDeliveredConfirm = ()=>{
    this.props.dispatch({
      type: 'deliveredConfirm/showPage',
      payload: {
        showPage: 'unDeliveredConfirm',
      }
    });
  }


  ReSend = (e)=>{
    const { data,selectedRows } = this.state;

    if(this.state.selectedRows.length==0){
      message.warning('请先勾选行！');
      return;
    }
    selectedRows.forEach(row=>{
      data.list[row.line-1].unDeliveredType = UnDeliveredType.ReSend.name;
    });
    this.setState({
      data:data
    });
  }

  Reject = (e)=>{
    const { data,selectedRows } = this.state;

    if(this.state.selectedRows.length==0){
      message.warning('请先勾选行！');
      return;
    }
    selectedRows.forEach(row=>{
      data.list[row.line-1].unDeliveredType = UnDeliveredType.Reject.name;
    });
    this.setState({
      data:data
    });
  }

  onBatchSetReasonVisible = (flag)=>{
    if(flag!=false&&this.state.selectedRows.length==0){
      message.warning('请先勾选行！');
      return;
    }
    this.setState({
      reasonModalVisible:!this.state.reasonModalVisible
    })
  }
  onBatchSetDutyVisible = (flag)=>{
    if(flag!=false&&this.state.selectedRows.length==0){
      message.warning('请先勾选行！');
      return;
    }
    this.setState({
      dutyModalVisible:!this.state.dutyModalVisible
    })
  }

  handleSubmitDuty = ()=>{
    const { selectedRows,data } = this.state

    const { form } = this.props;

    form.validateFields((errors, fieldsValue) => {
      if (errors&&errors.unDeliveredDuty) return;
      
      selectedRows.forEach(row=>{
        data.list[row.line-1].unDeliveredDuty = fieldsValue.unDeliveredDuty
      });

      this.setState({
        data:data,
        dutyModalVisible:!this.state.dutyModalVisible
      })
    });
  }

  onType = () => {
    this.props.dispatch({
      type: 'deliveredConfirm/showPage',
      payload: {
        showPage: 'type'
      }
    });
  }

  onSave = ()=>{
    const { selectedRows } = this.state
    let list = [];
    if(selectedRows.length==0){
      message.warning('请先勾选行！');
      return;
    }

    this.props.dispatch({
      type: 'deliveredConfirm/confirmOrderUndelivered',
      payload:selectedRows,
      callback:response=>{
        if(response&&response.success){
          this.refreshTable();
          message.success(commonLocale.saveSuccessLocale);
        }
      }
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
    if (fieldName === 'unDeliveredType') {
      target.unDeliveredType = e;
    }else if(fieldName === 'unDeliveredReason'){
      target.unDeliveredReason = e;
    }else if(fieldName === 'unDeliveredDuty'){
      target.unDeliveredDuty = e;
    }

    this.setState({
      data: data
    });
  }


  columns = [
    {
      title: deliveredConfirmLocale.orderNum,
      dataIndex: 'orderNum',
      width: colWidth.billNumberColWidth + 50,
    },
    {
      title: deliveredConfirmLocale.wmsNum,
      dataIndex: 'wmsNum',
      width: colWidth.billNumberColWidth + 50,
    },
    {
      title: deliveredConfirmLocale.sourceNum,
      dataIndex: 'sourceNum',
      width: colWidth.billNumberColWidth + 50,
    },
    {
      title: commonLocale.inStoreLocale,
      dataIndex: 'store',
      width: colWidth.billNumberColWidth + 50,
      render:val=>val?convertCodeName(val):<Empty/>
    },
    {
      title: deliveredConfirmLocale.delivered,
      dataIndex: 'delivered',
      width: colWidth.billNumberColWidth + 50,
      render:val=>val?DeliveredType[val].caption:<Empty/>
    },
    {
      title: deliveredConfirmLocale.unDeliveredType,
      dataIndex: 'unDeliveredType',
      width: colWidth.billNumberColWidth + 50,
      render:(val,record)=><Select value={val} style={{width:'100%'}} onChange={e => this.handleFieldChange(e, 'unDeliveredType', record.line)} placeholder={placeholderChooseLocale('未送达类型')}>
         {typeOptions}
      </Select>
    },
    {
      title: deliveredConfirmLocale.unDeliveredReason,
      dataIndex: 'unDeliveredReason',
      width: colWidth.billNumberColWidth + 50,
      render:(val,record)=><PreTypeSelect
        value = {val}
        preType={PRETYPE.unDeliveredReason}
        orgUuid={loginOrg().uuid}
        placeholder={placeholderLocale('未送达原因')}
        onChange={e => this.handleFieldChange(e, 'unDeliveredReason', record.line)}
      />
    },
    {
      title: deliveredConfirmLocale.unDeliveredDuty,
      dataIndex: 'unDeliveredDuty',
      width: colWidth.billNumberColWidth + 50,
      render:(val,record)=><Select value={val} style={{width:'100%'}} onChange={e => this.handleFieldChange(e, 'unDeliveredDuty', record.line)} placeholder={placeholderChooseLocale('未送达责任归属')}>
         {dutyOptions}
      </Select>
    },
  ];

  drawActionButton = () => {
    return (
      <Fragment>
        <Button onClick={() => this.props.backToBefore()}>
          {commonLocale.backLocale}
        </Button>
        <Button onClick={() => this.onType()}>
          {deliveredConfirmLocale.unDeliveredReasonManage}
        </Button> 
      </Fragment>
    );
  }

  drawToolbarPanel() {
    return [
      <Button key={1} onClick={()=>{this.ReSend()}}>
        {deliveredConfirmLocale.reSend}
      </Button>,
      <Button key={2} onClick={()=>{this.Reject()}}>
        {deliveredConfirmLocale.reject}
      </Button>,
      <Button key={3} onClick={() => this.onBatchSetReasonVisible()}>
        {deliveredConfirmLocale.batchSetReason}
      </Button>,
      <Button key={4} onClick={() => this.onBatchSetDutyVisible()}>
        {deliveredConfirmLocale.batchSetDuty}
      </Button>,
      <Button key={5} style={{float:'right'}} onClick={()=>this.onSave()}>
        {commonLocale.saveLocale}
      </Button>,
    ];
    
  }

  drawSearchPanel = () => {
    return <DeliveredConfirmSearchForm filterValue={this.state.pageFilter.searchKeyValues} refresh={this.onSearch}/>;
  }
  
  CreateFormReason = () => {
    const formItemLayout = {
      labelCol: {
        xs: { span: 48 },
        sm: { span:8 },
      },
      wrapperCol: {
        xs: { span: 48 },
        sm: { span: 10 },
      },
    };

    const CreateFormReason = Form.create()(props => {
      const { dispatch,form} = props;
      const { getFieldDecorator } = form;
      const handleSubmitReason = ()=>{
        const { selectedRows,data } = this.state
        form.validateFields((errors, fieldsValue) => {
          if (errors&&errors.unDeliveredReason) return;
          selectedRows.forEach(row=>{
            data.list[row.line-1].unDeliveredReason = fieldsValue.unDeliveredReason
          });
          this.setState({
            data:data,
            reasonModalVisible:!this.state.reasonModalVisible
          })
        });
      }
      return <Modal
        visible={this.state.reasonModalVisible}
        onCancel={()=>this.onBatchSetReasonVisible(false)}
        onOk={handleSubmitReason}
        title={deliveredConfirmLocale.batchSetReason}
      >
        <Form {...formItemLayout}>
          <Form.Item label={deliveredConfirmLocale.unDeliveredReason}>
            { getFieldDecorator('unDeliveredReason', {
              initialValue: undefined,
              rules: [
                { required: true, message: notNullLocale(deliveredConfirmLocale.unDeliveredReason) },
              ],
            })(
              <PreTypeSelect 
                preType={PRETYPE.unDeliveredReason}
                orgUuid={loginOrg().uuid}
                placeholder={placeholderLocale(deliveredConfirmLocale.unDeliveredReason)}
              />
            )}
          </Form.Item>
        </Form>
      </Modal> ;
    });

    return <CreateFormReason />;
  }

  CreateFormDuty = () => {
    const formItemLayout = {
      labelCol: {
        xs: { span: 48 },
        sm: { span:8 },
      },
      wrapperCol: {
        xs: { span: 48 },
        sm: { span: 10 },
      },
    };

    const CreateFormDuty = Form.create()(props => {
      const { dispatch,form} = props;
      const { getFieldDecorator } = form;
      const handleSubmitDuty = ()=>{
        const { selectedRows,data } = this.state
        form.validateFields((errors, fieldsValue) => {
          if (errors&&errors.unDeliveredDuty) return;
          
          selectedRows.forEach(row=>{
            data.list[row.line-1].unDeliveredDuty = fieldsValue.unDeliveredDuty
          });
    
          this.setState({
            data:data,
            dutyModalVisible:!this.state.dutyModalVisible
          })
        });
      }
      return<Modal
        visible={this.state.dutyModalVisible}
        onCancel={()=>this.onBatchSetDutyVisible(false)}
        onOk={handleSubmitDuty}
        title={deliveredConfirmLocale.batchSetDuty}
      >
        <Form {...formItemLayout}>
          <Form.Item label={deliveredConfirmLocale.unDeliveredDuty}>
            { getFieldDecorator('unDeliveredDuty', {
              initialValue: undefined,
              rules: [
                { required: true, message: notNullLocale(deliveredConfirmLocale.unDeliveredDuty) },
              ],
            })(
              <Select style={{width:'100%'}} placeholder={placeholderChooseLocale(deliveredConfirmLocale.unDeliveredDuty)}>
                {dutyOptions}
              </Select>
            )}
          </Form.Item>
        </Form>
      </Modal> ;
    });

    return <CreateFormDuty />;
  }

  drawOtherCom = ()=>{
    const { drawerVisble,historyBillNumber } = this.state;
    const formItemLayout = {
      labelCol: {
        xs: { span: 48 },
        sm: { span:8 },
      },
      wrapperCol: {
        xs: { span: 48 },
        sm: { span: 10 },
      },
    };
    const { getFieldDecorator } = this.props.form;

    return <div>
      {this.CreateFormReason()}
      {this.CreateFormDuty()}
    </div>;
  }
  
}
