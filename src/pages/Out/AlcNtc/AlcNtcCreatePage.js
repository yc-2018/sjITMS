import { connect } from 'dva';
import CreatePage from '@/pages/Component/Page/CreatePage';
import FormPanel from '@/pages/Component/Form/FormPanel';
import CFormItem from '@/pages/Component/Form/CFormItem';
import OrderBillNumberSelect from '@/pages/In/Receive/OrderBillNumberSelect';
import { loginCompany, loginOrg, loginUser, getDefOwner,getActiveKey} from '@/utils/LoginContext';
import { Form, Select, Input, InputNumber, message, Col, DatePicker, Modal } from 'antd';
import { commonLocale, notNullLocale,tooLongLocale, placeholderLocale, placeholderChooseLocale, confirmLineFieldNotNullLocale } from '@/utils/CommonLocale';
import { qtyStrToQty, add, toQtyStr } from '@/utils/QpcStrUtil';
import { convertCodeName } from '@/utils/utils';
import ItemEditTable from '@/pages/Component/Form/ItemEditTable';
import QtyStrInput from '@/pages/Component/Form/QtyStrInput';
import moment from 'moment';
import { formatDate } from '@/utils/utils';
import { alcNtcLocale } from './AlcNtcLocale';
import { LogisticMode } from '@/pages/In/Order/OrderContants';
import OwnerSelect from '@/pages/Component/Select/OwnerSelect';
import WrhSelect from '@/pages/Component/Select/WrhSelect';
import StoreSelect from '@/pages/Component/Select/StoreSelect';
import { STATE } from '@/utils/constants';
import ArticleSelect from './ArticleSelect';
import PreTypeSelect from '@/pages/Component/Select/PreTypeSelect';
import { PRETYPE } from '@/utils/constants';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import Empty from '@/pages/Component/Form/Empty';
import { MAX_DECIMAL_VALUE } from '@/utils/constants';
import { SchedulingType, State } from './AlcNtcContants';
import {ALCNTC_RES} from "./AlcNtcPermission.js";
const logisticModeOptions = [];
Object.keys(LogisticMode).forEach(function (key) {
	if (key === LogisticMode.UNIFY.name) {
		logisticModeOptions.push(<Select.Option value={LogisticMode[key].name} key={LogisticMode[key].name}>{LogisticMode[key].caption}</Select.Option>);
	}
});
//调度类型选项
const schedulingTypes = [];
Object.keys(SchedulingType).forEach(function(key){
	schedulingTypes.push(
		<Select.Option value = {SchedulingType[key].name} key={SchedulingType[key].name}>
			{SchedulingType[key].caption}
		</Select.Option>
	)
})
@connect(({ alcNtc, order, article, loading }) => ({
	alcNtc,
	order,
	article,
	loading: loading.models.alcNtc,
}))
@Form.create()
export default class AlcNtcCreatePage extends CreatePage {

	constructor(props) {
		super(props);
		this.state = {
			title: commonLocale.createLocale + alcNtcLocale.title,
			entityUuid: props.alcNtc.entityUuid,
			entity: {
				owner: getDefOwner() ? getDefOwner() : undefined,
				logisticMode: LogisticMode.UNIFY.name,
				schedulingType: SchedulingType.DELIVERY.name,
				items: [],
				sourceWay: "CREATE",
			},//配货通知单
			articles: {},
			auditButton : true,
			articleOption: [],
			order: {},
      auditPermission: ALCNTC_RES.AUDIT,
    }
	}

	componentDidMount() {
	  this.refresh();
  }

