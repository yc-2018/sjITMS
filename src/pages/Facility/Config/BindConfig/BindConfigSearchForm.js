import { Form, Input, Select,Col } from 'antd';
import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { formatMessage } from 'umi/locale';
import { bindConfigLocale } from './BindConfigLocale';
import { commonLocale, placeholderLocale, placeholderChooseLocale} from '@/utils/CommonLocale';
import BinUsageSelect from '@/pages/Component/Select/BinUsageSelect';
import { dockGroupConfigLocale } from '@/pages/Facility/Config/DockGroup/DockGroupConfigLocale';
import ConfigSearchForm from '@/pages/Component/Form/ConfigSearchForm';

const FormItem = Form.Item;

@Form.create()
export default class BindConfigSearchForm extends ConfigSearchForm {
    constructor(props) {
        super(props);
    }


    drawCols = () => {
        const { getFieldDecorator } = this.props.form;
        const { filterValue } = this.props;
        const Option = Select.Option;



      return [
        <SFormItem label={commonLocale.inBinUsageLocale}>
          {getFieldDecorator('binUsage', {
            initialValue: filterValue.binUsage ? filterValue.binUsage : '',
          })(
            <BinUsageSelect hasAll/>
          )}
        </SFormItem>,


        <SFormItem label={bindConfigLocale.bindConfigConfigType}>
          {getFieldDecorator('configType', {
            initialValue: "BIND,MERGER"
          })(
            <Select  placeholder={bindConfigLocale.bindConfigAll} >
              <Option key=" " value="BIND,MERGER">{commonLocale.allLocale}</Option>
              <Option value="BIND">{bindConfigLocale.bindConfigBinding}</Option>
              <Option value="MERGER">{bindConfigLocale.bindConfigSplitsand}</Option>
            </Select>
          )}
        </SFormItem>,
      ];
    }
}
