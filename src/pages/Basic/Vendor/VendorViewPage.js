import { Fragment } from 'react';
import { connect } from 'dva';
import { Button, message, Tabs } from 'antd';
import ViewPage from '../../Component/Page/ViewPage';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import { VENDOR_RES } from './VendorPermission';
import { commonLocale } from '@/utils/CommonLocale';
import { addressToStr, convertCodeName } from '@/utils/utils';
import { vendorLocale } from './VendorLocale';
import { havePermission } from '@/utils/authority';
import { basicState } from '@/utils/BasicState';
import { loginOrg } from '@/utils/LoginContext';
import { OWNER_RES } from '@/pages/Basic/Owner/OwnerPermission';
import { ARV_TYPE } from './Constants';

const TabPane = Tabs.TabPane;
@connect(({ vendor, loading }) => ({
	vendor,
	loading: loading.models.vendor,
}))
export default class VendorViewPage extends ViewPage {
	constructor(props) {
		super(props);

		this.state = {
			title: '',
			disabledChangeState: loginOrg().type === 'COMPANY' ? !havePermission(VENDOR_RES.ONLINE) : 'disabled',
      entityCode: this.props.entityCode,
      entity: {}
		}
	}

	refresh(entityCode) {
	  if(!entityCode){
	    entityCode = this.state.entityCode;
    }
	  if(entityCode){
	    this.props.dispatch({
        type: 'vendor/getByCode',
        payload: entityCode,
        callback:(response) =>{
          if(!response || !response.data || !response.data.uuid){
            message.error("指定供应商不存在。")
            this.onCancel();
          }else{
            this.setState({
              entityCode:response.data.code
            })
          }
        }
      })
    }else {
      this.props.dispatch({
        type: 'vendor/get',
        payload: this.props.vendor.entityUuid
      });
    }
	}

	componentDidMount() {
		this.refresh(this.state.entityCode);
	}

	componentWillReceiveProps(nextProps) {
		const entity = nextProps.vendor.entity;
		if (entity) {
			this.setState({
				entity: entity,
				title: convertCodeName(entity),
				entityState: entity.state,
				entityUuid: entity.uuid,
        entityCode: entity.code
			});
		}
	}

	drawActionButtion() {
		const { entity } = this.props.vendor;
		return (
			<Fragment>
				<Button onClick={this.onCancel}>
					{commonLocale.backLocale}
				</Button>
				{loginOrg().type === 'COMPANY' &&
					<Button disabled={!havePermission(VENDOR_RES.EDIT)} type="primary" onClick={this.onEditBasicInfo}>
						{commonLocale.editLocale}
					</Button>}
			</Fragment>
		);
	}

	onChangeState = () => {
		const entity = this.props.vendor.entity;
		if (entity.state === basicState.ONLINE.name) {
			this.props.dispatch({
				type: 'vendor/disable',
				payload: entity,
				callback: response => {
					if (response && response.success) {
						this.refresh();
					}
				}
			});
		} else {
			this.props.dispatch({
				type: 'vendor/enable',
				payload: entity,
				callback: response => {
					if (response && response.success) {
						this.refresh();
					}
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
		const { entity } = this.state;
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
			label: commonLocale.ownerLocale,
			value: <a onClick={this.onViewOwner.bind(this, entity.owner?entity.owner.uuid:undefined)}
				disabled={!havePermission(OWNER_RES.VIEW)}>{convertCodeName(entity.owner)}</a>
		}, {
			label: commonLocale.contactorLocale,
			value: entity.contactor
		}, {
			label: commonLocale.contactPhoneLocale,
			value: entity.contactPhone
		}, {
			label: commonLocale.addressLocale,
			value: addressToStr(entity.address)
		}, {
			label: commonLocale.zipCodeLocale,
			value: entity.zipCode
		}, {
			label: vendorLocale.unLoader,
			value: entity.unLoader
	 	}, {
      label: vendorLocale.arvType,
      value: ARV_TYPE[entity.arvType]
    }, {
			label: commonLocale.homeUrlLocale,
			value: entity.homeUrl
		}, {
			label: commonLocale.custom1Locale,
			value: entity.custom1
		}, {
			label: commonLocale.noteLocale,
			value: entity.note
		}];

		return (
			<TabPane key="basicInfo" tab={vendorLocale.title}>
				<ViewPanel items={basicItems} title={commonLocale.basicInfoLocale} />
			</TabPane>
		);
	}

	/**
   * 跳转至编辑页面
   */
	onEditBasicInfo = () => {
		const { dispatch } = this.props;
		dispatch({
			type: 'vendor/showPage',
			payload: {
				showPage: 'create',
				entityUuid: this.props.vendor.entity.uuid,
			}
		});
	}

	/**
   * 跳转至列表页面
   */
	onCancel = () => {
		this.props.dispatch({
			type: 'vendor/showPage',
			payload: {
				showPage: 'query',
        fromView: true
			}
		});
	}

}
