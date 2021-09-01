import SearchForm from '@/pages/Tms/PickUpDispatching/SearchForm';
import { Form, Input, Select, DatePicker, Tooltip, Icon } from 'antd';
import SFormItem from '@/pages/Component/Form/SFormItem';
const { RangePicker } = DatePicker;
@Form.create()
export default class OrderSearchForm extends SearchForm {
  constructor(props) {
    super(props);
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
    const { form } = this.props;
    const { getFieldDecorator } = form;
    let cols = [];
    cols.push(
      <SFormItem md={7} key="waveNum" label={'波次号'}>
        {getFieldDecorator('waveNum', {
        })(
          <Input placeholder={'波次号'} />
        )}
      </SFormItem>
    );
    cols.push(
      <SFormItem md={7} key="created" label={'下单时间'}>
        {getFieldDecorator('created', {})(
          <RangePicker />)}
      </SFormItem>
    );    
    cols.push(
      <SFormItem md={10} key="sourceNum" label={'物流来源单号'}>
        {getFieldDecorator('sourceNum', {
        })(
          <Input placeholder={'物流来源单号'} />
        )}
      </SFormItem>
    );
    return cols;
  }
}
