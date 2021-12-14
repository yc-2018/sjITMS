import { Form, Input, Select } from 'antd';
import { connect } from 'dva';
import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import BasicStateSelect from '@/pages/Component/Select/BasicStateSelect';
import OwnerSelect from '@/pages/Component/Select/OwnerSelect';
import PreTypeSelect from '@/pages/Component/Select/PreTypeSelect';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { commonLocale, notNullLocale, placeholderChooseLocale, placeholderLocale } from '@/utils/CommonLocale';
import { zzLocale } from '../../Test/Zz/ZzLocale';
import {PRETYPE} from '@/utils/constants';
import CFormItem from '@/pages/Component/Form/CFormItem';
import { userLocale } from '@/pages/Account/User/UserLocale';
import OrgSelect from '@/pages/Component/Select/OrgSelect';
import { basicState } from '@/utils/BasicState';
import OrgConfigSelect from '@/pages/Component/Select/OrgConfigSelect';
import { getOrgCaption, orgType } from '@/utils/OrgType';
import OwnerConfigSelect from '@/pages/Component/Select/OwnerConfigSelect';
@connect(({ batchNumberConfig,pretype,loading }) => ({
  batchNumberConfig,
  pretype,
  loading: loading.models.batchNumberConfig,
}))
@Form.create()
export default class BatchNumberConfigForm extends SearchForm {
  constructor(props) {
    super(props);
    this.state = {
      orgTypes: [],
      disabled:false,
    //   toggle: false,
    }
  }

  onReset = () => {
    this.props.refresh();
  }

  onSearch = (data) => {
    data.owner = data.owner ? JSON.parse(data.owner) : undefined;
    data.ownerUuid = data.owner ? data.owner.uuid : undefined;
    this.props.refresh(data);
  }
  /**
   * 绘制列
   */
  drawCols = () => {

    const customOptions = [];
    const {orgTypes} = this.state;
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
    const { form, filterValue } = this.props;
    const { getFieldDecorator } = form;
    const { toggle,} = this.state;
    let cols = [];
    cols.push(
      /*loginOrg().type === 'COMPANY' &&*/ <CFormItem key='orgUuids' label={userLocale.orgs} labelSpan={4} span={11} >
        {
          getFieldDecorator('dcuuid', {
          /*  rules: [
              { required: true, message: notNullLocale(userLocale.orgs) },
            ],*/
            initialValue:"" /*entity ? orgInitialValues : []*/,
          })(
            <OrgConfigSelect
              types={this.state.orgTypes ? this.state.orgTypes : []}
              upperUuid={loginOrg().uuid}
              customOptions={customOptions}
              state={basicState.ONLINE.name}
              disabled={this.state.disabled}
              forItemTable={false}
              placeholder={placeholderChooseLocale(userLocale.userType)}
            />
            // <Select
            //   showSearch
            //   style={{ width: 200 }}
            //   placeholder="Select a person"
            //   optionFilterProp="children"
            //   onChange={this.onChange}
            //   onFocus={this.onFocus}
            //   onBlur={this.onBlur}
            //   onSearch={this.onSearch}
            //   filterOption={(input, option) =>
            //     option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            //   }
            // >
            //   <Option value="jack">Jack</Option>
            //   <Option value="lucy">Lucy</Option>
            //   <Option value="tom">Tom</Option>
            // </Select>
          )
        }
      </CFormItem>)
    cols.push(
      <CFormItem key='ownercode' label="货主" labelSpan={5} span={8}>
        {
          getFieldDecorator('ownercode', {
            initialValue: ""/*entity ? (entity.owner ? JSON.stringify(entity.owner) : undefined) : null*/,
            /*rules: [
              { required: true, message: notNullLocale(commonLocale.inOwnerLocale) }
            ],*/
          })(
            <OwnerConfigSelect /*onChange={this.handlechangeOwner}*/ onlyOnline placeholder={placeholderChooseLocale(commonLocale.inOwnerLocale)} />
          )
        }
      </CFormItem>,
    );
    /*cols.push(
        <SFormItem key="sex" label={'性别'}>
          {getFieldDecorator('sex',
              { initialValue:'' }
          )(
            <PreTypeSelect
            hasAll
            preType={PRETYPE.zztest}
            orgUuid={loginOrg().type=='DC' || loginOrg().type == 'DISPATCH_CENTER'?loginCompany().uuid:loginOrg().uuid}
          />)
          }
        </SFormItem>
      );*/

    return cols;
  }
}
