import { connect } from 'dva';
import CreatePage from './CreatePage';
import FormPanel from '@/pages/Component/Form/FormPanel';
import CFormItem from '@/pages/Component/Form/CFormItem';
import { loginCompany, loginOrg, loginUser, getDefOwner,getActiveKey} from '@/utils/LoginContext';
import { Form, Select, Input, Switch, message, Col, DatePicker, Modal } from 'antd';
import { commonLocale, notNullLocale,tooLongLocale, placeholderLocale, placeholderChooseLocale, confirmLineFieldNotNullLocale } from '@/utils/CommonLocale';
import { qtyStrToQty, add, toQtyStr } from '@/utils/QpcStrUtil';
import { convertCodeName } from '@/utils/utils';
import ItemEditTable from '@/pages/Component/Form/ItemEditTable';
import QtyStrInput from '@/pages/Component/Form/QtyStrInput';
import { formatDate } from '@/utils/utils';
import { alcNtcLocale } from './TransportOrderLocale';
import { LogisticMode } from '@/pages/In/Order/OrderContants';
import OwnerSelect from '@/pages/Component/Select/OwnerSelect';
import StoreSelect from './StoreSelect';
import DeliverySelect from './DeliverySelect';
import { STATE } from '@/utils/constants';
import { PRETYPE } from '@/utils/constants';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { MAX_DECIMAL_VALUE } from '@/utils/constants';
import { orderBillType, urgencyLevel } from './TransportOrderContants';
import { addressToStr, addressToStr1 } from '@/utils/utils';
import { orderLocale } from '../../In/Order/OrderLocale';
import DeliverySelectForPick from './DeliverySelectForPick';
import Empty from '@/pages/Component/Form/Empty';
import moment from 'moment';
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm';
import VendorSelect from '@/pages/Component/Select/VendorSelect';
import { accDiv, accMul } from '@/utils/QpcStrUtil'

const orderTypeOptions = [];
Object.keys(orderBillType).forEach(function (key) {
  orderTypeOptions.push(<Option value={orderBillType[key].name} key={orderBillType[key].name}>{orderBillType[key].caption}</Option>);
});

const urgencyLevelOptions = [];
Object.keys(urgencyLevel).forEach(function (key) {
  urgencyLevelOptions.push(<Option value={urgencyLevel[key].name} key={urgencyLevel[key].name}>{urgencyLevel[key].caption}</Option>);
});
@connect(({ transportOrder, order, article, store, dc, loading }) => ({
  transportOrder,
  order,
  article,
  store,
  dc,
  loading: loading.models.transportOrder,
}))
@Form.create()
export default class TransportOrderCreatePage extends CreatePage {

  constructor(props) {
    super(props);
    this.state = {
      title: commonLocale.createLocale + alcNtcLocale.title,
      entityUuid: props.transportOrder.entityUuid,
      orderBillItems: [],
      articleMap: {},
      qpcStrAndMunitOptions: [],
      qtyStr: '',
      entity: {
        owner: getDefOwner() ? getDefOwner() : undefined,
        articleDetails: [],
        sourceWay: "CREATE",
        deliveryPoint: props.transportOrder.entity.deliveryPoint
      },
      articles: [],
      deliveryInfo:props.transportOrder.entity.deliveryPoint,
      owner: getDefOwner(),
      showTack: false,
      addDetail: true
    }
  }

