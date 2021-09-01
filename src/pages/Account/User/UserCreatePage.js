import { connect } from 'dva';
import CreatePage from '@/pages/Component/Page/CreatePage';
import FormPanel from '@/pages/Component/Form/FormPanel';
import CFormItem from '@/pages/Component/Form/CFormItem';
import { Form, Tabs, Select, Input, message } from 'antd';
import {
  commonLocale,
  notNullLocale,
  tooLongLocale,
  placeholderLocale,
  placeholderChooseLocale
} from '@/utils/CommonLocale';
import { codePattern } from '@/utils/PatternContants';
import { userLocale } from './UserLocale';
import { loginCompany, loginOrg, loginUser } from '@/utils/LoginContext';
import { arrConcat, arrDiff, convertCodeName } from '@/utils/utils';
import AuthorizeCom from '@/pages/Component/Authorize/AuthorizeCom';
import RoleSelect from '@/pages/Component/Select/RoleSelect';
import OrgSelect from '@/pages/Component/Select/OrgSelect';
import { basicState } from '@/utils/BasicState';
import { orgType, getOrgCaption } from '@/utils/OrgType';
import { formatMessage, FormattedMessage } from 'umi/locale';
import { func } from 'prop-types';
import styles from '@/pages/Account/Role/role.less';
import RolePermissionInfo from '@/pages/Account/Role/RolePermissionInfo';

const TabPane = Tabs.TabPane;
@connect(({ user, loading }) => ({
  user,
  loading: loading.models.user,
}))
@Form.create()
export default class UserCreatePage extends CreatePage {
  constructor(props) {
    super(props);

    this.state = {
      noNote: true,
      title: commonLocale.createLocale + userLocale.title,
      orgs: [],
      roles: [],
      originalRoles: [],
      originalOrgs: [],

      checkedResources: [],
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

      tempRoleResourceMap: new Map(),
      dcTempRoleResourceMap: new Map(),
      storeTempRoleResourceMap: new Map(),
      vendorTempRoleResourceMap: new Map(),
      carrierTempRoleResourceMap: new Map(),
      dispatchCenterTempRoleResourceMap: new Map(),

      entity: {
        companyUuid: loginCompany().uuid
      },
      orgTypes: [],
      orgTypeRoles: [],
      disabled: true
    }
  }

  componentDidMount() {
    this.fetchAuthorizeData();
    this.fetchUserByUuid();
  }

