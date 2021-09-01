import SearchForm from '@/pages/Component/Form/SearchForm';
import { Form , Input, Col } from 'antd';
import { storeAllocationLocale } from './StoreAllocationLocale';
import { commonLocale, placeholderLocale, placeholderChooseLocale, notNullLocale,} from '@/utils/CommonLocale';
import BinSelect from '@/pages/Component/Select/BinSelect';
import { binUsage } from '@/utils/BinUsage';
import SFormItem from '@/pages/Component/Form/SFormItem';
import ConfigSearchForm from '@/pages/Component/Form/ConfigSearchForm';

const FormItem = Form.Item;
@Form.create()
export default class StoreAllocationConfigSearchForm extends ConfigSearchForm {
  onReset = () => {
    this.props.refresh();
  }

  onSearch = (data) => {
    this.props.refresh(data);
  }
  drawCols = () => {
    const { getFieldDecorator } = this.props.form;
    const { filterValue } = this.props;

    return [

      <SFormItem label={storeAllocationLocale.storeAllocationStore}>
        {getFieldDecorator('storeCodeName', {
          initialValue: filterValue.storeCodeName
        })(
          <Input placeholder={placeholderLocale(commonLocale.codeAndNameLocale)} />
        )}
      </SFormItem>,
      <SFormItem label={storeAllocationLocale.storeAllocationAllocation}>
        {getFieldDecorator('binCode', {
          initialValue: filterValue.binCode
        })(
          <Input placeholder={placeholderLocale(commonLocale.storeAllocationBinCode)} />
        )}
      </SFormItem>,
    ];
  }
}
