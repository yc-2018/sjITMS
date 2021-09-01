import { Fragment } from 'react';
import { connect } from 'dva';
import { Button, message, Tabs } from 'antd';
import ViewPage from '../../Component/Page/ViewPage';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import { OWNER_RES } from './OwnerPermission';
import { commonLocale } from '@/utils/CommonLocale';
import { addressToStr, convertCodeName } from '@/utils/utils';
import { ownerLocale } from './OwnerLocale';
import { havePermission } from '@/utils/authority';
import { basicState } from '@/utils/BasicState';
import { loginOrg } from '@/utils/LoginContext';
import OwnerVendorTab from  './OwnerVendorTab';
import OwnerStoreTab from  './OwnerStoreTab';
const TabPane = Tabs.TabPane;
@connect(({ owner, loading }) => ({
	owner,
	loading: loading.models.owner,
}))
export default class OwnerViewPage extends ViewPage {
	constructor(props) {
		super(props);

		this.state = {
			title: '',
      ownerVendors: [],
			ownerStores: [],
      entityCode: props.owner.entityCode,
      entityUuid: props.owner.entityUuid
		}
	}

	refresh (entityCode) {
	  if(!entityCode){
	    entityCode = this.state.entityCode;
    }
	  if(entityCode){
      this.props.dispatch({
        type: 'owner/getByCode',
        payload: entityCode,
        callback: (response)=>{
          if(!response || !response.data || !response.data.uuid){
            message.error("指定的货主不存在")
            this.onCancel()
          } else {
            this.setState({
              entityCode: response.data.code,
              entity: { ...response.data }
            })
          }
        }
      });
    }else{
		  this.props.dispatch({
			  type: 'owner/get',
			  payload: this.props.owner.entityUuid
		  });
	  }
	}

	componentDidMount() {
		this.refresh(this.state.entityCode);
	}

	componentWillReceiveProps(nextProps) {
		const entity = nextProps.owner.entity;
		if(this.props.owner.entityUuid!=nextProps.owner.entityUuid){
			this.refresh(nextProps.owner.entityUuid);
		}
		if (entity) {
			// if (nextProps.owner.entityUuid&& entity.uuid !== nextProps.owner.entityUuid) {
			// 	this.refresh()
			// }

			this.setState({
				entity: entity,
				ownerStores:entity.ownerStores?entity.ownerStores:[],
				ownerVendors:entity.ownerVendors?entity.ownerVendors:[],
				title: convertCodeName(entity),
				entityState: entity.state,
				entityUuid: entity.uuid,
        entityCode: entity.code,
				disabledChangeState: loginOrg().type === 'COMPANY' && entity.def == false ? !havePermission(OWNER_RES.ONLINE) : true
			});
		}
		if(nextProps.owner.entity!=this.props.owner.entity){
			this.setState({
				entity: nextProps.owner.entity,
			})
		}
	}

	/**
   * 跳转至编辑页面
   */
	onEditBasicInfo = () => {
		const { dispatch } = this.props;
		dispatch({
			type: 'owner/showPage',
			payload: {
				showPage: 'create',
				entityUuid: this.props.owner.entity.uuid,
			}
		});
	}

	/**
   * 跳转至列表页面
   */
	onCancel = () => {
		this.props.dispatch({
			type: 'owner/showPage',
			payload: {
				showPage: 'query',
        fromView: true
			}
		});
	}

	onChangeState = () => {
		const entity = this.props.owner.entity;
		if (entity.state === basicState.ONLINE.name) {
			this.props.dispatch({
				type: 'owner/offLine',
				payload: entity,
				callback: response => {
					if (response && response.success) {
						this.refresh();
					}
				}
			});
		} else {
			this.props.dispatch({
				type: 'owner/onLine',
				payload: entity,
				callback: response => {
					if (response && response.success) {
						this.refresh();
					}
				}
			});
		}
	}


	drawActionButtion() {
		const { entity } = this.props.owner;
		return (
			<Fragment>
				<Button onClick={this.onCancel}>
					{commonLocale.backLocale}
				</Button>
				{loginOrg().type === 'COMPANY' && entity.def === false && <Button disabled={!havePermission(OWNER_RES.CREATE)} type="primary" onClick={this.onEditBasicInfo}>
					{commonLocale.editLocale}
				</Button>}
			</Fragment>
		);
	}

	/**
	 * 绘制基本信息
	 */
	drawBasicInfoTab = () => {
		const entity = this.props.owner.entity;
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
			label: commonLocale.homeUrlLocale,
			value: entity.homePage
		}, {
      label: commonLocale.noteLocale,
      value: entity.note
    }];

		return (
			<TabPane key="basicInfo" tab={ownerLocale.title}>
				<ViewPanel items={basicItems} title={commonLocale.basicInfoLocale} />
			</TabPane>
		);
	}


	/**
	 * 绘制货主门店对应关系
	 */
	drawStoreInfoTab = ()=>{
		return (
      <TabPane key="store" tab={'门店关系'}>
        <div style={{marginTop:'-20px'}}>
          <OwnerStoreTab
            data={this.state.ownerStores}
            owner={this.props.owner.entity}
            entity={this.state.entity}
            dispatch={this.props.dispatch}
            refresh={this.refresh}
          />
        </div>
      </TabPane>
    );
	}

	/**
	 * 绘制货主供应商对应关系
	 */
	drawVendorInfoTab = ()=>{
		return (
      <TabPane key="vendor" tab={'供应商关系'}>
        <div style={{marginTop:'-20px'}}>
          <OwnerVendorTab
            data={this.state.ownerVendors}
            owner={this.props.owner.entity}
            entity={this.state.entity}
            dispatch={this.props.dispatch}
            refresh={this.refresh}
          />
        </div>
      </TabPane>
    );
	}

	drawTabPanes = () => {
		let tabPanes = [
			this.drawBasicInfoTab(),
      this.drawStoreInfoTab(),
      this.drawVendorInfoTab(),
		];

		return tabPanes;
	}
}
