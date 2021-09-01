import { connect } from 'dva';
import CreatePage from '@/pages/Component/Page/CreatePage';
import FormPanel from '@/pages/Component/Form/FormPanel';
import CFormItem from '@/pages/Component/Form/CFormItem';
import OrderBillNumberSelect from '@/pages/In/Receive/OrderBillNumberSelect';
import { loginCompany, loginOrg, loginUser, getDefOwner } from '@/utils/LoginContext';
import { Form, Select, Input, InputNumber, message, Col, DatePicker, TimePicker, Modal } from 'antd';
import { commonLocale, notNullLocale, tooLongLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { qtyStrToQty, add, toQtyStr, subtract, compare } from '@/utils/QpcStrUtil';
import { convertCodeName } from '@/utils/utils';
import ItemEditTable from '@/pages/Component/Form/ItemEditTable';
import QtyStrInput from '@/pages/Component/Form/QtyStrInput';
import moment from 'moment';
import { formatDate } from '@/utils/utils';
import { bookLocale } from './BookLocale';
import { LogisticMode } from '@/pages/In/Order/OrderContants';
import OwnerSelect from '@/pages/Component/Select/OwnerSelect';
import DockGroupSelect from '@/pages/Component/Select/DockGroupSelect';
import VendorSelect from '@/pages/Component/Select/VendorSelect';
import UserSelect from '@/pages/Component/Select/UserSelect';
import { orgType } from '@/utils/OrgType';
import { STATE } from '@/utils/constants';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import Empty from '@/pages/Component/Form/Empty';
import PanelItemBatchAdd from '@/pages/Component/Form/PanelItemBatchAdd';
import SearchFormItemBatchAdd from './SearchFormItemBatchAdd';
import ConfirmModal from '@/pages/Component/Modal/ConfirmModal';
import { BOOK_RES } from './BookPermission';
const format = 'HH:mm';
const { RangePicker } = DatePicker;
const Option = Select.Option;
@connect(({ book, order, bookConfig, receiveConfig, loading }) => ({
	book,
	order,
	bookConfig,
	receiveConfig,
	loading: loading.models.book,
}))
@Form.create()
export default class BookCreatePage extends CreatePage {

	constructor(props) {
		super(props);
		this.state = {
			title: commonLocale.createLocale + bookLocale.title,
			entityUuid: props.entityUuid,
			entity: {
				type: 'CREATED',
				state: 'SAVED',
				booker: {
					uuid: loginUser().uuid,
					code: loginUser().code,
					name: loginUser().name
				},
				owner: getDefOwner() ? getDefOwner() : undefined,
				items: []
			},
			orders: [],
			beginTimes: [],
			endTimes: [],
			flag: true,
			index: 0,
			auditButton : true,
			orderList: {
				list: [],
				pagination: {},
			},
			pageFilter: {
				page: 0,
				pageSize: 10,
				sortFields: {}
			},
			bookQtyStrConfig:undefined,
      auditPermission: BOOK_RES.AUDIT,
		}
	}

	componentDidMount() {
		this.refresh();
	}

	componentWillReceiveProps(nextProps) {

		let { orders, beginTimes, line, entity, flag, index } = this.state;
		if (this.state.entityUuid === nextProps.book.entity.uuid) {
			this.setState({
				entity: nextProps.book.entity,
				title: bookLocale.title + "：" + nextProps.book.entity.billNumber,
			});
			if (flag && index >= 0 && entity.items && entity.items.length > 0) {
				if (index <= entity.items.length - 1) {
					this.onOrderChange(entity.items[index].orderBillNumber, entity.items[index].line);
					index = index + 1;
					this.setState({
						index: index
					})
				} else {
					this.setState({
						flag: false,
						index: -1
					})
				}

			}
		}
		if (nextProps.order.entity && nextProps.order.entity.uuid && orders.find(function (item) {
			return item.billNumber === nextProps.order.entity.billNumber
		}) === undefined) {

			orders.push(nextProps.order.entity);
			
		}
		if (nextProps.bookConfig.data.startTime && beginTimes.length === 0) {
			this.buildSelectTimes(nextProps.bookConfig.data);
		}
		let target = entity.items[line - 1];
		let order = target && orders.find(function (item) {
			return item.billNumber === target.orderBillNumber
		})
		if (order && line && target.orderBillNumber) {
			if (!target.qtyStr || (target.originalOrder && target.originalOrder != target.orderBillNumber)) {
				target.sourceOrderBillNumber = order.sourceBillNumber;
			}
			this.setState({
				entity: { ...entity },
			})
		}

		if(target&&nextProps.order.orderAccount&&nextProps.order.orderAccount!=this.props.orderAccount){
			target.ableBookQtyStr = nextProps.order.orderAccount.ableBookQtyStr;
			target.ableBookArticleCount = nextProps.order.orderAccount.ableBookArticleCount;


			this.setState({
				entity: { ...entity },
			})
		}
		this.setState({
			orders: orders
		})

		if (nextProps.order.data && nextProps.order.data != this.props.order.data) {
			this.setState({
				orderList: nextProps.order.data,
			})
		}

		if (nextProps.receiveConfig.data) {
			this.setState({
				bookQtyStrConfig: nextProps.receiveConfig.data,
			})
		}
	}
	onCancel = () => {
		this.props.form.resetFields();
		this.props.dispatch({
			type: 'book/showPage',
			payload: {
				showPage: 'query'
			}
		});
	}

	convertData(data) {
		if (data.endTime && data.endTime <= data.beginTime) {
			message.error('结束时间必须大于开始时间');
			return false;
		}
		
		for (let i = 0; i < this.state.entity.items.length; i++) {
			if (!this.state.entity.items[i].orderBillNumber) {
				this.state.entity.items.splice(i, 1);
				if (this.state.entity.items[i] && this.state.entity.items[i].line) {
					this.state.entity.items[i].line = i + 1;
				}
				i = i - 1;
			}
		}

		if (this.state.entity.items.length === 0) {
			message.error('订单明细不能为空');
			return false;
		}

		let allQtyStr='0';

		let flag = false;
		let items = this.state.entity.items;
		for (let i = 0; i < items.length; i++) {
			if (!items[i].orderBillNumber) {
				flag = true;
				message.error('第' + items[i].line + '行订单不能为空');
				break;
			}
			if (!items[i].qtyStr || items[i].qtyStr === 0) {
				flag = true;
				message.error('第' + items[i].line + '行预约件数不能为空且不能为0');
				break;
			}
			if (items[i].note && items[i].note.length > 255) {
				flag = true;
				message.error('第' + items[i].line + '行备注长度最大为255');
				break;
			}
			console.log(items[i])
			let qtyStrs = items[i].qtyStr.toString().split('+');
			let ableBookQtyStr = items[i].ableBookQtyStr.toString().split('+');
			let case1 = parseInt(ableBookQtyStr[0] ? ableBookQtyStr[0] : 0) - parseInt(qtyStrs[0] ? qtyStrs[0] : 0);
			if (case1 < 0) {
				flag = true;
				message.error('第' + items[i].line + '行可预约最大整件数为' + (ableBookQtyStr[0] ? ableBookQtyStr[0] : 0) + '，最小为0，请检查！');
				break;
			}

			allQtyStr = add(allQtyStr, qtyStrs[0] ? qtyStrs[0] : 0);

			let split = parseInt(ableBookQtyStr[1] ? ableBookQtyStr[1] : 0) - parseInt(qtyStrs[1] ? qtyStrs[1] : 0);
			if (split < 0) {
				flag = true;
				message.error('第' + items[i].line + '行可预约最大拆零数为' + (ableBookQtyStr[1] ? ableBookQtyStr[1] : 0) + '，最小为0，请检查！');
				break;
			}
			if (!items[i].articleCount || 0 >= items[i].articleCount || items[i].articleCount > items[i].ableBookArticleCount) {
				flag = true;
				message.error('第' + items[i].line + '行可预约最大品项数为' + items[i].ableBookArticleCount + '，最小为0且不能为0，请检查！');
				break;
			}
		}
		if (flag) {
			return false;
		}
		let bookCreation = {
			companyUuid: loginCompany().uuid,
			dcUuid: loginOrg().uuid,
			vendor: JSON.parse(data.vendor),
			owner: JSON.parse(data.owner),
			bookDate: formatDate(data.bookDate, true),
			startTime: data.beginTime,
			endTime: data.endTime,
			booker: JSON.parse(data.booker),
			dockGroup: JSON.parse(data.dockGroup),
			note: data.note,
			items: this.state.entity.items
		}
		let config=this.state.bookQtyStrConfig;
		if(config && config.exceedRatio && compare(config.maxReceiveQtyStr,allQtyStr)<0
			&& compare((config.exceedRatio+1)*config.maxReceiveQtyStr, allQtyStr)>0){
			bookCreation.showModal=true;
		}
		return bookCreation;
	}

	confirmSave=(creation,onlySave)=>{
		if(this.state.modalVisible){
			this.handleModalVisible();
		}
		if(onlySave){
			if (!this.state.entity.uuid) {
				this.props.dispatch({
					type: 'book/onSave',
					payload: creation,
					callback: (response) => {
						if (response && response.success) {
							this.props.form.resetFields();
							message.success(commonLocale.saveSuccessLocale);
						}
					}
				});
			} else {
				creation.uuid = this.state.entity.uuid;
				creation.version = this.state.entity.version;
				this.props.dispatch({
					type: 'book/onModify',
					payload: creation,
					callback: (response) => {
						if (response && response.success) {
							this.props.form.resetFields();
							message.success(commonLocale.modifySuccessLocale);
						}
					}
				});
			}
		}else{
			this.props.dispatch({
				type: 'book/onSaveAndCreate',
				payload: creation,
				callback: (response) => {
					if (response && response.success) {
						this.setState({
							entity: {
								companyUuid: loginCompany().uuid,
								dcUuid: loginOrg().uuid,
								type: 'CREATED',
								state: 'SAVED',
								booker: {
									uuid: loginUser().uuid,
									code: loginUser().code,
									name: loginUser().name
								},
								owner: getDefOwner(),
								items: []
							}
						});
						this.props.form.resetFields();
						this.getOrder(null);
						message.success(commonLocale.saveSuccessLocale);
					}
				}
			});
		}
	}
	onSave = (data) => {
		const creation = this.convertData(data);
		if (!creation) {
			return;
		}
		if(creation.showModal){
			this.handleModalVisible(creation,true);
		}else{
			this.confirmSave(creation,true);
		}
	}

	onSaveAndCreate = (data) => {
		const creation = this.convertData(data);
		if (!creation) {
			return;
		}
		if(creation.showModal){
			this.handleModalVisible(creation,false)
		}else{
			this.confirmSave(creation,false);
		}
	}

	  /**
   * 模态框显示/隐藏
   */
  handleModalVisible = (creation,flag) => {
	if(creation!=undefined && flag!=undefined){
		this.setState({
			modalVisible: !this.state.modalVisible,
			creation:creation,
			onlySave:flag
		});
	}else{
		this.setState({
			modalVisible: !this.state.modalVisible,
			creation:undefined,
			onlySave:undefined
		});
	}
  }
	/**
	 * 模态框确认操作
	 */
	handleOk = () => {
		if(this.state.creation!=undefined && this.state.onlySave!=undefined){
			this.confirmSave(this.state.creation,this.state.onlySave);
		}
	}
	refresh = () => {
		this.getOrder(null);
		this.props.dispatch({
			type: 'bookConfig/getByCompanyUuidAndDcUuid',
		});
		if (this.state.entityUuid) {
			this.getOrder(null);
			this.props.dispatch({
				type: 'book/get',
				payload: {
					uuid: this.state.entityUuid
				}
			});
		}
	}

	onOrderChange = (value, line) => {
		this.setState({
			line: line,
		})
		let { orders, entity } = this.state;
		const target = entity.items[line - 1];
		target.originalOrder = target.orderBillNumber ? target.orderBillNumber : value;
		target.orderBillNumber = value;
		let order = orders.find(function (item) {
			return item.billNumber === value
		});

		if (order === undefined) {
			this.getOrder(value);
		}

		this.getOrderForQty(value);
	}

	getOrder = (value) => {
		this.props.dispatch({
			type: 'order/getByBillNumberForReceive',
			payload: {
				sourceBillNumber: value,
				dcUuid: loginOrg().uuid
			},
		});
	}
	getOrderForQty = (value)=>{
		this.props.dispatch({
			type: 'order/getByBillNumberAndDcUuidForBook',
			payload: {
				billNumber: value,
			},
		});
	}

	addTimeRange = (startTime, endTime, timeRange) => {
		let startTimes = startTime.split(':');
		let hour = parseInt(startTimes[0]);
		let minute = parseInt(startTimes[1]);
		let addHour = Math.floor(timeRange / 60);
		let addMinute = timeRange % 60;
		let newHour = hour + addHour;
		let newMinute = minute + addMinute;
		let endTimes = endTime.split(':');
		let endHour = parseInt(endTimes[0]);
		let endMinute = parseInt(endTimes[1]);
		if (newHour > endHour || (newHour === endHour && newMinute > endMinute))
			return endTime;
		if (newMinute >= 60) {
			newHour = newHour + Math.floor(newMinute / 60);
			newMinute = newMinute % 60;
		}
		let middleTime = (newHour < 10 ? '0' : '') + newHour + ":" + (newMinute < 10 ? '0' + newMinute : newMinute);
		return middleTime;
	}


	buildSelectTimes = (bookConfig) => {
		const startTime = bookConfig.startTime;
		const endTime = bookConfig.endTime;
		const timeRange = bookConfig.timeRange;

		let beginTimes = [];
		let endTimes = [];
		beginTimes.push(bookConfig.startTime);

		if (startTime) {
			let middleTime = this.addTimeRange(startTime, endTime, timeRange);
			beginTimes.push(middleTime);
			endTimes.push(middleTime);
			while (middleTime !== endTime) {
				middleTime = this.addTimeRange(middleTime, endTime, timeRange);
				beginTimes.push(middleTime);
				endTimes.push(middleTime);
			}
			beginTimes.splice(beginTimes.length - 1, 1);
		}
		this.setState({
			beginTimes: beginTimes,
			endTimes: endTimes
		})
	}

	disabledStartDate = (current) => {
		const entity = this.props.bookConfig.data;
		if (entity.preDays === 0) {
			entity.preDays = 90;
		}
		return current && (current < moment().add(-1, 'days').endOf('day') || current > moment().add(entity.preDays, 'days'));
	}

	onVendorChange = (value) => {
		const { entity } = this.state;
		let originalVendor = this.props.form.getFieldValue('vendor');
		if (!originalVendor || entity.items.length === 0) {
			return;
		}

		if (originalVendor != value) {
			Modal.confirm({
				title: '修改供应商会导致明细清空，请确认修改？',
				okText: '确认',
				cancelText: '取消',
				onOk: () => {
					entity.items = [];
					this.setState({
						entity: { ...entity }
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

	onOwnerChange = (value) => {
		const { entity } = this.state;
		let originalOwner = this.props.form.getFieldValue('owner');
		if (!originalOwner || entity.items.length === 0) {
			return;
		}

		if (originalOwner != value) {
			Modal.confirm({
				title: '修改货主会导致明细清空，请确认修改？',
				okText: '确认',
				cancelText: '取消',
				onOk: () => {
					entity.items = [];
					this.setState({
						entity: { ...entity }
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

	onDockGroupChange = (value) => {
		const { entity } = this.state;
		this.props.dispatch({
			type: 'receiveConfig/getByDockGroupUuid',
			payload: JSON.parse(value).uuid,
		});
	}

	drawFormItems = () => {
		const { getFieldDecorator } = this.props.form;
		const { entity, beginTimes, endTimes, defOwner } = this.state;
		let beginTimeOptions = [];
		let endTimeOptions = [];
		const bookDate = this.props.form.getFieldValue('bookDate');
		let today = moment();
		beginTimes.forEach(function (key) {
			if (bookDate && moment(bookDate, 'YYYY-MM-DD').diff(today.format('YYYY-MM-DD'), 'days') === 0) {
				if (key > today.format('HH:mm')) {
					beginTimeOptions.push(<Option value={key}>{key}</Option>);
				}
			} else {
				beginTimeOptions.push(<Option value={key}>{key}</Option>);
			}
		});

		let selectBeginTime = this.props.form.getFieldValue('beginTime');
		endTimes.forEach(function (key) {
			if (beginTimeOptions.length >= 1) {
				if (selectBeginTime) {
					if (key > selectBeginTime) {
						endTimeOptions.push(<Option value={key}>{key}</Option>);
					}
				} else {
					if (key > beginTimeOptions[0].props.value) {
						endTimeOptions.push(<Option value={key}>{key}</Option>);
					}
				}
			} else {
				endTimeOptions.push(<Option value={key}>{key}</Option>);
			}
		})

		const owner = this.props.form.getFieldValue('owner');
		let ownerUuid = '';
		if (owner) {
			ownerUuid = JSON.parse(owner).uuid;
		}

		let cols = [
			<CFormItem key='owner' label={commonLocale.inOwnerLocale}>
				{
					getFieldDecorator('owner', {
						initialValue: entity.owner ? JSON.stringify(entity.owner) : undefined,
						rules: [
							{ required: true, message: notNullLocale(commonLocale.inOwnerLocale) }
						],
					})(
						<OwnerSelect onChange={this.onOwnerChange} onlyOnline placeholder={placeholderChooseLocale(commonLocale.inOwnerLocale)} />
					)
				}
			</CFormItem>,
			<CFormItem key='vendor' label={commonLocale.inVendorLocale}>
				{getFieldDecorator('vendor', {
					initialValue: JSON.stringify(entity.vendor),
					rules: [
						{ required: true, message: notNullLocale(commonLocale.inVendorLocale) }
					]
				})(
					<VendorSelect
						ownerUuid={ownerUuid}
						onChange={this.onVendorChange}
						state={STATE.ONLINE}
						placeholder={placeholderLocale(commonLocale.inVendorLocale + commonLocale.codeLocale)}
						single
					/>)}
			</CFormItem>,
			<CFormItem key='dockGroup' label={bookLocale.dockGroup}>
				{
					getFieldDecorator('dockGroup', {
						initialValue: JSON.stringify(entity.dockGroup),
						rules: [
							{ required: true, message: notNullLocale(bookLocale.dockGroup) }
						],
					})(
						<DockGroupSelect placeholder={placeholderChooseLocale(bookLocale.dockGroup)} onChange={this.onDockGroupChange}/>
					)
				}
			</CFormItem>,
			<CFormItem label={bookLocale.booker} key='booker'>
				{getFieldDecorator('booker', {
					initialValue: JSON.stringify(entity.booker),
					rules: [
						{ required: true, message: notNullLocale(bookLocale.booker) }
					],
				})(<UserSelect single={true} />)}
			</CFormItem>,
			<CFormItem key='bookDate' label={bookLocale.bookDate}>
				{
					getFieldDecorator('bookDate', {
						initialValue: entity.bookDate ? moment(entity.bookDate, 'YYYY-MM-DD') : moment(),
						rules: [
							{ required: true, message: notNullLocale(bookLocale.bookDate) }
						],
					})(
						<DatePicker style={{ width: '100%' }} disabledDate={this.disabledStartDate} />
					)
				}
			</CFormItem>,
			<CFormItem key='time' label={'预约时间'} required={true}>
				<Form.Item
					style={{ display: 'inline-block', width: 'calc(50% - 12px)' }}
				>
					{
						getFieldDecorator('beginTime', {
							initialValue: entity.startTime,
							rules: [
								{ required: true, message: notNullLocale(bookLocale.beginTime) }
							],
						})(
							<Select placeholder={bookLocale.beginTime}>
								{beginTimeOptions}
							</Select>
						)
					}
				</Form.Item>
				<span style={{ display: 'inline-block', width: '24px', textAlign: 'center' }}>-</span>
				<Form.Item style={{ display: 'inline-block', width: 'calc(50% - 12px)' }}>
					{
						getFieldDecorator('endTime', {
							initialValue: entity.endTime,
							// rules: [
							// 	{ required: true, message: notNullLocale(bookLocale.endTime) }
							// ],
						})(
							<Select placeholder={bookLocale.endTime}>
								{endTimeOptions}
							</Select>
						)
					}
				</Form.Item>
			</CFormItem>
		];
    return [
      <FormPanel key='basicInfo' noteLabelSpan={4} title={commonLocale.basicInfoLocale} cols={cols} noteCol={this.drawNotePanel()}/>
    ];
	}

	handleFieldChange(e, fieldName, line) {
		const { entity } = this.state;
		const target = entity.items[line - 1];
		if (fieldName === 'qtyStr') {
			target.qtyStr = e;
		}
		if (fieldName === 'articleCount') {
			target.articleCount = e;
		}
		this.setState({
			entity: { ...entity },
		})
	}
	drawTable = () => {
		const vendor = this.props.form.getFieldValue('vendor');
		let vendorUuid = null;
		if (vendor) {
			vendorUuid = JSON.parse(vendor).uuid;
		}
		const owner = this.props.form.getFieldValue('owner');
		let ownerUuid = null;
		if (owner) {
			ownerUuid = JSON.parse(owner).uuid;
		}
		const columns = [
			{
				title: commonLocale.inOrderBillNumberLocale,
				dataIndex: 'orderBillNumber',
				key: 'orderBillNumber',
				width: colWidth.billNumberColWidth,
				render: (text, record) => {
					return (
						<OrderBillNumberSelect value={record.orderBillNumber} onChange={e => this.onOrderChange(e, record.line)}
							states={['INITIAL', 'BOOKING','BOOKED','PREVEXAM','INPROGRESS']} vendorUuid={vendorUuid} ownerUuid={ownerUuid} />
					);
				}
			},
			{
				title: '来源单号',
				dataIndex: 'sourceOrderBillNumber',
				key: 'sourceOrderBillNumber',
				width: colWidth.billNumberColWidth,
				render: (text) => text ? text : <Empty />
			},
			{
				title:'可预约件数',
				dataIndex:'ableBookQtyStr',
        width: colWidth.billNumberColWidth+50,
				render: (text) => text ? text : <Empty />
			},
			{
				title: bookLocale.bookQtyStr,
				dataIndex: 'qtyStr',
				key: 'qtyStr',
				width: itemColWidth.qtyStrEditColWidth,
				render: (text, record) => {
					return (
						<QtyStrInput
							value={record.qtyStr}
							onChange={
								e => this.handleFieldChange(e, 'qtyStr', record.line)
							}
							placeholder={placeholderLocale(commonLocale.inQtyStrLocale)}
						/>
					);
				}
			},
			{
				title:'可预约品项数',
				dataIndex:'ableBookArticleCount',
        width: colWidth.billNumberColWidth+50,
				render: (text) => text ? text : <Empty />
			},
			{
				title: bookLocale.bookArticleQty,
				dataIndex: 'articleCount',
				key: 'articleCount',
				width: itemColWidth.numberEditColWidth + 100,
				render: (text, record) => {
					return (
						<InputNumber
							min={0}
							precision={0}
							decimalSeparator={null}
							style={{ width: '80%' }}
							value={record.articleCount}
							onChange={
								e => this.handleFieldChange(e, 'articleCount', record.line)
							}
							placeholder={placeholderLocale(bookLocale.bookArticleQty)}
						/>
					);
				}
			},
		];
		return (
			<div>
				<ItemEditTable
					title={bookLocale.orderInfo}
					columns={columns}
					data={this.state.entity.items}
					handleFieldChange={this.handleFieldChange}
					drawBatchButton={this.drawBatchButton}
					drawTotalInfo={this.drawTotalInfo}
				/>
				<PanelItemBatchAdd
					searchPanel={<SearchFormItemBatchAdd refresh={this.onSearch} fieldsValue={''} />}
					visible={this.state.batchAddVisible}
					columns={this.columns}
					data={this.state.searcheButtonClicked ? this.state.orderList : {list: [],pagination: {}}}
					handlebatchAddVisible={this.handlebatchAddVisible}
					getSeletedItems={this.getItemList}
					onChange={this.tableChange}
				/>
				<ConfirmModal
					operate={'预约'}
					visible={this.state.modalVisible}
					content={'已超过预约配置的最大可预约件数,是否确认保存？'}
					onOk={this.handleOk}
					onCancel={this.handleModalVisible}
				/>
			</div>
		)
	}

	drawTotalInfo = () => {
		let allQtyStr = '0';
		let allArticleCount = 0;
		this.state.entity.items && this.state.entity.items.map(item => {
			if (item.articleCount) {
				allArticleCount = allArticleCount + parseFloat(item.articleCount)
			}
			if (item.qtyStr) {
				allQtyStr = add(allQtyStr, item.qtyStr);
			}
		})
		return (
			<span style={{ marginLeft: '10px' }}>
				本次预约{commonLocale.inAllQtyStrLocale}：{allQtyStr}  |
      {bookLocale.allArticles}：{allArticleCount}
			</span>
		);
	}
	/**
   * 绘制按钮
   */
	drawBatchButton = () => {
		return (
			<span>
				<a onClick={() => this.handlebatchAddVisible()}>添加</a>
			</span>
		)
	}
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
	/**搜索*/
	onSearch = (data) => {
		let vendorUuid = undefined;
		let ownerUuid = undefined;
		if (this.props.form.getFieldValue('vendor')) {
			vendorUuid = JSON.parse(this.props.form.getFieldValue('vendor')).uuid;
		}
		if (this.props.form.getFieldValue('owner')) {
			ownerUuid = JSON.parse(this.props.form.getFieldValue('owner')).uuid;
		}
		if (!vendorUuid || !ownerUuid) {
			return;
		}
		const { pageFilter } = this.state;
		pageFilter.page = 0;
		pageFilter.searchKeyValues = {
			companyUuid: loginCompany().uuid,
			dcUuid: loginOrg().uuid,
			vendorUuid: vendorUuid,
			ownerUuid: ownerUuid,
			states: ['INITIAL', 'BOOKING','BOOKED','PREVEXAM','INPROGRESS'],
			...data
		}
		this.refreshTable();
	}
	refreshTable = () => {
		this.setState({
			searcheButtonClicked:true
		})
		this.props.dispatch({
			type: 'order/query',
			payload: { ...this.state.pageFilter }
		});
	};

	/** 批量添加弹出框*/
	handlebatchAddVisible = () => {
		if(this.state.batchAddVisible){
			this.setState({
				searcheButtonClicked:false
			})
		}
		this.setState({
			batchAddVisible: !this.state.batchAddVisible
		})
	}

	/**获取批量增加的集合*/
	getItemList = (value) => {
		const { entity } = this.state;
		var newList = [];
		for (let i = 0; i < value.length; i++) {
			let obj = {
				orderBillNumber: value[i].billNumber,
				sourceOrderBillNumber: value[i].sourceBillNumber,
				// qtyStr: subtract(value[i].totalQtyStr, value[i].bookedQtyStr),
				// articleCount: value[i].totalArticleCount,
				// maxQtyStr: subtract(value[i].totalQtyStr, value[i].bookedQtyStr),
				// maxArticleCount: value[i].totalArticleCount,
				ableBookArticleCount:value[i].ableBookArticleCount,
				ableBookQtyStr:value[i].ableBookQtyStr,
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
	columns = [
		{
			title: commonLocale.inOrderBillNumberLocale,
			dataIndex: 'billNumber',
			key: 'billNumber',
			width: colWidth.billNumberColWidth,
		},
		{
			title: '来源单号',
			dataIndex: 'sourceBillNumber',
			key: 'sourceBillNumber',
			width: colWidth.billNumberColWidth,
			render: (val) => { return val ? val : <Empty /> }
		},
		{
			title: bookLocale.ableBookQtyStr,
			dataIndex: 'ableBookQtyStr',
			key: 'ableBookQtyStr',
			width: itemColWidth.qtyStrEditColWidth+100,
		},
		{
			title: bookLocale.ableBookArticleCount,
			dataIndex: 'ableBookArticleCount',
			key: 'ableBookArticleCount',
			width: itemColWidth.qtyColWidth+100,
		},
	]
}
