import { connect } from 'dva';
import { Fragment } from 'react';
import { formatMessage } from 'umi/locale';
import { Button, message, Form } from 'antd';
import SearchPage from '@/pages/Component/Page/SearchPage';
import Empty from '@/pages/Component/Form/Empty';
import BadgeUtil from '@/pages/Component/BadgeUtil';
import { commonLocale } from '@/utils/CommonLocale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { havePermission } from '@/utils/authority';
import { convertCodeName } from '@/utils/utils';
import { State } from './ShipPlanBillContants';
import { shipPlanBillLocale } from './ShipPlanBillLocale';
import { SHIPPLANBILL_RES } from './ShipPlanBillPermission';
import ShipPlanBillSearchForm from './ShipPlanBillSearchForm';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import OperateCol from '@/pages/Component/Form/OperateCol';
import { colWidth } from '@/utils/ColWidth';
import { orgType } from '@/utils/OrgType';
import PrintButton from '@/pages/Component/Printer/PrintButton';
import { PrintTemplateType } from '@/pages/Account/PrintTemplate/PrintTemplateContants';
import { getQueryBillDays } from '@/utils/LoginContext';
const FormItem = Form.Item;

@connect(({ shipplanbill, loading }) => ({
	shipplanbill,
	loading: loading.models.shipplanbill,
}))
@Form.create()
export default class ShipPlanBillSearchPage extends SearchPage {

	constructor(props) {
		super(props);

		this.state = {
			...this.state,
			title: shipPlanBillLocale.title,
			data: props.shipplanbill.data,
			suspendLoading: false,
			key: 'shipPlanBill.search.table',
		};
		this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
		this.state.pageFilter.sortFields = {
			billNumber: true
		};
	}

	componentDidMount() {
		if (this.props.shipplanbill.fromView) {
			return;
		} else {
			this.refreshTable();
		}
	}

	componentWillReceiveProps(nextProps) {
		this.setState({
			data: nextProps.shipplanbill.data
		});
	}

	onBatchRemove = () => {
		this.setState({
			batchAction: commonLocale.deleteLocale
		})
		this.handleBatchProcessConfirmModalVisible(true);
	}

	onBatchApprove = () => {
		this.setState({
			batchAction: commonLocale.approveLocale
		});
		this.handleBatchProcessConfirmModalVisible(true);
	}

	onBatchAbort = () => {
		this.setState({
			batchAction: commonLocale.abortLocale
		});
		this.handleBatchProcessConfirmModalVisible(true);
	}

	onBatchProcess = () => {
		this.setState({
			suspendLoading: true
		})
		const { selectedRows, batchAction } = this.state;

		const that = this;
		let bacth = (i) => {
			if (i < selectedRows.length) {
				if (batchAction === commonLocale.approveLocale) {
					if (selectedRows[i].state === State.SAVED.name && !selectedRows[i].sourceBillNumber) {
						that.onApprove(selectedRows[i], true).then(res => {
							bacth(i + 1);
						});
					} else {
						that.refs.batchHandle.calculateTaskSkipped();
						bacth(i + 1);
					}
				} else if (batchAction === commonLocale.abortLocale) {
					if (selectedRows[i].state === State.APPROVED.name && !selectedRows[i].sourceBillNumber) {
						that.onAbort(selectedRows[i], true).then(res => {
							bacth(i + 1);
						});
					} else {
						that.refs.batchHandle.calculateTaskSkipped();
						bacth(i + 1);
					}
				} else if (batchAction === commonLocale.deleteLocale) {
					if (selectedRows[i].state === State.SAVED.name && !selectedRows[i].sourceBillNumber) {
						that.onRemove(selectedRows[i], true).then(res => {
							bacth(i + 1);
						});
					} else {
						that.refs.batchHandle.calculateTaskSkipped();
						bacth(i + 1);
					}
				}
			} else {
				this.setState({
					suspendLoading: false
				})
			}
		}
		bacth(0);
	}

