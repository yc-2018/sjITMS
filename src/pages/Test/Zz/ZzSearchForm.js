import { Form, Input, Select } from 'antd';
import { connect } from 'dva';
import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import BasicStateSelect from '@/pages/Component/Select/BasicStateSelect';
import OwnerSelect from '@/pages/Component/Select/OwnerSelect';
import PreTypeSelect from '@/pages/Component/Select/PreTypeSelect';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { commonLocale, placeholderLocale } from '@/utils/CommonLocale';
import { zzLocale } from './ZzLocale';
import {PRETYPE} from '@/utils/constants';
@connect(({ zztest,pretype,loading }) => ({
  zztest,
  pretype,
  loading: loading.models.zztest,
}))
@Form.create()
export default class ZzSearchForm extends SearchForm {
  constructor(props) {
    super(props);
    this.state = {
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
    const { form, filterValue } = this.props;
    const { getFieldDecorator } = form;
    const { toggle,} = this.state;
    let cols = [];
    cols.push(
      <SFormItem key="name" label={'员工姓名'}>
        {getFieldDecorator('name', {
            initialValue: filterValue ? filterValue.name : ''
        })(
            <Input placeholder={placeholderLocale('员工姓名')}/>
        )}
      </SFormItem>
    );
    cols.push(
        <SFormItem key="sex" label={'性别'}>
          {getFieldDecorator('sex',
              { initialValue:'' }
          )(
            <Select >
              <Option value="男">男</Option>
              <Option value="女">女</Option>
            </Select>)
          }
        </SFormItem>
      );
    return cols;
  }
}
