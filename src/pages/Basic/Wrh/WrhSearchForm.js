import { PureComponent } from "react";
import SearchForm from '@/pages/Component/Form/SearchForm';
import { Form, Col, Input, Select } from 'antd';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { STATE } from '@/utils/constants';
import DCSelect from '@/components/MyComponent/DCSelect';
import { formatMessage } from 'umi/locale';
import BasicStateSelect from '@/pages/Component/Select/BasicStateSelect';
import { commonLocale, placeholderLocale } from '@/utils/CommonLocale';

@Form.create()
export default class WrhSearchForm extends SearchForm {
  constructor(props) {
    super(props);
  };

  drawCols = () => {
    const { form, filterValue } = this.props;
    const { getFieldDecorator } = form;

    let cols = [
      <SFormItem key="codeName" label={commonLocale.wrhNameLocale}>
        {getFieldDecorator('codeName', {
          initialValue: filterValue.codeName
        })(
          <Input placeholder={placeholderLocale(commonLocale.codeAndNameLocale)} />
        )}
      </SFormItem>,
      <SFormItem key="state" label={formatMessage({ id: 'wrh.index.search.input.state' })}>
        {getFieldDecorator('state', {
          initialValue: filterValue.state
        })(
          <BasicStateSelect />
        )}
      </SFormItem>
    ];

    return cols;
  }
}
