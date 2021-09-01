import { Form, Input, Select,Col } from 'antd';
import ConfigSearchForm from '@/pages/Component/Form/ConfigSearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { formatMessage } from 'umi/locale';
import { decincConfigLocale } from '../Decinc/DecincConfigLocale';
import { commonLocale, placeholderLocale, placeholderChooseLocale} from '@/utils/CommonLocale';
import BinUsageSelect from '@/pages/Component/Select/BinUsageSelect';

const FormItem = Form.Item;

@Form.create()
export default class LockConfigSearchForm extends ConfigSearchForm {
    constructor(props) {
        super(props);
    }


    drawCols = () => {
        const { getFieldDecorator } = this.props.form;
        const { filterValue } = this.props;
        const Option = Select.Option;

        let cols = [
          <SFormItem label={decincConfigLocale.decincConfigBinUsage}>
            {getFieldDecorator('binUsage', {
              initialValue: filterValue.binUsage ? filterValue.binUsage : ''
            })(
              <BinUsageSelect hasAll/>
            )}
          </SFormItem>,
        ];
        return cols;
    }
}
