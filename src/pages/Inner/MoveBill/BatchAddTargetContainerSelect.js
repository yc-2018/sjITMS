import { PureComponent } from "react";
import { Select } from 'antd';
import { connect } from 'dva';
import { stockState } from '@/utils/StockState';
import { getStateCaption, containerState } from '@/utils/ContainerState';

import { loginCompany, loginOrg } from '@/utils/LoginContext';

@connect(({ container }) => ({
  container
}))
export default class MoveToContainerSelect extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      value: props.value,
      binCode: props.binCode
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      value: nextProps.value,
      binCode: nextProps.binCode
    });

    if (this.props.value !== nextProps.value) {
      this.onSearch(nextProps.value);
    }
  }

  componentDidMount() {
    const { value } = this.state;
    if (value) {
      this.onSearch(value);
    }
    this.getInitialValue();
  }

  buildOptions = () => {
    const { endBarcodes } = this.state;
    let options = [];
    Array.isArray(endBarcodes) && endBarcodes.forEach(function (item) {
      options.push(<Select.Option key="item" value={JSON.stringify({
        barcode: item,
        state: containerState.USEING,
      })}> {'[' + item + ']' + getStateCaption(containerState.USEING.name)} </Select.Option>)
    });

    let data = this.props.container.containers;
    Array.isArray(data) && data.forEach(function (container) {
      options.push(
        <Select.Option key={container.barcode} value={JSON.stringify({
          barcode: container.barcode,
          state: container.state,
        })}> {'[' + container.barcode + ']' + getStateCaption(container.state)} </Select.Option>
      );
    });
    return options;
  }

  getInitialValue = () => {
    const { dispatch, binCode } = this.props;
    let barcodes = [];
    let endBarcodes = [];
    dispatch({
      type: 'container/query',
      payload: {
        page: 0,
        pageSize: 20,
        searchKeyValues: {
          dcUuid: loginOrg().uuid,
          companyUuid: loginCompany().uuid,
          binCodeLike: binCode
        }
      },
      callback: (response) => {
        if (response && response.success && response.data && response.data.records) {
          let dataList = response.data.records;
          dataList.forEach(item=>{
            barcodes.push(item.barcode)
          });
          let len = barcodes.length;
          let isRepeat;

          for(let i=0; i<len; i++) {  //第一次循环
            isRepeat = false;
            for(let j=i+1; j<len; j++) {  //第二次循环
              if(barcodes[i] === barcodes[j]){
                isRepeat = true;
                break;
              }
            }
            if(!isRepeat){
              endBarcodes.push(barcodes[i]);
            }
          }
        }
        this.setState({
          endBarcodes: endBarcodes
        })
      }
    });
  }

  onSearch = (value) => {
    const { dispatch, binCode } = this.props;

    let searchKeyValues = {
      companyUuid: loginCompany().uuid,
      dcUuid: loginOrg().uuid,
    }

    if (binCode) {
      searchKeyValues['binCode'] = binCode;
    }

    if (value) {
      let data = value && value.charAt(0)=== '{' && JSON.parse(value).barcode ? JSON.parse(value).barcode : value;
      searchKeyValues['barcodeLike'] = data;
    }

    dispatch({
      type: 'container/queryIdleAndThisPostionUseing',
      payload: {
        recordCount: 20,
        ...searchKeyValues
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
      mode: single,
      onChange: this.onChange,
      onSearch: this.onSearch
    };

    // 暂时去掉校验
    // if (this.state.value) {
    //     selectProps.value = this.state.value;
    // }
    selectProps.value = this.state.value;
    return (
      <Select {...selectProps} placeholder={this.props.placeholder}>
        {this.buildOptions()}
      </Select>
    );
  }
}
