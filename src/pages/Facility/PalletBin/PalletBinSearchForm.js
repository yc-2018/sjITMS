import { Form, Input, Select } from 'antd';
import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import PalletBinTypeSelect from '@/pages/Component/Select/PalletBinTypeSelect';
import { commonLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { palletBinLocale } from './PalletBinLocale';

@Form.create()
export default class PalletBinSearchForm extends SearchForm {
  onReset = () => {
    this.props.refresh();
  }

  onSearch = (data) => {
    this.props.refresh(data);
  }

  drawCols = () => {
    const { getFieldDecorator } = this.props.form;
    const { filterValue } = this.props;

    let cols = [
      <SFormItem key="barcodeLike" label={palletBinLocale.barcodeLocale}>
        {getFieldDecorator('barcodeLike', {
          initialValue: filterValue.barcodeLike,
        })(
          <Input placeholder={placeholderLocale(palletBinLocale.barcodeLocale)}/>,
        )}
      </SFormItem>,
    ];

    cols.push(
      <SFormItem key="palletBinType" label={palletBinLocale.palletBinType}>
        {getFieldDecorator('palletBinType',
          { initialValue: filterValue.palletBinType ? filterValue.palletBinType : '' },
        )(
          <PalletBinTypeSelect hasAll/>)
        }
      </SFormItem>,
    );

    return cols;
  };
}
