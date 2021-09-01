import { connect } from 'dva';
import moment from 'moment';
import { isArray } from 'util';
import { Form, Select, Input, InputNumber, message, Col,Modal } from 'antd';
import { commonLocale, notNullLocale, placeholderLocale, placeholderChooseLocale,tooLongLocale } from '@/utils/CommonLocale';
import { loginCompany, loginOrg, getDefOwner } from '@/utils/LoginContext';
import { STATE } from '@/utils/constants';
import { sourceWay } from '@/utils/SourceWay';
import { orgType } from '@/utils/OrgType';
import { convertCodeName, formatDate } from '@/utils/utils';
import { qtyStrToQty, add, toQtyStr } from '@/utils/QpcStrUtil';
import { itemColWidth, colWidth } from '@/utils/ColWidth';
import OwnerSelect from '@/pages/Component/Select/OwnerSelect';
import ItemEditTable from '@/pages/Component/Form/ItemEditTable';
import CreatePage from '@/pages/Component/Page/CreatePage';
import FormPanel from '@/pages/Component/Form/FormPanel';
import CFormItem from '@/pages/Component/Form/CFormItem';
import { orderLocale,itemRepeat } from './PackageBillLocale';
import { MAX_DECIMAL_VALUE } from '@/utils/constants';
import UserSelect from '@/pages/Component/Select/UserSelect';
import { PRETYPE } from '@/utils/constants';
import Empty from '@/pages/Component/Form/Empty';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { PACKAGE_RES } from './PackageBillPermission';

