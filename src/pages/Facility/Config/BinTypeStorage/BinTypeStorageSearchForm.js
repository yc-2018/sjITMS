import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { Form, Input, Select,Col } from 'antd';
import BinTypeSelect from '@/pages/Component/Select/BinTypeSelect';
import { binTypeStorageLocale } from './BinTypeStorageLocale';
import { commonLocale, placeholderLocale, placeholderChooseLocale, notNullLocale,} from '@/utils/CommonLocale';
import ConfigSearchForm from '@/pages/Component/Form/ConfigSearchForm';

const FormItem = Form.Item;
@Form.create()
export default class BinTypeStorageSearchForm extends ConfigSearchForm {
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
      <SFormItem label={binTypeStorageLocale.binTypeStorageBinType}>
        {getFieldDecorator('binType', {
          initialValue: filterValue.binType
        })(
          <BinTypeSelect placeholder={placeholderChooseLocale(binTypeStorageLocale.binTypeStorageSelectBinType)} id={'binType'}/>
        )}
      </SFormItem>,
    ];
  }
}
