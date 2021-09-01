import React, { PureComponent } from 'react';
import { Select } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { loginCompany, loginOrg  } from '@/utils/LoginContext';

/**
 * 商品下拉框
 *
 * 支持单选和多选，传入属性single，表示单选，得到的值为商品ucn的json串
 * 不传single属性时为多选模式，json串的数组
 * hasAll：包含全部选项，可用于搜索条件;全部选项值为''，只用于single模式
 * 设置autoFocus属性,则会定位焦点
 */
@connect(({ article }) => ({
  article
}))
export default class ArticleSelect extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      value: props.value,
      data:[]
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      value: nextProps.value
    });
  }

  buildOptions = () => {
    let options = [];
    if ( !this.props.ownerCode) {
      return options;
    }
    if (this.props.hasAll && this.props.single) {
      options.push(<Select.Option key="all" value={undefined} > 全部 </Select.Option>);
    }

    let data = this.state.data ? this.state.data : this.props.article.data.list;
    // let data = this.props.article.data.list;
    const that = this;
    Array.isArray(data) && data.forEach(function (article) {
      if(that.props.getSpec){
        options.push(
          <Select.Option key={article.uuid} value={JSON.stringify({
            uuid: article.uuid,
            code: article.code,
            name: article.name,
            spec: article.spec
          })}> {'[' + article.code + ']' + article.name} </Select.Option>
        );
      }else{
        options.push(
          <Select.Option key={article.uuid} value={JSON.stringify({
            uuid: article.uuid,
            code: article.code,
            name: article.name
          })}> {'[' + article.code + ']' + article.name} </Select.Option>
        );
      }
    });
    // this.props.article.data.list = [];
    return options;
  }

  onSearch = (value) => {
    if ( !this.props.ownerCode) {
      return options;
    }
    let binCode = '';
    let list = [];
      this.props.dispatch({
        type: 'article/query',
        payload: {
          page: 0,
          pageSize: 20,
          searchKeyValues: {
            companyUuid: loginCompany().uuid,
            state: 'ONLINE',
            ownerUuid: this.props.ownerUuid,
            codeName: value
          },
          sortFields: {
            code: false
          }
        },
        callback: response => {
          if (response && response.success && response.data) {
            let data = response.data.records;
            Array.isArray(data) && data.forEach( item => {
              list.push(item)
            });
            this.setState({
              data: list
            })
          }
        }
      });
  }

  onChange = (selectValue) => {
    this.setState({
      value: selectValue,
    });

    // 用于form表单获取控件值
    if (this.props.onChange)
      this.props.onChange(selectValue);
  }

  render() {
    const { single } = this.props;
    const selectProps = {
      showSearch: true,
      mode: single ? '' : 'multiple',
      onChange: this.onChange,
      onSearch: this.onSearch,
      value: this.state.value,
      autoFocus:this.props.autoFocus?true:false,
      filterOption:false,
      disabled: this.props.disabled?true:false
    };

    return (
      <Select {...selectProps} placeholder={this.props.placeholder} id='article'>
        {this.buildOptions()}
      </Select>
    );
  }
}
