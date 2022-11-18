/*
 * @Author: guankongjin
 * @Date: 2022-01-15 16:03:07
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-02-25 11:53:11
 * @Description: 快速开发简单查询
 * @FilePath: \iwms-web\src\pages\Component\RapidDevelopment\OnlReport\SimpleQuery\SimpleQuery.js
 */
import { Form, Input, Select, DatePicker } from 'antd';
import { notNullLocale } from '@/utils/CommonLocale';
import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import Address from '@/pages/Component/Form/Address';
import {
  SimpleTreeSelect,
  SimpleSelect,
  SimpleRadio,
  SimpleAutoComplete,
  SimpleAutoCompleteEasy,
} from '@/pages/Component/RapidDevelopment/CommonComponent';
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
    this.props.refresh('reset');
  };

  //查询console
  onSearch = searchParam => {
    let params = new Array();
    const { selectFields } = this.props;
    for (let param in searchParam) {
      const field = selectFields.find(x => x.fieldName == param);
      let val = searchParam[param];
      if (val == null || val == undefined) {
        continue;
      }
      if (field.searchShowtype == 'datetime' && val instanceof Array) {
        val = val.map(x => x.format('YYYY-MM-DD HH:mm:ss')).join('||');
      }
      if (field.searchShowtype == 'date' && val instanceof Array) {
        val = val.map(x => x.format('YYYY-MM-DD')).join('||');
      }
      if (field.searchShowtype == 'auto_complete' || field.searchShowtype == 'sel_tree') {
        if (val instanceof Object) {
          val = val.value;
        }
      }
      //多选下拉框时修改入参,非下拉框暂时不支持in 改为like
      if (field.searchCondition == 'in' || field.searchCondition == 'notIn') {
        if (field.searchShowtype == 'list' || field.searchShowtype == 'sel_search') {
          val = val.join('||');
        } else {
          field.searchCondition = 'like';
        }
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
    const searchProperties = searchField.searchProperties
      ? JSON.parse(searchField.searchProperties)
      : '';
    switch (searchField.searchShowtype) {
      case 'date':
        return <RangePicker style={{ width: '100%' }} />;
      case 'datetime':
        return <RangePicker style={{ width: '100%' }} showTime />;
      case 'time':
        return <RangePicker style={{ width: '100%' }} showTime />;
      case 'list':
        return (
          <SimpleSelect
            allowClear
            placeholder={'请选择' + searchField.fieldTxt}
            searchField={searchField}
            {...searchProperties}
          />
        );
      case 'radio':
        return <SimpleRadio {...searchProperties} />;
      case 'sel_search':
        if (searchField.searchCondition == 'in' || searchField.searchCondition == 'notIn') {
          return (
            <SimpleSelect
              showSearch
              allowClear
              placeholder={'请输入' + searchField.fieldTxt}
              reportCode={this.props.reportCode}
              searchField={searchField}
              isOrgQuery={this.props.isOrgQuery}
            />
          );
        }
        return (
          <SimpleAutoCompleteEasy
            placeholder={'请输入' + searchField.fieldTxt}
            reportCode={this.props.reportCode}
            searchField={searchField}
            isOrgQuery={this.props.isOrgQuery}
            {...searchProperties}
          />
        );
      case 'auto_complete':
        //影响原本判断逻辑 暂时不支持in与notIn 需要多选时参考json配置
        // let mut =
        //   searchField.searchCondition == 'in' || searchField.searchCondition == 'notIn'
        //     ? {
        //         mode: 'multiple',
        //         multipleSplit: '||',
        //       }
        //     : {};
        return (
          <SimpleAutoComplete
            placeholder={'请选择' + searchField.fieldTxt}
            searchField={searchField}
            {...searchProperties}
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
        return <SimpleTreeSelect {...searchProperties} />;
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
      //select多选默认值
      if (
        (searchField.searchShowtype == 'list' || searchField.searchShowtype == 'sel_search') &&
        (searchField.searchCondition == 'in' || searchField.searchCondition == 'notIn')
      ) {
        if (typeof filterValue[searchField.fieldName] === 'string') {
          filterValue[searchField.fieldName] = filterValue[searchField.fieldName].split('||');
        }
      }
      cols.push(
        <SFormItem key={searchField.id} label={searchField.fieldTxt}>
          {getFieldDecorator(searchField.fieldName, {
            initialValue: filterValue ? filterValue[searchField.fieldName] : undefined,
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
        <SFormItem label="error">
          <Input />
        </SFormItem>
      );
    }
    return cols;
  };
}
