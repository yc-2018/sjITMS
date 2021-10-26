import { Form, Input, Select } from 'antd';
import { connect } from 'dva';
import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import BasicStateSelect from '@/pages/Component/Select/BasicStateSelect';
import OwnerSelect from '@/pages/Component/Select/OwnerSelect';
import PreTypeSelect from '@/pages/Component/Select/PreTypeSelect';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { commonLocale, placeholderLocale } from '@/utils/CommonLocale';
import { storeLocale } from './StoreLocale';
import {PRETYPE} from '@/utils/constants';
@connect(({ store,pretype,loading }) => ({
  store,
  pretype,
  loading: loading.models.store,
}))
@Form.create()
export default class StoreSearchForm extends SearchForm {
  constructor(props) {
    super(props);
    this.state = {
      toggle: false,
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
    const { form, filterValue } = this.props;
    const { getFieldDecorator } = form;
    const { toggle,} = this.state;
    let cols = [];
    cols.push(
      <SFormItem key="codeName" label={'门店'}>
        {getFieldDecorator('codeName', {
            initialValue: filterValue ? filterValue.codeName : ''
        })(
            <Input placeholder={placeholderLocale('门店')}/>
        )}
      </SFormItem>
    );
    cols.push(
      <SFormItem key="state" label={commonLocale.stateLocale}>
        {getFieldDecorator('state',
            { initialValue: filterValue.state }
        )(
          <BasicStateSelect />)
        }
      </SFormItem>
    );
    cols.push(
      <SFormItem key="storeType" label={storeLocale.storeType}>
        {getFieldDecorator('storeType', {
            initialValue: filterValue.storeType
        })(
          <PreTypeSelect 
            hasAll
            preType={PRETYPE.store}
            orgUuid={loginOrg().type=='DC' || loginOrg().type == 'DISPATCH_CENTER'?loginCompany().uuid:loginOrg().uuid}
          />
        )}
      </SFormItem>
    );
    if (toggle) {
      cols.push(
        <SFormItem key="operatingType" label={storeLocale.operatingType}>
        {getFieldDecorator('operatingType', {
            initialValue: filterValue.operatingType
        })(
          <PreTypeSelect 
            hasAll
            preType={PRETYPE.storeOperating}
            orgUuid={(loginOrg().type=='DC' || loginOrg().type == 'DISPATCH_CENTER')?loginCompany().uuid:loginOrg().uuid}
          />
        )}
      </SFormItem>
      );
      cols.push(
        <SFormItem key="ownerUuid" label={commonLocale.inOwnerLocale}>
          {
            getFieldDecorator('owner', {
              initialValue: filterValue.owner ? JSON.stringify(filterValue.owner) : '',
            })(
              <OwnerSelect onlyOnline />)
          }
        </SFormItem>
      );
    }
    return cols;
  }
}