  componentWillReceiveProps(nextProps) {
      if (nextProps.user.entity && this.props.user.entityUuid&&nextProps.user.entity.uuid==this.props.user.entityUuid) {
      this.setState({
        entity: nextProps.user.entity,
        title: convertCodeName(nextProps.user.entity)
      });
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
  fetchUserByUuid = () => {
    const { dispatch } = this.props;
    const { tempRoleResourceMap, dcTempRoleResourceMap, storeTempRoleResourceMap,
      vendorTempRoleResourceMap, carrierTempRoleResourceMap,dispatchCenterTempRoleResourceMap } = this.state;
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
              // let resources = response.data.resources;
              // this.setState({
              //   checkedResources: resources ? resources : [],
              // })

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
                  // if (item.orgUuid === loginOrg().uuid) {
                  //   let res = item.resources;
                  //   if (!Array.isArray(res)) {
                  //     res = [];
                  //   }
                  //   tempRoleResourceMap.set(item.uuid, res);
                  // }
                  this.fetchRoleResources(item);
                  // this.handleSelcetRoleChange(JSON.stringify(item))
                })
              }
            }
          }
        }
      });
    }
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

  arrangeData = (data) => {
    let { originalRoles, originalOrgs } = this.state;
    let user = {
      ...this.state.entity,
      ...data
    };
    if(user.phone==undefined||user.phone==''||user.phone==null){
      user.phone = user.code
    }

    // 保存角色
    const roleUuids = []
    data.roleUuids.map(item => {
      roleUuids.push((eval('(' + item + ')')).uuid)
    })

    const orgUuids = [];
    // 非企业登录，记录下原来的组织
    if (loginOrg().type !== orgType.company.name) {
      originalOrgs.map(item => {
        orgUuids.push(item.orgUuid);
      })
      // 判断当前组织是否存在，不存在，则加上
      if (orgUuids.indexOf(loginOrg().uuid) === -1) {
        orgUuids.push(loginOrg().uuid);
      }
    } else {
      // 企业用户，保存form中的数据
      data.orgUuids.forEach(function (e) {
        orgUuids.push(JSON.parse(e).uuid);
      });
    }

    user.roleUuids = roleUuids;
    user.orgUuids = orgUuids;
    delete user.resources;
    user.currentOrgId = loginOrg().uuid;
    return user;
  }

  /**
   * 保存
   */
  onSave = (data) => {
    let user = this.arrangeData(data);

    if (!user.uuid) {
      this.props.dispatch({
        type: 'user/onSave',
        payload: user,
        callback: (response) => {
          if (response && response.success) {
            message.success(commonLocale.saveSuccessLocale);
          }
        }
      });
    } else {
      this.props.dispatch({
        type: 'user/onModify',
        payload: user,
        callback: (response) => {
          if (response && response.success) {
            message.success(commonLocale.modifySuccessLocale);
          }
        }
      });
    }
  }

  /**
   * 保存并新建
   */
  onSaveAndCreate = (data) => {
    let user = this.arrangeData(data);

    this.props.dispatch({
      type: 'user/onSaveAndCreate',
      payload: user,
      callback: (response) => {
        if (response && response.success) {
          message.success(commonLocale.saveSuccessLocale);
          this.props.form.resetFields();
          this.setState({
            checkedResources: [],
          })
        }
      }
    });
  }

  /**
   * 选择角色
   */
  handleSelcetRoleChange = (value) => {
    if (value.length != 0) {
      const role = eval('(' + value + ')');
      const roleList = []
      roleList.push(role);
      if (roleList.length != 0) {
        roleList.map((item) => {
          this.fetchRoleResources(item);
        });
      }
    }
  }

  /**
   * 取消选择
   */
  handleDeSelectRole = (value) => {
    const role = eval('(' + value + ')');
    this.setDeSelectRoleResources(role);
  }

  /**
   * 取消选中角色对应的资源
   */
  setDeSelectRoleResources = (role) => {
    const { orgTypeRoles, orgTypes } = this.state;
    if (role.uuid) {
      const {
        checkedResourceKeys, dcCheckedResourceKeys, storeCheckedResourceKeys,
        vendorCheckedResourceKeys, carrierCheckedResourceKeys,dispatchCenterCheckedResourceKeys,
        tempRoleResourceMap, dcTempRoleResourceMap, vendorTempRoleResourceMap,
        carrierTempRoleResourceMap, storeTempRoleResourceMap,dispatchCenterTempRoleResourceMap
      } = this.state;

      let checks = this.deleteRoleResource(tempRoleResourceMap, checkedResourceKeys, role);
      let dcChecks = this.deleteRoleResource(tempRoleResourceMap, checkedResourceKeys, role);
      let storeChecks = this.deleteRoleResource(tempRoleResourceMap, checkedResourceKeys, role);
      let vendorChekcs = this.deleteRoleResource(tempRoleResourceMap, checkedResourceKeys, role);
      let carrierChecks = this.deleteRoleResource(tempRoleResourceMap, checkedResourceKeys, role);
      let dispatchCenterChecks = this.deleteRoleResource(tempRoleResourceMap, checkedResourceKeys, role);
      this.setState({
        checkedResourceKeys: checks ? checks : [],
        dcCheckedResourceKeys: dcChecks ? dcChecks : [],
        storeCheckedResourceKeys: storeChecks ? storeChecks : [],
        vendorCheckedResourceKeys: vendorChekcs ? vendorChekcs : [],
        carrierCheckedResourceKeys: carrierChecks ? carrierChecks : [],
        dispatchCenterCheckedResourceKeys: dispatchCenterChecks ? dispatchCenterChecks : []
      })


      // 去除该角色特有的组织类型
      delete orgTypeRoles[role.uuid];

      let orgs = [];
      for (let key of Object.keys(orgTypeRoles)) {
        let value = orgTypeRoles[key];
        Array.isArray(value) && value.forEach(function (v) {
          if (orgs.indexOf(v) === -1) {
            orgs.push(v);
          }
        });
      }

      this.setState({
        orgTypes: orgs,
        disabled: orgs.length > 0 == false
      })
    }
  }

  deleteRoleResource = (resourceMap, checkedResourceKeys, role) => {
    if (!resourceMap || !checkedResourceKeys || !role)
      return undefined;
    let currentSelectedRoleResources = resourceMap.get(role.uuid);
    let usefulRoleResources = [];
    // 检测当前的角色资源
    resourceMap.forEach(function (value, key, mapObj) {
      if (Array.isArray(value) && key != role.uuid) {
        for (let j = 0; j < currentSelectedRoleResources.length; j++) {
          // 收集当前要取消的角色资源与其他选择的角色共有的部分
          if (usefulRoleResources.indexOf(currentSelectedRoleResources[j]) === -1) {
            if (value.indexOf(currentSelectedRoleResources[j]) >= 0) {
              usefulRoleResources.push(currentSelectedRoleResources[j]);
            }
          }
        }
      }
    });

    // 将这个角色独有的资源从已选择的资源中去掉
    let uselessRes = arrDiff(currentSelectedRoleResources, usefulRoleResources);
    if (uselessRes.length > 0) {
      for (let k = 0; k < uselessRes.length; k++) {
        let index = checkedResourceKeys.indexOf(uselessRes[k]);
        if (index >= 0) {
          checkedResourceKeys.splice(index, 1);
        }
      }
    }

    return checkedResourceKeys;
  }

  /**
   * 获取角色资源
   */
  fetchRoleResources = (role) => {
    const { orgTypes, orgTypeRoles } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'role/getResources',
      payload: role.uuid,
      callback: response => {
        if (response && response.success) {
          let result = response.data;
          const {
            checkedResourceKeys, dcCheckedResourceKeys, storeCheckedResourceKeys,
            vendorCheckedResourceKeys, carrierCheckedResourceKeys,dispatchCenterCheckedResourceKeys,
            tempRoleResourceMap, dcTempRoleResourceMap, vendorTempRoleResourceMap,
            carrierTempRoleResourceMap, storeTempRoleResourceMap,dispatchCenterTempRoleResourceMap
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

          // 暂存角色资源
          tempRoleResourceMap.set(role.uuid, resource);
          dcTempRoleResourceMap.set(role.uuid, dcResource);
          storeTempRoleResourceMap.set(role.uuid, storeResource);
          vendorTempRoleResourceMap.set(role.uuid, vendorResource);
          carrierTempRoleResourceMap.set(role.uuid, carrierResource);
          dispatchCenterTempRoleResourceMap.set(role.uuid, dispatchCenterResource);


          if (result && !orgTypeRoles[role.uuid]) {
            orgTypeRoles[role.uuid] = Object.keys(result);
          }

          let orgs = [];
          for (let key of Object.keys(orgTypeRoles)) {
            let value = orgTypeRoles[key];
            Array.isArray(value) && value.forEach(function (v) {
              if (orgs.indexOf(v) === -1) {
                orgs.push(v);
              }
            });
          }

          this.setState({
            orgTypes: orgs,
            disabled: orgs.length > 0 == false,
            orgTypeRoles: orgTypeRoles,
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

  /**
   * 绘制表单
   */
  drawFormItems = () => {
    const { getFieldDecorator } = this.props.form;
    const { entity, orgs, roles, orgTypes } = this.state;

    // 渲染组织列表
    let orgItems = [];

    let orgInitialValues = [];
    let roleInitialValues = [];

    if (entity && entity.orgs) {
      entity.orgs.map(value => {
        orgInitialValues.push(JSON.stringify({
          uuid: value.orgUuid,
          code: value.orgCode,
          name: value.orgName,
          type: value.orgType
        }));
      });
    }

    const customOptions = [];
    if (orgTypes.indexOf(orgType.company.name) !== -1) {
      customOptions.push({
        key: JSON.stringify({
          uuid: loginOrg().uuid,
          code: loginOrg().code,
          name: loginOrg().name,
          type: loginOrg().type
        }),
        caption: '[' + loginOrg().code + ']' + loginOrg().name + " " + getOrgCaption(loginOrg().type)
      })
    }

    if (entity && entity.roles) {
      entity.roles.map(value => {
        if (value.orgUuid === loginOrg().uuid) {
          roleInitialValues.push(JSON.stringify({
            uuid: value.uuid,
            code: value.code,
            name: value.name
          }));
        }
      });
    }

    let cols = [
      <CFormItem key='code' label={commonLocale.codeLocale}>
        {
          getFieldDecorator('code', {
            initialValue: entity.code,
            rules: [
              { required: true, message: notNullLocale(commonLocale.codeLocale) },
              { pattern: codePattern.pattern, message: codePattern.message }
            ],
          })(
            <Input placeholder={placeholderLocale(commonLocale.codeLocale)} />
          )
        }
      </CFormItem>,
      <CFormItem key='workId' label={userLocale.workId}>
      {
        getFieldDecorator('workId', {
          initialValue: entity.workId,
          // rules: [
          //   { required: true, message: notNullLocale(commonLocale.codeLocale) },
          //   { pattern: codePattern.pattern, message: codePattern.message }
          // ],
        })(
          <Input placeholder={placeholderLocale(userLocale.workId)} />
        )
      }
    </CFormItem>,
      <CFormItem key='name' label={commonLocale.nameLocale}>
        {
          getFieldDecorator('name', {
            initialValue: entity.name,
            rules: [{ required: true, message: notNullLocale(commonLocale.nameLocale) }, {
              max: 30, message: tooLongLocale(commonLocale.nameLocale, 30),
            }],
          })(
            <Input placeholder={placeholderLocale(commonLocale.nameLocale)} />
          )
        }
      </CFormItem>,
      <CFormItem key='phone' label={userLocale.phone}>
        {
          getFieldDecorator('phone', {
            rules: [
              { pattern: userLocale.phonePattern, message: userLocale.phonePatternMessage },
            ],
            initialValue: entity.phone,
          })(<Input placeholder={placeholderLocale(userLocale.phone)} />)
        }
      </CFormItem>,
      <CFormItem key='roleUuids' label={userLocale.roles}>
        {
          getFieldDecorator('roleUuids', {
            rules: [
              { required: true, message: notNullLocale(userLocale.roles) },
            ],
            initialValue: entity ? roleInitialValues : [],
          })(
            <RoleSelect placeholder={placeholderChooseLocale(userLocale.roles)}
              mode='multiple'
              onChange={this.handleSelcetRoleChange}
              onDeselect={this.handleDeSelectRole}
            />
          )
        }
      </CFormItem>,
      loginOrg().type === 'COMPANY' && <CFormItem key='orgUuids' label={userLocale.orgs} labelSpan={4} span={12} >
        {
          getFieldDecorator('orgUuids', {
            rules: [
              { required: true, message: notNullLocale(userLocale.orgs) },
            ],
            initialValue: entity ? orgInitialValues : [],
          })(
            <OrgSelect
              mode="multiple"
              types={this.state.orgTypes ? this.state.orgTypes : []}
              upperUuid={loginOrg().uuid}
              customOptions={customOptions}
              state={basicState.ONLINE.name}
              disabled={this.state.disabled}
              forItemTable={false}
              placeholder={placeholderChooseLocale(userLocale.userType)}
            />
          )
        }
      </CFormItem>,
    ];

    return [
      <FormPanel key='basicInfo' title={commonLocale.basicInfoLocale} cols={cols} />,
      <FormPanel key='resourcesInfo' title={userLocale.resourcesInfo}
        cols={[
          <Tabs className={styles.tabsWrapper} defaultActiveKey="1">
            {this.drawTabPanes()}
          </Tabs>
        ]}
      />,
    ];
  }

  drawTabPanes = () => {
    const { dcResourceTree, resourceTree, storeResourceTree,
      vendorResourceTree, carrierResourceTree,dispatchCenterResourceTree } = this.state;
    let height= "calc(100vh - 420px)";
    const tabPanes = [];
    let i = 1;
    if (resourceTree && resourceTree.length > 0) {
      tabPanes.push(
        <TabPane tab={userLocale.tabPermissionInfoTitle} key={i}>
          <RolePermissionInfo data={resourceTree} checkedKeys={this.state.checkedResourceKeys} height={height}
            handleAuthorize={this.handleAuthorize} loading={this.props.loading}
            disable={true} orgType={orgType.company.name}
          />
        </TabPane>
      )
      i = i + 1;
    }
    if (dcResourceTree && dcResourceTree.length > 0) {
      tabPanes.push(
        <TabPane tab={userLocale.dcTabPermissionInfoTitle} key={i}>
          <RolePermissionInfo data={dcResourceTree} checkedKeys={this.state.dcCheckedResourceKeys}
            disable={true} height={height} handleAuthorize={this.handleAuthorize} loading={this.props.loading} orgType={orgType.dc.name} />
        </TabPane>
      )
      i = i + 1;
    }

    if (dispatchCenterResourceTree && dispatchCenterResourceTree.length > 0) {
      tabPanes.push(
        <TabPane tab={userLocale.dispatchCenterTabPermissionInfoTitle} key={i}>
          <RolePermissionInfo data={dispatchCenterResourceTree} checkedKeys={this.state.dispatchCenterCheckedResourceKeys}
            disable={true} height={height} handleAuthorize={this.handleAuthorize} loading={this.props.loading} orgType={orgType.dispatchCenter.name} />
        </TabPane>
      )
      i = i + 1;
    }

    if (storeResourceTree && storeResourceTree.length > 0) {
      tabPanes.push(
        <TabPane tab={userLocale.storeTabPermissionInfoTitle} key={i}>
          <RolePermissionInfo data={storeResourceTree} checkedKeys={this.state.storeCheckedResourceKeys}
            disable={true} height={height} handleAuthorize={this.handleAuthorize} loading={this.props.loading} orgType={orgType.store.name} />
        </TabPane>
      )
      i = i + 1;
    }
    if (vendorResourceTree && vendorResourceTree.length > 0) {
      tabPanes.push(
        <TabPane tab={userLocale.vendorTabPermissionInfoTitle} key={i}>
          <RolePermissionInfo data={vendorResourceTree} checkedKeys={this.state.vendorCheckedResourceKeys}
            disable={true} height={height} handleAuthorize={this.handleAuthorize} loading={this.props.loading} orgType={orgType.vendor.name} />
        </TabPane>
      )
      i = i + 1;
    }
    if (carrierResourceTree && carrierResourceTree.length > 0) {
      tabPanes.push(
        <TabPane tab={userLocale.carrirTabPermissionInfoTitle} key={i}>
          <RolePermissionInfo data={carrierResourceTree} checkedKeys={this.state.carrierCheckedResourceKeys}
            disable={true} height={height} handleAuthorize={this.handleAuthorize} loading={this.props.loading} orgType={orgType.carrier.name} />
        </TabPane>
      )
      i = i + 1;
    }
    return tabPanes;
  }
}