  componentDidMount() {
    if(this.state.entityUuid) {
      this.refresh();
      this.refreshStore();
    } else {
      this.state.entity.deliveryPoint = null;
      this.setState({
        entity: { ...this.state.entity },
        deliveryInfo: null
      })
      this.state.entity = {
        owner: getDefOwner() ? getDefOwner() : undefined,
        articleDetails: [],
        sourceWay: "CREATE",
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.entityUuid && nextProps.transportOrder.entity !== this.props.transportOrder.entity && nextProps.transportOrder.entity.uuid === this.state.entityUuid) {
      if(nextProps.transportOrder.entity.articleDetails){
        nextProps.transportOrder.entity.articleDetails.forEach(item=>{
          item.volume = Number (accDiv(item.volume,1000000).toFixed(4));
          item.weight = Number (accDiv(item.weight,1000).toFixed(4));
        })
      }
      this.setState({
        entity: nextProps.transportOrder.entity,
        showTack: nextProps.transportOrder.entity.orderType && nextProps.transportOrder.entity.orderType === 'TakeDelivery' ? true : false,
        orderBillItems: nextProps.transportOrder.entity.articleDetails ? nextProps.transportOrder.entity.articleDetails : [],
        title: alcNtcLocale.title + "：" + nextProps.transportOrder.entity.billNumber,
      });
      if(nextProps.transportOrder.entity.articleDetails && nextProps.transportOrder.entity.articleDetails.length>0) {
        this.setState({
          addDetail: true
        })
      } else {
        this.setState({
          addDetail: false
        })
      }
    }
    if (nextProps.article.data.list && Array.isArray(nextProps.article.data.list)&&nextProps.article.data.list!=this.props.article.data.list) {
      this.setState({
        articles: nextProps.article.data.list
      });

    }

    if (nextProps.article.qpcs&&nextProps.article.qpcs!=this.props.article.qpcs && Array.isArray(nextProps.article.qpcs)) {
      const { articleMap } = this.state;
      nextProps.article.qpcs.forEach(item=>{
        item.weight = accDiv(item.weight,item.paq);
        item.volumn = accDiv(item.length*item.width*item.height,item.paq);
      });
      articleMap[nextProps.article.articleUuid] = nextProps.article.qpcs;
      this.setState({
        articleMap: {
          ...articleMap
        }
      });
    }
  }

  onCancel = () => {
    this.props.form.resetFields();
    this.props.dispatch({
      type: 'transportOrder/showPage',
      payload: {
        showPage: 'query'
      }
    });
  }

  onSave = (data) => {
    const creation = this.convertData(data);
    if (!creation) {
      return;
    }
    if (!this.state.entity.uuid) {
      this.props.dispatch({
        type: 'transportOrder/onSave',
        payload: creation,
        callback: (response) => {
          if (response && response.success) {
            this.props.form.resetFields();
            message.success(commonLocale.saveSuccessLocale);
          }
        }
      });
    } else {
      this.props.dispatch({
        type: 'transportOrder/modify',
        payload: creation,
        callback: (response) => {
          if (response && response.success) {
            this.props.form.resetFields();
            message.success(commonLocale.modifySuccessLocale);
          }
        }
      });
    }
  }

  convertData(data) {
    const { entity, orderBillItems } = this.state;
    let pickUpPoint = null;
    let deliveryPoint = null;
    if(data.pickUpPoint) {
      pickUpPoint = JSON.parse(data.pickUpPoint);
      pickUpPoint.specificAddress = data.pickSpecificAddress ? data.pickSpecificAddress : ''
    }
    if(data.deliveryPoint) {
      if(data.deliveryPoint.charAt(0)==='{') {
        deliveryPoint = JSON.parse(data.deliveryPoint);
      } else {
        deliveryPoint.code =  data.deliveryPoint ? data.deliveryPoint : '';
      }
      deliveryPoint.specificAddress =  data.deliverySpecificAddress ? data.deliverySpecificAddress : '';
      deliveryPoint.contacter =  data.contactor ? data.contactor : '';
      deliveryPoint.contactNumber =  data.contactPhone ? data.contactPhone : '';
      deliveryPoint.address =  data.address ? data.address : '';
      deliveryPoint.name =  data.deliveryPointName ? data.deliveryPointName : '';
    }
    let items = [];
    if(Array.isArray(orderBillItems) && orderBillItems.length > 0 ) {
      for (let i = 0; i < orderBillItems.length; i++) {
        if (!orderBillItems[i].article) {
          orderBillItems.splice(i, 1);
          if (orderBillItems[i] && orderBillItems[i].line) {
            orderBillItems[i].line = i + 1;
          }
        }
      }
      for (let i = 0; i <= orderBillItems.length - 1; i++) {
        if (!orderBillItems[i].article) {
          message.error(confirmLineFieldNotNullLocale(orderBillItems[i].line, commonLocale.inArticleLocale));
          return false;
        } else if (!orderBillItems[i].qpcStr || !orderBillItems[i].munit) {
          message.error(confirmLineFieldNotNullLocale(orderBillItems[i].line, commonLocale.inQpcAndMunitLocale));
          return false;
        } else if (!orderBillItems[i].qty || orderBillItems[i].qty <= 0) {
          message.error('第' + orderBillItems[i].line + '行数量必须大于0');
          return false;
        }else if (orderBillItems[i].note && orderBillItems[i].note.length > 255) {
          message.error('第' + orderBillItems[i].line + '行备注长度最大为255');
          return false;
        }
        let articleItem = {};
        let endValue = orderBillItems[i].qtyStr;
        articleItem.article = orderBillItems[i].article;
        articleItem.billUuid = '';
        articleItem.uuid = '';
        articleItem.barcode = orderBillItems[i].barcode;
        articleItem.line = orderBillItems[i].line;
        articleItem.qpcStr = orderBillItems[i].qpcStr;
        articleItem.qpc = orderBillItems[i].qpc;
        articleItem.munit = orderBillItems[i].munit;
        articleItem.qty = orderBillItems[i].qty;
        articleItem.amount = orderBillItems[i].amount;
        articleItem.qtyStr = endValue && Array.isArray(endValue) && endValue.charAt(endValue.length-1) === '0' ? parseFloat(orderBillItems[i].qtyStr) : orderBillItems[i].qtyStr;
        articleItem.weight = accMul(orderBillItems[i].weight,1000) ;
        articleItem.volume = accMul(orderBillItems[i].volume,1000000) ;
        articleItem.containerCode = '';
        items.push(articleItem);
      }
    }
    let alcNtcCreation = {
      billNumber: this.state.entity.billNumber,
      cartonCount: data.cartonCount ? data.cartonCount : 0,
      scatteredCount: data.scatteredCount ? data.scatteredCount : 0,
      totalQtyStr: this.state.entity.totalQtyStr,
      createInfo: this.state.entity.createInfo ? this.state.entity.createInfo : {},
      stat: this.state.entity.stat,
      uuid: this.state.entity.uuid ? this.state.entity.uuid : '',
      companyUuid: loginCompany().uuid,
      containerCount: data.containerCount ? data.containerCount : 0,
      lastModifyInfo:{},
      version: this.state.entity.version ? this.state.entity.version : 0,
      wmsNum: this.state.entity.wmsNum ? this.state.entity.wmsNum : '',
      dispatchCenterUuid:loginOrg().uuid,
      sourceNum:data.sourceNum,
      orderTime: formatDate(data.orderTime, true),
      appointmentTime: data.appointmentTime,
      versionTime:'',
      weight:data.weight ? data.weight : 0,
      note: data.note,
      volume: data.volume ? data.volume : 0,
      waveNum: this.state.entity.waveNum ? this.state.entity.waveNum : '',
      scheduleNum: this.state.entity.waveNum ? this.state.entity.waveNum : '',
      owner: JSON.parse(data.owner),
      orderType: data.orderType,
      urgencyLevel: data.urgencyLevel,
      allowCashResult: data.allowCashResult,
      selfhandover: (data.selfhandover=== (true || '自提')) ? true : false,
      pickUpPoint: pickUpPoint,
      deliveryPoint: deliveryPoint,
      finalPoint: this.state.entityUuid && entity.finalPoint ? entity.finalPoint : entity.deliveryPoint ? entity.deliveryPoint : deliveryPoint,
      articleDetails: items,
      containerDetails: [],
      pendingTag:'Normal',
      vendor:data.vendor?JSON.parse(data.vendor):undefined,
      sourceOrderBillTms: this.state.entity.sourceOrderBillTms ? this.state.entity.sourceOrderBillTms : undefined,
      sourceWay: this.state.entity.sourceWay ? this.state.entity.sourceWay : '',
      oldStat: this.state.entity.oldStat ? this.state.entity.oldStat : '',
    };
    return alcNtcCreation;
  }

  refresh = () => {
    this.props.dispatch({
      type: 'transportOrder/get',
      payload: this.state.entityUuid
    });
  }

  refreshStore = () => {
    const { deliveryInfo } = this.state;
    this.props.dispatch({
      type: 'store/query',
      payload: {
        page: 0,
        pageSize: 0,
        searchKeyValues: {
          codeName: null,
          companyUuid: loginCompany().uuid
        },
        sortFields: {
          code: false
        }
      },
      callback: response => {
        if (response && response.success && response.data && response.data.records) {
          let list = response.data.records;
          Array.isArray(list) && list.forEach(function (item) {
           if(deliveryInfo && deliveryInfo.code && deliveryInfo.code === item.code) {
             if(deliveryInfo.type === 'Store') {
               deliveryInfo.uuid = item.uuid;
               deliveryInfo.code = item.code;
               deliveryInfo.name = item.name;
               deliveryInfo.address = addressToStr1(item.address);
               deliveryInfo.contacter = item.contactor;
               deliveryInfo.contactNumber = item.contactPhone;
               deliveryInfo.type = 'Store';
             }
           }
          });
          if(deliveryInfo.type === 'Store') {
            this.setState({
              deliveryInfo:{
                uuid : deliveryInfo.uuid,
                code : deliveryInfo.code,
                name : deliveryInfo.name,
                type : deliveryInfo.type,
                address : deliveryInfo.address,
                contacter : deliveryInfo.contacter,
                contactNumber : deliveryInfo.contactNumber,
              }
            })
          }
         if(deliveryInfo.type === 'DeliveryCenter') {
           this.setState({
             deliveryInfo:{
               uuid : deliveryInfo.uuid,
               code : deliveryInfo.code,
               name : deliveryInfo.name,
               type : deliveryInfo.type,
               address : deliveryInfo.address,
               contacter : deliveryInfo.contacter,
               contactNumber : deliveryInfo.contactNumber,
             }
           })
         }
        }
      }
    });
  }

  onOwnerChange = (value) => {
    const { orderBillItems,entity } = this.state;
    let originalOwner = this.props.form.getFieldValue('owner');
    if (!entity.articleDetails||(entity.articleDetails&&orderBillItems.length == 0 && entity.articleDetails.length == 0)) {
      entity.owner = JSON.parse(value);
      entity.vendor = undefined;
      this.props.form.setFieldsValue({
        vendor:undefined
      });
      this.setState({
        owner: JSON.parse(value),
        entity:{...entity}
      });
    }else if (entity.articleDetails&&(orderBillItems.length > 0 || entity.articleDetails.length > 0)){
      Modal.confirm({
        title: '修改货主会导致商品信息清空，请确认修改？',
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          entity.articleDetails = [];
          entity.owner = JSON.parse(value);
          entity.vendor = undefined;
          this.setState({
            owner: JSON.parse(value),
            orderBillItems:[],
            entity: { ...entity }
          }, () => {
            this.props.form.setFieldsValue({
              owner: value,
              vendor:undefined
            });
          });
        },
        onCancel: () => {
          this.props.form.setFieldsValue({
            owner: originalOwner
          });
        }
      });
    }
  }