	onApprove = (record, batch) => {
		const that = this;
		return new Promise(function (resolve, reject) {
			that.props.dispatch({
				type: 'shipplanbill/onApprove',
				payload: record,
				callback: (response) => {
					if (batch) {
						that.batchCallback(response, record);
						resolve({ success: response.success });
						return;
					}
					if (response && response.success) {
						that.refreshTable();
						message.success(commonLocale.approveSuccessLocale)
					}
				}
			})
		})
	}

	onAbort = (record, batch) => {
		const that = this;
		return new Promise(function (resolve, reject) {
			that.props.dispatch({
				type: 'shipplanbill/onAbort',
				payload: record,
				callback: (response) => {
					if (batch) {
						that.batchCallback(response, record);
						resolve({ success: response.success });
						return;
					}
					if (response && response.success) {
						that.refreshTable();
						message.success(commonLocale.abortSuccessLocale)
					}
				}
			})
		})
	}

	onRemove = (record, batch) => {
		const that = this;
		return new Promise(function (resolve, reject) {
			that.props.dispatch({
				type: 'shipplanbill/onRemove',
				payload: record,
				callback: (response) => {
					if (batch) {
						that.batchCallback(response, record);
						resolve({ success: response.success });
						return;
					}
					if (response && response.success) {
						that.refreshTable();
						message.success(commonLocale.removeSuccessLocale)
					}
				}
			})
		})
	}


	onView = (record) => {
		this.props.dispatch({
			type: 'shipplanbill/showPage',
			payload: {
				showPage: 'view',
				entityUuid: record.uuid
			}
		});
	}

	onCreate = (uuid) => {
		this.props.dispatch({
			type: 'shipplanbill/showPage',
			payload: {
				showPage: 'create',
				entityUuid: uuid
			}
		});
	}

	onSearch = (data) => {
		const { pageFilter } = this.state;
		pageFilter.page = 0;
    var days = '';
    if (data) {
      if (data.days) {
        days = data.days
      }
			pageFilter.searchKeyValues = {
				...pageFilter.searchKeyValues,
				...data,
        days: days
      }
		} else {
			pageFilter.searchKeyValues = {
				companyUuid: loginCompany().uuid,
        days: getQueryBillDays()
      },
				pageFilter.sortFields = {
					billNumber: false
				}
		}
		this.refreshTable();
	}

	refreshTable = (filter) => {
		const { dispatch } = this.props;
		const { pageFilter } = this.state;

		if (!filter || !filter.changePage) {
			this.setState({
				selectedRows: []
			});
      if(pageFilter.searchKeyValues && !pageFilter.searchKeyValues.days) {
        pageFilter.searchKeyValues.days = getQueryBillDays()
      }
		}

		const currentOrgType = loginOrg().type;
		const createOrgUuid = (orgType.carrier.name === currentOrgType) ? null : loginOrg().uuid;
		const carrierUuid = (orgType.carrier.name === currentOrgType) ? loginOrg().uuid : null;

		pageFilter.searchKeyValues = {
			...pageFilter.searchKeyValues,
			createOrgUuid: createOrgUuid,
			carrierUuid: carrierUuid
		}

		let queryFilter = { ...pageFilter };
		if (filter) {
			queryFilter = { ...pageFilter, ...filter };
		}

		dispatch({
			type: 'shipplanbill/query',
			payload: queryFilter,
		});
	};

	/**
		 * 绘制右上角按钮
		 */
	drawActionButton = () => {
		return (
			orgType.carrier.name != loginOrg().type && <Fragment>
				<Button type="primary" icon='plus' onClick={this.onCreate.bind(this, '')} disabled={true}>
					{commonLocale.createLocale}
				</Button>
			</Fragment>
		)
	}

	drawToolbarPanel() {
		const { selectedRows } = this.state;
		const batchPrintParams = [];
		selectedRows.forEach(function (e) {
			batchPrintParams.push({
				billNumber: e.billNumber
			})
		});

		if (orgType.carrier.name === loginOrg().type) {
			return [
				<PrintButton
					key='printButton'
					reportParams={batchPrintParams}
					moduleId={PrintTemplateType.SHIPPLANBILL.name} />
			];
		} else {
			return [
				<Button disabled={true} key="onBatchApprove" onClick={() => this.onBatchApprove()}>
					{commonLocale.batchApproveLocale}
				</Button>,
				<Button disabled={true} key="onBatchAbort" onClick={() => this.onBatchAbort()}>
					{commonLocale.batchAbortLocale}
				</Button>,
				<Button key="onBatchRemove" disabled={true} onClick={() => this.onBatchRemove()}>
					{commonLocale.batchRemoveLocale}
				</Button>,
				<PrintButton
					key='printButton'
					reportParams={batchPrintParams}
					moduleId={PrintTemplateType.SHIPPLANBILL.name} />
			];
		}
	}

