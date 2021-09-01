import { Form, Input, Select } from 'antd';
import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { commonLocale, placeholderLocale } from '@/utils/CommonLocale';
import { dockLocale,DockState } from './DockLocale';
import { formatMessage } from 'umi/locale';
const Option = Select.Option;
const stateOptions = [];
stateOptions.push(<Option key='dockStateAll' value=''>{formatMessage({ id: 'dock.state.all' })}</Option>);
stateOptions.push(<Option key="FREE" value="FREE">{formatMessage({ id: 'dock.state.free' })}</Option>);
stateOptions.push(<Option key="USING" value="USING">{formatMessage({ id: 'dock.state.using' })}</Option>);
stateOptions.push(<Option key="DISENABLED" value="DISENABLED">{formatMessage({ id: 'dock.state.disenabled' })}</Option>);
stateOptions.push(<Option key="ASSIGNED" value="ASSIGNED">{formatMessage({ id: 'dock.state.assinged' })}</Option>);
@Form.create()
export default class DockSearchForm extends SearchForm {
  constructor(props) {
    super(props);
  }
  drawCols = () => {
    const { getFieldDecorator } = this.props.form;
    const { filterEqualsValue,filterLikeValue } = this.props;
    let cols = [
      <SFormItem key="codeNameLike" label={commonLocale.dockNameLocale}>
        {getFieldDecorator('codeNameLike', {
          initialValue: filterLikeValue.codeNameLike
        })(
          <Input placeholder={placeholderLocale(commonLocale.codeAndNameLocale)} />
        )}
      </SFormItem>,
      <SFormItem key="stateEquals" label={commonLocale.stateLocale}>
        {getFieldDecorator('stateEquals', {
          initialValue: filterEqualsValue.stateEquals?filterEqualsValue.stateEquals:''
        })(
          <Select>
            {stateOptions}
          </Select>
        )}
      </SFormItem>
    ];
    return cols;
  }
}