  /**
   * 选择供应商时
   */
  handleChangeVendor = (value) => {
    const { orderBillItems,entity } = this.state;
		let originalVendor = this.props.form.getFieldValue('vendor');
    if (orderBillItems.length == 0 && entity.articleDetails &&entity.articleDetails.length == 0) {
      this.setState({
        vendor: JSON.parse(value),
      });
    }else if (orderBillItems.length > 0 || (entity.articleDetails&&entity.articleDetails.length > 0)){
      Modal.confirm({
				title: '修改供应商会导致商品信息清空，请确认修改？',
				okText: '确认',
				cancelText: '取消',
				onOk: () => {
          entity.items = [];
					this.setState({
            vendor: JSON.parse(value),
            orderBillItems:[],
						entity: { ...entity }
					}, () => {
						this.props.form.setFieldsValue({
							vendor: value,
						});
					});
				},
				onCancel: () => {
					this.props.form.setFieldsValue({
						vendor: originalVendor
					});
				}
			});
    }
  }

  /**
   * 是否添加明细
   */
  onChangeState = () => {
    const { entity, addDetail } = this.state;
    entity.cartonCount = 0;
    entity.containerCount = 0;
    entity.weight = 0;
    entity.volume = 0;
    if(addDetail) {
      this.setState({
        orderBillItems:[]
      })
    }
    this.setState({
      addDetail: !addDetail
    });
  };

  onTypeChange = (value) => {
    const { entity } = this.state;
    entity.orderType = value;
    if(value === 'TakeDelivery') {
      entity.pickUpPoint = null;
      entity.deliveryPoint = null;
      entity.finalPoint = null;
      this.setState({
        showTack: true,
        pickInfo: undefined,
        deliveryInfo: undefined,
        finalPoint: undefined
      })
    } else {
      entity.pickUpPoint = null;
      entity.deliveryPoint = null;
      entity.finalPoint = null;
      entity.vendor = undefined
      this.setState({
        showTack: false,
        pickInfo: undefined,
        deliveryInfo: undefined,
        finalPoint: undefined
      })
    }
    this.setState({
      entity: { ...entity }
    });
  };

    onFieldChange = (value, field, showTack) => {
    const { entity } = this.state;
    if (field === 'pickUpPoint') {
      if(!showTack) {
        const dc = JSON.parse(value);
        this.props.dispatch({
          type: 'dc/get',
          payload: {
            uuid: dc.uuid
          },
          callback: response => {
            if (response && response.success && response.data) {
              this.setState({
                pickInfo: response.data
              })
            }
          }
        });
      } else {
        const vendor = JSON.parse(value);
        this.props.dispatch({
          type: 'vendor/get',
          payload: vendor.uuid,
          callback: response => {
            if (response && response.success && response.data) {
              this.setState({
                pickInfo: response.data
              })
            }
          }
        });
      }
    }
    if (field === 'deliveryPoint') {
      if(!showTack) {
        const dc = JSON.parse(value);
        this.props.dispatch({
          type: 'dc/get',
          payload: {
            uuid: dc.uuid
          },
          callback: response => {
            if (response && response.success && response.data) {
              this.setState({
                deliveryInfo: response.data,
                entity: {...entity},
              })
            }
          }
        });
      } else {
        const store = JSON.parse(value);
        if(store && store.uuid) {
          this.props.dispatch({
            type: 'store/getByCompanyUuidAndUuid',
            payload: store.uuid,
            callback: response => {
              if (response && response.success && response.data) {
                let deliveryInfo = {};
                entity.deliveryPoint = store;
                deliveryInfo = store;
                // 处理修改送货信息，最终点跟随变化的问题
                // entity.finalPoint = store;
                this.setState({
                  // deliveryInfo: response.data,
                  deliveryInfo: { ...deliveryInfo },
                  entity: {...entity}
                })
              }
            }
          });
        } else {
          if(entity.deliveryPoint) {
            entity.deliveryPoint.contacter = '';
            entity.deliveryPoint.contactNumber = '';
            entity.deliveryPoint.address = '';
            entity.deliveryPoint.specificAddress = '';
            // 处理数据更新，界面数据依然保留原值的问题
            this.props.form.setFieldsValue({
              deliveryPointName:'',
              contactor:'',
              contactPhone:'',
              address:''
            });
            this.setState({
              entity: {...entity}
            })
          }
        }
      }
      this.setState({
        entity: {...entity}
      })
    }
    if(field === 'deliverySpecificAddress') {
      if(entity.deliveryPoint) {
        if(entity.stat === 'Saved' && entity.deliveryPoint.specificAddress && entity.finalPoint.specificAddress) {
          entity.finalPoint.specificAddress = value.target.value;
        }
        entity.deliveryPoint.specificAddress = value.target.value;
      }
      this.setState({
        entity: {...entity}
      })
    }
      if(field === 'contacter') {
        if(entity.deliveryPoint) {
          entity.deliveryPoint.contacter = value.target.value;
        }
        this.setState({
          entity: {...entity}
        })
      }
      if(field === 'contactNumber') {
        if(entity.deliveryPoint) {
          entity.deliveryPoint.contactPhone = value.target.value;
        }
        this.setState({
          entity: {...entity}
        })
      }
      if(field === 'address') {
        if(entity.deliveryPoint) {
          entity.deliveryPoint.address = value.target.value;
        }
        this.setState({
          entity: {...entity}
        })
      }
      if(field === 'deliveryPointName') {
        if(entity.deliveryPoint) {
          entity.deliveryPoint.name = value.target.value;
        }
        this.setState({
          entity: {...entity}
        })
      }

  }

