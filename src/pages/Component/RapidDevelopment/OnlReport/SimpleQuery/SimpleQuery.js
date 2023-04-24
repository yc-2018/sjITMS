/*
 * @Author: guankongjin
 * @Date: 2022-01-15 16:03:07
 * @LastEditors: guankongjin
 * @LastEditTime: 2023-04-20 16:02:00
 * @Description: 快速开发简单查询
 * @FilePath: \iwms-web\src\pages\Component\RapidDevelopment\OnlReport\SimpleQuery\SimpleQuery.js
 */
import { Form, Input, DatePicker } from 'antd';
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
import moment from 'moment';
import { loginOrg, loginCompany } from '@/utils/LoginContext';
const { RangePicker } = DatePicker;

@Form.create()
export default class SimpleQuery extends SearchForm {
  constructor(props) {
    super(props);
    this.state = { toggle: undefined, runTimeProps: {} };
  }

  componentWillReceiveProps(props) {
    let { toggle, runTimeProps } = this.state;
    const { selectFields } = props;
    if (JSON.stringify(runTimeProps) == '{}') {
      for (const searchField of selectFields) {
        let searchProperties = searchField.searchProperties
          ? JSON.parse(searchField.searchProperties)
          : '';
        if (searchProperties.linkFields) {
          const linkFilters = this.buildLinkFilter(
            searchField.searchDefVal,
            searchProperties.linkFields
          );
          for (const linkField of searchProperties.linkFields) {
            runTimeProps[linkField.field] = linkFilters;
          }
        }
      }
      if (JSON.stringify(runTimeProps) != '{}') {
        this.setState({ runTimeProps });
      }
    }
    if (toggle == undefined && selectFields && selectFields.length > 3) {
      this.setState({ toggle: false });
    }
  }

  //重置
  onReset = () => {
    this.props.refresh('reset');
  };

  presets = () => {};

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
        } else if (field.searchShowtype != 'auto_complete') {
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

  handleChange = (valueEvent, searchField) => {
    let searchProperties = searchField.searchProperties
      ? JSON.parse(searchField.searchProperties)
      : '';
    if (searchProperties.linkFields) {
      const linkFilters = this.buildLinkFilter(valueEvent, searchProperties.linkFields);
      let runTimeProps = {};
      for (const linkField of searchProperties.linkFields) {
        runTimeProps[linkField.field] = linkFilters;
      }
      this.setState({ runTimeProps });
    }
  };

  buildLinkFilter = (valueEvent, linkFields) => {
    let linkFilters = [];
    for (const linkField of linkFields) {
      let { outField, inField, valueSplit, rule } = linkField;
      rule = rule || 'eq';
      let filter = { field: outField, rule: rule, val: [''] };
      // 多选的控件联动
      if (valueEvent?.record) {
        if (valueEvent.record instanceof Array) {
          filter.rule = 'in';
          if (valueSplit) {
            let val = [];
            for (const item of valueEvent.record) {
              val = [...val, ...item[inField]?.split(inField)];
            }
            filter.val = val;
          } else {
            filter.val = valueEvent.record.map(x => x[inField]);
          }
        } else {
          if (valueSplit) {
            filter.rule = 'in';
            filter.val = valueEvent.record[inField]?.split(valueSplit);
          } else {
            filter.val = [valueEvent.record[inField]];
          }
        }
      } else {
        filter.val = [valueEvent instanceof Array ? valueEvent.join('||') : valueEvent];
      }
      linkFilters.push(filter);
    }
    return linkFilters;
  };

  //生成查询控件
  buildSearchItem = searchField => {
    let searchProperties = searchField.searchProperties
      ? JSON.parse(searchField.searchProperties)
      : '';
    if (searchProperties.isOrgSearch) {
      const orgFields = searchProperties.isOrgSearch.split(',');
      let loginOrgType = loginOrg().type.replace('_', '');
      let loginParmas = [];
      if (orgFields.indexOf('Company') != -1) {
        loginParmas.push({ field: 'COMPANYUUID', rule: 'eq', val: [loginCompany().uuid] });
      }
      if (orgFields.indexOf('Org') != -1) {
        loginParmas.push({ field: loginOrgType + 'UUID', rule: 'like', val: [loginOrg().uuid] });
      }
      if (searchProperties.queryParams.condition) {
        const params = [...searchProperties.queryParams.condition.params];
        searchProperties.queryParams.condition.params = [...params, ...loginParmas];
      }
    }
    if (searchProperties.isLink) {
      searchProperties.linkFilter = this.state.runTimeProps[searchField.fieldName];
    }
    switch (searchField.searchShowtype) {
      case 'date':
        return <RangePicker showToday={true} style={{ width: '100%' }} />;
      case 'datetime':
        return (
          <RangePicker
            ranges={{
              近三天: [
                moment()
                  .startOf('day')
                  .subtract(3, 'day'),
                moment('23:59:59', 'HH:mm:ss'),
              ],
              近七天: [
                moment()
                  .startOf('day')
                  .subtract(1, 'weeks'),
                moment('23:59:59', 'HH:mm:ss'),
              ],
              近一月: [
                moment()
                  .startOf('day')
                  .subtract(1, 'month'),
                moment('23:59:59', 'HH:mm:ss'),
              ],
            }}
            style={{ width: '100%' }}
            showTime={{
              defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
            }}
          />
        );
      case 'time':
        return (
          <RangePicker
            style={{ width: '100%' }}
            showTime={{
              defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
            }}
          />
        );
      case 'list':
        return (
          <SimpleSelect
            allowClear
            placeholder={'请选择' + searchField.fieldTxt}
            searchField={searchField}
            {...searchProperties}
            setFieldsValues={this.props.form.setFieldsValue}
            onChange={valueEvent => this.handleChange(valueEvent, searchField)}
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
              setFieldsValues={this.props.form.setFieldsValue}
              onChange={valueEvent => this.handleChange(valueEvent, searchField)}
            />
          );
        }
        return (
          <SimpleAutoCompleteEasy
            placeholder={'请输入' + searchField.fieldTxt}
            allowClear
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
            onChange={valueEvent => this.handleChange(valueEvent, searchField)}
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
        return (
          <SimpleTreeSelect placeholder={'请选择' + searchField.fieldTxt} {...searchProperties} />
        );
      default:
        return <Input placeholder={'请输入' + searchField.fieldTxt} />;
    }
  };

  drawCols = () => {
    const { form, filterValue, selectFields } = this.props;
    const { getFieldDecorator } = form;
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
