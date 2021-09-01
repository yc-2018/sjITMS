import { connect } from 'dva';
import ViewPage from '../../Component/Page/ViewPage';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import { Tabs, message, Button, Spin } from 'antd';
import {commonLocale} from '@/utils/CommonLocale';
import { codePattern } from '@/utils/PatternContants';
import { userLocale } from './UserLocale';
import { loginCompany, loginOrg, loginUser } from '@/utils/LoginContext';
import { arrConcat, arrDiff, convertCodeName } from '@/utils/utils';
import AuthorizeCom from '@/pages/Component/Authorize/AuthorizeCom';
import { basicState } from '@/utils/BasicState';
import { orgType } from '@/utils/OrgType';
import { formatMessage, FormattedMessage } from 'umi/locale';
import RolePermissionInfo from '@/pages/Account/Role/RolePermissionInfo';
import { Fragment } from 'react';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import Empty from '@/pages/Component/Form/Empty';
import { USER_RES } from './UserPermission';
import { havePermission } from '@/utils/authority';
import ConfirmModal from '@/pages/Component/Modal/ConfirmModal';
import { articleLocale } from '@/pages/Basic/Article/ArticleLocale';
import LoadingIcon from '@/pages/Component/Loading/LoadingIcon';
import ArticleBusinessForm from '@/pages/Basic/Article/ArticleBusinessForm';
import WorkTypeForm from '@/pages/Account/User/WorkTypeForm';
import { WorkType } from '@/pages/Account/User/WorkTypeConstants';
import ViewTabPanel from '@/pages/Component/Page/inner/ViewTabPanel';
const TabPane = Tabs.TabPane;
@connect(({ user, workType, loading, workTypeLoading }) => ({
  user, workType,
  loading: loading.models.user,
  workTypeLoading: loading.models.workType
}))
export default class UserViewPage extends ViewPage {
  constructor(props) {
    super(props);
    this.state = {
      entityUuid: props.entityUuid,
      entityCode: props.entityCode,
      title: commonLocale.viewLocale + userLocale.title,
      originalRoles: [],
      originalOrgs: [],

      checkedResourceKeys: [],
      storeCheckedResourceKeys: [],
      vendorCheckedResourceKeys: [],
      carrierCheckedResourceKeys: [],
      dcCheckedResourceKeys: [],
      dispatchCenterCheckedResourceKeys: [],

      resourceTree: [],
      storeResourceTree: [],
      vendorResourceTree: [],
      carrierResourceTree: [],
      dcResourceTree: [],
      dispatchCenterResourceTree: [],

      entity: {
        companyUuid: loginCompany().uuid
      },

      operate: '',
      modalVisible: false,
      showWorkTypeEditor: false,
      workType: {},
    }
  }

  componentDidMount() {
    this.fetchAuthorizeData();
    this.refresh(this.state.entityCode, this.state.entityUuid);
  }

  componentWillReceiveProps(nextProps) {
    let entity = nextProps.user.entity;
    if (entity && (entity.code === this.state.entityCode || entity.uuid === this.state.entityUuid)) {
      this.setState({
        entity: entity,
        title: convertCodeName(entity),
        entityUuid: entity.uuid,
        entityCode: entity.code,
        entityState: this.checkUserOrgEnable(entity.orgs) ? basicState.ONLINE.name : basicState.OFFLINE.name,
        disabledChangeState: entity.uuid == loginUser().uuid || !havePermission(USER_RES.ONLINE)
      });
    }
    const nextEntityCode = nextProps.entityCode;
    // 当本次传入的entityCode与当前状态中的code不一致时，重新查询渲染
    if (nextEntityCode && nextEntityCode !== this.state.entityCode) {
      this.setState({
        entityCode: nextEntityCode
      });
      this.refresh(nextEntityCode);
    }
  }

