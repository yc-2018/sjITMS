import { connect } from 'dva';
import { loginCompany, loginOrg, loginUser } from '@/utils/LoginContext';
import { Form, message } from 'antd';
import { commonLocale, notNullLocale } from '@/utils/CommonLocale';
import { qtyStrToQty, add, toQtyStr } from '@/utils/QpcStrUtil';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import CreatePage from '@/pages/Component/Page/CreatePage';
import ImportFromOrderModal from './ImportFromOrderModal';
import React from 'react';
import ItemEditNestTable from '@/pages/Component/Form/ItemEditNestTable';
import { orderLocale } from '@/pages/In/Order/OrderLocale';
import Empty from '@/pages/Component/Form/Empty';
import { convertCodeName } from '@/utils/utils';
import { LogisticMode } from '@/pages/In/Order/OrderContants';
import CFormItem from '@/pages/Component/Form/CFormItem';
import { receiveLocale } from '@/pages/In/Receive/ReceiveLocale';
import FormPanel from '@/pages/Component/Form/FormPanel';
import ContainerTypeSelect from '@/pages/Component/Select/ContainerTypeSelect';
import EditDtlModal from '@/pages/In/Preview/EditDtlModal';
import { roleLocale } from '@/pages/Account/Role/RoleLocale';
import ConfirmModal from '@/pages/Component/Modal/ConfirmModal';
import { PREVEXAM_RES } from './PreviewPermission';

@connect(({preview, order, loading}) => ({
  preview, order,
  loading: loading.models.preview,
}))
@Form.create()
export default class PreviewBillCreatePage extends CreatePage {
	constructor(props) {
    super(props);

    this.state = {
      title: commonLocale.createLocale + '预检单',
      batchAddVisible:false,
      entityUuid: props.preview.entityUuid,
      groupNo: props.preview.groupNo,
      ocrDate: props.preview.ocrDate,
      entity: [
        {items: []}
      ],
      orders: [],
      ordersWithDetail: {},
      pageFilter: {
        page: 0,
        pageSize: 5000,
        searchKeyValues: {
          dcUuid: loginOrg().uuid,
          companyUuid: loginCompany().uuid
        },
      },
      editVisible: false,
      orderDtlToEdit: {},
      auditButton: true,
      previewAnew: false,
      modalVisible: false,
      selectedRows: [],
      auditPermission: PREVEXAM_RES.AUDIT,
    };
  }

  componentDidMount() {
	  if (this.props.orderBillNumbers && this.props.orderBillNumbers.length > 0){
	    this.getImportedData(this.props.orderBillNumbers) //从订单浏览页面过来
    }else{
      this.refresh();
    }

	}

	componentWillReceiveProps(nextProps) {
    if (nextProps.preview.entity && this.props.preview.entityUuid) {
      this.setState({
        entity: nextProps.preview.entity,
        title: '预检单' + '：' + nextProps.preview.entity.billNumber,
        orders: nextProps.preview.entity,
      });
    }
    if (nextProps.order && nextProps.order.data) {
      this.setState({orders: nextProps.order.data});
    }
  }

  onCancel = () => {
		this.props.form.resetFields();
		if (!this.props.preview.entityUuid) {
			this.props.dispatch({
				type: 'preview/showPage',
				payload: {
					showPage: 'query'
				}
			});
		} else {
			this.props.dispatch({
				type: 'preview/showPage',
				payload: {
					showPage: 'view',
					entityUuid: this.props.entityUuid
				}
			});
		}
  }

