import { Form, Input, Select } from 'antd';
import { connect } from 'dva';
import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import OrgSelect from '@/pages/Component/Select/OrgSelect';
import { loginOrg } from '@/utils/LoginContext';
import { commonLocale, placeholderLocale,placeholderChooseLocale } from '@/utils/CommonLocale';
import { userLocale } from './UserLocale';
import { orgType } from '@/utils/OrgType';

@connect(({ user,loading }) => ({
  user,
  loading: loading.models.user,
}))
@Form.create()
export default class UserSearchForm extends SearchForm {
  constructor(props) {
    super(props);
    this.state = {
      orgs:[]
    }
  }

  onReset = () => {
    this.props.refresh();
  }

  onSearch = (data) => {
    if (data.org) {
      let orgUuids = [];
      data.org.forEach(function(e) {
        orgUuids.push(JSON.parse(e).uuid);
      })
      data['orgUuid'] = orgUuids;
      delete data.org;
    }
    this.props.refresh(data);
  }

  /**
   * 绘制列
   */
  drawCols = () => {
    const { form, filterValue } = this.props;
    const { getFieldDecorator } = form;
    let cols = [];
    cols.push(
      <SFormItem key="codeName" label={'用户'}>
        {getFieldDecorator('codeName', {
          initialValue: filterValue ? filterValue.codeName : ''
        })(
          <Input placeholder={placeholderLocale('用户')}/>
        )}
      </SFormItem>
    );
    cols.push(
      <SFormItem key="phone" label={userLocale.phone}>
        {getFieldDecorator('phone',
          { initialValue:filterValue ? filterValue.phone : '' }
        )(
          <Input placeholder={placeholderLocale(userLocale.phone)}/>
        )}
      </SFormItem>
    );
    loginOrg().type === orgType.company.name && cols.push(
      <SFormItem key="org" label={userLocale.orgs}>
        {getFieldDecorator('org')(
            <OrgSelect
              showSearch
              upperUuid={loginOrg().uuid}
              mode = "multiple"
              placeholder={placeholderChooseLocale(userLocale.orgs)}
            />
        )}
      </SFormItem>
    );
    return cols;
  }
}
