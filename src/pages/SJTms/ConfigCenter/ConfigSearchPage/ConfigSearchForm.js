import SearchForm from '@/pages/Component/Form/SearchForm';
import { Form, Select, Col } from 'antd';
import { dynamicQuery } from '@/services/quick/Quick';

const FormItem = Form.Item;

@Form.create()
export default class ConfigSearchForm extends SearchForm {
  state = {
    ...this.state,
  };
  componentDidMount() {
    // this.initData();
  }

  // initData = async () => {
  //   let sourceData = [];
  //   let queryParamsJson = {
  //     tableName: 'V_SYS_DICT_ITEM',
  //     condition: {
  //       params: [{ field: 'DICT_CODE', rule: 'eq', val: ['dispatchCenter'] }],
  //     },
  //   };
  //   const response = await dynamicQuery(queryParamsJson);
  //   if (!response || !response.success || !Array.isArray(response.result.records)) {
  //     sourceData = [];
  //   } else {
  //     sourceData = response.result.records;
  //   }
  //   this.setState({
  //     sourceData: sourceData,
  //   });
  // };

  buildOptions = () => {
    const { sourceData } = this.props;
    return sourceData.map(data => {
      return (
        <Select.Option value={data.VALUE} label={data.NAME} title={data.NAME}>
          {data.NAME}
        </Select.Option>
      );
    });
  };

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
        <FormItem label={'调度中心'}>
          {getFieldDecorator('dispatchcenteruuid', {
            initialValue: filterValue.name,
          })(<Select>{this.buildOptions()}</Select>)}
        </FormItem>
      </Col>,
    ];
  };
}