	componentWillReceiveProps(nextProps) {
		let { articles, articleOption } = this.state;
		let order = nextProps.order.entity;
		if (this.state.entityUuid && nextProps.alcNtc.entity.uuid === this.state.entityUuid) {
			this.setState({
				entity: nextProps.alcNtc.entity,
				title: alcNtcLocale.title + "：" + nextProps.alcNtc.entity.billNumber,
			});
			if (this.state.entity.orderBillNumber && !nextProps.order.entity.billNumber) {
				this.getOrder(this.state.entity.orderBillNumber);
			}
		}
		if (nextProps.order.entity&&this.state.order.uuid !== nextProps.order.entity.uuid) {
			this.setState({
				order: order
			})
		}

		if (order&&order.billNumber && order.billNumber === this.state.entity.orderBillNumber) {
			let entity = this.state.entity;
			entity.orderBillNumber = order.billNumber;
			entity.sourceOrderBillNumber = order.sourceBillNumber;
			entity.wrh = order.wrh;
			let articleUuids = [];
			articleOption = [];
			Array.isArray(order.items) && order.items.forEach(function (item) {
				if (!articleUuids.find((n) => n === item.article.uuid)) {
					articleUuids.push(item.article.uuid);
					articleOption.push(
						<Select.Option key={item.article.uuid} value={JSON.stringify({
							uuid: item.article.uuid,
							code: item.article.code,
							name: item.article.name
						})}> {'[' + item.article.code + ']' + item.article.name} </Select.Option>
					);
				}
			});
			this.setState({
				entity: { ...entity },
				articleOption: articleOption
			})
		}
		if (nextProps.article.entity.uuid && !articles[nextProps.article.entity.uuid]) {
			articles[nextProps.article.entity.uuid] = nextProps.article.entity;
			this.setState({
				articles: articles
			});
		}
	}
	onCancel = () => {
		this.props.form.resetFields();
		this.props.dispatch({
			type: 'alcNtc/showPage',
			payload: {
				showPage: 'query'
			}
		});
	}

