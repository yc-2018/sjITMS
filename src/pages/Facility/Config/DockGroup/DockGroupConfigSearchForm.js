import SearchForm from '@/pages/Component/Form/SearchForm';
import { Form, Input, Select, Col } from 'antd';
import { commonLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { dockGroupConfigLocale } from './DockGroupConfigLocale';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { LogisticMode } from './DockGroupContants';
import ConfigSearchForm from '@/pages/Component/Form/ConfigSearchForm';
import { packageVirtualArticleConfigLocale } from '@/pages/Facility/Config/VirtualArticleConfig/VirtualArticleConfigLocale';
import OwnerSelect from '@/pages/Component/Select/OwnerSelect';

const FormItem = Form.Item;
const logisticModeOptions = [];
Object.keys(LogisticMode).forEach(function (key) {
  logisticModeOptions.push(<Select.Option key={LogisticMode[key].name} value={LogisticMode[key].name}>{LogisticMode[key].caption}</Select.Option>);
});

@Form.create()
export default class DockGroupConfigSearchForm extends ConfigSearchForm {

  onReset = () => {
    this.props.reset();
  }

  onSearch = (data) => {
    this.props.refresh(data);
  }

  drawCols = () => {
    const { getFieldDecorator } = this.props.form;
    const { filterValue } = this.props;

    return [
      <SFormItem label={dockGroupConfigLocale.dockGroup}>
        {getFieldDecorator('dockGroupCodeName', {
          initialValue: filterValue.dockGroupCodeName ? filterValue.dockGroupCodeName : '',
        })(
          <Input placeholder={placeholderLocale(commonLocale.codeAndNameLocale)} />
        )}
      </SFormItem>,


      <SFormItem label={dockGroupConfigLocale.pickarea}>
        {getFieldDecorator('pickareaCodeName', {
          initialValue: filterValue.pickareaCodeName
        })(
          <Input placeholder={placeholderLocale(commonLocale.codeAndNameLocale)} />
        )}
      </SFormItem>,

      <SFormItem label={dockGroupConfigLocale.logisticsType}>
        {getFieldDecorator('logisticsType', {
          initialValue: filterValue.logisticsType ? filterValue.logisticsType : '',
        })(
          <Select initialValue=' ' placeholder={placeholderChooseLocale(dockGroupConfigLocale.logisticsType)} >
            {logisticModeOptions}
          </Select>
        )}
      </SFormItem>,
    ];
  }
}
