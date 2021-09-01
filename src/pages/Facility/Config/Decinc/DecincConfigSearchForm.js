import { Form, Input, Select,Col } from 'antd';
import ConfigSearchForm from '@/pages/Component/Form/ConfigSearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { formatMessage } from 'umi/locale';
import { decincConfigLocale } from './DecincConfigLocale';
import { commonLocale, placeholderLocale, placeholderChooseLocale} from '@/utils/CommonLocale';
import BinUsageSelect from '@/pages/Component/Select/BinUsageSelect';

const FormItem = Form.Item;

@Form.create()
export default class DecincConfigSearchForm extends ConfigSearchForm {
    constructor(props) {
        super(props);
    }


  drawCols = () => {
    const { getFieldDecorator } = this.props.form;
    const { filterValue } = this.props;
    const Option = Select.Option;

    return  [
      <SFormItem label={commonLocale.inBinUsageLocale}>
        {getFieldDecorator('binUsage', {
          initialValue: filterValue.binUsage ? filterValue.binUsage : ''
        })(
          <BinUsageSelect hasAll/>
        )}
      </SFormItem>,
      <SFormItem label={decincConfigLocale.decincConfigConfigType}>
        {getFieldDecorator('configType', {
          initialValue: "DEC,INC"
        })(
          <Select  placeholder={decincConfigLocale.decincConfigAll} >
            <Option key=" " value="DEC,INC">{commonLocale.allLocale}</Option>
            <Option value="DEC">{decincConfigLocale.decincConfigLoss}</Option>
            <Option value="INC">{decincConfigLocale.decincConfigSpill}</Option>
          </Select>
        )}
      </SFormItem>,
    ];

  }
}