  drawFormItems = () => {
    const { getFieldDecorator } = this.props.form;
    const { entity, pickInfo, deliveryInfo, addDetail, initValue, showTack } = this.state;
    const owner = this.props.form.getFieldValue('owner');
    let orgOwnerUuid = '';
    let orderOwnerUuid = null;
    let pickUpPoint = null;
    let deliveryPoint = null;
    if (owner) {
      orgOwnerUuid = JSON.parse(owner).uuid;
      orderOwnerUuid = JSON.parse(owner).uuid;
    }

    if (entity.store) {
      entity.store.type = 'STORE';
    }
    if(entity.pickUpPoint) {
      let a = JSON.stringify(entity.pickUpPoint);
      let b = JSON.parse(a)
      pickUpPoint = b;
      pickUpPoint.specificAddress = undefined;
    }
    if(entity.deliveryPoint) {
      let c = JSON.stringify(entity.deliveryPoint);
      let d = JSON.parse(c)
      deliveryPoint = d;
      deliveryPoint.specificAddress = undefined;
    }
    let confirm = '';
    if(addDetail) {
      confirm = '清空'
    }
    if(!addDetail) {
      confirm = '添加'
    }
    // console.log('===========无奈'+JSON.stringify(deliveryInfo));
    if(deliveryInfo && deliveryInfo.address && typeof(deliveryInfo.address) !== 'string') {
      deliveryInfo.address = addressToStr1(deliveryInfo.address)
      this.setState({
        deliveryInfo:{ ...deliveryInfo }
      })
    }
    let cols = [
      <CFormItem key='wmsNum' label={alcNtcLocale.wmsNum}>
        {
          getFieldDecorator('wmsNum', {
            initialValue: entity.wmsNum,
            rules: [{
              max: 30, message: tooLongLocale(alcNtcLocale.wmsNum),
            }],
          })(
            <Input disabled={true} />
          )
        }
      </CFormItem>,
      <CFormItem key='sourceNum' label={alcNtcLocale.sourceBillNumber}>
        {
          getFieldDecorator('sourceNum', {
            initialValue: entity.sourceNum,
            rules: [{
              max: 30, message: tooLongLocale(alcNtcLocale.sourceBillNumber),
            }],
          })(
            <Input disabled={entity.stat === 'Initial'|| entity.stat === 'Scheduled' || entity.stat === 'Shiped'} placeholder={placeholderLocale(alcNtcLocale.sourceNum)} />
          )
        }
      </CFormItem>,
      <CFormItem key='waveNum' label={alcNtcLocale.waveNum}>
        {
          getFieldDecorator('waveNum', {
            initialValue: entity.waveNum,
            rules: [{
              max: 30, message: tooLongLocale(alcNtcLocale.waveNum),
            }],
          })(
            <Input disabled={true} />
          )
        }
      </CFormItem>,
      <CFormItem label={commonLocale.inOwnerLocale} key='owner'>
        {getFieldDecorator('owner', {
          initialValue: JSON.stringify(entity.owner),
          rules: [
            { required: true, message: notNullLocale(commonLocale.inOwnerLocale) }
          ]
        })(
          <OwnerSelect disabled={entity.stat === 'Initial' || entity.stat === 'Scheduled' || entity.stat === 'Shiped'} onChange={this.onOwnerChange} onlyOnline placeholder={placeholderChooseLocale(commonLocale.inOwnerLocale)} />
        )}
      </CFormItem>,
      this.state.entityUuid ? <CFormItem label={alcNtcLocale.orderType} key='orderType'>
        {getFieldDecorator('orderType', {
          initialValue: entity.orderType ? entity.orderType : '' ,
          rules: [
            { required: true, message: notNullLocale(alcNtcLocale.orderType) }
          ]}
        )(
          <Select disabled={entity.stat === 'Initial'|| entity.stat === 'Scheduled' || entity.stat === 'Shiped'} onChange={this.onTypeChange}>{orderTypeOptions}</Select>)}
      </CFormItem> : <CFormItem label={alcNtcLocale.orderType} key='orderType'>
        {getFieldDecorator('orderType', {
          initialValue: entity.orderType ? entity.orderType : '' ,
          rules: [
            { required: true, message: notNullLocale(alcNtcLocale.orderType) }
          ]}
        )(
          <Select onChange={this.onTypeChange}>
            <Select.Option key={'TakeDelivery'} value={'TakeDelivery'}>提货</Select.Option>
          </Select>)}
      </CFormItem>,
      <CFormItem label={alcNtcLocale.urgencyLevel} key='urgencyLevel'>
        {getFieldDecorator('urgencyLevel', {
          initialValue: entity.urgencyLevel ? entity.urgencyLevel : false ,
          rules: [
            { required: true, message: notNullLocale(alcNtcLocale.urgencyLevel) }
          ]}
        )(
          <Select disabled={entity.stat === 'Initial'|| entity.stat === 'Scheduled' || entity.stat === 'Shiped'}>
            <Select.Option key={1} value={true}>是</Select.Option>
            <Select.Option key={0} value={false}>否</Select.Option>
          </Select>)}
      </CFormItem>,
      <CFormItem label={alcNtcLocale.allowCashResult} key='allowCashResult'>
        {getFieldDecorator('allowCashResult', {
          initialValue: entity.allowCashResult ? entity.allowCashResult : false ,
          rules: [
            { required: true, message: notNullLocale(alcNtcLocale.allowCashResult) }
          ]}
        )(
          <Select disabled={entity.stat !== 'Initial' && entity.stat !== 'Saved' && entity.stat !== 'Scheduled' && entity.stat !== 'Shiped' && this.state.entityUuid}>
            <Select.Option key={1} value={true}>是</Select.Option>
            <Select.Option key={0} value={false}>否</Select.Option>
          </Select>)}
      </CFormItem>,
      <CFormItem label={'调度类型'} key='selfhandover'>
        {getFieldDecorator('selfhandover', {
          initialValue: entity.selfhandover ? '自提' : '配送' ,
          rules: [
            { required: true, message: notNullLocale(alcNtcLocale.selfhandover) }
          ]}
        )(
          <Select disabled={true}>
            <Select.Option key={1} value={true}>自提</Select.Option>
            <Select.Option key={0} value={false}>配送</Select.Option>
          </Select>)}
      </CFormItem>,
      <CFormItem key='orderTime' label={alcNtcLocale.orderTime}>
        {
          getFieldDecorator('orderTime', {
            initialValue: entity.orderTime ? moment(entity.orderTime, 'YYYY-MM-DD') : null,
            rules: [
              { required: true, message: notNullLocale(alcNtcLocale.orderTime) }
            ],
          })(
            <DatePicker disabled={entity.stat === 'Initial'|| entity.stat === 'Scheduled' || entity.stat === 'Shiped'} style={{ width: '100%' }} />
          )
        }
      </CFormItem>,
      <CFormItem key='appointmentTime' label={'预约时间'}>
        {
            getFieldDecorator('appointmentTime', {
            initialValue: entity.appointmentTime,
            rules: [
              { required: true, message: notNullLocale('预约时间') }
            ],
          })(
            <Input disabled={(entity.stat && entity.stat !== 'Initial' && entity.stat !== 'Saved')} style={{ width: '100%' }} />
          )
        }
      </CFormItem>,
      <CFormItem label={alcNtcLocale.pickUpPoint} key='pickUpPoint'>
        {getFieldDecorator('pickUpPoint', {
          initialValue: pickUpPoint ? JSON.stringify(pickUpPoint) : '',
          rules: [
            { required: true, message: notNullLocale(alcNtcLocale.pickUpPoint) }
          ]
        })(
          showTack ? <DeliverySelectForPick
            single
            disabled={entity.stat === 'Initial'|| entity.stat === 'Scheduled' || entity.stat === 'Shiped'}
            onChange={e => this.onFieldChange(e, 'pickUpPoint', true)}
            showSearch={true}
          /> : <DeliverySelect
            single
            disabled={entity.stat === 'Initial'|| entity.stat === 'Scheduled' || entity.stat === 'Shiped'}
            onChange={e => this.onFieldChange(e, 'pickUpPoint', false)}
            showSearch={true}
          />
        )}
      </CFormItem>,
      <CFormItem label={'取货点联系人'} key='contactor1'>
        {getFieldDecorator('contactor1', {
          initialValue: pickInfo && pickInfo.contactor ? pickInfo.contactor : '' || entity.pickUpPoint && entity.pickUpPoint.contacter ? entity.pickUpPoint.contacter : ''
        })(
          <Input disabled={true} />
        )}
      </CFormItem>,
      <CFormItem label={'取货点联系方式'} key='contactPhone1'>
        {getFieldDecorator('contactPhone1', {
          initialValue: pickInfo && pickInfo.contactPhone ? pickInfo.contactPhone : '' || entity.pickUpPoint && entity.pickUpPoint.contactNumber ? entity.pickUpPoint.contactNumber : ''
        })(
          <Input disabled={true} />
        )}
      </CFormItem>,
      <CFormItem label={'取货点地址'} key='address1'>
        {getFieldDecorator('address1', {
          initialValue: pickInfo && pickInfo.address ? addressToStr1(pickInfo.address) : null || entity.pickUpPoint && entity.pickUpPoint.address ? entity.pickUpPoint.address : ''
        })(
          <Input disabled={true} />
        )}
      </CFormItem>,
      <CFormItem label={'取货点具体位置'} key='pickSpecificAddress'>
        {getFieldDecorator('pickSpecificAddress', {
          initialValue: entity.pickUpPoint && entity.pickUpPoint.specificAddress ? entity.pickUpPoint.specificAddress : ''
        })(
          <Input disabled={(entity.stat && entity.stat !== 'Initial' && entity.stat !== 'Saved')}/>
        )}
      </CFormItem>,
      entity.orderType === 'PackageDelivery' ? <CFormItem key="deliveryPoint" label={'送货点代码'}>
        {getFieldDecorator('deliveryPoint')(
          <Col>{entity.deliveryPoint ? entity.deliveryPoint.code : '空'}</Col>
        )}
      </CFormItem>:<CFormItem label={'送货点代码'} key='deliveryPoint'>
        {getFieldDecorator('deliveryPoint', {
          initialValue: deliveryInfo ? JSON.stringify(deliveryInfo) : '',
          rules: [
            { required: true, message: notNullLocale('送货点代码') }
          ]
        })(
          (entity.orderType === 'TakeDelivery') ? <DeliverySelect
              single
              disabled={entity.stat === 'Initial' || entity.stat === 'Scheduled' || entity.stat === 'Shiped'}
              onChange={e => this.onFieldChange(e, 'deliveryPoint', false)}
              showSearch={true}
            /> : <StoreSelect
            single
            // disabled={entity.orderType !== 'TakeDelivery'}
            initValue={initValue}
            onChange={e => this.onFieldChange(e, 'deliveryPoint', true)}
            showSearch={true}
          />
        )}
      </CFormItem>,
      entity.orderType === 'PackageDelivery' ? <CFormItem key="deliveryPointName" label={'送货点名称'}>
        {getFieldDecorator('deliveryPointName')(
          <Col>{entity.deliveryPoint ? entity.deliveryPoint.name : '空'}</Col>
        )}
      </CFormItem>:<CFormItem label={'送货点名称'} key='deliveryPointName'>
        {getFieldDecorator('deliveryPointName', {
          initialValue: entity.deliveryPoint && entity.deliveryPoint.name ? entity.deliveryPoint.name : deliveryInfo && deliveryInfo.name ? deliveryInfo.name : ''
        })(
          <Input disabled={entity.orderType === 'TakeDelivery'} onChange={e => this.onFieldChange(e, 'deliveryPointName')}/>
        )}
      </CFormItem>,
      entity.orderType === 'PackageDelivery' ? <CFormItem key="contactor" label={'送货点联系人'}>
        {getFieldDecorator('contactor')(
          <Col>{entity.deliveryPoint && entity.deliveryPoint.contacter ? entity.deliveryPoint.contacter : '空'}</Col>
        )}
      </CFormItem> : <CFormItem label={'送货点联系人'} key='contactor'>
        {getFieldDecorator('contactor', {
          initialValue: entity.deliveryPoint && entity.deliveryPoint.contacter ? entity.deliveryPoint.contacter : deliveryInfo && deliveryInfo.contacter ? deliveryInfo.contacter : deliveryInfo && deliveryInfo.contactor ? deliveryInfo.contactor : ''
        })(
          <Input disabled={entity.orderType === 'TakeDelivery'} onChange={e => this.onFieldChange(e, 'contacter')}/>
        )}
      </CFormItem>,
      entity.orderType === 'PackageDelivery' ? <CFormItem key="contactPhone" label={'送货点联系方式'}>
        {getFieldDecorator('contactPhone')(
          <Col>{entity.deliveryPoint && entity.deliveryPoint.contactNumber ? entity.deliveryPoint.contactNumber : '空'}</Col>
        )}
      </CFormItem> : <CFormItem label={'送货点联系方式'} key='contactPhone'>
        {getFieldDecorator('contactPhone', {
          initialValue: entity.deliveryPoint && entity.deliveryPoint.contactNumber ? entity.deliveryPoint.contactNumber : deliveryInfo && deliveryInfo.contactNumber ? deliveryInfo.contactNumber : deliveryInfo && deliveryInfo.contactPhone ? deliveryInfo.contactPhone : ''
        })(
          <Input disabled={entity.orderType === 'TakeDelivery'} onChange={e => this.onFieldChange(e, 'contactNumber')}/>
        )}
      </CFormItem>,
      entity.orderType === 'PackageDelivery' ? <CFormItem key="address" label={'送货点地址'}>
        {getFieldDecorator('address')(
          <Col>{entity.deliveryPoint && entity.deliveryPoint.address ? entity.deliveryPoint.address : '空'}</Col>
        )}
      </CFormItem> : <CFormItem label={'送货点地址'} key='address'>
        {getFieldDecorator('address', {
          initialValue: entity.deliveryPoint && entity.deliveryPoint.address ? entity.deliveryPoint.address : deliveryInfo && deliveryInfo.address ? deliveryInfo.address : ''
        })(
          <Input disabled={entity.orderType === 'TakeDelivery'} onChange={e => this.onFieldChange(e, 'address')}/>
        )}
      </CFormItem>,
     <CFormItem label={'送货点具体位置'} key='deliverySpecificAddress'>
        {getFieldDecorator('deliverySpecificAddress', {
          initialValue: entity.deliveryPoint && entity.deliveryPoint.specificAddress ? entity.deliveryPoint.specificAddress : ''
        })(
          <Input
            onChange={e => this.onFieldChange(e, 'deliverySpecificAddress')}
            disabled={ entity.stat && entity.stat !== 'Initial' && entity.stat !== 'Saved' } />
        )}
      </CFormItem>
    ];
    if(entity.orderType ==='TakeDelivery'){
      cols.splice(5,0,<CFormItem label={commonLocale.vendorLocale} key='vendor'>
        {getFieldDecorator('vendor', {
        initialValue: entity.vendor ? JSON.stringify(entity.vendor) : undefined ,
        rules: [
          { required: true, message: notNullLocale(commonLocale.vendorLocale) }
        ]}
      )(
        <VendorSelect
          disabled={entity.stat === 'Initial'}
          ownerUuid={entity.owner ? entity.owner.uuid : ''}
          state={STATE.ONLINE}
          single
          placeholder={placeholderLocale(commonLocale.inVendorLocale)}
          onChange={this.handleChangeVendor}
        />)}
    </CFormItem>)
    }
    if(this.state.entityUuid) {
      cols.push(
        <CFormItem label={alcNtcLocale.finalPoint} key='finalPoint'>
          {
            getFieldDecorator('finalPoint')(
              <span>{entity.finalPoint ? '[' + entity.finalPoint.code + ']' + entity.finalPoint.name : entity.deliveryPoint ? '[' + entity.deliveryPoint.code + ']' + entity.deliveryPoint.name : deliveryInfo ? '[' + deliveryInfo.code + ']' + deliveryInfo.name : ''}</span>
            )
          }
        </CFormItem>);
      cols.push(
        <CFormItem label={'最终点联系人'} key='contactor2'>
          {
            getFieldDecorator('contactor2')(
              <span>{entity.finalPoint && entity.finalPoint.contacter ? entity.finalPoint.contacter : entity.deliveryPoint ? entity.deliveryPoint.contacter : deliveryInfo ? deliveryInfo.contactor : ''}</span>
            )
          }
        </CFormItem>);
      cols.push(
        <CFormItem label={'最终点联系方式'} key='contactPhone2'>
          {
            getFieldDecorator('contactPhone2')(
              <span>{entity.finalPoint && entity.finalPoint.contactNumber ? entity.finalPoint.contactNumber : entity.deliveryPoint ? entity.deliveryPoint.contactNumber : deliveryInfo ? deliveryInfo.contactPhone : ''}</span>
            )
          }
        </CFormItem>);
      cols.push(
        <CFormItem label={'最终点地址'} key='address2'>
          {
            getFieldDecorator('address2')(
              <span>{entity.finalPoint && entity.finalPoint.address ? entity.finalPoint.address : entity.deliveryPoint ? entity.deliveryPoint.address : deliveryInfo ? addressToStr1(deliveryInfo.address) : ''}</span>
            )
          }
        </CFormItem>);
      cols.push(
        <CFormItem label={'最终点具体位置'} key='deliverySpecificAddress'>
          {
            getFieldDecorator('specificAddress2')(
              <span>{entity.finalPoint ? entity.finalPoint.specificAddress : entity.deliveryPoint && entity.deliveryPoint.specificAddress ? entity.deliveryPoint.specificAddress : <Empty /> }</span>
            )
          }
        </CFormItem>
      )
    }
    let cols1 = [
      <CFormItem key='cartonCount' label={alcNtcLocale.wholeCase}>
        {getFieldDecorator('cartonCount', {
          initialValue: entity.cartonCount
        })(
          <Input disabled={entity.stat === 'Initial' || addDetail}/>
        )}
      </CFormItem>,
       <CFormItem key='scatteredCount' label={'零散数'}>
       {getFieldDecorator('scatteredCount', {
         initialValue: entity.scatteredCount
       })(
         <Input disabled={entity.stat === 'Initial' || addDetail}/>
       )}
     </CFormItem>,
      <CFormItem key='totalQtyStr' label={commonLocale.inQtyStrLocale}>
        {getFieldDecorator('totalQtyStr')(
          <span>{ entity.totalQtyStr ? entity.totalQtyStr : 0 }</span>
        )}
      </CFormItem>,
      <CFormItem key='containerCount' label={alcNtcLocale.passBox}>
        {getFieldDecorator('containerCount', {
          initialValue: entity.containerCount
        })(
          <Input disabled={entity.stat === 'Initial' || addDetail}/>
        )}
      </CFormItem>,
      <CFormItem key='weight' label={'总重量(kg)'}>
        {getFieldDecorator('weight', {
          initialValue: entity.weight
        })(
          <Input disabled={entity.stat === 'Initial' || addDetail}/>
        )}
      </CFormItem>,
      <CFormItem key='volume' label={'总体积(m3)'}>
        {getFieldDecorator('volume', {
          initialValue: entity.volume
        })(
          <Input disabled={entity.stat === 'Initial' || addDetail}/>
        )}
      </CFormItem>
    ];
    return [
      <FormPanel key='basicInfo' title={commonLocale.basicInfoLocale} cols={cols} noteLabelSpan={4} noteCol={this.drawNotePanel()}/>,
      <div style={{marginBottom:10}}>
        <IPopconfirm onConfirm={() => this.onChangeState()} operate={confirm}
                     object={'明细'}>
          <Switch checked={addDetail} size="small" />
        </IPopconfirm> &emsp;{'添加明细'}
      </div>,
      <FormPanel key='basicInfo1' title={'业务信息'} cols={cols1} />
    ];
  }