	onSave = (data) => {
		let creation = {};
		if(this.state.entity.state&&(this.state.entity.state === State.INITIAL.name||this.state.entity.state === State.USED.name)){
			creation = this.convertDataIntial(data);
		}else{
			creation = this.convertData(data);
		}
		if (!creation) {
			return;
		}
		if (!this.state.entity.uuid) {
			this.props.dispatch({
				type: 'alcNtc/onSave',
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

			let type = 'alcNtc/onModify';
			if(this.state.entity.state&&(this.state.entity.state === State.INITIAL.name||this.state.entity.state === State.USED.name)){
				type = 'alcNtc/onModifyInitial';
			}
			this.props.dispatch({
				type: type,
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

	onSaveAndCreate = (data) => {
		const creation = this.convertData(data);
		if (!creation) {
			return;
		}
		this.props.dispatch({
			type: 'alcNtc/onSaveAndCreate',
			payload: creation,
			callback: (response) => {
				if (response && response.success) {
					this.setState({
						entity: {
							companyUuid: loginCompany().uuid,
							dcUuid: loginOrg().uuid,
							items: []
						}
					});
					this.props.form.resetFields();
					message.success(commonLocale.saveSuccessLocale);
				}
			}
		});
	}

	convertData(data) {
		const { entity } = this.state;
		for (let i = 0; i < entity.items.length; i++) {
			if (!entity.items[i].article) {
				entity.items.splice(i, 1);
				if (entity.items[i] && entity.items[i].line) {
					entity.items[i].line = i + 1;
				}
				i = i - 1;
			}
		}
		if (entity.items.length === 0) {
			message.error(notNullLocale(commonLocale.itemsLocale));
			return false;
		}

		let items = [];
		if (data.logisticMode !== LogisticMode.UNIFY.name && !data.orderBillNumber) {
			message.error('物流模式为“越库”时，订单号必须输入');
			return false;
		}
		if (data.store && data.store.type) {
			delete data.store.type;
		}
		if (data.expireDate) {
			data.expireDate = formatDate(data.expireDate, true);
		}
		if (data.alcDate) {
			data.alcDate = formatDate(data.alcDate, true);
		}
		for (let i = 0; i <= entity.items.length - 1; i++) {
			if (!entity.items[i].article) {
				message.error(confirmLineFieldNotNullLocale(entity.items[i].line, commonLocale.inArticleLocale));
				return false;
			} else if (!entity.items[i].qpcStr || !entity.items[i].munit) {
				message.error(confirmLineFieldNotNullLocale(entity.items[i].line, commonLocale.inQpcAndMunitLocale));
				return false;
			} else if (!entity.items[i].qty || entity.items[i].qty <= 0) {
				message.error('第' + entity.items[i].line + '行数量必须大于0');
				return false;
			} else if (entity.items[i].price==undefined || entity.items[i].price < 0) {
				message.error('第' + entity.items[i].line + '行价格不能为空且不能小于0');
				return false;
			} else if (entity.items[i].note && entity.items[i].note.length > 255) {
				message.error('第' + entity.items[i].line + '行备注长度最大为255');
				return false;
			}
			let articleItem = {};
			articleItem.article = entity.items[i].article;
			articleItem.line = entity.items[i].line;
			articleItem.price = entity.items[i].price;
			articleItem.spec = entity.items[i].spec;
			articleItem.note = entity.items[i].note;
			articleItem.qpcStr = entity.items[i].qpcStr;
			articleItem.munit = entity.items[i].munit;
			articleItem.qty = entity.items[i].qty;
			articleItem.productionBatch = entity.items[i].productionBatch;
			articleItem.targetProductDate = entity.items[i].targetProductDate? moment(entity.items[i].targetProductDate).format('YYYY-MM-DD')+" 00:00:00" : undefined;
			articleItem.targetValidDate = entity.items[i].targetValidDate? moment(entity.items[i].targetValidDate).format('YYYY-MM-DD')+" 00:00:00" : undefined;
			items.push(articleItem);
		}

		let store = JSON.parse(data.store);
		delete store.type;
		let sourceWay = "CREATE";
		if (data.sourceWay) {
			sourceWay = data.sourceWay;
		}
		let alcNtcCreation = {
			billNumber: this.state.entity.billNumber,
			state: this.state.entity.state,
			type: data.type,
			schedulingType: data.schedulingType,
			owner: JSON.parse(data.owner),
			store: store,
			logisticMode: data.logisticMode,
			wrh: data.wrh ? JSON.parse(data.wrh) : this.state.entity.wrh,
			orderBillNumber: data.orderBillNumber,
			expireDate: data.expireDate,
			alcDate: data.alcDate,
			sourceOrderBillNumber: this.state.entity.sourceOrderBillNumber,
			sourceBillNumber: data.sourceBillNumber,
			groupName: data.groupName,
			note: data.note,
			companyUuid: loginCompany().uuid,
			dcUuid: loginOrg().uuid,
			items: items,
			sourceWay: sourceWay
		}
		return alcNtcCreation;
	}

	convertDataIntial (data){
		const { entity }  = this.state;
		let items = [];
		entity.items.forEach(item=>{
			let value = {
				itemUuid:item.uuid,
				note:item.note,
				productionBatch:item.productionBatch,
				targetProductDate:item.targetProductDate?moment(item.targetProductDate).format('YYYY-MM-DD')+' 00:00:00':undefined,
				targetValidDate:item.targetValidDate?moment(item.targetValidDate).format('YYYY-MM-DD')+' 00:00:00':undefined,
			}
			items.push(value);
		})
		let newData = {
			billUuid:this.state.entity.uuid,
			schedulingType:data.schedulingType,
			note:data.note,
			version: entity.version,
			items:items
		}

		return newData
	}

	refresh = () => {
			this.props.dispatch({
				type: 'alcNtc/get',
				payload: {
					uuid: this.state.entityUuid
				}
			});
	}

	onOrderChange = (value) => {
		const { entity } = this.state;
		let originalOrder = this.props.form.getFieldValue('orderBillNumber');
		if (!originalOrder || entity.items.length === 0) {
			entity.orderBillNumber = value;
			this.setState({
				entity: { ...entity }
			});
			this.getOrder(value);
			return;
		} else if (originalOrder != value && entity.items.length != 0) {
			Modal.confirm({
				title: '修改订单会导致仓位及明细改变，请确认修改？',
				okText: '确认',
				cancelText: '取消',
				onOk: () => {
					entity.items = [];
					entity.wrh = null;
					entity.orderBillNumber = value;
					this.setState({
						articleOption: [],
						entity: { ...entity }
					});
					this.getOrder(value);
				},
				onCancel: () => {
					this.props.form.setFieldsValue({
						orderBillNumber: originalOrder
					});
				}
			});
		}
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

	onOwnerChange = (value) => {
		const { entity } = this.state;
		let originalOwner = this.props.form.getFieldValue('owner');
    this.props.form.setFieldsValue({
      wrh: undefined,
      store: undefined
    });
		if (!originalOwner || (originalOwner != value && !this.props.form.getFieldValue('orderBillNumber') && entity.items.length == 0)) {
			entity.owner = JSON.parse(value);
			return;
		} else if (originalOwner != value && (this.props.form.getFieldValue('orderBillNumber') || entity.items.length != 0)) {
			Modal.confirm({
				title: '修改货主会导致订单或明细清空，请确认修改？',
				okText: '确认',
				cancelText: '取消',
				onOk: () => {
					entity.items = [];
					entity.orderBillNumber = undefined;
					entity.sourceOrderBillNumber = undefined;
					entity.owner = JSON.parse(value);
					this.setState({
						order: {},
						articleOption: [],
						articles: {},
						entity: { ...entity }
					}, () => {
						this.props.form.setFieldsValue({
							owner: value,
							orderBillNumber: undefined
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

	onModeChange = (value) => {
		const { entity } = this.state;
		let originalMode = this.props.form.getFieldValue('logisticMode');
		if (originalMode != value && (this.props.form.getFieldValue('orderBillNumber') || entity.items.length != 0)) {
			Modal.confirm({
				title: '修改物流模式会导致订单或者明细清空，请确认修改？',
				okText: '确认',
				cancelText: '取消',
				onOk: () => {
					entity.items = [];
					entity.orderBillNumber = undefined;
					entity.sourceOrderBillNumber = undefined;
					entity.logisticMode = value;
					entity.wrh = undefined;
					this.setState({
						order: {},
						articleOption: [],
						entity: { ...entity }
					}, () => {
						this.props.form.setFieldsValue({
							orderBillNumber: undefined,
							logisticMode: value,
						});
						this.props.form.setFields({
							wrh: {
								value: entity.wrh,
								errors: undefined,
							},
						});
					});
				},
				onCancel: () => {
					this.props.form.setFieldsValue({
						logisticMode: originalMode
					});
				}
			});
		} else if (originalMode != value && entity.items.length === 0) {
			entity.logisticMode = value;
			this.props.form.setFields({
				wrh: {
					value: entity.wrh,
					errors: undefined,
				},
			});
			this.setState({
				entity: { ...entity }
			})
			return;
		}
	}

	drawFormItems = () => {
		const { getFieldDecorator } = this.props.form;
		const { entity } = this.state;
		const owner = this.props.form.getFieldValue('owner');
		let isCreateOrSaved = !entity.uuid || (entity.uuid && State[entity.state].name === State.SAVED.name);
		let orgOwnerUuid = '';
		let orderOwnerUuid = null;
		if (owner) {
			orgOwnerUuid = JSON.parse(owner).uuid;
			orderOwnerUuid = JSON.parse(owner).uuid;
		}
		let logisticMode = LogisticMode.UNIFY.name;
		if (this.props.form.getFieldValue('logisticMode')) {
			logisticMode = this.props.form.getFieldValue('logisticMode');
		};
		let wrhItem = <CFormItem key='wrh' label={commonLocale.inWrhLocale}>
			{
				getFieldDecorator('wrh', {
					initialValue: entity ? (entity.wrh ? JSON.stringify(entity.wrh) : undefined) : null,
					rules: [{ required: true, message: notNullLocale(commonLocale.inWrhLocale) }],
				})(
					<WrhSelect disabled={!isCreateOrSaved} placeholder={placeholderLocale(commonLocale.inWrhLocale)} />
				)
			}
		</CFormItem>;
		if (logisticMode && logisticMode != LogisticMode.UNIFY.name) {
			wrhItem = <CFormItem label={commonLocale.inWrhLocale} key='wrh'>
				{getFieldDecorator('wrh')(
					<Col>{entity.wrh ? convertCodeName(entity.wrh) : <Empty />}</Col>
				)}
			</CFormItem>;
		}
		let cols = [
			<CFormItem label={alcNtcLocale.type} key='preType'>
				{getFieldDecorator('type', {
					initialValue: entity.type,
					rules: [
						{ required: true, message: notNullLocale(alcNtcLocale.type) }
					],
				})(<PreTypeSelect disabled={!isCreateOrSaved} placeholder={placeholderChooseLocale(alcNtcLocale.type)} preType={PRETYPE.alcNtcType} />)}
			</CFormItem>,
			<CFormItem label={'调度类型'} key='schedulingType'>
				{getFieldDecorator('schedulingType', {
					initialValue: entity.schedulingType,
					rules: [
						{ required: true, message: '调度类型' }
					],
				})(
					<Select placeholder={placeholderChooseLocale('调度类型')}>
						{schedulingTypes}
					</Select>
				)}
			</CFormItem>,
			<CFormItem label={commonLocale.inOwnerLocale} key='owner'>
				{getFieldDecorator('owner', {
					initialValue: JSON.stringify(entity.owner),
					rules: [
						{ required: true, message: notNullLocale(commonLocale.inOwnerLocale) }
					]
				})(
					<OwnerSelect disabled={!isCreateOrSaved} onChange={this.onOwnerChange} onlyOnline placeholder={placeholderChooseLocale(commonLocale.inOwnerLocale)} />
				)}
			</CFormItem>,
			<CFormItem label={commonLocale.inStoreLocale} key='store'>
				{getFieldDecorator('store', {
					initialValue: JSON.stringify(entity.store),
					rules: [
						{ required: true, message: notNullLocale(commonLocale.inStoreLocale) }
					]
				})(
					<StoreSelect
						disabled={!isCreateOrSaved}
						ownerUuid={orgOwnerUuid}
						state={STATE.ONLINE}
						placeholder={placeholderLocale(commonLocale.inStoreLocale + commonLocale.codeLocale)}
						single
					/>
				)}
			</CFormItem>,
			<CFormItem key='logisticMode' label={commonLocale.inlogisticModeLocale}>
				{
					getFieldDecorator('logisticMode', {
						initialValue: entity.logisticMode,
						rules: [
							{ required: true, message: notNullLocale(commonLocale.inlogisticModeLocale) }
						],
					})
					(
						<Select disabled={!isCreateOrSaved} onChange={this.onModeChange} placeholder={placeholderChooseLocale(commonLocale.inlogisticModeLocale)}>
							{logisticModeOptions}
						</Select>
					)
				}
			</CFormItem>,
			wrhItem,
			<CFormItem key='expireDate' label={commonLocale.validDateLocale}>
				{
					getFieldDecorator('expireDate', {
						initialValue: entity.expireDate ? moment(entity.expireDate, 'YYYY-MM-DD') : undefined,
						rules: [
							{ required: true, message: notNullLocale(commonLocale.validDateLocale) }
						],
					})(
						<DatePicker disabled={!isCreateOrSaved} style={{ width: '100%' }} placeholder={placeholderChooseLocale(commonLocale.validDateLocale)} />
					)
				}
			</CFormItem>,
			<CFormItem key='alcDate' label={'配货日期'}>
				{
					getFieldDecorator('alcDate', {
						initialValue: entity.alcDate ? moment(entity.alcDate, 'YYYY-MM-DD') : undefined,
						rules: [
							{ required: true, message: notNullLocale('配货日期') }
						],
					})(
						<DatePicker disabled={!isCreateOrSaved} style={{ width: '100%' }} placeholder={placeholderChooseLocale('配货日期')} />
					)
				}
			</CFormItem>,
			<CFormItem key='sourceBillNumber' label={alcNtcLocale.sourceBillNumber}>
				{
					getFieldDecorator('sourceBillNumber', {
						initialValue: entity.sourceBillNumber,
						rules: [{
              max: 30, message: tooLongLocale(alcNtcLocale.sourceBillNumber, 30),
            }],
					})(
						<Input disabled={!isCreateOrSaved} placeholder={placeholderLocale(alcNtcLocale.sourceBillNumber)} />
					)
				}
			</CFormItem>,
			<CFormItem key='groupName' label={alcNtcLocale.groupName}>
			{
				getFieldDecorator('groupName', {
					initialValue: entity.groupName,
					rules: [{
		  max: 30, message: tooLongLocale(alcNtcLocale.groupName, 30),
		}],
				})(
					<Input disabled={!isCreateOrSaved} placeholder={placeholderLocale(alcNtcLocale.groupName)} />
				)
			}
		</CFormItem>
		];
		if (logisticMode != LogisticMode.UNIFY.name) {
			cols.splice(4, 0,
				<CFormItem label={alcNtcLocale.orderBillTitle} key='orderBillNumber'>
					{getFieldDecorator('orderBillNumber', {
						initialValue: entity.orderBillNumber,
						rules: [
							{ required: true, message: notNullLocale(alcNtcLocale.orderBillTitle) }
						],
					})(<OrderBillNumberSelect disabled={!isCreateOrSaved} onChange={this.onOrderChange}
						logisticMode={logisticMode}
						ownerUuid={orderOwnerUuid}
						states={['INITIAL', 'BOOKING', 'BOOKED', 'INPROGRESS', 'FINISHED']}
					/>)}
				</CFormItem>
			);
		}
		return [
			<FormPanel key='basicInfo' noteLabelSpan={4} title={commonLocale.basicInfoLocale} cols={cols} noteCol={this.drawNotePanel()} />
		];
	}

	getQpcStrs = (record) => {
		if (!record.article) {
			return [];
		}

		const { articles } = this.state;
		const article = articles[record.article.uuid];
		if (!article) {
			return [];
		}

		const qpcStrs = [];
		if (!article.qpcs) {
			return qpcStrs;
		}
		article.qpcs.forEach(function (e) {
			qpcStrs.push({
				qpcStr: e.qpcStr,
				munit: e.munit,
			});
		});
		return qpcStrs;
	}

	getQpcStrOptions = (record) => {
		const qpcStrs = this.getQpcStrs(record);

		const qpcStrOptions = [];
		qpcStrs.forEach(e => {
			qpcStrOptions.push(
				<Select.Option key={e.qpcStr} value={JSON.stringify(e)}>{e.qpcStr + "/" + e.munit}</Select.Option>
			);
		});
		return qpcStrOptions;
	}

	handleFieldChange(e, fieldName, line) {
		const { entity, articles } = this.state;
		const target = entity.items[line - 1];
		if (fieldName === 'article') {
			let article = JSON.parse(e);
			target.article = article;
			target.qpcStr = undefined;
			target.munit = undefined;
			if (this.getQpcStrs(target).length > 0) {
				target.qty = qtyStrToQty(target.qtyStr == undefined ? "0" : target.qtyStr.toString(), this.getQpcStrs(target)[0].qpcStr);
			}
			if (!articles[article.uuid]) {
				this.props.dispatch({
					type: 'article/get',
					payload: {
						uuid: article.uuid
					}
				})
			} else {
				target.price = articles[target.article.uuid].salePrice;
				target.spec = articles[target.article.uuid].spec;
			}
		} else if (fieldName === 'qpcStr') {
			if (e) {
				const qpcStrMunit = JSON.parse(e);
				target.qpcStr = qpcStrMunit.qpcStr;
				target.munit = qpcStrMunit.munit;
				if (target.qtyStr) {
					target.qty = qtyStrToQty(target.qtyStr == undefined ? "0" : target.qtyStr.toString(), qpcStrMunit.qpcStr);
				}
			}
		} else if (fieldName === 'qtyStr') {
			if (e) {
				target.qtyStr = e;
				target.qty = qtyStrToQty(e.toString(), target.qpcStr);
			}
		} else if (fieldName === 'price') {
			if (e >= 0) {
				target.price = e;
			}
		} else if (fieldName === 'productionBatch') {
			target.productionBatch = e;
		} else if (fieldName === 'targetProductDate') {
			target.targetProductDate = e;
		} else if (fieldName === 'targetValidDate') {
			target.targetValidDate = e;
		} else if (fieldName === 'note') {
			target.note = e;
		}

		this.setState({
			entity: { ...entity },
		})
	}

	drawTable = () => {
		const { entity, articles, articleOption } = this.state;
		let isCreateOrSaved = !entity.uuid || (entity.uuid && State[entity.state].name === State.SAVED.name);
		const columns = [
			{
				title: '包装规格/计量单位',
				dataIndex: 'qpcStr',
				key: 'qpcStr',
				width: itemColWidth.qpcStrEditColWidth,
				render: (text, record) => {
					let value;
					if (record.qpcStr) {
						value = record.qpcStr + "/" + record.munit;
					} else {
						if (this.getQpcStrs(record).length > 0) {
							record.qpcStr = this.getQpcStrs(record)[0].qpcStr;
							record.munit = this.getQpcStrs(record)[0].munit;
							value = JSON.stringify(this.getQpcStrs(record)[0]);
						}
					}
					return (
						<Select disabled={!isCreateOrSaved} value={value}
							placeholder={placeholderLocale(commonLocale.qpcStrLocale)}
							onChange={e => this.handleFieldChange(e, 'qpcStr', record.line)}>
							{this.getQpcStrOptions(record)}
						</Select>
					);
				},
			},
			{
				title: commonLocale.inQtyStrLocale,
				dataIndex: 'qtyStr',
				key: 'qtyStr',
				width: itemColWidth.qtyStrEditColWidth,
				render: (text, record) => {
					return (
						isCreateOrSaved?
						<QtyStrInput
							value={record.qtyStr}
							onChange={
								e => this.handleFieldChange(e, 'qtyStr', record.line)
							}
							placeholder={placeholderLocale(commonLocale.inQtyStrLocale)}
						/> :
						<span>{record.qtyStr ? record.qtyStr : 0}</span>
					);
				}
			},
			{
				title: commonLocale.inQtyLocale,
				key: 'qty',
				width: itemColWidth.qtyColWidth,
				render: (record) => {
					return <span>{record.qty ? record.qty : 0}</span>
				}
			},
			{
				title: commonLocale.inPriceLocale,
				dataIndex: 'price',
				key: 'price',
				width: itemColWidth.numberEditColWidth,
				render: (val, record) => {
					if (record.price==undefined && record.article && articles[record.article.uuid]) {
						record.price = articles[record.article.uuid].salePrice;
						record.spec = articles[record.article.uuid].spec;
					}
					return (
						<InputNumber disabled={!isCreateOrSaved}
							onChange={e => this.handleFieldChange(e, 'price', record.line)}
							value={record.price}
							style={{ width: '100%' }}
							placeholder={placeholderLocale('价格')}
							min={0}
							precision={4}
							max={MAX_DECIMAL_VALUE}
						/>
					)
				}
			},
			{
				title: '批号',
				key: 'productionBatch',
				width: itemColWidth.numberEditColWidth,
				render: (record) => {
					return(
						<Input
							value={record.productionBatch}
							onChange={
								e => this.handleFieldChange(e.target.value, 'productionBatch', record.line)
							}
							placeholder={placeholderLocale('批号')}/>
					)
				}
			},
			{
				title: '指定开始生产日期',
				key: 'targetProductDate',
				width: itemColWidth.dateEditColWidth,
				render: (value, record) => {
					return (
						<DatePicker allowClear={true}
                        value={record.targetProductDate? moment(record.targetProductDate) : null}
						onChange={(data) => this.handleFieldChange(data, 'targetProductDate', record.line)}/>
						);
				}
			},
			{
				title: '指定结束生产日期',
				key: 'targetValidDate',
				width: itemColWidth.dateEditColWidth,
				render: (value, record) => {
					return (
						<DatePicker allowClear={true}
                        value={record.targetValidDate? moment(record.targetValidDate) : null}
						onChange={(data) => this.handleFieldChange(data, 'targetValidDate', record.line)}/>
						);
				}
			},
			{
				title: commonLocale.noteLocale,
				dataIndex: 'note',
				key: 'note',
				width: itemColWidth.numberEditColWidth,
				render: (text, record) => {
					return (
						<Input
							maxLength={255}
							value={record.note}
							onChange={e => this.handleFieldChange(e.target.value, 'note', record.line)}
							placeholder={placeholderLocale(commonLocale.noteLocale)}
						/>
					);
				}
			}
		];
		if (entity.logisticMode === LogisticMode.UNIFY.name) {
			columns.unshift(
				{
					title: commonLocale.inArticleLocale,
					dataIndex: 'article',
					key: 'article',
					width: itemColWidth.articleEditColWidth,
					render: (text, record) => {
						return (
							<ArticleSelect disabled={!isCreateOrSaved}
								value={record.article ? convertCodeName(record.article) : undefined}
								ownerUuid={entity.owner ? entity.owner.uuid : '-'}
								placeholder={placeholderChooseLocale(commonLocale.articleLocale)}
								onChange={e => this.handleFieldChange(e, 'article', record.line)}
								showSearch={true}
								single onlyOnline/>
						);
					}
				},
			);
		} else {
			columns.unshift(
				{
					title: commonLocale.inArticleLocale,
					dataIndex: 'article',
					key: 'article',
					width: itemColWidth.articleEditColWidth,
					render: (text, record) => {
						return (
							<Select disabled={!isCreateOrSaved} placeholder={placeholderChooseLocale(commonLocale.articleLocale)} value={record.article ? convertCodeName(record.article) : undefined} onChange={e => this.handleFieldChange(e, 'article', record.line)}>{articleOption}</Select>
						);
					}
				},
			);
		}
		return (
			<ItemEditTable
				noAddandDelete={!isCreateOrSaved}
				notNote={true}
				title={commonLocale.inArticleLocale}
				columns={columns}
				data={this.state.entity.items}
				handleFieldChange={this.handleFieldChange}
				drawTotalInfo={this.drawTotalInfo}
			//scroll={{ x: 1000 }}
			/>
		)
	}

	drawTotalInfo = () => {
		let allQtyStr = '0';
		let allQty = 0;
		let allAmount = 0;
		this.state.entity.items && this.state.entity.items.map(item => {
			if (item.qty) {
				allQty = allQty + parseFloat(item.qty)
			}
			if (item.qtyStr) {
				allQtyStr = add(allQtyStr, item.qtyStr);
			}
			if (item.price) {
				allAmount = allAmount + item.price * item.qty;
			}
		})
		return (
			<span style={{ marginLeft: '10px' }}>
				{commonLocale.inAllQtyStrLocale}：{allQtyStr}  |
      {commonLocale.inAllQtyLocale}：{allQty}  |
      {commonLocale.inAllAmountLocale}：{isNaN(allAmount) ? 0 : allAmount}
			</span>
		);
	}
}