  /**
   * 根据勾选的明细重组生成单据的数据
   */
  setupCreation = () => {
	  const { selectedRows, ordersWithDetail, previewAnew } = this.state;
    let orderBillNumbers = []; //存放所有选择的订单号
    for(var p in selectedRows){
      orderBillNumbers.push(p);
    }
	  let creation = [];
	  Array.isArray(orderBillNumbers) && orderBillNumbers.forEach(function(orderBillNumber){
	    let order = {};
	    let selectedOrderDtls = selectedRows[orderBillNumber];
	    let items = [];
	    Array.isArray(selectedOrderDtls) && selectedOrderDtls.forEach(function(item) {
        let dtl = {
          orderBillItemUuid: item.uuid,
          article: item.article,
          spec: item.spec,
          plateAdvice: item.plateAdvice? item.plateAdvice : '',
          qpcStr: item.qpcStr,
          qtyStr: item.qtyStr? item.qtyStr : previewAnew? item.allQtyStr : item.surplusQtyStr,
          munit: item.munit,
          price: item.price,
          weight: item.weight,
          volume: item.volume,
          note: item.note,
        }
        items.push(dtl);
	    })
      let i = 0;
      while (i < ordersWithDetail.list.length){
        if (orderBillNumber === ordersWithDetail.list[i].orderBillNumber){
          order = {...ordersWithDetail.list[i]};
          break;
        }
        i ++;
      }
      order.companyUuid = loginCompany().uuid;
      order.dcUuid = loginOrg().uuid;
      order.orderBillNumber = orderBillNumber;
      order.items = items;
      if (items.length > 0){
        creation.push(order);
      }
    })

    return creation;
  }

  onSave = (data) => {
		const { selectedRows } = this.state;

		if (!selectedRows || JSON.stringify(selectedRows) === "{}" || JSON.stringify(selectedRows) === "[]"){
      message.error('至少选择一行明细。')
      return;
    }

		let creation = this.setupCreation();
    if (creation.length === 0){
      return;
    }
    creation.forEach(function(order) {
      order.containerType = JSON.parse(data.containerType);
    });

		if (!this.state.groupNo && !this.state.entityUuid) {
			this.props.dispatch({
				type: 'preview/onSave',
				payload: creation,
				callback: (response) => {
					if (response && response.success) {
						message.success(commonLocale.saveSuccessLocale);
					}
				}
			});
		} else {
			this.props.dispatch({
				type: 'preview/modify',
				payload: creation,
				callback: (response) => {
					if (response && response.success) {
						message.success(commonLocale.modifySuccessLocale);
					}
				}
			});
		}
	}

	onSaveAndCreate = (data) => {
    const { selectedRows } = this.state;

    if (!selectedRows || JSON.stringify(selectedRows) === "{}" || JSON.stringify(selectedRows) === "[]"){
      message.error('至少选择一行明细。')
      return;
    }

    let creation = this.setupCreation();
    if (creation.length === 0){
      return;
    }
    creation.forEach(function(order) {
      order.containerType = JSON.parse(data.containerType);
    });

		this.props.dispatch({
			type: 'preview/onSaveAndCreate',
			payload: creation,
			callback: (response) => {
				if (response && response.success) {
					this.setState({
						entity: {
							companyUuid: loginCompany().uuid,
							dcUuid: loginOrg().uuid,
						},
					});
					this.props.form.resetFields();
					message.success(commonLocale.saveSuccessLocale);
				}
			}
		});
  }

  refresh = () => {
	  const { groupNo, ocrDate } = this.state;
	  let payload;
	  if(groupNo) {
      payload = {
        groupNo: groupNo,
        ocrDate: ocrDate
      }
      this.props.dispatch({
        type: 'preview/getByGroupNo',
        payload: payload
      });
    }
	  else {

    }
  }

  /**
 * 批量添加弹出框
 */
	handlebatchAddVisible = () => {
		this.setState({
			batchAddVisible: !this.state.batchAddVisible
		})
	}

  /**
 * 获取导入的数据
 */
	getImportedData = (value) => {
		let orderBillNumbers = [];

		for (let i = 0; i < value.length; i++) {
      orderBillNumbers.push(value[i].billNumber);
		}

    this.getOrderDetails(orderBillNumbers);
    this.setState({
      batchAddVisible: false,
    })
	}