  /**
   * 商品选择框搜索功能
   */
  onSearchArticle = (value) => {
    if(this.state.entity.orderType =='TakeDelivery'&&(this.state.vendor==undefined||this.state.vendor=='') && !this.state.entity.vendor)
      return;
    let pageFilter={}
    pageFilter.page = 0;
    pageFilter.pageSize = 10;
    pageFilter.searchKeyValues = {
      companyUuid:loginCompany().uuid,
    }
    if (value.length!=0) {
      pageFilter.searchKeyValues = {
        ...pageFilter.searchKeyValues,
        codeName:value
      }
    }
    if(this.state.entity.orderType =='TakeDelivery'){
      pageFilter.searchKeyValues.vendorUuid = (this.state.vendor ? this.state.vendor.uuid : '') || (this.state.entity.vendor ? this.state.entity.vendor.uuid : '')
    }
    this.props.dispatch({
      type: 'article/query',
      payload: {
        ...pageFilter
      }
    });
  }

  /**
   * 展示商品选择
   */
  getArticleOptions = () => {
    let options = [];
    let originalVendor = this.props.form.getFieldValue('vendor');
    if(originalVendor){
      originalVendor = JSON.parse(originalVendor);
    }
    const { articles,entity } = this.state;
    articles.map(item => {
      let article = {
        uuid: item.uuid,
        code: item.code,
        name: item.name,
      }
      if(originalVendor&&item.defaultVendor.uuid== originalVendor.uuid){
        options.push(<Select.Option
          key={JSON.stringify(item)}
          value={JSON.stringify(item)}>{convertCodeName(item)}</Select.Option>
        );
      }else if(!originalVendor){
        options.push(<Select.Option
          key={JSON.stringify(item)}
          value={JSON.stringify(item)}>{convertCodeName(item)}</Select.Option>
        );
      }
    });
    return options;
  }

