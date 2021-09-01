import { connect } from 'dva';
import { Fragment, PureComponent } from 'react';
import moment from 'moment';
import { Form, Input, message, Button,Card,Radio } from 'antd';
import FormPanel from '@/pages/Component/Form/FormPanel';
import CFormItem from '@/pages/Component/Form/CFormItem';
import ItemEditTable from '@/pages/Component/Form/ItemEditTable';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import Page from '@/pages/Component/Page/inner/Page';
import NavigatorPanel from '@/pages/Component/Page/inner/NavigatorPanel';
import { State } from '@/pages/In/Order/OrderContants';
import Empty from '@/pages/Component/Form/Empty';
import PanelItemBatchAdd from '@/pages/Component/Form/PanelItemBatchAdd';
import SearchFormItemBatchAdd from './SearchFormItemBatchAdd';
import PrintButton from '@/pages/Component/Printer/PrintButton';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { loginCompany, loginOrg, } from '@/utils/LoginContext';
import { convertCodeName } from '@/utils/utils';
import { commonLocale, notNullLocale, placeholderLocale,tooLongLocale } from '@/utils/CommonLocale';
import OrderBillNumberSelect from './OrderBillNumberSelect';
import { checkInWrhLocale } from './CheckInWrhLocale';
import { InWrhState } from './CheckInWrhContants';

const { Search } = Input;

