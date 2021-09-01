import { Form, Input, Select, Col } from 'antd';
import ConfigSearchForm from '@/pages/Component/Form/ConfigSearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { commonLocale, placeholderLocale } from '@/utils/CommonLocale';
import { formatMessage } from 'umi/locale';
import { moveruleConfigLocale } from './MoveruleConfigLocale';
import BinUsageSelect from '@/pages/Component/Select/BinUsageSelect';
const FormItem = Form.Item;

@Form.create()
export default class MoveruleConfigSearchForm extends ConfigSearchForm {
  constructor(props) {
    super(props);
  }

  drawCols = () => {
    const { getFieldDecorator } = this.props.form;
    const { filterValue } = this.props;

    return [
      <SFormItem label={moveruleConfigLocale.moveruleConfigFromBin}>
        {getFieldDecorator('fromBinUsage', {
          initialValue: filterValue.fromBinUsage ? filterValue.fromBinUsage : ''
        })(
          <BinUsageSelect hasAll />
        )}
      </SFormItem>,
      <SFormItem label={moveruleConfigLocale.moveruleConfigToBin}>
        {getFieldDecorator('toBinUsage', {
          initialValue: filterValue.toBinUsage ? filterValue.toBinUsage : ''
        })(
          <BinUsageSelect hasAll />
        )}
      </SFormItem>,
    ];
  }
}
