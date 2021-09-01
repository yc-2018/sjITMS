import { Fragment } from 'react';
import { connect } from 'dva';
import { Button, Tabs } from 'antd';
import ViewPage from '../../Component/Page/ViewPage';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import { CARRIER_RES } from './CarrierPermission';
import { commonLocale } from '@/utils/CommonLocale';
import { addressToStr, convertCodeName } from '@/utils/utils';
import { carrierLocale } from './CarrierLocale';
import { havePermission } from '@/utils/authority';
import { basicState } from '@/utils/BasicState';
import { loginOrg } from '@/utils/LoginContext';
const TabPane = Tabs.TabPane;
@connect(({ carrier, loading }) => ({
	carrier,
	loading: loading.models.carrier,
}))
export default class CarrierViewPage extends ViewPage {
	constructor(props) {
		super(props);

		this.state = {
			title: '',
			disabledChangeState: loginOrg().type === 'COMPANY' ? !havePermission(CARRIER_RES.ONLINE) : 'disabled'
		}
	}

	refresh = () => {
		this.props.dispatch({
			type: 'carrier/get',
			payload: {
				uuid: this.props.carrier.entityUuid
			}
		});
	}

	componentDidMount() {
		this.refresh();
	}

	componentWillReceiveProps(nextProps) {
		const entity = nextProps.carrier.entity;
		if (entity) {
			if (nextProps.carrier.entityUuid
				&& entity.uuid !== nextProps.carrier.entityUuid) {
				this.refresh()
			}
			this.setState({
				entity: entity,
				title: convertCodeName(entity),
				entityState: entity.state,
				entityUuid: entity.uuid
			});
		}
	}

	drawActionButtion() {
		const { entity } = this.props.carrier;
		return (
			<Fragment>
				<Button onClick={this.onCancel}>
					{commonLocale.backLocale}
				</Button>
				{loginOrg().type === 'COMPANY' ?
					<Button disabled={!havePermission(CARRIER_RES.CREATE)} type="primary" onClick={this.onEditBasicInfo}>
						{commonLocale.editLocale}
					</Button>
					: null
				}

			</Fragment>
		);
	}

	onChangeState = () => {
		const entity = this.props.carrier.entity;
		if (entity.state === basicState.ONLINE.name) {
			this.props.dispatch({
				type: 'carrier/offline',
				payload: entity,
				callback: response => {
					this.refresh();
				}
			});
		} else {
			this.props.dispatch({
				type: 'carrier/online',
				payload: entity,
				callback: response => {
					this.refresh();
				}
			});
		}
	}

	drawTabPanes = () => {
		let tabPanes = [
			this.drawBasicInfoTab()
		];

		return tabPanes;
	}

	drawBasicInfoTab = () => {
		const entity = this.props.carrier.entity;
		let basicItems = [{
			label: commonLocale.codeLocale,
			value: entity.code
		}, {
			label: commonLocale.nameLocale,
			value: entity.name
		}, {
			label: commonLocale.shortNameLocale,
			value: entity.shortName
		}, {
			label: commonLocale.zipCodeLocale,
			value: entity.zipCode
		}, {
			label: commonLocale.contactPhoneLocale,
			value: entity.contactPhone
		}, {
			label: commonLocale.contactorLocale,
			value: entity.contactor
		}, {
			label: commonLocale.addressLocale,
			value: addressToStr(entity.address)
		}, {
			label: commonLocale.homeUrlLocale,
			value: entity.homeUrl
		}];

		let noteItems = [{
			label: commonLocale.noteLocale,
			value: entity.note
		}]

		return (
			<TabPane key="basicInfo" tab={carrierLocale.title}>
				<ViewPanel items={basicItems} title={commonLocale.basicInfoLocale} />
				<ViewPanel items={noteItems} title={commonLocale.noteLocale} />
			</TabPane>
		);
	}

	/**
   * 跳转至编辑页面
   */
	onEditBasicInfo = () => {
		const { dispatch } = this.props;
		dispatch({
			type: 'carrier/showPage',
			payload: {
				showPage: 'create',
				entityUuid: this.props.carrier.entity.uuid,
			}
		});
	}

	/**
   * 跳转至列表页面
   */
	onCancel = () => {
		this.props.dispatch({
			type: 'carrier/showPage',
			payload: {
				showPage: 'query'
			}
		});
	}

}