@connect(({ inwrh,order, loading }) => ({
  inwrh,
  order,
  loading: loading.models.inwrh,
}))
@Form.create()
export default class CheckInWrhCreatePage extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      title: checkInWrhLocale.title,
      showInWrh:true,
      batchAddVisible:false,
      submitting: false,
      pageFilter: {
        page: 0,
        pageSize: 20,
        sortFields: {}
      },
      entity: {
        operateMethod: "WEB",
        items: []
      },
      inwrhBillNumber:'',
      billInfo:{},
      releaseConfigs:'',
      orderList: {
        list: [],
        pagination: {},
      },

    }
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.order.orderEntity&&this.props.order.orderEntity!=nextProps.order.orderEntity){
      let orderEntity = nextProps.order.orderEntity;
      const target = this.state.entity.items[this.state.line-1];
      target.state = orderEntity.state;
      target.vendor = orderEntity.vendor;
      target.qtyStr = orderEntity.totalQtyStr;
      target.articleCount = orderEntity.totalArticleCount;
      target.bookQtyStr = orderEntity.bookedQtyStr;
      target.bookArticleCount = orderEntity.bookedArticleCount;
      target.orderBillNumber = orderEntity.billNumber;
      target.sourceOrderBillNumber = orderEntity.sourceBillNumber;
    }

    this.setState({
      entity :{...this.state.entity}
    });

    if(nextProps.inwrh.inwrhBill&&this.props.inwrh.inwrhBill!=nextProps.inwrh.inwrhBill){
      let str =''
      if(nextProps.inwrh.inwrhBill.configs){
        for(var i =0;i<nextProps.inwrh.inwrhBill.configs.length;i++){
          str = str+nextProps.inwrh.inwrhBill.configs[i].name+';';
        }
      }

      this.setState({
        billInfo:nextProps.inwrh.inwrhBill,
        releaseConfigs :str
      });
    }

    if(this.props.inwrh.billNumber!=nextProps.inwrh.billNumber){
      this.setState({
        inwrhBillNumber:nextProps.inwrh.billNumber
      })
    }

    if(nextProps.order.data&&this.props.order.data!=nextProps.order.data){
      this.setState({
        orderList: nextProps.order.data,
      });
    }

  }

  /**
   * 选择一个订单号
   */
  onOrderChange = (value, line) => {
    this.setState({
      line: line,
    })
    this.props.dispatch({
      type: 'order/getByBillNumberAndDcUuid',
      payload: {
        dcUuid: loginOrg().uuid,
        sourceBillNumber: value
      },
    });
  }

  /**
   *  选择出园or入园
   */
  onChangeType =()=>{
    this.props.form.resetFields();


    this.setState({
      showInWrh:!this.state.showInWrh,
      billInfo:{},
      releaseConfigs:'',
      inwrhBillNumber:''
    })
  }
  clearAll = (e)=>{
    this.props.form.resetFields();
    this.state.entity.items.length = 0;
    this.setState({
      entity:{...this.state.entity},
      billInfo:{},
      releaseConfigs:'',
    })
  }

  /**
   * 登记
   */
  onCreate =(e)=>{
    e.preventDefault();
    const { form } = this.props;
    if(this.state.showInWrh){ // 入园
      form.validateFields((errors, fieldsValue) => {
        if (errors) return;
        let items = this.state.entity.items;
        this.setState({
          submitting: true,
        })
        for (let i = 0; i < items.length; i++) {
          if (!items[i].orderBillNumber) {
            items.splice(i, 1);
            if (items[i] && items[i].line) {
              items[i].line = i + 1;
            }
            i = i - 1;
          }
        }
        if(items.length==0){
          message.error('订单明细不能为空');
          this.setState({
            submitting: false,
          })
          return false;
        }
        // 订单号不能相同
        for (let n = 0;n<items.length;n++){
          for(let m = n+1 ;m<items.length;m++){
            if(items[n].orderBillNumber===items[m].orderBillNumber){
              message.error(`第${items[n].line}行与第${items[m].line}行重复！`);
              this.setState({
                submitting: false,
              })
              return false;
            }
          }
        }
        let data ={
          ...fieldsValue,
          ...this.state.entity
        }
        data.companyUuid=loginCompany().uuid;
        data.dcUuid=loginOrg().uuid;
        this.props.dispatch({
          type: 'inwrh/onSave',
          payload: data,
          callback: (response) => {
            if (response && response.success) {
              message.success(commonLocale.saveSuccessLocale);
              this.props.form.resetFields();
              this.state.entity.items.length = 0;
            }
            this.setState({
              submitting: false,
            })
          }
        });
      });
    }else{
      form.validateFields((errors, fieldsValue) => {
        if(errors&&errors.hasOwnProperty('inWrhbillNumber')) return;
        this.setState({
          submitting: true,
        })
        this.props.dispatch({
          type: 'inwrh/outWrh',
          payload: {
            billNumber:fieldsValue.inWrhbillNumber
          },
          callback: (response) => {
            if (response && response.success) {
              message.success(commonLocale.saveSuccessLocale);
              //展示打印按钮展示入园单号
              this.setState({
                inwrhBillNumber:fieldsValue.inWrhbillNumber,
                submitting: false,
              })
            }else{
              this.setState({
                submitting: false,
              })
            }
          }
        });
      });
    }
  }

  /** 批量添加弹出框*/
  handlebatchAddVisible = () => {
    this.setState({
      batchAddVisible: !this.state.batchAddVisible,
      orderList: {
        list: [],
        pagination: {},
      },
    })
  }
  /**
   * 根据入园单号搜索信息
   */
  onSearch = value => {
    const { dispatch } = this.props;
    dispatch({
      type: 'inwrh/getByBillNumber',
      payload: {
        inwrhBillNumber:value,
      },
      callback: (response) => {
        if (response && response.success && response.data) {
          let data = response.data.inwrhBill ? response.data.inwrhBill : null;
          this.setState({
            billInfo: {...data}
          })
        }
      }
    });
  };
  /**
   * 批量添加-检索订单
   */
  onSearchOrderBill = (data) => {
    let vendorUuid = undefined;
    if(data&&data.vendor){
      vendorUuid = JSON.parse(data.vendor).uuid;
    }

    const { pageFilter } = this.state;
    pageFilter.page = 0;
    pageFilter.searchKeyValues = {
      ...data,
      companyUuid: loginCompany().uuid,
      dcUuid: loginOrg().uuid,
      vendorUuid: vendorUuid,
      states: ['INITIAL', 'BOOKING','BOOKED'],
    };
    this.refreshTable();
  }
  refreshTable = () => {
    this.props.dispatch({
      type: 'order/query',
      payload: { ...this.state.pageFilter }
    });
  };

  /**
   * 批量增加表格改变时
   */
  tableChange = (pagination, filtersArg, sorter) => {
    const { pageFilter } = this.state;

    pageFilter.page = pagination.current - 1;
    pageFilter.pageSize = pagination.pageSize;

    // 判断是否有过滤信息
    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});

    if (sorter.field) {
      // 如果有排序字段，则需要将原来的清空
      pageFilter.sortFields = {};
      var sortField = `${sorter.field}`;
      var sortType = sorter.order === 'descend' ? true : false;
      pageFilter.sortFields[sortField] = sortType;
    }
    this.refreshTable();
  }

  /**获取批量增加的集合*/
  getItemList = (value) => {
    const { entity } = this.state;
    var newList = [];
    for (let i = 0; i < value.length; i++) {
      let obj = {
        state : value[i].state,
        vendor : value[i].vendor,
        qtyStr : value[i].totalQtyStr,
        articleCount : value[i].totalArticleCount,
        bookQtyStr : value[i].bookedQtyStr,
        bookArticleCount : value[i].bookedArticleCount,
        orderBillNumber : value[i].billNumber,
        sourceOrderBillNumber : value[i].sourceBillNumber,
      }
      if (entity.items && entity.items.find(function (item) {
        return item.orderBillNumber === obj.orderBillNumber &&
          item.sourceOrderBillNumber === obj.sourceOrderBillNumber
      }) === undefined) {
        newList.push({ ...obj });
      }
    }
    this.state.line = entity.items.length + 1;
    newList.map(item => {
      item.line = this.state.line;
      this.state.line++;
    });
    entity.items = [...entity.items, ...newList];
    this.setState({
      entity: { ...entity }
    })
  }

  /**
   * 绘制右上角按钮
   */
  drawActionButton = () => {
    return (
      <Fragment>
        <Button
          onClick={this.clearAll.bind(this)}
        >
          {checkInWrhLocale.clear}
        </Button>
        <Button type="primary"
                onClick={this.onCreate.bind(this)}
                loading={this.state.submitting}
        >
          {checkInWrhLocale.checkin}
        </Button>

      </Fragment>
    )
  }
  /**
   * 绘制表单
   */
  drawFormItems = () => {
    const { getFieldDecorator } = this.props.form;
    const { entity, defOwner } = this.state;
    let typeCol = [
      <CFormItem key='showInWrh' label={checkInWrhLocale.checkinType}>
        {
          getFieldDecorator('showInWrh', {
            initialValue: entity ? (entity.owner ? JSON.stringify(entity.owner) : this.state.showInWrh) : this.state.showInWrh,
            rules: [
              { required: true, message: notNullLocale(checkInWrhLocale.checkinType) }
            ],
          })(
            <Radio.Group
              onChange={this.onChangeType}
            >
              <Radio value={true}>{checkInWrhLocale.inWrh}</Radio>
              <Radio value={false}>{checkInWrhLocale.outWrh}</Radio>
            </Radio.Group>
          )
        }
      </CFormItem>,
      <br/>,
      this.state.inwrhBillNumber!=''?
        <CFormItem key='inWrhBillNumber' label={checkInWrhLocale.inWrhBillNumber}>
          {
            getFieldDecorator('inWrhBillNumber', {
              initialValue: this.state.inwrhBillNumber,
            })(
              <div>
                <div style={{marginRight:20,display:'inline',fontWeight:600}}>
                  {this.state.inwrhBillNumber}
                </div>
                <PrintButton
                  reportParams={[this.state.inwrhBillNumber]}
                  moduleId={'INWRHBILL'} />
              </div>
            )
          }
        </CFormItem>:null,
    ];
    let driverInfoCol = [
      <CFormItem key='driverName' label={checkInWrhLocale.driverName}>
        {
          getFieldDecorator('driverName', {
            initialValue: entity.driverName,
            rules: [
              { required: this.state.showInWrh?true:false, message: notNullLocale(checkInWrhLocale.driverName) },
              {
                max: 30,
                message: tooLongLocale(checkInWrhLocale.driverName, 30),
              },{ pattern:commonLocale.UnSpacePattern, message: commonLocale.UnSpacePatternMessage }
            ],
          })(
            <Input placeholder={placeholderLocale(checkInWrhLocale.driverName)} autoFocus/>
          )
        }
      </CFormItem>,
      <CFormItem key='driverPhone' label={checkInWrhLocale.driverPhone}>
        {
          getFieldDecorator('driverPhone', {
            initialValue: entity.driverPhone,
            rules: [
              { required: true, message: notNullLocale(checkInWrhLocale.driverPhone) },
              { pattern: checkInWrhLocale.phonePattern, message: checkInWrhLocale.phonePatternMessage },
            ],
          })(
            <Input placeholder={placeholderLocale(checkInWrhLocale.driverPhone)} />
          )
        }
      </CFormItem>,
      <CFormItem key='vehicleNum' label={checkInWrhLocale.vehicleNum}>
        {
          getFieldDecorator('vehicleNum', {
            initialValue: entity.vehicleNum,
            rules: [
              { required: this.state.showInWrh?true:false, message: notNullLocale(checkInWrhLocale.vehicleNum) },
              {
                max: 30,
                message: tooLongLocale(checkInWrhLocale.vehicleNum, 30),
              },{ pattern:commonLocale.UnSpacePattern, message: commonLocale.UnSpacePatternMessage }

            ],
          })(
            <Input placeholder={placeholderLocale(checkInWrhLocale.vehicleNum)} />
          )
        }
      </CFormItem>,
    ];

    let data=[<FormPanel key='typeInfo' title={checkInWrhLocale.checkinType} cols={typeCol}/>];
    if(this.state.showInWrh==true){
      data.push(<FormPanel key='driverInfo' title={checkInWrhLocale.driverInfo} cols={driverInfoCol}/>);
    }
    return data;
  }
  /**
   * 绘制按钮
   */
  drawBatchButton = () => {
    return (
      <span>
        <a onClick={() => this.handlebatchAddVisible()}>{commonLocale.batchAddLocale}</a>
      </span>
    )
  }
  /**
   * 绘制明细表格
   */
  drawTable = () => {
    const { getFieldDecorator } = this.props.form;
    const { entity, putawayBillitems, stocks, batchStocks } = this.state;
    let data = putawayBillitems;

    let itemsCols  = [
      {
        title: commonLocale.inOrderBillNumberLocale,
        dataIndex: 'orderBillNumber',
        key: 'orderBillNumber',
        width: colWidth.billNumberColWidth+150,
        render: (text, record) => {
          return (
            <OrderBillNumberSelect
              value={record.orderBillNumber}
              onChange={e => this.onOrderChange(e, record.line)}
              states={['INITIAL', 'BOOKING','BOOKED']}
            />
          );
        }
      },
      {
        title: checkInWrhLocale.state,
        dataIndex: 'state',
        key: 'state',
        width: colWidth.enumColWidth,
        render: (text) => text ? State[text].caption : <Empty />
      },
      {
        title: commonLocale.vendorLocale,
        dataIndex: 'vendor',
        key: 'vendor',
        width: colWidth.codeNameColWidth,
        render: (text) => text ? <EllipsisCol colValue={convertCodeName(text)} /> : <Empty />
      },
      {
        title: commonLocale.inAllQtyStrLocale,
        dataIndex: 'qtyStr',
        key: 'qtyStr',
        width: itemColWidth.qtyStrColWidth,
        render: (text) => text ? text : <Empty />
      },
      {
        title: commonLocale.inAllArticleCountLocale,
        dataIndex: 'articleCount',
        key: 'articleCount',
        width: colWidth.fixColWidth,
        render: (text) => text ? text : <Empty />
      },
      {
        title: checkInWrhLocale.bookedQtyStr,
        dataIndex: 'bookQtyStr',
        key: 'bookQtyStr',
        width: itemColWidth.qtyStrColWidth,
        render: (text) => text ? text : <Empty />
      },
      {
        title: checkInWrhLocale.bookedArticleCount,
        dataIndex: 'bookArticleCount',
        key: 'bookArticleCount',
        width: colWidth.fixColWidth,
        render: (text) => text!=undefined ? text : <Empty />
      },

    ];

    let batchOrderColumns = [
      {
        title: commonLocale.inOrderBillNumberLocale,
        dataIndex: 'billNumber',
        key: 'billNumber',
        width: colWidth.billNumberColWidth,
        render: (val,record) => <EllipsisCol colValue={val+'['+record.sourceBillNumber+']'} />
      },
      {
        title: checkInWrhLocale.state,
        dataIndex: 'state',
        key: 'state',
        width: colWidth.enumColWidth,
        render: (text) => text ? State[text].caption : <Empty />
      },
      {
        title: commonLocale.vendorLocale,
        dataIndex: 'vendor',
        key: 'vendor',
        width: colWidth.codeNameColWidth,
        render: (text) => text ? <EllipsisCol colValue={convertCodeName(text)} />: <Empty />
      },
      {
        title: commonLocale.inAllQtyStrLocale,
        dataIndex: 'totalQtyStr',
        key: 'totalQtyStr',
        width: itemColWidth.qtyColWidth,
        render: (text) => text ? text : <Empty />
      },
      {
        title: commonLocale.inAllArticleCountLocale,
        dataIndex: 'totalArticleCount',
        key: 'totalArticleCount',
        width: colWidth.qtyColWidth,
        render: (text) => text ? text : <Empty />
      },
      {
        title: checkInWrhLocale.bookedQtyStr,
        dataIndex: 'bookedQtyStr',
        key: 'bookedQtyStr',
        width: itemColWidth.qtyColWidth,
        render: (text) => text ? text : <Empty />
      },
      {
        title: checkInWrhLocale.bookedArticleCount,
        dataIndex: 'bookedArticleCount',
        key: 'bookedArticleCount',
        width: itemColWidth.qtyColWidth,
        render: (text) => text!=undefined ? text : <Empty />
      },
    ]

    return (
      <div>
        <ItemEditTable
          title={checkInWrhLocale.orderInfo}
          columns={itemsCols}
          data={this.state.entity.items}
          drawBatchButton={this.drawBatchButton}
          notNote={true}
        />
        <PanelItemBatchAdd
          searchPanel={<SearchFormItemBatchAdd refresh={this.onSearchOrderBill} fieldsValue={''} />}
          visible={this.state.batchAddVisible}
          columns={batchOrderColumns}
          data={this.state.orderList}
          handlebatchAddVisible={this.handlebatchAddVisible}
          getSeletedItems={this.getItemList}
          onChange={this.tableChange}
          comId={'checkInWrh.search.batchTable'}
        />
      </div>
    )
  }

  /**
   * 查询入园信息
   */
  searchInWrhInfo =()=>{
    const { getFieldDecorator } = this.props.form;
    const { billInfo } = this.state;
    let cols =[
      <CFormItem key='inWrhbillNumber' label={checkInWrhLocale.inWrhBillNumber}>
        {
          getFieldDecorator('inWrhbillNumber', {
            rules: [
              { required: true, message: notNullLocale(checkInWrhLocale.inWrhBillNumber) }
            ],
          })(
            <Search
              placeholder={placeholderLocale(checkInWrhLocale.inWrhBillNumber)}
              onSearch={value => this.onSearch(value)}
              onPressEnter={e => this.onSearch(e.target.defaultValue)}
              style={{ width: 200 }}
            />
          )
        }
      </CFormItem>,
      <CFormItem key='state' label={commonLocale.stateLocale}>
        {
          getFieldDecorator('state', {
            initialValue: billInfo.state,
          })(
            <span>{billInfo.state?InWrhState[billInfo.state].caption:<Empty/>} </span>
          )
        }
      </CFormItem>,
      <CFormItem key='driverName' label={checkInWrhLocale.driver}>
        {
          getFieldDecorator('driverName', {
            initialValue: billInfo.driverName,
          })(
            <span>{billInfo.driverName?billInfo.driverName:<Empty/>} </span>
          )
        }
      </CFormItem>,
      <CFormItem key='vehicleNum' label={checkInWrhLocale.vehicleNum}>
        {
          getFieldDecorator('vehicleNum', {
            initialValue: billInfo.vehicleNum,
          })(
            <span>{billInfo.vehicleNum?billInfo.vehicleNum:<Empty/>}</span>
          )
        }
      </CFormItem>,
      <CFormItem key='configs' label={checkInWrhLocale.releaseContent}>
        {
          getFieldDecorator('configs', {
            initialValue: billInfo.releaseContentConfigs,
          })(
            <span>{billInfo!=''?billInfo.releaseContentConfigs:<Empty/>}</span>
          )
        }
      </CFormItem>,
    ];

    return [
      <FormPanel key='inWrhInfo' title={checkInWrhLocale.inWrhInfo} cols={cols}/>,
    ];
  }
  render() {
    const { data, filterValue, schedule, traceId, abortAndConfirmButtonVisible } = this.state;
    return (
      <PageHeaderWrapper>
        <Page>
          <NavigatorPanel title={this.state.title} action={this.drawActionButton()}/>
          <Card bordered={false}>
            <Form onChange={this.onChange}>
              {this.drawFormItems()}
              {this.state.showInWrh==true?this.drawTable():this.searchInWrhInfo()}
            </Form>
          </Card>
        </Page>
      </PageHeaderWrapper>
    )
  }
}