  getOrderDetails = (bills) => {
    this.props.dispatch({
      type: 'preview/getByBillNumbers',
      payload: bills,
      callback: response => {
        if (response && response.success) {
          if (response.data && response.data.length > 0){
            this.setState({ordersWithDetail: {list: response.data}});
            if (this.checkPreviewAnew({list: response.data})){
              this.handleModalVisible();
            }
          }else{
            this.setState({ordersWithDetail: {list: []}});
          }          
        }
      },
    });
  }

  checkPreviewAnew = (ordersWithDetail) => {
	  let i = 0;
	  while (i < ordersWithDetail.list.length){
	    let order = ordersWithDetail.list[i];
	    if (order.prevExam){
	      return true;
      }
	    i++;
    }
    return false;
  }
  handleFieldChange = (e, fieldName, line) => {
		const { entity, } = this.state;
		const target = entity.items[line - 1];

		if (fieldName === 'qtyStr') {
			target.qtyStr = e;
			target.qty = qtyStrToQty(e.toString(), target.qpcStr);
		}

		this.setState({
			entity: { ...entity },
		})
  }

  drawFormItems = () => {
    const { getFieldDecorator } = this.props.form;
	  const { orders } = this.state;
    let cols = [
      <CFormItem label={'容器类型'} key='containerType'>
        {getFieldDecorator('containerType', {
          initialValue: JSON.stringify(orders.length > 0? orders[0].containerType : undefined),
          rules: [
            { required: true, message: notNullLocale('容器类型') }
          ],
        })(<ContainerTypeSelect single={true} />)}
      </CFormItem>,
    ];
    return [
      <FormPanel key='basicInfo' noteLabelSpan={4} title={commonLocale.basicInfoLocale} cols={cols} noteCol={this.drawNotePanel()} />
    ];
  }

  drawBatchButton = () => {
    if (!this.state.groupNo) {
      return (
        <div style={{ "display": 'inline' }}>
          <span>
            <a onClick={() => this.handlebatchAddVisible()}>从定单导入</a>
          </span>
        </div>
      )
    }
  }

  handleQtyStrModified = (data) => {
	  const { ordersWithDetail } = this.state;
    ordersWithDetail.list.forEach(function(order) {
      order.items.forEach(function(dtl) {
        if (dtl.uuid === data.uuid){
          dtl.qtyStr = data.qtyStr;
          dtl.qty = data.qty;
        }
      })
    })
    this.setState({
      ordersWithDetail : {...ordersWithDetail},
      editVisible : !this.state.editVisible,
    })
  }

  handleVisible = () => {
	  this.setState({
      editVisible : !this.state.editVisible,
    })
  }

  showEditModal = (record) => {
	  this.setState({
      orderDtlToEdit: record,
      editVisible : !this.state.editVisible,
    })
  }

  /**
   * 全部预检提示框
   */
  handleModalVisible =()=>{
    this.setState({
      modalVisible: !this.state.modalVisible
    });
  }

  /**
   * 提示框确认事件
   */
  handleOk =()=>{
    this.setState({
      previewAnew: true,
      modalVisible: !this.state.modalVisible
    })
  }

