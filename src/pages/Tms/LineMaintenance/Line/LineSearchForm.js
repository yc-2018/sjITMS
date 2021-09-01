import { Form, Input, Select, DatePicker } from 'antd';
import { connect } from 'dva';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { loginCompany,loginOrg } from '@/utils/LoginContext';
import { commonLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import SearchForm from '../SearchForm';
import { STATE } from '@/utils/constants';
import { orgType } from '@/utils/OrgType';
import TeamSelect from '@/pages/Component/Select/TeamSelect';
@connect(({ order, loading }) => ({
  order,
  loading: loading.models.order,
}))
@Form.create()
export default class LineSearchForm extends SearchForm {
  constructor(props) {
    super(props);
    this.state = {
      showColCount:3
    }
  }
  onReset = () => {
    this.props.refresh();
  }
  onSearch = (data) => {
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
      <SFormItem key="serialArchLineCodeName" label={'线路'}>
        {getFieldDecorator('serialArchLineCodeName', {
          initialValue: filterValue.serialArchLineCodeName ? filterValue.serialArchLineCodeName : ''
        })(
          <Input placeholder={placeholderLocale('线路')} />
        )}
      </SFormItem>,
    );
    cols.push(
      <SFormItem  key="classGroupCodeName1" label={'班组'}>
        {getFieldDecorator('classGroupCodeName1', {
          initialValue: filterValue.classGroupCodeName1 ? filterValue.classGroupCodeName1 : ''
        })(
          <Input placeholder={placeholderLocale('班组')} />
        )}
      </SFormItem>
    );
    return cols;
  }
}
