import { Form, Input, Select } from 'antd';
import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { commonLocale, placeholderLocale } from '@/utils/CommonLocale';
import React from 'react';
import { State } from '@/pages/Basic/Team/TeamConstant';

const stateOptions = [];
stateOptions.push(<Option key=' ' value=' '>{commonLocale.allLocale}</Option>);
Object.keys(State).forEach(function (key) {
  stateOptions.push(<Option key={State[key].name} value={State[key].name}>{State[key].caption}</Option>);
});

@Form.create()
export default class TeamSearchForm extends SearchForm {

  constructor(props) {
    super(props);
    this.state = {
    }
  }

  drawCols = () => {
    const { getFieldDecorator } = this.props.form;
    const { filterEqualsValue, filterLikeValue } = this.props;

    let cols = [
      <SFormItem key="codeName" label={'班组'}>
        {getFieldDecorator('codeName', {
          initialValue: filterLikeValue.codeName
        })(
          <Input placeholder={placeholderLocale('班组')}/>
        )}
      </SFormItem>,
      <SFormItem key="state" label={commonLocale.stateLocale}>
        {getFieldDecorator('state',
          {
            initialValue: filterEqualsValue.state ? filterEqualsValue.state : ' '
          }
        )(
          <Select initialValue=' '>
            {stateOptions}
          </Select>
        )
        }
      </SFormItem>,
    ];

    return cols;
  }
}