  onModalCancel =()=>{
    this.setState({
      previewAnew: false,
      modalVisible: !this.state.modalVisible
    })
  }
  /**
   * 获取选中子行
   */
  onSelectRowForNest = (selectRows)=>{
    this.setState({
      selectedRows: selectRows,
    })
  }
	/**
   * 绘制明细表格
   */
  drawTable = () => {
    let orderCols = [
      {
        title: commonLocale.orderBillNumberLocal,
        width: colWidth.billNumberColWidth,
        key: 'orderBillNumber',
        render: record => <EllipsisCol colValue={record.orderBillNumber}/>,
      },
      {
        title: commonLocale.inVendorLocale,
        width: colWidth.codeNameColWidth,
        dataIndex: 'vendor',
        render: val => <EllipsisCol colValue={convertCodeName(val)} />
      },
      {
        title: orderLocale.wrh,
        width: colWidth.codeNameColWidth,
        dataIndex: 'wrh',
        render: val => <EllipsisCol colValue={convertCodeName(val)} />
      },
      {
        title: commonLocale.inOwnerLocale,
        width: colWidth.codeNameColWidth,
        dataIndex: 'owner',
        render: val => <EllipsisCol colValue={convertCodeName(val)} />
      },
      {
        title: commonLocale.inlogisticModeLocale,
        width: colWidth.enumColWidth,
        render: record => record.logisticMode? LogisticMode[record.logisticMode].caption : <Empty />
      },
    ];
    let orderDtlCols = [
      {
        title: commonLocale.inArticleLocale,
        key: 'article',
        width: itemColWidth.articleEditColWidth,
        render: (text, record) => <a onClick={()=>this.showEditModal(record)}>{'[' + record.article.code + ']' + record.article.name}</a>,
      },
      {
        title: commonLocale.inQpcAndMunitLocale,
        dataIndex: 'qpcStr',
        key: 'qpcStr',
        width: 75,
        render: text => <EllipsisCol colValue={text}/>,
      },
      {
        title: '可预检件数',
        width: itemColWidth.qtyColWidth,
        render: (text, record) => <EllipsisCol colValue={this.state.previewAnew === true? record.allQtyStr : record.surplusQtyStr}/>,
      },
      {
        title: '可预检数量',
        width: itemColWidth.qtyColWidth,
        render: (text, record) => <EllipsisCol colValue={this.state.previewAnew? record.allQty : record.surplusQty}/>,
      },
      {
        title: '预检件数',
        key: 'previewQtyStr',
        width: itemColWidth.qtyColWidth,
        render: (text, record) => <a onClick={()=>this.showEditModal(record)}>{record.qtyStr? record.qtyStr : !this.state.previewAnew? record.surplusQtyStr : record.allQtyStr}</a>,
      },
      {
        title: '预检数量',
        key: 'previewQty',
        width: itemColWidth.qtyColWidth,
        render: (text, record) => <EllipsisCol colValue={record.qty? record.qty : !this.state.previewAnew? record.surplusQty : record.allQty}/>,
      },
    ];
    return (
      <div>
        <ItemEditNestTable
          nestRowSelect={true}
          nestGroupbyName = {'orderBillNumber'}
          title = {commonLocale.itemsLocale}
          columns={orderCols}
          nestColumns={orderDtlCols}
          noAddButton={true}
          notNote
          hasPagination={true}
          drawBatchButton={this.drawBatchButton}
          data={this.state.ordersWithDetail}
          scroll={{ x: 2100 }}
          onSelectRowForNest = {this.onSelectRowForNest}
        />
        <ImportFromOrderModal
          type={"aaaa"}
          visible={this.state.batchAddVisible}
					handlebatchAddVisible={this.handlebatchAddVisible}
					getImportedData={this.getImportedData}
        />
        <EditDtlModal
          type={"aaaa"}
          previewAnew={this.state.previewAnew}
          editVisible={this.state.editVisible}
          orderDtl={this.state.orderDtlToEdit}
          qtyStr={this.state.orderDtlToEdit.qtyStr? this.state.orderDtlToEdit.qtyStr : !this.state.previewAnew? this.state.orderDtlToEdit.surplusQtyStr : this.state.orderDtlToEdit.allQtyStr}
          qty={this.state.orderDtlToEdit.qty? this.state.orderDtlToEdit.qty : !this.state.previewAnew? this.state.orderDtlToEdit.surplusQty : this.state.orderDtlToEdit.allQty}             
          editOrder={true}
          onCancel={this.handleVisible}
          onOK={this.handleVisible}
          handleQtyStrModified={this.handleQtyStrModified}
        />
        <ConfirmModal
          visible={this.state.modalVisible}
          operate={''}
          content={'存在当日已预检的订单，是否全部预检？'}
          onOk={this.handleOk}
          onCancel={this.onModalCancel}
        />
      </div>
    )
  }
}
