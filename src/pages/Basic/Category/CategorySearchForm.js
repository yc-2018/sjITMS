import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { Form, Input, Select } from 'antd';
import BasicStateSelect from '@/pages/Component/Select/BasicStateSelect';
import OwnerSelect from '@/pages/Component/Select/OwnerSelect';
import { commonLocale, placeholderLocale } from '@/utils/CommonLocale';
import { loginCompany } from '@/utils/LoginContext';
import { getSourceWayCaption, sourceWay } from '@/utils/SourceWay';
import { categoryLocale } from './CategoryLocale';
const Option = Select.Option;
const sourceWayOptions = [];
sourceWayOptions.push(<Option key='categoryAll' value=''>{commonLocale.allLocale}</Option>)
Object.keys(sourceWay).forEach(function (key) {
  sourceWayOptions.push(<Option value={sourceWay[key].name}>{sourceWay[key].caption}</Option>);
});
@Form.create()
export default class CategorySearchForm extends SearchForm {
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

  drawCols = () => {
    const { getFieldDecorator } = this.props.form;
    const { filterValue } = this.props;
    const { toggle } = this.state;
    let cols = [];
    cols.push(
      <SFormItem key="codeName" label={'类别'}>
        {getFieldDecorator('codeName', {
          initialValue: filterValue.codeName
        })(
          <Input placeholder={placeholderLocale('类别')} />
        )}
      </SFormItem>
    );
    cols.push(
      <SFormItem key="state" label={commonLocale.stateLocale}>
        {getFieldDecorator('state', { initialValue: filterValue.state ? filterValue.state : '' })(
          <BasicStateSelect />)}
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
    if (toggle) {
      cols.push(
        <SFormItem key="sourceWay" label={commonLocale.sourceWayLocale}>
          {getFieldDecorator('sourceWay',
            { initialValue: filterValue.sourceWay ? filterValue.sourceWay : '' }
          )(
            <Select>
              {sourceWayOptions}
            </Select>
          )
          }
        </SFormItem>
      );
      cols.push(
        <SFormItem key="upperCodeName" label={categoryLocale.upperCategory}>
          {getFieldDecorator('upperCodeName', {
            initialValue: filterValue.upperCodeName
          })(
            <Input placeholder={placeholderLocale(categoryLocale.upperCategory + commonLocale.nameLocale)} />
          )}
        </SFormItem>
      );
    }
    return cols;
  }
}