  /**
   * 展示规格选择
   */
  getQpcStrOptions = (articleUuid) => {
    let options = [];
    const { articleMap } = this.state;
    if (!articleUuid || !articleMap[articleUuid]) {
      return options;
    }

    articleMap[articleUuid].map(e => {
      options.push(<Select.Option
        key={e.qpcStr + "/" + e.munit}
        value={e.qpcStr + "/" + e.munit}>
        {e.qpcStr + "/" + e.munit}</Select.Option>);
    });
    return options;
  }

  getQpcsByArticleUuid = (article, line) => {
    const { articleMap, orderBillItems } = this.state;
    const payload = {
      articleUuid: article.uuid
    }
    this.props.dispatch({
      type: 'article/getQpcsByArticleUuid',
      payload: { ...payload },
      callback: response =>{
        if( response && response.success ){
          // console.log(articleMap[article.uuid])
          articleMap[article.uuid] && articleMap[article.uuid].map(item => {
            orderBillItems[line - 1].qpcStr = item.qpcStr;

            if (item.defaultQpcStr && orderBillItems[line - 1]) {
              orderBillItems[line - 1].qpcStr = item.qpcStr;
              orderBillItems[line - 1].munit = item.munit;
              orderBillItems[line - 1].weight = Number(accDiv(item.weight, 1000).toFixed(4));
              orderBillItems[line - 1].volume = Number(accDiv(item.volumn, 1000000).toFixed(4));
              orderBillItems[line - 1].qpc = item.paq;
            } else if(item.defaultQpcStr==false && orderBillItems[line - 1]&& !orderBillItems[line - 1].qpcStr){

              orderBillItems[line - 1].qpcStr = undefined;
              orderBillItems[line - 1].munit = undefined;
              orderBillItems[line - 1].qpc = item.paq;
              orderBillItems[line - 1].weight =  Number(accDiv(item.weight, 1000).toFixed(4));
              orderBillItems[line - 1].volume = Number(accDiv(item.volumn, 1000000).toFixed(4));
            }
            if( orderBillItems[line - 1] && item.qpcStr) {
              orderBillItems[line - 1].weight =  Number(accDiv(item.weight, 1000).toFixed(4));
              orderBillItems[line - 1].volume = Number(accDiv(item.volumn, 1000000).toFixed(4));
              orderBillItems[line - 1].qpc = item.paq;
            }
          });
          if (articleMap && articleMap[article.uuid] == undefined && orderBillItems[line - 1]) {
            orderBillItems[line - 1].qpcStr = undefined;
          }
         this.setState({
           orderBillItems: orderBillItems.slice()
         });
        }
      }
    });
  }

