import { connect } from 'dva';
import moment from 'moment';
import { isArray } from 'util';
import { Form, Select, Input, InputNumber, message, DatePicker,Modal } from 'antd';
import { commonLocale, notNullLocale, placeholderLocale, placeholderChooseLocale,tooLongLocale } from '@/utils/CommonLocale';
import { loginCompany, loginOrg, getDefOwner } from '@/utils/LoginContext';
import { STATE } from '@/utils/constants';
import { sourceWay } from '@/utils/SourceWay';
import { orgType } from '@/utils/OrgType';
import { convertCodeName, formatDate, convertDate } from '@/utils/utils';
import { qtyStrToQty, add, toQtyStr } from '@/utils/QpcStrUtil';
import { itemColWidth, colWidth } from '@/utils/ColWidth';
import ItemEditTable from '@/pages/Component/Form/ItemEditTable';
import CreatePage from './CreatePage';
import FormPanel from '@/pages/Component/Form/FormPanel';
import CFormItem from '@/pages/Component/Form/CFormItem';
import { orderLocale,itemRepeat } from './PackageBillLocale';
import { LogisticMode } from './PackageBillContants';
import { MAX_DECIMAL_VALUE } from '@/utils/constants';
import UserSelect from '@/pages/Component/Select/UserSelect';
import { PRETYPE } from '@/utils/constants';
import Empty from '@/pages/Component/Form/Empty';
import ContainerSelect from '@/pages/Component/Select/ContainerSelect';
import { containerState } from '@/utils/ContainerState';

