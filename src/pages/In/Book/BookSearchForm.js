import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { Form, Input, Select, DatePicker } from 'antd';
import { commonLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { State, BookType } from './BookContants';
import OrgSelect from '@/pages/Component/Select/OrgSelect';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { bookLocale } from './BookLocale';
import DockGroupSelect from '@/pages/Component/Select/DockGroupSelect';
import moment from 'moment';
const { RangePicker } = DatePicker;
const Option = Select.Option;

const stateOptions = [];
stateOptions.push(<Option key='' value=''>{commonLocale.allLocale}</Option>);
Object.keys(State).forEach(function (key) {
  stateOptions.push(<Option value={State[key].name} key={State[key].name}>{State[key].caption}</Option>);
});
const typeOptions = [];
typeOptions.push(<Option key='' value=''>{commonLocale.allLocale}</Option>);
Object.keys(BookType).forEach(function (key) {
  typeOptions.push(<Option value={BookType[key].name} key={BookType[key].name}>{BookType[key].caption}</Option>);
});
@Form.create()
export default class BookSearchForm extends SearchForm {
  constructor(props) {
    super(props);
    this.state = {
      toggle: false,
      showLimitDays: true,
    }
  }
  onReset = () => {
    this.props.form.resetFields();
    this.props.refresh();
  }

  onSearch = (data) => {
    this.props.refresh(data);
  }

  drawCols = () => {
    const { getFieldDecorator } = this.props.form;
    const { filterValue } = this.props;
    const { toggle } = this.state;
    let cols = [];
    let dateInitial = filterValue.date && filterValue.date.length == 2 ? [moment(filterValue.date[0]), moment(filterValue.date[1])] : null;
    cols.push(
      <SFormItem key="billNumber" label={commonLocale.billNumberLocal}>
        {getFieldDecorator('billNumber', {
          initialValue: filterValue.billNumber
        })(
          <Input placeholder={placeholderLocale(commonLocale.billNumberLocal)} />
        )}
      </SFormItem>
    );
    cols.push(
      <SFormItem key="state" label={commonLocale.stateLocale}>
        {getFieldDecorator('state', { initialValue: filterValue.state ?  filterValue.state : ''})(
          <Select>{stateOptions}</Select>)}
      </SFormItem>
    );
    cols.push(
      <SFormItem key="dockGroup" label={bookLocale.dockGroup}>
        {getFieldDecorator('dockGroup', {
          initialValue: filterValue.dockGroup
        })(
          <DockGroupSelect placeholder={placeholderChooseLocale(bookLocale.dockGroup)} style={{ width: '120%' }} />
        )}
      </SFormItem>
    );
    if (toggle) {
      cols.push(
        <SFormItem key="vendor" label={commonLocale.inVendorLocale}>
          {getFieldDecorator('vendor', { initialValue: filterValue.vendor })(
            <OrgSelect
              placeholder={placeholderLocale(commonLocale.inVendorLocale + commonLocale.codeLocale)}
              upperUuid={loginCompany().uuid}
              type={'VENDOR'}
              single
            />)}
        </SFormItem>
      );

      cols.push(
        <SFormItem key="bookType" label={bookLocale.type}>
          {getFieldDecorator('bookType', { initialValue: filterValue.bookType ? filterValue.bookType :'' })(
            <Select>{typeOptions}</Select>)}
        </SFormItem>
      );

      cols.push(
        <SFormItem key="date" label={bookLocale.bookDate}>
          {getFieldDecorator('date', {
            initialValue: dateInitial
          })(
            <RangePicker />
          )}
        </SFormItem>
      );
    }
    return cols;
  }
}