  handleFieldChange(e, fieldName, line) {
    const { articleMap, orderBillItems } = this.state;
    if (fieldName === 'article') {
      let article = {
        uuid: JSON.parse(e).uuid,
        code: JSON.parse(e).code,
        name: JSON.parse(e).name,
      }
      this.props.dispatch({
        type: 'article/get',
        payload: {
          uuid: article.uuid
        },
        callback: response => {
          if (response && response.success && response.data) {
            orderBillItems[line - 1].barcode = response.data.barcode;
            this.setState({
              salePrice : response.data.salePrice
            });
          }
        }
      });
      orderBillItems[line - 1].article = article;
      orderBillItems[line - 1].qpcStr = '';
      orderBillItems[line - 1].munit = '';
      orderBillItems[line - 1].qtyStr = '0';
      orderBillItems[line - 1].qty = 0;
      this.getQpcsByArticleUuid(JSON.parse(e), line);
    } else if (fieldName === 'qpcStrAndMunit') {
      var Arr = e.split("/");
      var qpcStr = Arr[0];
      var munit = Arr[1];
      orderBillItems[line - 1].qpcStr = qpcStr;
      orderBillItems[line - 1].munit = munit;
      orderBillItems[line - 1].qty = qtyStrToQty(orderBillItems[line - 1].qtyStr, qpcStr);
      articleMap[orderBillItems[line - 1].article.uuid] && articleMap[orderBillItems[line - 1].article.uuid].map(item => {
        if(  qpcStr === item.qpcStr) {
          orderBillItems[line - 1].weight = Number(accDiv(item.weight, 1000).toFixed(4));
          orderBillItems[line - 1].volume = Number(accDiv(item.volumn, 1000000).toFixed(4));
          orderBillItems[line - 1].qpc = item.paq;
        }
      });
    } else if (fieldName === 'qtyStr') {
      orderBillItems[line - 1].qtyStr = e;
      orderBillItems[line - 1].qty = qtyStrToQty(e.toString(), orderBillItems[line - 1].qpcStr);
      orderBillItems[line - 1].amount = orderBillItems[line - 1].qty * this.state.salePrice;
      this.drawTotal();
    }

    this.setState({
      orderBillItems: orderBillItems.slice()
    });
  }

