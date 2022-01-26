/*
 * @Author: guankongjin
 * @Date: 2022-01-15 16:03:07
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-01-25 09:01:18
 * @Description: 快速开发简单查询
 * @FilePath: \iwms-web\src\pages\Quick\SimpleQuery\SimpleQuery.js
 */
import { Form, Input, Select, DatePicker } from 'antd';
import { notNullLocale } from '@/utils/CommonLocale';
import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import Address from '@/pages/Component/Form/Address';
import { SimpleTreeSelect, SimpleSelect } from "@/pages/Component/RapidDevelopment/CommonComponent";
const { RangePicker } = DatePicker;

@Form.create()
export default class SimpleQuery extends SearchForm {
  constructor(props) {
    super(props);
    this.state = { toggle: undefined };
  }

  componentWillReceiveProps(props) {
    const { toggle } = this.state;
    const { selectFields } = props;
    if (toggle == undefined && selectFields && selectFields.length > 3) {
      this.setState({ toggle: false });
    }
  }

  //重置
  onReset = () => {
    this.props.refresh();
  };

  //查询console
  onSearch = searchParam => {
    let params = new Array();
    const { selectFields } = this.props;
    for (let param in searchParam) {
      const field = selectFields.find(x => x.fieldName == param);
      let val = searchParam[param];
      if (field.searchShowtype == 'datetime' && val instanceof Array) {
        val = val.map(x => x.format('YYYY-MM-DD')).join('||');
      }
      if (field.searchShowtype == 'date') {
        val = val.format('YYYY-MM-DD');
      }
      if (val && field) {
        params.push({
          field: field.fieldName,
          type: field.fieldType,
          rule: field.searchCondition || 'like',
          val,
        });
      }
    }
    this.props.refresh({ matchType: '', queryParams: params });
  };

  //生成查询控件
  buildSearchItem = searchField => {
    const searchProperties = searchField.searchProperties ? JSON.parse(searchField.searchProperties) : "";
    switch (searchField.searchShowtype) {
      case 'date':
        return <DatePicker style={{ width: '100%' }} />;
      case 'datetime':
        return <RangePicker style={{ width: '100%' }} />;
      case 'time':
        return <RangePicker style={{ width: '100%' }} />;
      case 'list':
        return (
          <SimpleSelect
            reportCode={this.props.reportCode}
            searchField={searchField}
          />
        );
      case 'list_multi':
        return <RangePicker style={{ width: '100%' }} />;
      case 'sel_search':
        return (
          <SimpleSelect
            reportCode={this.props.reportCode}
            searchField={searchField}
            showSearch
          />
        );
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
        return <SimpleTreeSelect {...searchProperties}/>;
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
            rules: [
              {
                required: searchField.searchRequire,
                message: notNullLocale(searchField.fieldTxt),
              },
            ],
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