  /**
   * 获取全部权限信息
   */
  fetchAuthorizeData = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'user/getResourcesByUser',
      payload: loginUser().uuid,
      callback: response => {
        if (response && response.success) {
          let res;
          if (response.data) {
            res = response.data;
          } else {
            res = new Array();
          }
          this.setState({
            resourceTree: res[orgType.company.name] ? res[orgType.company.name] : [],
            dcResourceTree: res[orgType.dc.name] ? res[orgType.dc.name] : [],
            vendorResourceTree: res[orgType.vendor.name] ? res[orgType.vendor.name] : [],
            storeResourceTree: res[orgType.store.name] ? res[orgType.store.name] : [],
            carrierResourceTree: res[orgType.carrier.name] ? res[orgType.carrier.name] : [],
            dispatchCenterResourceTree: res[orgType.dispatchCenter.name] ? res[orgType.dispatchCenter.name] : [],
          });
        }
      },
    });
  }

  /**
   * 获取用户信息
   */
  refresh = (entityCode, entityUuid) => {
    const { dispatch } = this.props;
    if (!entityCode && !entityUuid) {
      entityCode = this.state.entityCode;
    }
    if (entityCode) {
      this.setState({
        checkedResourceKeys: [],
        storeCheckedResourceKeys: [],
        vendorCheckedResourceKeys: [],
        carrierCheckedResourceKeys: [],
        dcCheckedResourceKeys: [],
      });
      dispatch({
        type: 'user/getByCodeAndOrgUuid',
        payload: {
          code: entityCode,
          companyUuid: loginOrg().uuid
        },
        callback: response => {
          if (!response || !response.data || !response.data.uuid) {
            message.error(formatMessage({ id: 'app.login.user.not.exist' }));
            this.props.dispatch({
              type: 'user/showPage',
              payload: {
                showPage: 'query'
              }
            });
          } else if (response && response.success && response.data){
            let uuid = response.data.uuid;
            this.setState({
              entityCode: response.data.code,
              // entity: response.data
            });
            let orgs = response.data.orgs;
            if (Array.isArray(orgs)) {
              this.setState({
                originalOrgs: orgs,
              })
            }
            let roles = response.data.roles;
            if (Array.isArray(roles)) {
              this.setState({
                originalRoles: roles,
              })
              roles.map((item) => {
                this.fetchRoleResources(item);
              })
            }
            //取工种
            this.props.dispatch({
              type: 'workType/getByUserUuidAndDispatchCenterUuid',
              payload: uuid,
              callback: response => {
                if (response && response.success && response.data){
                  this.setState({
                    workType: response.data,
                  })
                }else if (response && response.success && !response.data) {
                  this.setState({
                    workType: [],
                  })
                }
              }
            });
          }
        }
      });
      return;
    }
    if (this.props.user.entityUuid) {
      dispatch({
        type: 'user/get',
        payload: this.props.user.entityUuid,
        callback: response => {
          if (response && response.success) {
            if (!response.data) {
              message.error(formatMessage({ id: 'app.login.user.not.exist' }));
              this.props.dispatch({
                type: 'user/showPage',
                payload: {
                  showPage: 'query'
                }
              });
            } else {
              this.setState({
                // entity: response.data,
                entityCode: response.data.code
              })
              let orgs = response.data.orgs;
              if (Array.isArray(orgs)) {
                this.setState({
                  originalOrgs: orgs,
                })
              }
              let roles = response.data.roles;
              if (Array.isArray(roles)) {
                this.setState({
                  originalRoles: roles,
                })
                roles.map((item) => {
                  this.fetchRoleResources(item);
                })
              }
              //取工种
              this.props.dispatch({
                type: 'workType/getByUserUuidAndDispatchCenterUuid',
                payload: this.props.user.entityUuid,
                callback: response => {
                  if (response && response.success && response.data){
                    this.setState({
                      workType: response.data,
                    })
                  }else if (response && response.success && !response.data) {
                    this.setState({
                      workType: [],
                    })
                  }
                }
              });
            }
          }
        }
      });
    }
  }

  /**
   * 检测用户在当前登录组织中是否启用
   */
  checkUserOrgEnable = (orgs) => {
    if (!Array.isArray(orgs)) {
      return false;
    }

    if (orgType.company.name === loginOrg().type) {
      for (let x in orgs) {
        if (orgs[x].enable)
          return true;
      }
    } else {
      for (let x in orgs) {
        if (orgs[x].orgUuid === loginOrg().uuid) {
          return orgs[x].enable;
        }
      }
    }
    return false;
  }

  /**
   * 取消
   */
  onCancel = () => {
    this.props.dispatch({
      type: 'user/showPage',
      payload: {
        showPage: 'query'
      }
    });
  }

  /**
   * 跳转至编辑页面
   */
	onEdit = () => {
		const { dispatch } = this.props;
		dispatch({
			type: 'user/showPage',
			payload: {
				showPage: 'create',
				entityUuid: this.state.entity.uuid,
			}
		});
  }

  /**
   * 单一删除
   */
  onRemove = () => {
    this.props.dispatch({
      type: 'user/remove',
      payload: {
        uuid: this.state.entity.uuid,
        version: this.state.entity.version
      },
      callback: response => {
        if (response && response.success) {
          message.success(commonLocale.removeSuccessLocale);
          this.onCancel();
        }
      }
    });
  }


  /**
   * 模态框显示/隐藏
   */
  handleModalVisible = (operate) => {
    if (operate) {
      this.setState({
        operate: operate
      })
    }
    this.setState({
      modalVisible: !this.state.modalVisible
    });
  }

  /**
   * 模态框确认操作
   */
  handleOk = () => {
    const { operate } = this.state;
    if (operate === commonLocale.deleteLocale) {
      this.onRemove();
    }
  }
  onChangeState = () => {
    const entity = this.state.entity;
    let flag=this.checkUserOrgEnable(entity.orgs);
		if (flag === true) {
			this.props.dispatch({
				type: 'user/offline',
				payload: entity,
        callback: response => {
          if (response && response.success) {
            this.refresh(this.state.entityCode, this.state.entityUuid);
            message.success(commonLocale.offlineSuccessLocale);
          }
        }
			});
		} else {
			this.props.dispatch({
				type: 'user/online',
				payload: entity,
				callback: response => {
          if (response && response.success) {
            this.refresh(this.state.entityCode, this.state.entityUuid);
            message.success(commonLocale.onlineSuccessLocale);
          }
        }
			});
		}
	}

  drawActionButtion() {
		const { entity } = this.state;
		return (
			<Fragment>
				<Button onClick={this.onCancel}>
					{commonLocale.backLocale}
				</Button>

        {entity.roles && entity.roles.length > 0 && entity.uuid != loginUser().uuid &&<Fragment>
          <Button disabled={!havePermission(USER_RES.CREATE)} type="primary" onClick={this.onEdit}>
            {commonLocale.editLocale}
          </Button>
					<Button disabled={!havePermission(USER_RES.DELETE)} type="primary" onClick={() => this.handleModalVisible(commonLocale.deleteLocale)}>
						{commonLocale.deleteLocale}
          </Button></Fragment>
				}

			</Fragment>
		);
  }

  /**
   * 获取角色资源
   */
  fetchRoleResources = (role) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'role/getResources',
      payload: role.uuid,
      callback: response => {
        if (response && response.success) {
          let result = response.data;
          const {
            checkedResourceKeys, dcCheckedResourceKeys, storeCheckedResourceKeys,
            vendorCheckedResourceKeys, carrierCheckedResourceKeys,dispatchCenterCheckedResourceKeys
          } = this.state;


          let resource = [];
          let dcResource = [];
          let storeResource = [];
          let vendorResource = [];
          let carrierResource = [];
          let dispatchCenterResource = [];

          if (result) {
            if (result[orgType.company.name])
              resource = result[orgType.company.name];
            if (result[orgType.dc.name])
              dcResource = result[orgType.dc.name];
            if (result[orgType.store.name])
              storeResource = result[orgType.store.name];
            if (result[orgType.vendor.name])
              vendorResource = result[orgType.vendor.name];
            if (result[orgType.carrier.name])
              carrierResource = result[orgType.carrier.name];
            if (result[orgType.dispatchCenter.name])
              dispatchCenterResource = result[orgType.dispatchCenter.name];
          }

          this.setState({
            checkedResourceKeys: arrConcat(checkedResourceKeys, resource),
            dcCheckedResourceKeys: arrConcat(dcCheckedResourceKeys, dcResource),
            storeCheckedResourceKeys: arrConcat(storeCheckedResourceKeys, storeResource),
            vendorCheckedResourceKeys: arrConcat(vendorCheckedResourceKeys, vendorResource),
            carrierCheckedResourceKeys: arrConcat(carrierCheckedResourceKeys, carrierResource),
            dispatchCenterCheckedResourceKeys: arrConcat(dispatchCenterCheckedResourceKeys, dispatchCenterResource),
          })
        }
      }
    })
  }

  switchWorkTypeEditorState = (show) => {
    this.setState({
      showWorkTypeEditor: show}
      )
  }

  onWorkTypeEdit = () => {
    this.switchWorkTypeEditorState(true)
  }
  drawTabPanes = () => {
		let tabPanes = [
      this.drawInfoTab()
		];

		return tabPanes;
  }

  drawInfoTab = () => {
    const { entity, showWorkTypeEditor, entityUuid, workType }= this.state;
    let orgInitialValues = [];
    let roleInitialValues = [];

    if (entity && entity.orgs) {
      entity.orgs.map(value => {
        orgInitialValues.push('[' + value.orgCode + ']' + value.orgName);
      });
    }

    if (entity && entity.roles) {
      entity.roles.map(value => {
        if (value.orgUuid === loginOrg().uuid) {
          roleInitialValues.push(convertCodeName(value));
        }
      });
    }

		let basicItems = [{
			label: commonLocale.codeLocale,
			value: entity.code
		}, {
			label: userLocale.workId,
			value: entity.workId?entity.workId:<Empty/>
		},{
			label: commonLocale.nameLocale,
			value: entity.name
		}, {
			label: userLocale.phone,
			value: entity.phone,
		}, {
			label: userLocale.roles,
			value: entity && entity.roles ? <EllipsisCol colValue={roleInitialValues.join('、')} /> : <Empty/>
    }];

    let workTypeStr = "";
    Array.isArray(workType) && workType.forEach(function(userPro){
      if (workTypeStr === "") {
        workTypeStr = WorkType[userPro.userPro].caption
      }else{
        workTypeStr = workTypeStr + "、" + WorkType[userPro.userPro].caption
      }

    })
    let workTypeCols = [{
      label: '工种',
      value: workTypeStr
    }];

    if(loginOrg().type === orgType.company.name){
      basicItems.push({
        label:userLocale.orgs,
        value:entity && entity.orgs ? <EllipsisCol colValue={orgInitialValues.join('、')} /> : <Empty/>
      });
    }

    let viewPanel = [<ViewPanel onCollapse={this.onCollapse} items={basicItems} title={userLocale.title} style={{marginTop:'3px',marginBottom:'-15px'}}/>];
        if(loginOrg().type !== orgType.dispatchCenter.name) {
          viewPanel.push(<ViewPanel style={{marginTop:'3px',marginBottom:'-15px'}} items={workTypeCols} title={'工种'} />);
        }
        if(loginOrg().type === orgType.dispatchCenter.name) {
          viewPanel.push(<ViewPanel style={{marginTop:'3px',marginBottom:'-15px'}} onEdit={!showWorkTypeEditor && this.onWorkTypeEdit}
                                    items={workTypeCols} title={'工种'} >
            {showWorkTypeEditor &&
            (
              <WorkTypeForm
                userUuid={entityUuid}
                userCode={entity.code}
                userName={entity.name}
                workTypeName={workType? workType : []}
                switchWorkTypeEditorState={this.switchWorkTypeEditorState}
                dispatch={this.props.dispatch}
                refresh={this.refresh}
              />
            )
            }
          </ViewPanel>);
        }
    if (entity && entity.roles && entity.roles.length > 0) {
      viewPanel.push(<ViewPanel style={{marginBottom:'-15px'}} children={this.drawResourcePanes()} title={userLocale.resourcesInfo} />);
    }

		return (
      <TabPane key="basicInfo" tab={userLocale.title}>
        <ViewTabPanel>
          {viewPanel}
        </ViewTabPanel>
      </TabPane>
		);
  }


  drawResourcePanes = () => {
    const { dcResourceTree, resourceTree, storeResourceTree,
      vendorResourceTree, carrierResourceTree,dispatchCenterResourceTree } = this.state;
    let height= "calc(100vh - 500px)";
    const tabPanes = [];
    let i = 1;
    return <Tabs defaultActiveKey="resource" style={{marginTop:'-15px', paddingBottom:'-20px'}}>
      {resourceTree && resourceTree.length > 0 &&
        <TabPane tab={userLocale.tabPermissionInfoTitle} key={"resourceTree"}>
          <RolePermissionInfo data={resourceTree} checkedKeys={this.state.checkedResourceKeys}
                              height={height} handleAuthorize={this.handleAuthorize} loading={this.props.loading}
            disable={true} orgType={orgType.company.name}
          />
        </TabPane>
      }
      {dcResourceTree && dcResourceTree.length > 0 &&
        <TabPane tab={userLocale.dcTabPermissionInfoTitle} key={"dcResourceTree"}>
          <RolePermissionInfo data={dcResourceTree} checkedKeys={this.state.dcCheckedResourceKeys}
            disable={true} height={height} handleAuthorize={this.handleAuthorize} loading={this.props.loading} orgType={orgType.dc.name} />
        </TabPane>
      }
      {dispatchCenterResourceTree && dispatchCenterResourceTree.length > 0 &&
        <TabPane tab={userLocale.dispatchCenterTabPermissionInfoTitle} key={"dispatchCenterResourceTree"}>
          <RolePermissionInfo data={dispatchCenterResourceTree} checkedKeys={this.state.dispatchCenterCheckedResourceKeys}
            disable={true} height={height} handleAuthorize={this.handleAuthorize} loading={this.props.loading} orgType={orgType.dispatchCenter.name} />
        </TabPane>
      }
      {storeResourceTree && storeResourceTree.length > 0 &&
        <TabPane tab={userLocale.storeTabPermissionInfoTitle} key={"storeResourceTree"}>
          <RolePermissionInfo data={storeResourceTree} checkedKeys={this.state.storeCheckedResourceKeys}
            disable={true} height={height} handleAuthorize={this.handleAuthorize} loading={this.props.loading} orgType={orgType.store.name} />
        </TabPane>
      }
      {vendorResourceTree && vendorResourceTree.length > 0 &&
        <TabPane tab={userLocale.vendorTabPermissionInfoTitle} key={"vendorResourceTree"}>
          <RolePermissionInfo data={vendorResourceTree} checkedKeys={this.state.vendorCheckedResourceKeys}
            disable={true} height={height} handleAuthorize={this.handleAuthorize} loading={this.props.loading} orgType={orgType.vendor.name} />
        </TabPane>
      }
      {carrierResourceTree && carrierResourceTree.length > 0 &&
        <TabPane tab={userLocale.carrirTabPermissionInfoTitle} key={"carrierResourceTree"}>
          <RolePermissionInfo data={carrierResourceTree} checkedKeys={this.state.carrierCheckedResourceKeys}
            disable={true} height={height} handleAuthorize={this.handleAuthorize} loading={this.props.loading} orgType={orgType.carrier.name} />
        </TabPane>
      }
    </Tabs>
  }

  drawOthers(){
    return <div>
      <ConfirmModal
        visible={this.state.modalVisible}
        operate={this.state.operate}
        object={ userLocale.title+ ':' +'['+this.state.entity.code+']'+this.state.entity.name}
        onOk={this.handleOk}
        onCancel={this.handleModalVisible}
      />
    </div>
  }
}
