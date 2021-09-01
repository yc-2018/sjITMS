import React, { PureComponent } from 'react';
import { Select, message } from 'antd';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { binUsage } from '@/utils/BinUsage';
import { STATE } from '@/utils/constants';

/**
* 上架单使用--货位下拉选择控件
*
* 支持form表单initialValue设置初始值，也可通过属性value设置初始值,形式为JSON.stringify(entity.bin)
* 支持通过form表单获取控件值，获取到的为货主字符串形式的ucn，可通过JSON.parse(fieldName)转换格式
* containerCode:根据容器查询，展示对应的货主信息
* 
*/
@connect(({ putaway }) => ({
  putaway
}))
export default class PutawaytBinSelect extends PureComponent {

  static propTypes = {
    containerBarcode: PropTypes.string || PropTypes.Array,
  }

  constructor(props) {
    super(props);

    this.state = {
      value: props.value,
      binList: [],
      containerBarcode:props.containerBarcode
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.putaway.bins != nextProps.putaway.bins) {
      this.setState({
        binList: nextProps.putaway.bins
      })
    }
    this.setState({
      value: nextProps.value,
      containerBarcode:nextProps.containerBarcode
    });
    if (this.props.value !== nextProps.value) {
      if (nextProps.value&&nextProps.containerBarcode) {
        this.setState({
          containerBarcode:nextProps.containerBarcode
        });

        this.onSearch(nextProps.value.indexOf("binCode") != -1 ? {binCode:JSON.parse(nextProps.value).binCode,containerBarcode:nextProps.containerBarcode} : nextProps.value);
      }
    }
  }

  componentDidMount() {
    const { value } = this.state;
    if (value)
      this.onSearch(value);
  }

  onSearch = (value) => {
    const { dispatch } = this.props;
    let payload={
      containerBarcode:value.containerBarcode?value.containerBarcode:this.state.containerBarcode,
      binCode:(value.binCode?value.binCode.indexOf("binCode") != -1:value.indexOf("binCode") != -1)?JSON.parse(value).binCode:(value.binCode?value.binCode:value),
    }
    dispatch({
      type: 'putaway/queryPutawayBins',
      payload:payload
    });
  }
  /**
   * 返回货位用途用以下方法
   */
  buildOptionsUsage=()=>{
    let options = [];
    let data = this.state.binList;
    const { state, usage, usages,binScope } = this.props;

    Array.isArray(data) && data.forEach(function (dg) {
        options.push(
          <Select.Option key={dg.uuid} value={JSON.stringify({
            binCode: dg.binCode,
            binUsage: dg.binUsage
        })}>
            {dg.binCode+'['+binUsage[dg.binUsage].caption+']'}
          </Select.Option>
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
    const { multiple,data } = this.props;
    const selectProps = {
      disabled: this.props.disabled,
      showSearch: true,
      mode: multiple ? 'multiple' : '',
      onChange: this.onChange,
      onSearch: this.onSearch,
      placeholder: this.props.placeholder,
      defaultValue: this.props.defaultValue
    };

    selectProps.value = this.props.value;
    if(this.props.value){

      selectProps.value = JSON.parse(this.props.value).binCode+'['+binUsage[JSON.parse(this.props.value).binUsage].caption+']'
    }

    return (
      <Select {...selectProps}>
        {this.buildOptionsUsage()}
      </Select>
    );
  }
}