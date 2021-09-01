import { Form, Input, Select,DatePicker } from 'antd';
import { connect } from 'dva';
import { loginCompany } from '@/utils/LoginContext';
import { commonLocale,placeholderLocale } from '@/utils/CommonLocale';
import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';

const Option = Select.Option;

@connect(({ palletBinScheme,loading }) => ({
  palletBinScheme,
  loading: loading.models.palletBinScheme,
}))
@Form.create()
export default class PalletBinSearchForm extends SearchForm {
  constructor(props) {
    super(props);
    this.state = {}
  }

  onReset = () => {
    this.props.refresh();
  }

  onSearch = (data) => {
    this.props.refresh(data);
  }

  /**
   * 绘制列
   */
  drawCols = () => {
    const { form, filterValue } = this.props;
    const { getFieldDecorator } = form;
    let cols = [];

    cols.push(
      <SFormItem key="codeName" label={commonLocale.codeAndNameLocale}>
        {getFieldDecorator('codeName', {
            initialValue: filterValue ? filterValue.codeName : ''
        })(
            <Input placeholder={placeholderLocale(commonLocale.codeAndNameLocale)}/>
        )}
      </SFormItem>
    );

    return cols;
  }
}