@connect(({ packageBill, article, loading }) => ({
  packageBill,
  article,
  loading: loading.models.packageBill,
}))
@Form.create()
export default class PackageBillCreatePage extends CreatePage {
  constructor(props) {
    super(props);

    this.state = {
      title: commonLocale.createLocale + orderLocale.title,
      entity: {
        owner: getDefOwner(),
        items: []
      },
      orderBillitems: [],
      auditButton : true,
      owner: getDefOwner(),
      auditPermission: PACKAGE_RES.AUDIT,
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
      payload: this.props.packageBill.entityUuid
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
  onSave = (data) => {
    let order = {
      ...this.state.entity,
      ...data,
    };
    if (this.state.orderBillitems.length === 0) {
      message.error('明细不能为空');
      return;
    }

    if (Array.isArray(this.state.orderBillitems)){
      let data = this.state.orderBillitems;
      for (let i = 0; i < data.length; i++) {
        if (!data[i].packageNumber) {
          message.error('第' + data[i].line + '行包裹号不能为空');
          return;
        }

      }
    }
    order.items = this.state.orderBillitems;
    order.companyUuid=loginCompany().uuid;
    order.dcUuid = loginOrg().uuid;
    order.owner = JSON.parse(order.owner);
    order.receiver = order.receiver ? JSON.parse(order.receiver) : null;
    order.customer = {
      code: order.customerCode,
      name: order.customerName,
      uuid:''
    };
    if (!order.uuid) {
      this.props.dispatch({
        type: 'packageBill/onSave',
        payload: order,
        callback: (response) => {
          if (response && response.success) {
            message.success(commonLocale.saveSuccessLocale);
          }
        }
      });
    } else if(order.uuid && order.state === 'FINISHED'){
      this.props.dispatch({
        type: 'packageBill/modifyafterfinish',
        payload: {
          uuid: order.uuid,
          version: order.version,
          customerAddress: order.customerAddress,
          note: order.note
        },
        callback: (response) => {
          if (response && response.success) {
            message.success(commonLocale.modifySuccessLocale);
          }
        }
      });
    } else {
      this.props.dispatch({
        type: 'packageBill/modify',
        payload: order,
        callback: (response) => {
          if (response && response.success) {
            message.success(commonLocale.modifySuccessLocale);
          }
        }
      });
    }
  }

  /**
   * 保存并新建
   */
  onSaveAndCreate = (data) => {
    let order = {
      ...this.state.entity,
      ...data,
    };
    if (this.state.orderBillitems.length === 0) {
      message.error('明细不能为空');
      return;
    }

    if (Array.isArray(this.state.orderBillitems)){
      let data = this.state.orderBillitems;
      for (let i = 0; i < data.length; i++) {
        if (!data[i].packageNumber) {
          message.error('第' + data[i].line + '行包裹号不能为空');
          return;
        }

      }
    }
    order.items = this.state.orderBillitems;
    order.companyUuid=loginCompany().uuid;
    order.dcUuid = loginOrg().uuid;
    order.owner = JSON.parse(order.owner);
    order.receiver = JSON.parse(order.receiver);
    order.customer = {
      code: order.customerCode,
      name: order.customerName,
      uuid:''
    };
    this.props.dispatch({
      type: 'packageBill/saveAndAudit',
      payload: order,
      callback: (response) => {
        if (response && response.success) {
          message.success(commonLocale.saveSuccessLocale);
          this.setState({
            orderBillitems: [],
          })
          this.props.form.resetFields();
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
    const { entity, orderBillitems } = this.state;
   if (fieldName === 'packageNumber') {
      orderBillitems[line - 1].packageNumber = e;
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
      entity && entity.state && entity.state !== 'SAVED' ? <CFormItem key="customerCode" label={orderLocale.code}>
          {getFieldDecorator('customerCode')(
            <Col>{entity.customer ? entity.customer.code : '空'}</Col>
          )}
        </CFormItem> :
      <CFormItem key='customerCode' label={orderLocale.code}>
        {
          getFieldDecorator('customerCode', {
            initialValue: entity.customer ? entity.customer.code : '',
            rules: [{
              max: 30, message: tooLongLocale('客户代码', 30),
            }, { required: true, message: notNullLocale(orderLocale.code) }],
          })(
            <Input placeholder={placeholderLocale('客户代码')} />
          )
        }
      </CFormItem>,
      entity && entity.state && entity.state !== 'SAVED' ? <CFormItem key="customerName" label={orderLocale.name}>
        {getFieldDecorator('customerName')(
          <Col>{entity.customer ? entity.customer.name : '空'}</Col>
        )}
      </CFormItem> :<CFormItem key='customerName' label={orderLocale.name}>
        {
          getFieldDecorator('customerName', {
            initialValue: entity.customer ? entity.customer.name : '',
            rules: [{
              max: 40, message: tooLongLocale(orderLocale.name, 40),
            }, { required: true, message: notNullLocale(orderLocale.name) }],
          })(
            <Input placeholder={placeholderLocale(orderLocale.name)} />
          )
        }
      </CFormItem>,
      <CFormItem key='customerAddress' label={'客户地址'}>
        {
          getFieldDecorator('customerAddress', {
            initialValue: entity.customerAddress ? entity.customerAddress : '',
            rules: [{
              max: 50, message: tooLongLocale('客户地址', 50),
            }, { required: true, message: notNullLocale('客户地址') }],
          })(
            <Input placeholder={placeholderLocale('客户地址')} />
          )
        }
      </CFormItem>,
      entity && entity.state && entity.state !== 'SAVED' ? <CFormItem key="sourceBillNumber" label={orderLocale.sourceBillNumber}>
        {getFieldDecorator('sourceBillNumber')(
          <Col>{entity.sourceBillNumber ? entity.sourceBillNumber : '空'}</Col>
        )}
      </CFormItem> : <CFormItem key='sourceBillNumber' label={orderLocale.sourceBillNumber}>
        {
          getFieldDecorator('sourceBillNumber', {
            initialValue: entity.sourceBillNumber,
            rules: [
              { max: 30, message: tooLongLocale(orderLocale.sourceBillNumber, 30) }
              ],
          })(
            <Input placeholder={placeholderLocale(orderLocale.sourceBillNumber)} />
          )
        }
      </CFormItem>,
      entity && entity.state && entity.state !== 'SAVED' ? <CFormItem key="owner" label={commonLocale.inOwnerLocale}>
        {getFieldDecorator('owner')(
          <Col>{entity.owner ? convertCodeName(entity.owner) : '空'}</Col>
        )}
      </CFormItem> : <CFormItem key='owner' label={commonLocale.inOwnerLocale}>
        {
          getFieldDecorator('owner', {
            initialValue: entity ? (entity.owner ? JSON.stringify(entity.owner) : undefined) : null,
            rules: [
              { required: true, message: notNullLocale(commonLocale.inOwnerLocale) }
            ],
          })(
            <OwnerSelect onChange={this.handlechangeOwner} onlyOnline placeholder={placeholderChooseLocale(commonLocale.inOwnerLocale)} />
          )
        }
      </CFormItem>,
      entity && entity.state && entity.state !== 'SAVED' ? <CFormItem key="receiver" label={orderLocale.receiver}>
        {getFieldDecorator('receiver')(
          <Col>{entity.receiver ? convertCodeName(entity.receiver) : '空'}</Col>
        )}
      </CFormItem> : <CFormItem key='receiver' label={orderLocale.receiver}>
        {
          getFieldDecorator('receiver', {
            initialValue: entity ? (entity.receiver ? JSON.stringify(entity.receiver) : undefined) : null,
            rules: [
              { required: true, message: notNullLocale(orderLocale.receiver) }
            ],
          })(
            <UserSelect onlyOnline single placeholder={placeholderChooseLocale(orderLocale.receiver)} />
          )
        }
      </CFormItem>,

    ];

    return [
      <FormPanel key='basicInfo' noteLabelSpan={4} title={commonLocale.basicInfoLocale} cols={basicCols} noteCol={this.drawNotePanel() }  />,
    ];
  }

  /**
   * 绘制明细表格
   */
  drawTable = () => {
    const { getFieldDecorator } = this.props.form;
    const { entity, orderBillitems } = this.state;
    let articleCols = [
      {
        title: orderLocale.packageNumber,
        dataIndex: 'packageNumber',
        key: 'packageNumber',
        // width: colWidth.billNumberColWidth + 50,
        render: (text, record) => {
          return(
            entity && entity.state && entity.state !== 'SAVED' ?
              <span>
                {record.packageNumber ? record.packageNumber : '空'}
              </span> :
              <Input
              value={record.packageNumber}
              onChange={
                e => this.handleFieldChange(e.target.value, 'packageNumber', record.line)
              }
              maxLength={30}
              placeholder={placeholderLocale(orderLocale.packageNumber)}
            />
          )
        }
      }
    ];

    return (
      <ItemEditTable
        notNote = {entity && entity.state && entity.state !== 'SAVED'}
        title={orderLocale.articleTableTitle}
        noAddandDelete = {entity && entity.state && entity.state !== 'SAVED'}
        columns={articleCols}
        data={orderBillitems ? orderBillitems : []}
        drawTotalInfo={this.drawTotalInfo}
      />
    )
  }
}
