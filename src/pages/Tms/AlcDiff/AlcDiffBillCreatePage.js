import moment from 'moment';
import { connect } from 'dva';
import { loginCompany, loginOrg, loginUser } from '@/utils/LoginContext';
import { Form, Select, Divider, Input, InputNumber, message, Col, DatePicker, Modal } from 'antd';
import { commonLocale, notNullLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { qtyStrToQty, add, toQtyStr } from '@/utils/QpcStrUtil';
import { convertCodeName, convertArticleDocField } from '@/utils/utils';
import { containerState } from '@/utils/ContainerState';
import { formatDate } from '@/utils/utils';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import UserSelect from '@/pages/Component/Select/UserSelect';
import CreatePage from '@/pages/Component/Page/CreatePage';
import FormPanel from '@/pages/Component/Form/FormPanel';
import CFormItem from '@/pages/Component/Form/CFormItem';
import ItemEditTable from './ItemEditTable';
import QtyStrInput from '@/pages/Component/Form/QtyStrInput';
import style from './ItemEditTable.less';
import ContainerSelect from '@/pages/Component/Select/ContainerSelect';
import BinSelect from '@/pages/Component/Select/BinSelect';
import { alcDiffLocal } from './AlcDiffBillLocale';
import { Type, State, AlcType, AlcClassify } from './AlcDiffBillContants';
import Empty from '@/pages/Component/Form/Empty';
import StoreHandoverBillSelect from './StoreHandoverBillSelect';
import ArticleSelect from '@/pages/Component/Select/ArticleSelect';
import { binUsage } from '@/utils/BinUsage';
import { binState } from '@/utils/BinState';
import MoveToContainerSelect from '@/pages/Inner/MoveBill/MoveToContainerSelect';
import StockArticleSelect from './StockArticleSelect';
import { sourceWay } from '@/utils/SourceWay';
import { runInContext } from 'vm';
import { stockState } from '@/utils/StockState';
import { billType, qpcStrFrom } from '@/pages/Facility/Config/BillQpcStr/BillQpcStrConfigContans';
import ImportFromAlcNtcModal from './ImportFromAlcNtcModal';
import WrhSelect from '@/pages/Component/Select/WrhSelect';

const typeOptions = [];
Object.keys(Type).forEach(function (key) {
	typeOptions.push(<Option value={Type[key].name}
		key={Type[key].name}>
		{Type[key].caption}
	</Option>);
});

const alctypeOptions = [];
Object.keys(AlcType).forEach(function (key) {
	alctypeOptions.push(<Option value={AlcType[key].name}
		key={AlcType[key].name}>
		{AlcType[key].caption}
	</Option>);
});

const classifyOptions = [];
Object.keys(AlcClassify).forEach(function (key) {
	classifyOptions.push(<Option value={AlcClassify[key].name}
		key={AlcClassify[key].name}>
		{AlcClassify[key].caption}
	</Option>);
});
@connect(({ alcDiff, storeHandover, stock, article, pickSchema, billQpcStrConfig, loading }) => ({
	alcDiff, storeHandover, stock, article, pickSchema, billQpcStrConfig,
	loading: loading.models.alcDiff,
}))
@Form.create()
export default class AlcDiffBillCreatePage extends CreatePage {
	constructor(props) {
		super(props);
		this.state = {
			title: commonLocale.createLocale + alcDiffLocal.title,
			entityUuid: props.entityUuid,
			entity: {
				differ: {
					uuid: loginUser().uuid,
					code: loginUser().code,
					name: loginUser().name
				},
				items: []
			},
			differ: {
				uuid: loginUser().uuid,
				code: loginUser().code,
				name: loginUser().name
			},
			storeHandoverBill: {
				items: []
			},
			stocks: [],
			bins: [],
			wrhs: [],
			wrhOptions: [],
			articles: [],
			pickSchemas: [],
			storeHandoverBillEnabled: true,
			batchAddVisible: false,
			disableWhenImport: true,
			alcDiffItemList: [],
			alcNtcBill: {},
		}
	}

	componentDidMount() {
		this.getHandoverBill('');
		this.queryBillQpcStrConfig()
		this.refresh();
	}

	componentWillReceiveProps(nextProps) {

		const { stocks, bins, articles, pickSchemas } = this.state;
		const that = this;
		if (nextProps.alcDiff.entity && this.state.entityUuid && nextProps.alcDiff.entity.uuid === this.state.entityUuid
			&& !nextProps.storeHandover.entity.uuid) {
			this.setState({
				entity: nextProps.alcDiff.entity,
				title: alcDiffLocal.title + "：" + nextProps.alcDiff.entity.billNumber,
			});

			// this.getHandoverBill(nextProps.alcDiff.entity.storeHandoverBillNumber);
			// if (nextProps.alcDiff.entity && nextProps.alcDiff.entity.items
			// 	&& this.props.alcDiff.entityUuid && !this.state.entity.uuid) {
			// 	var lessArticleUuids = [];
			// 	var moreArticleUuids = [];
			// 	var schemaArticleUuids = [];
			// 	nextProps.alcDiff.entity.items.forEach(function (e) {
			// 		if (nextProps.alcDiff.entity.wrh && nextProps.alcDiff.entity.owner) {
			// 			if (nextProps.alcDiff.entity.wrh && nextProps.alcDiff.entity.owner) {
			// 				if (Type.MOREALC.name === e.type) {
			// 					moreArticleUuids.push(e.article.articleUuid);
			// 					// that.queryStock(e.article.articleUuid, nextProps.alcDiff.entity.owner.uuid, nextProps.alcDiff.entity.wrh.uuid);
			// 				} else {
			// 					lessArticleUuids.push(e.article.articleUuid);
			// 					// that.queryArticle(e.article.articleUuid)
			// 					if (!e.binCode)
			// 						schemaArticleUuids.push(e.article.articleUuid);
			// 					// that.queryPickSchema(e.article.articleUuid);
			// 				}
			// 			}
			// 		}
			// 	});
				// if (moreArticleUuids || moreArticleUuids.length != 0)
				//     that.queryStocks(moreArticleUuids, nextProps.alcDiff.entity.owner.uuid, nextProps.alcDiff.entity.wrh.uuid);
				// if (lessArticleUuids || lessArticleUuids.length != 0)
				//     that.queryArticles(lessArticleUuids);
				// if (schemaArticleUuids || schemaArticleUuids.length != 0)
				//     that.queryPickSchemas(schemaArticleUuids);
			// }
		}

		if (nextProps.alcDiff.entity && nextProps.alcDiff.entity.uuid
			&& this.state.entity != nextProps.alcDiff.entity
			&& !this.state.disableWhenImport
			&& !nextProps.alcDiff.entity.storeHandoverBillNumber) {
			this.setState({
				disableWhenImport: true,
				alcNtcBill: nextProps.alcDiff.entity,
				entity: nextProps.alcDiff.entity,
				title: alcDiffLocal.title + "：" + nextProps.alcDiff.entity.billNumber,
			});
		}

		if (nextProps.storeHandover.entity.uuid && nextProps.storeHandover.entity) {
			let handoverBill = nextProps.storeHandover.entity;
			const wrhs = this.getWrhs(handoverBill);
			let wrhOptions = [];
			Array.isArray(wrhs) && wrhs.forEach(function (e) {
				wrhOptions.push(
					<Select.Option key={JSON.stringify(e)} value={JSON.stringify(e)}>
						{convertCodeName(e)}</Select.Option>
				);
			});

			this.setState({
				storeHandoverBill: nextProps.storeHandover.entity,
				wrhOptions: wrhOptions
			})
		}

		let handoverBill = nextProps.storeHandover.entity;
		if (handoverBill && handoverBill.billNumber
			&& this.state.entity.storeHandoverBillNumber !== handoverBill.billNumber) {
			let entity = this.state.entity;
			entity.storeHandoverBillNumber = handoverBill.billNumber;
			entity.store = handoverBill.store;
			entity.shipBillNumber = handoverBill.shipBillNumber;
			entity.vehicle = handoverBill.vehicle;
			if (handoverBill.articleItems && handoverBill.articleItems.length > 0) {
				entity.owner = handoverBill.articleItems[0].owner;
			}

			this.setState({
				entity: { ...entity },
				storeHandoverBill: handoverBill
			})
		}


		if (nextProps.stock.stocks) {
			nextProps.stock.stocks.forEach(function (stock) {

				var exist = stocks.some(function (e) {
					return e.uuid === stock.uuid;
				})
				if (!exist && stockState.NORMAL.name === stockState[stock.state].name)
					stocks.push(stock);
			});
			this.setState({
				stocks: stocks
			});
		}

		if (nextProps.article.entity && nextProps.article.entity.uuid
			&& !articles[nextProps.article.entity.uuid]) {
			articles[nextProps.article.entity.uuid] = nextProps.article.entity;
			this.setState({
				articles: articles
			});
		}


		if (nextProps.pickSchema.entity && nextProps.pickSchema.entity.uuid
			&& !pickSchemas[nextProps.pickSchema.entity.uuid]) {
			pickSchemas[nextProps.pickSchema.entity.article.uuid] = nextProps.pickSchema.entity;
			this.setState({
				pickSchemas: pickSchemas
			});
		}

		if (nextProps.billQpcStrConfig.entity && nextProps.billQpcStrConfig.entity.uuid) {
			this.setState({
				billConfig: nextProps.billQpcStrConfig.entity
			});
		}
	}

	queryBillQpcStrConfig = () => {
		this.props.dispatch({
			type: 'billQpcStrConfig/getByBillType',
			payload: {
				dcUuid: loginOrg().uuid,
				billType: billType.ALCDIFFBILL.name
			}
		});
	}

	queryPickSchema = (value) => {
		this.props.dispatch({
			type: 'pickSchema/getByDcUuidAndArticleUuid',
			payload: {
				dcUuid: loginOrg().uuid,
				articleUuid: value
			}
		});
	}

	queryArticle = (articleUuid) => {
		this.props.dispatch({
			type: 'article/get',
			payload: {
				uuid: articleUuid
			}
		});
	}

	queryStock = (articleUuid, ownerUuid, wrhUuid) => {
		if (!articleUuid)
			return;

		this.props.dispatch({
			type: 'stock/query',
			payload: {
				companyUuid: loginCompany().uuid,
				dcUuid: loginOrg().uuid,
				articleUuid: articleUuid,
				ownerUuid: ownerUuid,
				wrhUuid: wrhUuid,
				state: stockState.NORMAL.name,
				binUsages: [binUsage.PickUpBin.name, binUsage.PickUpStorageBin.name, binUsage.StorageBin.name, binUsage.Virtuality.name]
			},
      callback: (response) => {
        if ( response && response.success && response.data ) {
         this.setState({
           dataItemsList: response.data
         })
        }
      }
		});
	}

	onCancel = () => {
		this.props.form.resetFields();
		if (!this.props.alcDiff.entityUuid) {
			this.props.dispatch({
				type: 'alcDiff/showPage',
				payload: {
					showPage: 'query'
				}
			});
		} else {
			this.props.dispatch({
				type: 'alcDiff/showPage',
				payload: {
					showPage: 'view',
					entityUuid: this.props.alcDiff.entityUuid
				}
			});
		}
		this.getHandoverBill('');
	}

	onSave = (data) => {
            const { disableWhenImport, entity, alcNtcBill, dataItems, dataItemsList } = this.state;
		let bill = {
			...entity,
		};

		if (!bill.uuid && disableWhenImport) {
			bill.store = alcNtcBill.store;
			bill.owner = alcNtcBill.owner;
			bill.wrh = alcNtcBill.wrh;
			bill.alcNtcBillNumber = alcNtcBill.billNumber;
		}

		if (!bill) {
			return;
		}
    for (let i = bill.items.length - 1; i >= 0; i--) {
      if (!bill.uuid && disableWhenImport) {
        bill.items[i].productionDate = entity.items[i].productDate;
        bill.items[i].arrivalDate = entity.items[i].validDate;
        bill.items[i].stockBatch = entity.items[i].stockBatch;
      } else if (!bill.uuid) {
        if (bill.items[i].type === 'LESSALC' || bill.items[i].type === 'GOOD_RETURN_WAREHOUSE_LOSS'&& dataItems && dataItems.length>0 && dataItems[i].productionDate) {
          bill.items[i].productionDate = dataItems[i].productionDate;
          bill.items[i].arrivalDate = dataItems[i].validDate;
          bill.items[i].stockBatch = dataItems[i].stockBatch;
        } else if (bill.items[i].type === 'MOREALC' && dataItemsList && dataItemsList.length > 0) {
          for (let j = 0; j < dataItemsList.length; j++) {
            if (bill.items[i].article.articleUuid === dataItemsList[j].article.articleUuid && bill.items[i].qpcStr === dataItemsList[j].qpcStr) {
              bill.items[i].productionDate = dataItemsList[j].productionDate;
              bill.items[i].arrivalDate = dataItemsList[j].validDate;
              bill.items[i].stockBatch = dataItemsList[j].stockBatch;
            }
          }
        }
        bill.items[i].price = bill.items[i].price? bill.items[i].price : bill.items[i].article.price;
      }
    }
		bill.companyUuid = loginCompany().uuid;
		bill.dcUuid = loginOrg().uuid;
		bill.differ = JSON.parse(data.differ);
		bill.diffType = disableWhenImport ? '手工差错' : AlcType[data.diffType].name;
		bill.alcDiffDutyType = data.alcDiffDutyType;
		bill.sourceWay = sourceWay.CREATE.name;
		bill.note = data.note;

		if (this.validate(bill) === false)
			return;

		if (!bill.uuid) {
			this.props.dispatch({
				type: 'alcDiff/onSave',
				payload: bill,
				callback: (response) => {
					if (response && response.success) {
						this.props.form.resetFields();
						this.getHandoverBill('');
						message.success(commonLocale.saveSuccessLocale);
					}
				}
			});
		} else {
			this.props.dispatch({
				type: 'alcDiff/modify',
				payload: bill,
				callback: (response) => {
					if (response && response.success) {
						this.props.form.resetFields();
						this.getHandoverBill('');
						message.success(commonLocale.modifySuccessLocale);
					}
				}
			});
		}
	}

	onSaveAndCreate = (data) => {
		const { disableWhenImport, entity, alcNtcBill, dataItems, dataItemsList } = this.state;
		let bill = {
			...entity,
		};
		if (!bill.uuid && disableWhenImport) {
			bill.store = alcNtcBill.store;
			bill.owner = alcNtcBill.owner;
			bill.wrh = alcNtcBill.wrh;
			bill.alcNtcBillNumber = alcNtcBill.billNumber;
		}

		if (!bill) {
			return;
		}
    for (let i = bill.items.length - 1; i >= 0; i--) {
      if (!bill.uuid && disableWhenImport) {
        bill.items[i].productionDate = entity.items[i].productDate;
        bill.items[i].arrivalDate = entity.items[i].validDate;
        bill.items[i].stockBatch = entity.items[i].stockBatch;
      } else if (!bill.uuid)  {
        if (bill.items[i].type === 'LESSALC' || bill.items[i].type === 'GOOD_RETURN_WAREHOUSE_LOSS' && dataItems && dataItems.length>0 && dataItems[i].productionDate) {
          bill.items[i].productionDate = dataItems[i].productionDate;
          bill.items[i].arrivalDate = dataItems[i].validDate;
          bill.items[i].stockBatch = dataItems[i].stockBatch;
        } else if (bill.items[i].type === 'MOREALC' && dataItemsList && dataItemsList.length > 0) {
          for (let j = 0; j < dataItemsList.length; j++) {
            if (bill.items[i].article.articleUuid === dataItemsList[j].article.articleUuid && bill.items[i].qpcStr === dataItemsList[j].qpcStr) {
              bill.items[i].productionDate = dataItemsList[j].productionDate;
              bill.items[i].arrivalDate = dataItemsList[j].validDate;
              bill.items[i].stockBatch = dataItemsList[j].stockBatch;
            }
          }
        }
      }
    }
		bill.companyUuid = loginCompany().uuid;
		bill.dcUuid = loginOrg().uuid;
		bill.differ = JSON.parse(data.differ);
		bill.diffType = disableWhenImport ? '手工差错' : AlcType[data.diffType].name;
		bill.alcDiffDutyType = data.alcDiffDutyType;
		bill.sourceWay = sourceWay.CREATE.name;
		bill.note = data.note;

		if (this.validate(bill) === false)
			return;

		this.getHandoverBill('');
		this.props.dispatch({
			type: 'alcDiff/onSaveAndCreate',
			payload: bill,
			callback: (response) => {
				if (response && response.success) {
					this.setState({
						entity: {
							companyUuid: loginCompany().uuid,
							dcUuid: loginOrg().uuid,
							differ: {
								uuid: loginUser().uuid,
								code: loginUser().code,
								name: loginUser().name
							},
							items: []
						},
					}, () => { });
					this.props.form.resetFields();
					message.success(commonLocale.saveSuccessLocale);
				}
			}
		});
	}

	validate = (entity) => {
		const { disableWhenImport } = this.state;
		if (entity.items.length === 0) {
			message.error('差异明细不能为空');
			return false;
		}
		for (let i = entity.items.length - 1; i >= 0; i--) {
			if (!entity.items[i].type) {
				message.error(`第${entity.items[i].line}行差异类型不能为空！`);
				return false;
			}
			if (!entity.items[i].article) {
				message.error(`第${entity.items[i].line}行商品不能为空！`);
				return false;
			}

			if (entity.items[i].qty === 0)
				continue;

			if (entity.items[i].article && !entity.items[i].binCode) {
				message.error(`第${entity.items[i].line}行货位不能为空！`);
				return false;
			}
			if (entity.items[i].article && !entity.items[i].containerBarcode) {
				message.error(`第${entity.items[i].line}行容器条码不能为空！`);
				return false;
			}
			if (entity.items[i].article && !entity.items[i].vendor) {
				message.error(`第${entity.items[i].line}行供应商不能为空！`);
				return false;
			}
			if (entity.items[i].article && !entity.items[i].productionBatch) {
				message.error(`第${entity.items[i].line}行批次不能为空！`);
				return false;
			}
			if (!disableWhenImport) {
				if (entity.items[i].binUsage && binUsage[entity.items[i].binUsage].name !== binUsage.PickUpStorageBin.name
					&& binUsage[entity.items[i].binUsage].name !== binUsage.PickUpBin.name) {
					if ('-' === entity.items[i].containerBarcode) {
						message.error(`第${entity.items[i].line}行货位不是拣货位或拣货存储位，容器不能为虚拟容器！`);
						return false;
					}
				}
			}
		}

		for (let i = 0; i < entity.items.length; i++) {
			for (let j = i + 1; j < entity.items.length; j++) {
				if ('-' !== entity.items[i].containerBarcode &&
					entity.items[i].containerBarcode === entity.items[j].containerBarcode &&
					entity.items[i].binCode !== entity.items[j].binCode) {
					message.error(`第${entity.items[i].line}行与第${entity.items[j].line}行容器相同,货位不同！`);
					return false;
				}
			}
		}

		return true;
	}

	refresh = () => {
		this.props.dispatch({
			type: 'alcDiff/get',
			payload: this.props.alcDiff.entityUuid
		});
	}

	getHandoverBill = (value) => {
		this.props.dispatch({
			type: 'storeHandover/getByBillNumber',
			payload: {
				billNumber: value,
				companyUuid: loginCompany().uuid
			},
      callback: (response) => {
        if (response && response.success && response.data && response.data.articleItems) {
          this.setState({
            dataItems: response.data.articleItems
          })
        }
      }
		});
	}

	onChangeHandoverBill = (value) => {
		const { entity } = this.state;
		let originalHandoverBill = this.props.form.getFieldValue('storeHandoverBillNumber');
		if (!originalHandoverBill || entity.items.length === 0) {
			this.getHandoverBill(value);
			return;
		}

		if (originalHandoverBill != value) {
			Modal.confirm({
				title: '修改交接单会清除明细信息，是否确认修改？',
				okText: '确认',
				cancelText: '取消',
				onOk: () => {
					entity.items = [];
					entity.wrh = undefined;
					this.setState({
						entity: { ...entity }
					});
					this.getHandoverBill(value);
				},
				onCancel: () => {
					this.props.form.setFieldsValue({
						storeHandoverBill: originalHandoverBill
					});
				}
			});
		}
	}

	onChangeWrh = (value) => {
		const { entity } = this.state;
		if (!value) {
			return;
		}

    entity.wrh = JSON.parse(value);
    this.setState({
      entity: { ...entity },
    })
	}

	getWrhs = (storeHandoverBill) => {
		const { entity } = this.state;
		let wrhs = [];
		if (!storeHandoverBill
			|| !storeHandoverBill.articleItems
			|| storeHandoverBill.articleItems.length <= 0) {
			return wrhs;
		}

		let wrhUuids = [];
		storeHandoverBill.articleItems && storeHandoverBill.articleItems.forEach(function (e) {
			if (e.wrh && wrhUuids.indexOf(e.wrh.uuid) === -1) {
				wrhs.push(e.wrh);

				wrhUuids.push(e.wrh.uuid);
			}
		});

		if (wrhs.length === 1) {
			entity.wrh = {
				uuid: wrhs[0].uuid,
				code: wrhs[0].code,
				name: wrhs[0].name,
			};
		}
		return wrhs;
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
		var newalcDiffItemList = [];
		let line = 0;

		for (let i = 0; i < value.length; i++) {
			newalcDiffItemList.push(value[i]);
		}

		//重排行号并给初始值
		for (let j = 0; j < newalcDiffItemList.length; j++) {
			line = line + 1;
			newalcDiffItemList[j].line = line;
			newalcDiffItemList[j].type = Type.LESSALC.name;
			newalcDiffItemList[j].containerBarcode = '-';
		}

		this.setState({
			disableWhenImport: true,
			alcDiffItemList: newalcDiffItemList,
			entity: { items: newalcDiffItemList },
		});

		this.handlebatchAddVisible();
	}

	/**
	 * 取汇总信息
	 */
	getImportedHeadDate = (value) => {
		this.setState({
			alcNtcBill: value,
			disableWhenImport: true,
		});
	}

	drawFormItems = () => {
		const { getFieldDecorator } = this.props.form;
		const { entity, differ, wrhOptions, disableWhenImport, alcNtcBill } = this.state;
		let cols = [];
		if (entity.uuid){  //编辑时显示
			cols = [
				<CFormItem label={'配货通知单'} key='alcntcBillNumber' >
					{getFieldDecorator('alcntcBillNumber')
						(<Col>{entity.billNumber? entity.billNumber : <Empty />}</Col>)}
				</CFormItem>,
				<CFormItem label={commonLocale.inOwnerLocale} key='owner'>
					{getFieldDecorator('owner')
						(<Col>{entity.owner ?
							convertCodeName(entity.owner) : <Empty />}</Col>)}
				</CFormItem>,
				<CFormItem label={commonLocale.inStoreLocale} key='store'>
					{getFieldDecorator('store')
						(<Col>{entity.store ?
							convertCodeName(entity.store) : <Empty />}</Col>)}
				</CFormItem>,
				<CFormItem label={commonLocale.inWrhLocale} key='wrh'>
				{getFieldDecorator('wrh', {
					initialValue: entity.wrh ? JSON.stringify(entity.wrh) : undefined,
					rules: [
						{
							required: true,
							message: notNullLocale(commonLocale.inWrhLocale)
						}],
					})(<WrhSelect onChange={this.onChangeWrh}
						placeholder={placeholderChooseLocale(commonLocale.inWrhLocale)}/>
					)}
				</CFormItem>,
				<CFormItem label={alcDiffLocal.differ} key='differ'>
					{getFieldDecorator('differ', {
						initialValue: JSON.stringify(differ),
						rules: [
							{
								required: true,
								message: notNullLocale(alcDiffLocal.differ)
							}
						],
					})(<UserSelect value={JSON.stringify(differ)} single={true} />)}
				</CFormItem>,
				<CFormItem label={alcDiffLocal.alcDiffDutyType} key='alcDiffDutyType'>
				{getFieldDecorator('alcDiffDutyType', {
					initialValue: AlcClassify.WAREHOUSE_DIFF.name,
					rules: [
						{
							required: true,
							message: notNullLocale(alcDiffLocal.alcDiffDutyType)
						}
					],
				})(<Select placeholder={placeholderChooseLocale(alcDiffLocal.alcDiffDutyType)}>
					{classifyOptions}</Select>)}
			</CFormItem>,
			];
		} else if (disableWhenImport) {  //导入时显示
			cols = [
				<CFormItem label={'配货通知单'} key='alcntcBillNumber' >
					{getFieldDecorator('alcntcBillNumber')
						(<Col>{alcNtcBill.billNumber? alcNtcBill.billNumber : <Empty />}</Col>)}
				</CFormItem>,
				<CFormItem label={commonLocale.inOwnerLocale} key='owner'>
					{getFieldDecorator('owner')
						(<Col>{alcNtcBill.owner ?
							convertCodeName(alcNtcBill.owner) : <Empty />}</Col>)}
				</CFormItem>,
				<CFormItem label={commonLocale.inStoreLocale} key='store'>
					{getFieldDecorator('store')
						(<Col>{alcNtcBill.store ?
							convertCodeName(alcNtcBill.store) : <Empty />}</Col>)}
				</CFormItem>,
				<CFormItem label={commonLocale.inWrhLocale} key='wrh'>
				{getFieldDecorator('wrh', {
					initialValue: alcNtcBill.wrh ? JSON.stringify(alcNtcBill.wrh) : undefined,
					rules: [
						{
							required: true,
							message: notNullLocale(commonLocale.inWrhLocale)
						}],
					})(<WrhSelect onChange={this.onChangeWrh}
						placeholder={placeholderChooseLocale(commonLocale.inWrhLocale)}/>
					)}
				</CFormItem>,
				<CFormItem label={alcDiffLocal.differ} key='differ'>
					{getFieldDecorator('differ', {
						initialValue: JSON.stringify(differ),
						rules: [
							{
								required: true,
								message: notNullLocale(alcDiffLocal.differ)
							}
						],
					})(<UserSelect value={JSON.stringify(differ)} single={true} />)}
				</CFormItem>,
				<CFormItem label={alcDiffLocal.alcDiffDutyType} key='alcDiffDutyType'>
				{getFieldDecorator('alcDiffDutyType', {
					initialValue: AlcClassify.WAREHOUSE_DIFF.name,
					rules: [
						{
							required: true,
							message: notNullLocale(alcDiffLocal.alcDiffDutyType)
						}
					],
				})(<Select placeholder={placeholderChooseLocale(alcDiffLocal.alcDiffDutyType)}>
					{classifyOptions}</Select>)}
			</CFormItem>,
			];
		} else {  //新建时显示
			cols = [
				<CFormItem label={alcDiffLocal.handoverBillNumber}
					key='storeHandoverBillNumber'>
					{getFieldDecorator('storeHandoverBillNumber', {
						initialValue: entity.storeHandoverBillNumber,
						rules: [
							{
								required: true,
								message: notNullLocale(alcDiffLocal.handoverBillNumber)
							}
						],
					})(<StoreHandoverBillSelect onChange={this.onChangeHandoverBill} />)}
				</CFormItem>,
				<CFormItem label={commonLocale.inOwnerLocale} key='owner'>
					{getFieldDecorator('owner')
						(<Col>{this.state.entity.owner ?
							convertCodeName(this.state.entity.owner) : <Empty />}</Col>)}
				</CFormItem>,
				<CFormItem label={commonLocale.inStoreLocale} key='store'>
					{getFieldDecorator('store')
						(<Col>{this.state.entity.store ?
							convertCodeName(this.state.entity.store) : <Empty />}</Col>)}
				</CFormItem>,
				<CFormItem label={commonLocale.inWrhLocale} key='wrh'>
				{getFieldDecorator('wrh', {
					initialValue: entity.wrh ? JSON.stringify(entity.wrh) : undefined,
					rules: [
						{
							required: true,
							message: notNullLocale(commonLocale.inWrhLocale)
						}],
					})(<WrhSelect onChange={this.onChangeWrh}
						placeholder={placeholderChooseLocale(commonLocale.inWrhLocale)}/>
					)}
				</CFormItem>,
				<CFormItem label={alcDiffLocal.differ} key='differ'>
					{getFieldDecorator('differ', {
						initialValue: JSON.stringify(entity.differ),
						rules: [
							{
								required: true,
								message: notNullLocale(alcDiffLocal.differ)
							}
						],
					})(<UserSelect autoFocus single={true} />)}
				</CFormItem>,
				<CFormItem label={alcDiffLocal.alctype} key='diffType'>
					{getFieldDecorator('diffType', {
						initialValue: entity.diffType ? AlcType[entity.diffType].name : undefined,
						rules: [
							{
								required: true,
								message: notNullLocale(alcDiffLocal.alctype)
							}
						],
					})(<Select placeholder={placeholderChooseLocale(alcDiffLocal.alctype)}>
						{alctypeOptions}</Select>)}
				</CFormItem>,
				<CFormItem label={alcDiffLocal.alcDiffDutyType} key='alcDiffDutyType'>
					{getFieldDecorator('alcDiffDutyType', {
						initialValue: entity.alcDiffDutyType ? AlcClassify[entity.alcDiffDutyType].name : undefined,
						rules: [
							{
								required: true,
								message: notNullLocale(alcDiffLocal.alcDiffDutyType)
							}
						],
					})(<Select placeholder={placeholderChooseLocale(alcDiffLocal.alcDiffDutyType)}>
						{classifyOptions}</Select>)}
				</CFormItem>,
			];
		}
		return [<FormPanel key='basicInfo' noteLabelSpan={4}
			title={commonLocale.basicInfoLocale}
			cols={cols} noteCol={this.drawNotePanel()}
    />
		];
	}

	getArticles = (line) => {
		const { storeHandoverBill, entity, items, disableWhenImport } = this.state;
		let articles = [];
		if (!entity.items[line - 1]) {
			return articles;
		}
		let articleUuids = [];
		//从配单导入
		if (disableWhenImport === true) {
			items && items.forEach(function (e) {
				articles.push({
					articleUuid: e.article.articleUuid,
					articleCode: e.article.articleCode,
					articleName: e.article.articleName,
					articleSpec: e.article.articleSpec,
					munit: e.article.munit,
          price: e.price,
				});
			})
		} else {
			storeHandoverBill.articleItems && storeHandoverBill.articleItems.forEach(function (e) {
				if (entity.wrh && e.wrh.uuid === entity.wrh.uuid &&
					articleUuids.indexOf(e.article.articleUuid) === -1) {
					articles.push({
						articleUuid: e.article.articleUuid,
						articleCode: e.article.articleCode,
						articleName: e.article.articleName,
						articleSpec: e.article.articleSpec,
						munit: e.article.munit,
            price: e.price,
					});
					articleUuids.push(e.article.articleUuid);
				}
			});
		}

		return articles;
	}

	getArticleOptions = (line) => {
		let articleOptions = [];
		this.getArticles(line).forEach(function (e) {
			articleOptions.push(
				<Select.Option key={JSON.stringify(e)} value={JSON.stringify(e)}>
					{'[' + e.articleCode + ']' + e.articleName}</Select.Option>
			);
		});
		return articleOptions;
	}

	getQpcStrs = (line) => {
		const { articles, entity, stocks } = this.state;
		let qpcStrs = [];
		if (!entity.items[line - 1] || !entity.items[line - 1].article) {
			return qpcStrs;
		}

		if (entity.items[line - 1].type && Type.LESSALC.name === entity.items[line - 1].type || Type.GOOD_RETURN_WAREHOUSE_LOSS.name === entity.items[line - 1].type) {
			if (!articles)
				return qpcStrs;
			const article = articles[entity.items[line - 1].article.articleUuid];
			if (!article || !article.qpcs) {
				return qpcStrs;
			}
			let qpcInfo = article.qpcs.find(function (qpc) {
				return qpc.defaultQpcStr == true;
			});
			if (!qpcInfo) {
				qpcInfo = article.qpcs[0];
			}
			if (!entity.items[line - 1].qpcStr) {
				entity.items[line - 1].qpcStr = qpcInfo.qpcStr;
				entity.items[line - 1].qpc = qpcInfo.paq;
			}
			article.qpcs.forEach(function (e) {
				qpcStrs.push(JSON.stringify({
					qpcStr: e.qpcStr,
					munit: e.munit ? e.munit : '-',
					qpc: e.paq
				}));
			});
		} else {
			stocks.forEach(function (e) {
				if (e.article
					&& e.article.articleUuid === entity.items[line - 1].article.articleUuid) {
					if (e.qpcStr && qpcStrs.indexOf(JSON.stringify({
						qpcStr: e.qpcStr,
						munit: e.article.munit,
						qpc: e.qpc
					})) === -1) {
						qpcStrs.push(JSON.stringify({
							qpcStr: e.qpcStr,
							munit: e.article.munit,
							qpc: e.qpc
						}));
					}
				}
			});
			if (qpcStrs.length === 1) {
				entity.items[line - 1].qpcStr = JSON.parse(qpcStrs[0]).qpcStr;
				entity.items[line - 1].qpc = JSON.parse(qpcStrs[0]).qpc;
			}
		}

		return qpcStrs;
	}

	getQpcStrOptions = (line) => {
		let qpcStrOptions = [];
		this.getQpcStrs(line).forEach(function (e) {
			qpcStrOptions.push(
				<Select.Option key={e} value={e}>
					{JSON.parse(e).qpcStr + '/' + JSON.parse(e).munit}
				</Select.Option>
			);
		});
		return qpcStrOptions;
	}

	getVendors = (line) => {
		const { storeHandoverBill, entity, stocks } = this.state;
		let vendors = [];
		if (!entity.items[line - 1] || !entity.items[line - 1].article
			|| !entity.items[line - 1].qpcStr) {
			return vendors;
		}

		let vendorUuids = [];
		if (entity.items[line - 1].type && Type.LESSALC.name === entity.items[line - 1].type || Type.GOOD_RETURN_WAREHOUSE_LOSS.name === entity.items[line - 1].type) {
			storeHandoverBill.articleItems && storeHandoverBill.articleItems.forEach(function (e) {
				if (entity.wrh && e.wrh.uuid === entity.wrh.uuid &&
					e.article.articleUuid === entity.items[line - 1].article.articleUuid &&
					e.vendor && vendorUuids.indexOf(e.vendor.uuid) === -1) {
					vendors.push(e.vendor);
					vendorUuids.push(e.vendor.uuid);
				}
			});
		} else {
			stocks.forEach(function (e) {
				if (e.article.articleUuid === entity.items[line - 1].article.articleUuid &&
					e.qpcStr === entity.items[line - 1].qpcStr &&
					e.vendor && vendorUuids.indexOf(e.vendor.uuid) === -1) {
					vendors.push(e.vendor);
					vendorUuids.push(e.vendor.uuid);
				}
			});
		}

		if (vendors.length === 1) {
			entity.items[line - 1].vendor = vendors[0];
		}
		return vendors;
	}

	getVendorOptions = (line) => {
		let vendorOptions = [];
		this.getVendors(line).forEach(function (e) {
			vendorOptions.push(
				<Select.Option key={JSON.stringify(e)} value={JSON.stringify(e)}>
					{convertCodeName(e)}</Select.Option>
			);
		});
		return vendorOptions;
	}

	getProductionBatchs = (line) => {
		const { storeHandoverBill, entity, stocks } = this.state;
		let productionBatchs = [];
		if (!entity.items[line - 1] || !entity.items[line - 1].article
			|| !entity.items[line - 1].qpcStr
			|| !entity.items[line - 1].vendor) {
			return productionBatchs;
		}

		if (entity.items[line - 1].type && Type.LESSALC.name === entity.items[line - 1].type || Type.GOOD_RETURN_WAREHOUSE_LOSS.name === entity.items[line - 1].type) {
			storeHandoverBill.articleItems && storeHandoverBill.articleItems.forEach(function (e) {
				if (e.article.articleUuid === entity.items[line - 1].article.articleUuid &&
					e.vendor.uuid === entity.items[line - 1].vendor.uuid &&
					e.productionBatch && productionBatchs.indexOf(e.productionBatch) === -1) {
					productionBatchs.push(e.productionBatch);
				}
			});
		} else {
			stocks.forEach(function (e) {
				if (e.article.articleUuid === entity.items[line - 1].article.articleUuid &&
					e.qpcStr === entity.items[line - 1].qpcStr &&
					e.vendor.uuid === entity.items[line - 1].vendor.uuid &&
					e.productionBatch && productionBatchs.indexOf(e.productionBatch) === -1) {
					productionBatchs.push(e.productionBatch);
				}
			});
		}

		if (productionBatchs.length === 1) {
			entity.items[line - 1].productionBatch = productionBatchs[0];
		}
		return productionBatchs;
	}

	getProductionBatchOptions = (line) => {
		let productionBatchOptions = [];
		this.getProductionBatchs(line).forEach(function (e) {
			productionBatchOptions.push(
				<Select.Option key={e} value={e}>
					{e}</Select.Option>
			);
		});
		return productionBatchOptions;
	}

	getPickUpBin = (line) => {
		const { entity, pickSchemas } = this.state;
		if (!entity || !entity.items[line - 1] || !entity.items[line - 1].article) {
			return undefined;
		}
		if (!pickSchemas)
			return undefined;

		const pickSchema = pickSchemas[entity.items[line - 1].article.articleUuid];
		if (pickSchema) {
			if (pickSchema.caseBinCode) {
				entity.items[line - 1].binCode = pickSchema.caseBinCode;
				entity.items[line - 1].binUsage = pickSchema.caseBinUsage;
				entity.items[line - 1].containerBarcode = '-';
				return {
					code: entity.items[line - 1].binCode,
					usage: entity.items[line - 1].binUsage
				};
			}
			if (pickSchema.splitBinCode) {
				entity.items[line - 1].binCode = pickSchema.splitBinCode;
				entity.items[line - 1].binUsage = pickSchema.splitBinUsage;
				entity.items[line - 1].containerBarcode = '-';
				return {
					code: entity.items[line - 1].binCode,
					usage: entity.items[line - 1].binUsage
				};
			}
		}

		return undefined;
	}

	getBinCodes = (line) => {
		const { storeHandoverBill, entity, stocks } = this.state;
		const that = this;
		let bins = [];
		if (!entity.items[line - 1] || !entity.items[line - 1].article
			|| !entity.items[line - 1].qpcStr
			|| !entity.items[line - 1].vendor) {
			return bins;
		}

		let binCodes = []
		if (entity.items[line - 1].type && Type.MOREALC.name === entity.items[line - 1].type) {
			stocks.forEach(function (e) {
				if (e.article.articleUuid === entity.items[line - 1].article.articleUuid &&
					e.qpcStr === entity.items[line - 1].qpcStr &&
					e.vendor.uuid === entity.items[line - 1].vendor.uuid
					&& e.productionBatch === entity.items[line - 1].productionBatch
					&& e.binCode && binCodes.indexOf(e.binCode) === -1) {
					bins.push({
						code: e.binCode,
						usage: e.binUsage
					});

					binCodes.push(e.binCode)
				}
			});
		}

		if (bins.length === 1) {
			entity.items[line - 1].binCode = bins[0].code;
			entity.items[line - 1].binUsage = bins[0].usage;
		}
		return bins;
	}

	getBinCodeOptions = (line) => {
		let binCodeOptions = [];
		this.getBinCodes(line).forEach(function (e) {
			binCodeOptions.push(
				<Select.Option key={e}
					value={JSON.stringify(e)}>{e.code + '[' + binUsage[e.usage].caption + ']'}
				</Select.Option>
			);
		});
		return binCodeOptions;
	}

	getContainers = (line) => {
		const { storeHandoverBill, entity, stocks } = this.state;
		let containers = [];
		if (!entity.items[line - 1] || !entity.items[line - 1].article
			|| !entity.items[line - 1].qpcStr
			|| !entity.items[line - 1].vendor
			|| !entity.items[line - 1].binCode) {
			return containers;
		}

		if (entity.items[line - 1].type && Type.MOREALC.name === entity.items[line - 1].type) {
			stocks.forEach(function (e) {
				if (e.article.articleUuid === entity.items[line - 1].article.articleUuid &&
					e.qpcStr === entity.items[line - 1].qpcStr &&
					e.vendor.uuid === entity.items[line - 1].vendor.uuid &&
					e.binCode === entity.items[line - 1].binCode && e.productionBatch === entity.items[line - 1].productionBatch
					&& e.containerBarcode && containers.indexOf(e.containerBarcode) === -1) {
					containers.push(e.containerBarcode);
				}
			});
		}

		if (containers.length === 1) {
			entity.items[line - 1].containerBarcode = containers[0];
		}
		return containers;
	}

	getContainerOptions = (line) => {
		let containerOptions = [];
		this.getContainers(line).forEach(function (e) {
			containerOptions.push(
				<Select.Option key={e} value={e}>{e}</Select.Option>
			);
		});
		return containerOptions;
	}

	handleFieldChange = (e, fieldName, line) => {
		const { entity, } = this.state;
		const target = entity.items[line - 1];

		if (fieldName === 'type') {
		// 	if (target.type && e !== target.type) {
		// 		target.article = undefined;
		// 		target.qpcStr = undefined;
		// 		target.vendor = undefined;
		// 		target.binCode = undefined;
		// 		target.containerBarcode = undefined;
		// 		target.productionBatch = undefined;
		// 		target.type = undefined;
		// 		target.qtyStr = undefined;
		// 		target.qty = undefined;
		// 		target.munit = undefined;
		// 	}
			target.type = e;
		} else if (fieldName === 'article') {
			let article = JSON.parse(e);
			if (target.article && target.article.articleUuid !== article.articleUuid) {
				target.qpcStr = undefined;
				target.vendor = undefined;
				target.binCode = undefined;
				target.containerBarcode = undefined;
				target.productionBatch = undefined;
				target.price = undefined;
			}

			target.article = {
				articleUuid: article.articleUuid,
				articleCode: article.articleCode,
				articleName: article.articleName,
				articleSpec: article.articleSpec,
				munit: article.munit,
        price: article.price,
			};

			if (Type.MOREALC.name === target.type)
				this.queryStock(article.articleUuid, entity.owner.Uuid, entity.wrh.uuid);
			else {
				this.queryArticle(article.articleUuid);
				this.queryPickSchema(article.articleUuid)
			}
		} else if (fieldName === 'qpcStr') {
			const qpcStrMunit = JSON.parse(e);
			target.qpcStr = qpcStrMunit.qpcStr;
			target.article.munit = qpcStrMunit.munit;
			target.qpc = qpcStrMunit.qpc;
		} else if (fieldName === 'vendor') {
			if (target.vendor && target.vendor.uuid !== e.uuid) {
				target.productionBatch = undefined;
			}
			target.vendor = JSON.parse(e);
		} else if (fieldName === 'productionBatch') {
			target.productionBatch = e;
		} else if (fieldName === 'binCode') {
			if (target.binCode != JSON.parse(e).code) {
				target.containerBarcode = undefined;
			}
			target.binCode = JSON.parse(e).code;
			target.binUsage = JSON.parse(e).usage;
		} else if (fieldName === 'containerBarcode') {
			let containerBarcode = target.type && target.type === Type.LESSALC.name || target.type === Type.GOOD_RETURN_WAREHOUSE_LOSS.name ? JSON.parse(e).barcode : e;
			target.containerBarcode = containerBarcode;
		} else if (fieldName === 'qtyStr') {
			target.qtyStr = e;
			target.qty = qtyStrToQty(e.toString(), target.qpcStr);
		}

		this.setState({
			entity: { ...entity },
		})
	}

	drawBatchButton = () => {
		if (this.state.entity.uuid && !this.state.disableWhenImport) {

		} else {
			return (
				<div style={{ "display": 'inline' }}>
					<span>
						<a onClick={() => this.handlebatchAddVisible()}>从配单导入</a>
					</span>
				</div>
			)
		}
	}

	drawTable = () => {
		const { entity, disableWhenImport } = this.state;

		const columns = [
			{
				title: alcDiffLocal.type,
				dataIndex: 'type',
				key: 'type',
				width: itemColWidth.qtyStrEditColWidth,
				render: (text, record) => {
					return (
						<Select className={style.editWrapper} disable={disableWhenImport}
							value={record.type}
							title={placeholderChooseLocale(alcDiffLocal.type)}
							placeholder={placeholderChooseLocale(alcDiffLocal.type)}
							onChange={e => this.handleFieldChange(e, 'type', record.line)}>
							{typeOptions}
						</Select>
					);
				}
			},
			{
				title: commonLocale.inArticleLocale,
				dataIndex: 'article',
				key: 'article',
				width: itemColWidth.articleEditColWidth,
				render: (text, record) => {
					if (disableWhenImport === true) {
						return <span>{record.article ? '[' + record.article.articleCode + ']' + record.article.articleName : undefined}</span>;
					}
					if (record.type && Type.LESSALC.name === record.type || Type.GOOD_RETURN_WAREHOUSE_LOSS.name === record.type) {
						return (
							<Select
								value={record.article ? '[' + record.article.articleCode + ']' + record.article.articleName : undefined}
								placeholder={placeholderChooseLocale(commonLocale.articleLocale)}
								onChange={e => this.handleFieldChange(e, 'article', record.line)}>
								{this.getArticleOptions(record.line)}
							</Select>
						);
					}
					else {
						if (record.type && Type.LESSALC.name === record.type) {
							return (
								<Select
									value={record.article ? '[' + record.article.articleCode + ']' + record.article.articleName : undefined}
									placeholder={placeholderChooseLocale(commonLocale.articleLocale)}
									onChange={e => this.handleFieldChange(e, 'article', record.line)}>
									{this.getArticleOptions(record.line)}
								</Select>
							);
						} else {
							return (
								<StockArticleSelect
									value={record.article ? '[' + record.article.articleCode + ']' + record.article.articleName : undefined}
									ownerUuid={entity.owner ? entity.owner.uuid : undefined}
									wrhUuid={entity.wrh ? entity.wrh.uuid : undefined}
									placeholder={placeholderChooseLocale(commonLocale.articleLocale)}
									onChange={e => this.handleFieldChange(e, 'article', record.line)}
								/>
							);
						}
					}
				}
			},
			{
				title: commonLocale.inQpcAndMunitLocale,
				dataIndex: 'qpcStr',
				key: 'qpcStr',
				width: itemColWidth.qpcStrEditColWidth,
				render: (text, record) => {
					if (this.state.disableWhenImport) {
						return <span>{record.qpcStr && record.article ? record.qpcStr + '/' + record.article.munit : ''}</span>;
					} else {
						const qpcStrs = this.getQpcStrs(record.line);
						if (qpcStrs.length === 1) {
							let qpcStrMunit = JSON.parse(qpcStrs[0]);
							return qpcStrMunit.qpcStr + '/' + qpcStrMunit.munit;
						}
						return (
							<Select value={record.qpcStr && record.article ? record.qpcStr + '/' + record.article.munit : undefined}
								placeholder={placeholderChooseLocale(commonLocale.qpcStrLocale)}
								onChange={e => this.handleFieldChange(e, 'qpcStr', record.line)}>
								{this.getQpcStrOptions(record.line)}
							</Select>
						);
					}
				},
			},
			{
				title: commonLocale.inVendorLocale,
				dataIndex: 'vendor',
				key: 'vendor',
				width: itemColWidth.articleEditColWidth,
				render: (text, record) => {
					if (this.state.disableWhenImport) {
						return <span>{record.vendor ? convertCodeName(record.vendor) : undefined}</span>;
					}
					const vendors = this.getVendors(record.line);
					if (vendors.length === 1) {
						return <span>{convertCodeName(vendors[0])}</span>
					}
					return (
						<Select value={record.vendor ? convertCodeName(record.vendor) : undefined}
							placeholder={placeholderChooseLocale(commonLocale.inVendorLocale)}
							onChange={e => this.handleFieldChange(e, 'vendor', record.line)}>
							{this.getVendorOptions(record.line)}
						</Select>
					);
				}
			},
			{
				title: commonLocale.inProductionBatchLocale,
				dataIndex: 'productionBatch',
				key: 'productionBatch',
				width: itemColWidth.containerEditColWidth,
				render: (value, record) => {
					if (this.state.disableWhenImport) {
						return <span>{record.productionBatch ? record.productionBatch : undefined}</span>;
					}
					const productionBatchs = this.getProductionBatchs(record.line);
					if (productionBatchs.length === 1) {
						return <span>{productionBatchs[0]}</span>;
					}
					return (
						<Select value={record.productionBatch ? record.productionBatch : undefined}
							placeholder={placeholderChooseLocale(commonLocale.inProductionBatchLocale)}
							onChange={(e) => this.handleFieldChange(e, 'productionBatch', record.line)}>
							{this.getProductionBatchOptions(record.line)}
						</Select>
					);
				},
			},
			{
				title: commonLocale.inBinCodeLocale,
				dataIndex: 'binCode',
				key: 'binCode',
				width: itemColWidth.binCodeEditColWidth,
				render: (text, record) => {
					if (this.state.disableWhenImport) {
						return <span>{record.binCode ? record.binCode : undefined}</span>;
					}
					if (record.type && Type.MOREALC.name === record.type) {
						const binCodes = this.getBinCodes(record.line);
						if (binCodes.length === 1) {
							return <span>{binCodes[0].code + '[' + binUsage[binCodes[0].usage].caption + ']'}</span>;
						}
						return (
							<Select value={record.binCode ? record.binCode + '[' + binUsage[record.binUsage].caption + ']' : undefined}
								placeholder={placeholderChooseLocale(commonLocale.inBinCodeLocale)}
								onChange={(e) => this.handleFieldChange(e, 'binCode', record.line)}>
								{this.getBinCodeOptions(record.line)}
							</Select>
						);
					} else {
						let bin = undefined;
						if (!record.binCode)
							bin = this.getPickUpBin(record.line);
						return (
							<BinSelect
								getUsage={true}
								value={record.binCode ? JSON.stringify({ code: record.binCode, usage: record.binUsage }) :
									bin ? JSON.stringify(bin) : undefined}
								wrhUuid={entity.wrh ? entity.wrh.uuid : undefined}
								states={[binState.FREE.name, binState.USING.name]}
								usages={[binUsage.PickUpBin.name, binUsage.PickUpStorageBin.name, binUsage.StorageBin.name, binUsage.Virtuality.name]}
								onChange={e => this.handleFieldChange(e, 'binCode', record.line)}
								placeholder={placeholderLocale(commonLocale.inBinCodeLocale)} />
						);
					}
				},
			},
			{
				title: commonLocale.inContainerBarcodeLocale,
				dataIndex: 'containerBarcode',
				key: 'containerBarcode',
				width: itemColWidth.containerEditColWidth,
				render: (text, record) => {
					if (this.state.disableWhenImport) {
						return <span>{'-'}</span>;
					}
					if (record.type && Type.MOREALC.name === record.type) {
						const containers = this.getContainers(record.line);
						if (containers.length === 1) {
							return <span>{containers[0]}</span>;
						}
						return (
							<Select value={record.containerBarcode}
								placeholder={placeholderChooseLocale(commonLocale.inContainerBarcodeLocale)}
								onChange={(e) => this.handleFieldChange(e, 'containerBarcode', record.line)}>
								{this.getContainerOptions(record.line)}
							</Select>
						);
					} else {
						if (!record.binUsage)
							return <span>{record.containerBarcode ? record.containerBarcode : <Empty />}</span>
						if (record.binUsage === binUsage.PickUpBin.name ||
							record.binUsage === binUsage.PickUpStorageBin.name) {
							record.containerBarcode = '-';
							return (<span>{record.containerBarcode}</span>);
						} else {
							return (
								<MoveToContainerSelect
									value={record.containerBarcode ? record.containerBarcode : null}
									binCode={record.binCode}
									onChange={e => this.handleFieldChange(e, 'containerBarcode', record.line)}
									placeholder={placeholderLocale(commonLocale.inContainerBarcodeLocale)}
								/>
							);
						}
					}
				},
			},
			{
				title: commonLocale.inQtyStrLocale,
				dataIndex: 'qtyStr',
				key: 'qtyStr',
				width: itemColWidth.qtyStrEditColWidth,
				render: (text, record) => {
					return (
						<QtyStrInput
							value={record.qtyStr}
							onChange={e => this.handleFieldChange(e, 'qtyStr', record.line)}
							placeholder={placeholderLocale(commonLocale.inQtyStrLocale)}
						/>
					);
				}
			},
			{
				title: commonLocale.inQtyLocale,
				key: 'qty',
				width: itemColWidth.qtyColWidth,
				render: (text, record) => <span>{record.qty}</span>
			},
			{
				title: commonLocale.inPriceLocale,
				key: 'price',
        dataIndex: 'price',
				width: itemColWidth.inPriceLocale,
				render: text => <span>{text}</span>
			},
		];

		return (
			<div>
				<ItemEditTable
					title={commonLocale.inArticleLocale}
					columns={columns}
					data={this.state.entity.items}
					drawBatchButton={this.drawBatchButton}
					noAddButton={this.state.disableWhenImport}
					scroll={{ x: 2100 }} />
				<ImportFromAlcNtcModal
					type={"aaaa"}
					visible={this.state.batchAddVisible}
					handlebatchAddVisible={this.handlebatchAddVisible}
					getImportedData={this.getImportedData}
					getImportedHeadDate={this.getImportedHeadDate}
				/>
			</div>
		)
	}
}
