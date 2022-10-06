import SearchForm from '@/pages/Component/Form/SearchForm';
import { Form, Select, Col } from 'antd';
import { dispatcherConfigLocale } from './DispatcherConfigLocale';
const FormItem = Form.Item;

@Form.create()
export default class DispatcherConfigSearchForm extends SearchForm {
  onReset = () => {
    this.props.refresh();
  };

  onSearch = data => {
    this.props.refresh(data);
  };

  drawCols = () => {
    const { getFieldDecorator } = this.props.form;
    const { filterValue, dispatchData } = this.props;

    return [
      <Col key="dcCodeNameLike">
        <FormItem label={dispatcherConfigLocale.name}>
          {getFieldDecorator('name', {
            initialValue: filterValue.name,
          })(
            <Select>
              {dispatchData?.map(dispatch => {
                return (
                  <Select.Option value={JSON.stringify(dispatch)} key={dispatch.uuid}>
                    {'[' + dispatch.code + ']' + dispatch.name}
                  </Select.Option>
                );
              })}
            </Select>
          )}
        </FormItem>
      </Col>,
    ];
  };
}
