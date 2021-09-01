import SearchPage from '@/pages/Component/Page/SearchPage';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import CarrierSearchForm from './CarrierSearchForm';
import { Switch, Button, Divider, message } from 'antd';
import { Fragment } from 'react';
import { connect } from 'dva';
import { havePermission } from '@/utils/authority';
import { carrierLocale } from './CarrierLocale';
import { CARRIER_RES } from './CarrierPermission';
import { commonLocale } from '@/utils/CommonLocale';
import { getSourceWayCaption } from '@/utils/SourceWay';
import { basicState, getStateCaption } from '@/utils/BasicState';
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm';
import Empty from '@/pages/Component/Form/Empty';
import OperateCol from '@/pages/Component/Form/OperateCol';
@connect(({ carrier, loading }) => ({
	carrier,
	loading: loading.models.carrier,
}))
export default class CarrierSearchPage extends SearchPage {

	constructor(props) {
		super(props);

		this.state = {
			...this.state,
			title: carrierLocale.title,
			data: props.carrier.data,
			importTemplateUrl: '',
		};

		this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
		this.state.pageFilter.searchKeyValues.state = '';
	}

	componentDidMount() {
		this.refreshTable();
	}

	componentWillReceiveProps(nextProps) {
		this.setState({
			data: nextProps.carrier.data
		});
	}

	drawActionButton = () => {
		return (
			loginOrg().type === 'COMPANY' && <Fragment>
				<Button disabled={!havePermission(CARRIER_RES.CREATE)}
					onClick={() => this.handleShowExcelImportPage()}>
					{commonLocale.importLocale}
				</Button>
				<Button disabled={!havePermission(CARRIER_RES.CREATE)} icon="plus" type="primary"
					onClick={this.onCreate.bind(this, null)}>
					{commonLocale.createLocale}
				</Button>
			</Fragment>
		);
	}

	drawSearchPanel = () => {
		return <CarrierSearchForm filterValue={this.state.pageFilter.searchKeyValues} refresh={this.onSearch} />;
	}

	drawToolbarPanel = () => {
		return loginOrg().type === 'COMPANY' ? [
			<Button key='onLine' disabled={!havePermission(CARRIER_RES.ONLINE)}
				onClick={() => this.onBatchOnline()}
			>
				{commonLocale.batchOnlineLocale}
			</Button>,
			<Button key='offLine' disabled={!havePermission(CARRIER_RES.ONLINE)}
				onClick={() => this.onBatchOffline()}
			>
				{commonLocale.batchOfflineLocale}
			</Button>
		] : null;
	}

	fetchOperatePropsOne = (record) => {
		return [{
			name: commonLocale.viewLocale,
			onClick: this.onView.bind(this, record.uuid)
		}];
	}

	fetchOperatePropsTwo = (record) => {
		return [{
			name: commonLocale.viewLocale,
			disabled: !havePermission(CARRIER_RES.VIEW),
			onClick: this.onView.bind(this, record.uuid),
		}, {
			name: commonLocale.editLocale,
			disabled: !havePermission(CARRIER_RES.CREATE),
			onClick: this.onCreate.bind(this, record.uuid)
		}];
	}

	columns = [
		{
			title: commonLocale.codeLocale,
			dataIndex: 'code',
			sorter: true,
			render: (val, record) => <a disabled={loginOrg().type === 'COMPANY' ? !havePermission(CARRIER_RES.VIEW) : false} onClick={this.onView.bind(this, record.uuid)}>{val}</a>,
		},
		{
			title: commonLocale.nameLocale,
			dataIndex: 'name',
		},
		{
			title: commonLocale.shortNameLocale,
			dataIndex: 'shortName',
			render: val => <span>{val ? val : <Empty />}</span>,
		},
		{
			title: commonLocale.sourceWayLocale,
			dataIndex: 'sourceWay',
			render: val => (
				<span>
					{getSourceWayCaption(val)}
				</span>
			)
		},
		{
			title: commonLocale.stateLocale,
			dataIndex: 'state',
			render: (text, record) => {
				confirm = record.state == basicState.ONLINE.name ? commonLocale.offlineLocale
					: commonLocale.onlineLocale;
				return loginOrg().type === 'COMPANY' ?
					<div>
						<IPopconfirm onConfirm={this.onChangeState.bind(this, record)}
							operate={confirm}
							disabled={!havePermission(CARRIER_RES.ONLINE)}
							object={carrierLocale.title}>
							<Switch disabled={!havePermission(CARRIER_RES.ONLINE)} checked={record.state === basicState.ONLINE.name} size="small" />
						</IPopconfirm>
						&emsp; {getStateCaption(record.state)}
					</div>
					: <span>{getStateCaption(record.state)}</span>
			},
		},
		{
			title: commonLocale.operateLocale,

			render: record => (
				loginOrg().type === 'COMPANY' ?
					<OperateCol menus={this.fetchOperatePropsTwo(record)} />
					:
					<OperateCol menus={this.fetchOperatePropsOne(record)} />
			),
		},
	];

