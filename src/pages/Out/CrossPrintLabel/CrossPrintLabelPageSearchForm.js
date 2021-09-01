import { connect } from 'dva';
import { Form, Input } from 'antd';
import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { placeholderLocale } from '@/utils/CommonLocale';

@connect(({ crossPrintLabel, loading }) => ({
  crossPrintLabel,
  loading: loading.models.crossPrintLabel,
}))
@Form.create()
export default class CrossPrintLabelPageSearchForm extends SearchForm {
  constructor(props) {
    super(props);
    this.state = {
    }
  }

  onReset = () => {
    this.props.refresh();
  }

  onSearch = (data) => {
    this.props.refresh(data);
  }

  drawCols = () => {
    const { form, filterValue } = this.props;
    const { getFieldDecorator } = form;
    const { toggle } = this.state;
    let cols = [];

    cols.push(
      <SFormItem key='containerCode' label={'托盘号'}>
        {getFieldDecorator('containerCode',
        { initialValue: filterValue.containerCode ? filterValue.containerCode :'' }
      )(
        <Input placeholder={placeholderLocale('托盘号')} />)
      }
      </SFormItem>
    );

    return cols;
  }
}