/*
 * @Author: guankongjin
 * @Date: 2022-01-15 16:03:07
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-01-20 14:01:46
 * @Description: 快速开发简单查询
 * @FilePath: \iwms-web\src\pages\Quick\SimpleQuery\SimpleQuery.js
 */
import { Form, Input, Select, DatePicker } from 'antd';
import Address from '@/pages/Component/Form/Address';
import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
const { RangePicker } = DatePicker;

@Form.create()
export default class SimpleQuery extends SearchForm {
  constructor(props) {
    super(props);
    this.state = { toggle: undefined };
  }

  componentWillReceiveProps(props) {
    const { selectFields } = props;
    if (selectFields && selectFields.length > 3) {
      this.setState({ toggle: false });
    }
  }

  //重置
  onReset = () => {
    this.props.refresh();
  };

  //查询
  onSearch = searchParam => {
    let params = new Array();
    const { selectFields } = this.props;
    for (let param in searchParam) {
      const field = selectFields.find(x => x.fieldName == param);
      const val = searchParam[param];
      if (val && field) {
        params.push({
          field: field.fieldName,
          type: field.fieldType,
          rule: field.searchShowtype === 'text' ? 'like' : 'eq',
          val,
        });
      }
    }
    this.props.refresh({ matchType: '', queryParams: params });
  };

  //生成查询控件
  buildSearchItem = searchField => {
    switch (searchField.searchShowtype) {
      case 'date':
        return <DatePicker style={{ width: '100%' }} />;
      case 'datetime':
        return <RangePicker style={{ width: '100%' }} />;
      case 'time':
        return <RangePicker style={{ width: '100%' }} />;
      case 'list':
        return <RangePicker style={{ width: '100%' }} />;
      case 'list_multi':
        return <RangePicker style={{ width: '100%' }} />;
      case 'sel_search':
        return <RangePicker style={{ width: '100%' }} />;
      case 'cat_tree':
        return <RangePicker style={{ width: '100%' }} />;
      case 'popup':
        return <RangePicker style={{ width: '100%' }} />;
      case 'sel_depart':
        return <RangePicker style={{ width: '100%' }} />;
      case 'sel_user':
        return <RangePicker style={{ width: '100%' }} />;
      case 'pca':
        return <Address />;
      case 'sel_tree':
        return <RangePicker style={{ width: '100%' }} />;
      default:
        return <Input placeholder={'请输入' + searchField.fieldTxt} />;
    }
  };

  drawCols = () => {
    const { form, filterValue, selectFields } = this.props;
    const { getFieldDecorator } = this.props.form;
    const { toggle } = this.state;
    const showSelectFields = toggle ? selectFields : selectFields.slice(0, 3);
    let cols = new Array();
    showSelectFields.forEach(searchField => {
      cols.push(
        <SFormItem key={searchField.id} label={searchField.fieldTxt}>
          {getFieldDecorator(searchField.fieldName, {
            initialValue: filterValue ? filterValue[searchField.fieldName] : '',
          })(this.buildSearchItem(searchField))}
        </SFormItem>
      );
    });
    if (cols.length == 0) {
      cols.push(
        <SFormItem label="名字">
          <Input />
        </SFormItem>
      );
    }
    return cols;
  };
}