	refreshTable = (filter) => {
		const { dispatch } = this.props;
		const { pageFilter } = this.state;

		let queryFilter = { ...pageFilter };
		if (filter) {
			queryFilter = { ...pageFilter, ...filter };
		}

		dispatch({
			type: 'carrier/query',
			payload: queryFilter,
		});
	};

	onChangeState = (record) => {
		if (record.state === basicState.ONLINE.name) {
			this.offline(record);
		} else {
			this.online(record);
		}
	}

	onSearch = (data) => {
		const { pageFilter } = this.state;
		pageFilter.page = 0;
		if (data) {
			pageFilter.searchKeyValues = {
				...pageFilter.searchKeyValues,
				...data
			}
		} else {
			pageFilter.searchKeyValues = {
				companyUuid: loginCompany().uuid,
				state: ''
			}
		}
		this.refreshTable();
	}

	/**
   * 批量导入
   */
	handleShowExcelImportPage = () => {
		this.props.dispatch({
			type: 'carrier/getImportTemplateUrl',
			callback: response => {
				if (response && response.success) {
					this.props.dispatch({
						type: 'carrier/showPage',
						payload: {
							showPage: 'import',
							importTemplateUrl: response.data
						}
					});
				}
			}
		});
	}

	/**
   * 跳转到详情页面
   */
	onView = (uuid) => {
		this.props.dispatch({
			type: 'carrier/showPage',
			payload: {
				showPage: 'view',
				entityUuid: uuid
			}
		});
	}

	/**
   * 跳转到编辑或新增页面
   */
	onCreate = (uuid) => {
		const { dispatch } = this.props;
		dispatch({
			type: 'carrier/showPage',
			payload: {
				showPage: 'create',
				entityUuid: uuid,
			}
		});
	}

	/**
	 * 启用处理
	 */
	online = (record, batch) => {
		const { dispatch } = this.props;
		const that = this;
		dispatch({
			type: 'carrier/online',
			payload: record,
			callback: (response) => {
				if (batch) {
					that.batchCallback(response, record);
					return;
				}
				if (response && response.success) {
					this.refreshTable();
					message.success(commonLocale.onlineSuccessLocale);
				}
			}
		});
	};
	/**
	 * 禁用处理
	 */
	offline = (record, batch) => {
		const { dispatch } = this.props;
		const that = this;
		dispatch({
			type: 'carrier/offline',
			payload: record,
			callback: (response) => {
				if (batch) {
					that.batchCallback(response, record);
					return;
				}
				if (response && response.success) {
					this.refreshTable();
					message.success(commonLocale.offlineSuccessLocale);
				}
			}
		});
	};


	/**  批处理相关 开始  **/
	onBatchOnline = () => {
		this.setState({
			batchAction: basicState.ONLINE.caption
		});
		this.handleBatchProcessConfirmModalVisible(true);
	}

	onBatchOffline = () => {
		this.setState({
			batchAction: basicState.OFFLINE.caption
		});
		this.handleBatchProcessConfirmModalVisible(true);
	}

	onBatchProcess = () => {
		const { selectedRows, batchAction } = this.state;

		const that = this;
		selectedRows.forEach(function (e) {
			if (batchAction === basicState.ONLINE.caption) {
				if (e.state === basicState.ONLINE.name) {
					that.refs.batchHandle.calculateTaskSkipped();
				} else {
					that.online(e, true);
				}
			} else {
				if (e.state === basicState.OFFLINE.name) {
					that.refs.batchHandle.calculateTaskSkipped();
				} else {
					that.offline(e, true);
				}
			}
		});
	}

	/**  批处理相关 结束  **/
}