  /**
   * 绘制总数量
   */
  drawTotal = () => {
    let allQtyStr = 0;
    let allScatteredCount = 0;
    let allQtyStr1 = 0;
    let allWeight = 0;
    let allVolume = 0;
    const { entity, orderBillItems } = this.state;
    if (orderBillItems) {
      orderBillItems.map(item => {
        if (!item.qtyStr) {
          item.qtyStr = 0;
        }
        let a = parseFloat(item.qtyStr);
        let arr = (typeof(item.qtyStr) == 'string')&&item.qtyStr.split("+");
        let scatteredCount = arr.length==2&&Number(arr[1])
        let b = item.weight;
        let c = item.volume;
        let d = item.qty;
        allQtyStr = allQtyStr + a;
        allScatteredCount = allScatteredCount + scatteredCount;
        allQtyStr1 = add(allQtyStr1, item.qtyStr);
        allWeight = allWeight + Number(accMul(d, b).toFixed(4));
        allVolume = allVolume + Number(accMul(d, c).toFixed(4));
      })
    }

    entity.cartonCount = allQtyStr;
    entity.scatteredCount = allScatteredCount;
    entity.totalQtyStr = allQtyStr1;
    entity.weight = allWeight;
    entity.volume = allVolume;
    this.setState({
      entity: {...entity}
    })
  };
  /**
   * 绘制明细表格
   */
  drawTable = () => {
    const { getFieldDecorator } = this.props.form;
    const { entity, orderBillItems, addDetail } = this.state;
    let articleCols = [
      {
        title: commonLocale.inArticleLocale,
        key: 'article',
        width: itemColWidth.articleEditColWidth,
        render: record => {
          return (
            <Select
              id ='article'
              value={record.article ? `[${record.article.code}]${record.article.name}` : undefined}
              placeholder={placeholderLocale(commonLocale.inArticleLocale)}
              onChange={e => this.handleFieldChange(e, 'article', record.line)}
              onSearch={(e)=>this.onSearchArticle(e)}
              filterOption={false}
              notFoundContent={null}
              showSearch={true}
              disabled={entity.stat === 'Initial' || entity.stat === 'Scheduled' || entity.stat === 'Shiped'}
            >
              {this.getArticleOptions()}
            </Select>
          );
        }
      },
      {
        title: alcNtcLocale.secondCode,
        dataIndex: 'barcode',
        key: 'barcode',
        width: itemColWidth.qtyColWidth-50,
        render: (text, record) => {
          return <span>{record.barcode ? record.barcode : <Empty />}</span>
        }
      },
      {
        title: commonLocale.inQpcAndMunitLocale,
        key: 'qpcStrAndMunit',
        width: itemColWidth.qpcStrEditColWidth+60,
        render: (text, record) => {
          return (
            <Select value={record.qpcStr && record.munit ? record.qpcStr + '/' + record.munit : undefined}
                    placeholder={placeholderLocale(commonLocale.inQpcAndMunitLocale)}
                    disabled={entity.stat === 'Initial' || entity.stat === 'Scheduled' || entity.stat === 'Shiped'}
                    onChange={
                      e => this.handleFieldChange(e, 'qpcStrAndMunit', record.line)
                    }
            >
              {
                this.getQpcStrOptions(record.article ? record.article.uuid : null)
              }
            </Select>
          );
        }
      },
      {
        title: commonLocale.inQtyStrLocale,
        key: 'qtyStr',
        width: itemColWidth.qtyStrEditColWidth,
        render: (text, record) => {
          if(entity.stat && entity.stat === 'Initial' || entity.stat === 'Scheduled' || entity.stat === 'Shiped') {
            return <span>{record.qtyStr ? record.qtyStr : '0'}</span>
          } else {
            return (
              <QtyStrInput
                id ='qtyStr'
                disabled={entity.stat === 'Initial' || entity.stat === 'Scheduled' || entity.stat === 'Shiped'}
                value={record.qtyStr ? record.qtyStr : 0}
                onChange={
                  e => this.handleFieldChange(e, 'qtyStr', record.line)
                }
                maxSplit={record.qpc}
                placeholder={placeholderLocale(commonLocale.inQtyStrLocale)}
              />
            );
          }
        }
      },
      {
        title: commonLocale.inQtyLocale,
        dataIndex: 'qty',
        key: 'qty',
        width: itemColWidth.qtyColWidth-50,
        render: (text, record) => {
          return <span>{record.qty ? record.qty : 0}</span>
        }
      },
      {
        title: alcNtcLocale.amount,
        dataIndex: 'amount',
        key: 'amount',
        width: itemColWidth.qtyColWidth-50,
        render: (text, record) => {
          return <span>{record.amount ? record.amount : 0}</span>
        }
      },
      {
        title: alcNtcLocale.weight,
        dataIndex: 'weight',
        key: 'weight',
        width: itemColWidth.qtyColWidth-50,
        render: (text, record) => {
          let a =record.weight;
          let b = record.qty;
          let vl = a && b ?  Number(accMul(a, b).toFixed(4)) : 0;
          return <span>{record.weight ? vl : 0}</span>
        }
      },
      {
        title: alcNtcLocale.volume,
        dataIndex: 'volume',
        key: 'volume',
        width: itemColWidth.qtyColWidth-50,
        render: (text, record) => {
          let a = record.volume;
          let b = record.qty;
          let vl = a && b ? Number(accMul(a, b).toFixed(4)) : 0;

          return <span>{record.volume ? vl : 0}</span>
        }
      },

    ];
    return (
      <ItemEditTable
        title={orderLocale.articleTableTitle}
        notNote
        columns={articleCols}
        data={orderBillItems}
        drawTotalInfo={this.drawTotalInfo}
        noAddandDelete={entity.stat === 'Initial' || entity.stat === 'Scheduled' || entity.stat === 'Shiped' || !addDetail}
      />
    )
  }
}