	drawSearchPanel = () => {
		return <ShipPlanBillSearchForm filterValue={this.state.pageFilter.searchKeyValues}
			refresh={this.onSearch} toggleCallback={this.toggleCallback}/>;
	}

	handleCancel() {
		this.props.form.resetFields();
		this.refreshTable();
	}

	fetchOperateProps = (record) => {
		let operateProps = [];
		operateProps.push(
			{
				name: commonLocale.viewLocale,
				onClick: this.onView.bind(this, record)
			}
		);

		if (orgType.carrier.name === loginOrg().type)
			return operateProps;

		if (record.state === State.SAVED.name && !record.sourceBillNumber) {
			operateProps.push(
				{
					name: commonLocale.editLocale,
					disabled: !havePermission(SHIPPLANBILL_RES.EDIT),
					onClick: this.onCreate.bind(this, record.uuid)
				},
				{
					name: commonLocale.approveLocale,
					confirm: true,
					disabled: !havePermission(SHIPPLANBILL_RES.APPROVE),
					confirmCaption: shipPlanBillLocale.title,
					onClick: this.onApprove.bind(this, record, false)
				},
				{
					name: commonLocale.deleteLocale,
					confirm: true,
					disabled: !havePermission(SHIPPLANBILL_RES.DELETE),
					confirmCaption: shipPlanBillLocale.title,
					onClick: this.onRemove.bind(this, record, false)
				}
			);
		}

		if (record.state === State.APPROVED.name && !record.sourceBillNumber) {
			operateProps.push(
				{
					name: commonLocale.abortLocale,
					disabled: !havePermission(SHIPPLANBILL_RES.ABORT) || orgType.carrier.name === loginOrg().type,
					confirm: true,
					confirmCaption: shipPlanBillLocale.title,
					onClick: this.onAbort.bind(this, record, false)
				}
			)
		}
		return operateProps;
	}

	columns = [
		{
			title: commonLocale.billNumberLocal,
			dataIndex: 'billNumber',
			sorter: true,
			width: colWidth.billNumberColWidth,
			render: (text, record) => {
				return (
					<a
						onClick={() => this.onView(record)
						}>
						{text}
					</a >
				);
			}
		},
		{
      title: shipPlanBillLocale.plateNumber,
      key: 'plateNumber',
      dataIndex: 'vehicle',
      sorter: true,
      width: colWidth.codeColWidth,
      render: (text,record) => <a onClick={this.onViewVehicle.bind(true, record.vehicle ? record.vehicle.uuid : undefined)}>
        {record.vehicle ? record.vehicle.name : <Empty />}</a>
		},
		{
			title: '来源单号',
			dataIndex: 'sourceBillNumber',
			key: 'sourceBillNumber',
      sorter: true,
			width: colWidth.billNumberColWidth,
			render: val => val ? val : <Empty />
		},
		{
      title: shipPlanBillLocale.carrier,
      dataIndex: 'carrier',
      sorter: true,
      width: colWidth.codeNameColWidth,
      render: (text, record) => <a onClick={this.onViewCarrier.bind(true, record.carrier ? record.carrier.uuid : undefined)}>
        {<EllipsisCol colValue={convertCodeName(record.carrier)} />}</a>
		},
		{
      title: commonLocale.stateLocale,
      width: colWidth.enumColWidth,
      dataIndex: 'state',
      sorter: true,
      render: (text, record) => {
        return (<BadgeUtil value={record.state} />)
      }
		},
		{
			key: 'operate',
			title: commonLocale.operateLocale,
			width: colWidth.operateColWidth,
			render: record => {
				return (<OperateCol menus={this.fetchOperateProps(record)} />)
			}
		},
	];
}
