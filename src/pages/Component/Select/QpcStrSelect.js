import React, { PureComponent } from 'react';
import { Select, message } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { loginCompany } from '@/utils/LoginContext';
import { STATE } from '@/utils/constants';

/**
* QpcStr下拉选择控件
*
* 支持form表单initialValue设置初始值，也可通过属性value设置初始值；
*/
@connect(({ article }) => ({
  article
}))
export default class QpcStrSelect extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      value: props.value,
      qpcStrs: props.qpcStrs ? props.qpcStrs : [],
    }
  }
  
  componentDidMount() {
    let articleUuid = this.props.articleUuid;
    if (articleUuid && this.state.qpcStrs.length === 0) {
      this.props.dispatch({
        type: 'article/getQpcsByArticleUuid',
        payload: {articleUuid},
        callback: response => {
          if (response && response.success) {
            let data = response.data;
            if (!Array.isArray(data)) {
              data = [];
            }
            let qpcStrs = []
            data.map(item => {
              qpcStrs.push(item.qpcStr);
            }) 

            this.setState({
              qpcStrs: qpcStrs
            })
          }
        }
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      value: nextProps.value
    });
  }

  buildOptions = () => {
    const { qpcStrs } = this.state;
    let options = [];

    Array.isArray(qpcStrs) && qpcStrs.forEach(function (item, index) {
      options.push(
        <Select.Option key={index} value={item}>{item}</Select.Option>
      );
    });
    return options;
  }

  onChange = (value) => {
    this.setState({ value: value });

    // 用于form表单获取控件值
    if (this.props.onChange)
      this.props.onChange(value);
  }

  render() {
    return (
      <Select style={{width: '100%'}} disabled={this.props.disabled} value={this.state.value} placeholder={this.props.placeholder} onChange={this.onChange}>
        {this.buildOptions()}
      </Select>
    );
  }
}