@connect(({ packageBill, article, loading }) => ({
  packageBill,
  article,
  loading: loading.models.packageBill,
}))
@Form.create()
export default class PackageBillAuditPage extends CreatePage {
  constructor(props) {
    super(props);

    this.state = {
      noSaveAndConfirm: true,
      title: commonLocale.createLocale + orderLocale.title,
      entity: {
        items: []
      },
      orderBillitems: []
    }
  }
  componentDidMount() {
    this.refresh();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.packageBill.entity && this.props.packageBill.entityUuid) {
      this.setState({
        entity: nextProps.packageBill.entity,
        orderBillitems: nextProps.packageBill.entity.items,
        title: orderLocale.title + '：' + nextProps.packageBill.entity.billNumber,
      });
    }
  }

  /**
   * 选择货主
   */
  handlechangeOwner = (value) => {
    const { orderBillitems,entity } = this.state;
    let originalOwner = this.props.form.getFieldValue('owner');
    if (orderBillitems.length == 0 && entity.items.length == 0) {
      entity.owner = JSON.parse(value);
      this.setState({
        owner: JSON.parse(value),
      });
    }else if (orderBillitems.length > 0 || entity.items.length > 0){
      Modal.confirm({
        title: '修改货主会导致商品信息清空，请确认修改？',
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          entity.items = [];
          entity.owner = JSON.parse(value);
          this.setState({
            owner: JSON.parse(value),
            orderBillitems:[],
            entity: { ...entity }
          }, () => {
            this.props.form.setFieldsValue({
              owner: value,
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
   * 刷新
   */
  refresh = () => {
    this.props.dispatch({
      type: 'packageBill/get',
      payload: this.props.packageBill.entityUuid,
      callback: (response) => {
        if (response && response.success && response.data) {
          if(response.data.owner) {
            this.getDateState(response.data.owner.uuid)
          }
        }
      }
    });
  }

  /**
   * 刷新
   */
  getDateState = (uuid) => {
    this.props.dispatch({
      type: 'packageBill/getByOwnerCode',
      payload: {
        ownerUuid: uuid
      },
      callback: (response) => {
        if (response && response.success && response.data) {
          if(response.data.virtualArticle && response.data.virtualArticle.uuid) {
            let uuid1 = response.data.virtualArticle.uuid;
            this.props.dispatch({
              type: 'article/get',
              payload: {
                uuid: uuid1
              },
              callback: (response) => {
                if (response && response.success && response.data) {
                  this.setState({
                    data: response.data
                  })
                }
              }
            });
          }
        }
      }
    });
  }
  /**
   * 取消
   */
  onCancel = () => {
    this.props.dispatch({
      type: 'packageBill/showPage',
      payload: {
        showPage: 'query'
      }
    });
  }

  /**
   * 保存
   */
  onSave = () => {
    const { entity, orderBillitems, data } = this.state;
    let list = [];
    let upParams = {};
    if (Array.isArray(orderBillitems)) {
      orderBillitems.forEach((item,index)=>{
        if (data.shelfLifeType !== 'VALIDDATE' && data.shelfLifeType !== 'PRODUCTDATE') {
          item.productionDate = '8888-12-31';
          item.expireDate = '8888-12-31';
        }
        list.push({
          containerBarcode: item.receiveContainerBarcode,
          itemUuid: item.uuid,
          productionDate: formatDate(item.productionDate, true),
          expireDate: formatDate(item.expireDate, true),
        })
        // data.containerBarcode = item.receiveContainerBarcode;
        // data.itemUuid = item.uuid;
        // data.productionDate = formatDate(item.productionDate, true);
        // data.expireDate = formatDate(item.expireDate, true);
      });
      for (let i = 0; i < orderBillitems.length; i++) {
        // if (!orderBillitems[i].receiveContainerBarcode) {
        //   message.error('第' + orderBillitems[i].line + '行收货容器不能为空');
        //   return;
        // }
        // if (!orderBillitems[i].productionDate) {
        //   message.error('第' + orderBillitems[i].line + '行生产日期不能为空');
        //   return;
        // }
        // if (!orderBillitems[i].expireDate) {
        //   message.error('第' + orderBillitems[i].line + '行到效日期不能为空');
        //   return;
        // }
      }
    }
    if (orderBillitems.length === 0) {
      message.error('明细不能为空');
      return;
    }
    upParams.items = list;
    upParams.uuid = entity.uuid;
    upParams.version = entity.version;
    console.log('值', upParams);
    this.props.dispatch({
      type: 'packageBill/finish',
      payload: upParams,
      callback: (response) => {
        if (response && response.success) {
          this.props.dispatch({
            type: 'packageBill/showPage',
            payload: {
              showPage: 'view',
              entityUuid: entity.uuid,
            }
          });
          // this.props.dispatch({
          //   type: 'packageBill/get',
          //   payload: entity.uuid
          // });
        }
      }
    });
  }

  /**
   * 表格变化时
   * @param {*} e
   * @param {*} fieldName
   * @param {*} key
   */
  handleFieldChange(e, fieldName, line) {
    const { orderBillitems, data } = this.state;
   if (fieldName === 'receiveContainerBarcode') {
      orderBillitems[line - 1].receiveContainerBarcode = e;
    } else if ((fieldName === 'productionDate' || fieldName === 'expireDate') && e) {
     if (data.shelfLifeType === 'VALIDDATE') {
       orderBillitems[line - 1].expireDate = e.startOf('day');
       orderBillitems[line - 1].productionDate = moment(e).add(-data.shelfLifeDays, 'days');
     } else {
       orderBillitems[line - 1].productionDate = e.startOf('day');
       orderBillitems[line - 1].expireDate = moment(e).add(data.shelfLifeDays, 'days');
     }
   }

    this.setState({
      orderBillitems: orderBillitems.slice()
    });
  }

  /**
   * 绘制表单
   */
  drawFormItems = () => {
    const { getFieldDecorator } = this.props.form;
    const { entity, defOwner } = this.state;
    let basicCols = [
      <CFormItem key='sourceBillNumber' label={orderLocale.sourceBillNumber}>
        {
          getFieldDecorator('sourceBillNumber')(
            <span>{entity.sourceBillNumber ? entity.sourceBillNumber : <Empty />}</span>
          )
        }
      </CFormItem>,
      <CFormItem key='customerCode' label={orderLocale.code}>
        {
          getFieldDecorator('customerCode')(
            <span>{entity.customer ? entity.customer.code : ''}</span>
          )
        }
      </CFormItem>,
      <CFormItem key='customerName' label={orderLocale.name}>
        {
          getFieldDecorator('customerName')(
            <span>{entity.customer ? entity.customer.name : ''}</span>
          )
        }
      </CFormItem>,
      <CFormItem key='customerAddress' label={'客户地址'}>
        {
          getFieldDecorator('customerAddress')(
            <span>{entity.customerAddress ? entity.customerAddress : ''}</span>
          )
        }
      </CFormItem>,
      <CFormItem key='owner' label={commonLocale.inOwnerLocale}>
        {
          getFieldDecorator('owner')(
            <span>{entity.owner ? entity.owner.name : ''}</span>
          )
        }
      </CFormItem>,
      <CFormItem key='receiver' label={orderLocale.receiver}>
        {
          getFieldDecorator('receiver')(
            <span>{entity.receiver ? entity.receiver.name : ''}</span>
          )
        }
      </CFormItem>,

    ];

    return [
      <FormPanel key='basicInfo' title={commonLocale.basicInfoLocale} cols={basicCols} />,
    ];
  }

  /**
   * 绘制明细表格
   */
  drawTable = () => {
    const { getFieldDecorator } = this.props.form;
    const { data, orderBillitems } = this.state;
    let articleCols = [
      {
        title: orderLocale.packageNumber,
        dataIndex: 'packageNumber',
        key: 'packageNumber',
        width: colWidth.billNumberColWidth + 50,
        render: (text, record) => {
          return <span> {record.packageNumber ? record.packageNumber : <Empty />}</span>
        }
      },
      {
        title: orderLocale.receiveContainerBarcode,
        dataIndex: 'receiveContainerBarcode',
        key: 'receiveContainerBarcode',
        width: colWidth.billNumberColWidth,
        render: (text, record) => {
          return (
            <ContainerSelect
              state={containerState.IDLE.name || containerState.RECEIVING.name}
              value={record.receiveContainerBarcode}
              onChange={e => this.handleFieldChange(e, 'receiveContainerBarcode', record.line)}
              placeholder={placeholderLocale(commonLocale.inContainerBarcodeLocale)}
            />
          )
        },
      },
      {
        title: commonLocale.productionDateLocale,
        dataIndex: 'productionDate',
        key: 'productionDate',
        width: colWidth.dateColWidth,
        render: (value, record) => {
          if ( data && data.shelfLifeType && data.shelfLifeType === 'PRODUCTDATE') {
            return (
              <DatePicker
                value={value ? moment(value) : null} allowClear={false}
                onChange={(e) => this.handleFieldChange(e, 'productionDate', record.line)} />
            );
          } else if (data && data.shelfLifeType && data.shelfLifeType === 'VALIDDATE'){
            return (
              <span>{record.productionDate ? convertDate(record.productionDate) : <Empty />}</span>
            );
          } else {
            return (
              <span>{'8888-12-31'}</span>
            );
          }

        }
      },
      {
        title: commonLocale.validDateLocale,
        dataIndex: 'expireDate',
        key: 'expireDate',
        width: colWidth.dateColWidth,
        render: (value, record) => {
          if (data && data.shelfLifeType && data.shelfLifeType === 'VALIDDATE') {
            return (
              <DatePicker
                value={value ? moment(value) : null} allowClear={false}
                onChange={(e) => this.handleFieldChange(e, 'expireDate', record.line)} />
            );
          }  else if (data && data.shelfLifeType && data.shelfLifeType === 'PRODUCTDATE'){
            return (
              <span>{record.expireDate ? convertDate(record.expireDate) : <Empty />}</span>
            );
          } else {
            // record.expireDate = record.expireDate ? convertDate(record.expireDate) : '8888-12-31';
            return (
              <span>{'8888-12-31'}</span>
            );
          }
        }
      },
    ];
    return (
      <ItemEditTable
        noAddandDelete
        notNote
        title={orderLocale.articleTableTitle}
        columns={articleCols}
        data={orderBillitems ? orderBillitems : []}
        drawTotalInfo={this.drawTotalInfo}
      />
    )
  }
}
