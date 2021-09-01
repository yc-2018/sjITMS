import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import { Select, message } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { loginCompany } from '@/utils/LoginContext';
import { addressToStr1 } from '@/utils/utils';

/**
 * 商品下拉框
 *
 * 支持单选和多选，传入属性single，表示单选，得到的值为商品ucn的json串
 * 不传single属性时为多选模式，json串的数组
 * hasAll：包含全部选项，可用于搜索条件;全部选项值为''，只用于single模式
 * 设置autoFocus属性,则会定位焦点
 */
@connect(({ store }) => ({
  store
}))
export default class StoreSelect extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      value: props.value
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      value: nextProps.value
    });
    if(nextProps.store && nextProps.store.data && nextProps.store.data.list && nextProps.store.data.list.length>0) {
      let data = nextProps.store.data.list;
      let codes = [];
      let names = [];
      let contacters = [];
      let contactNumbers = [];
      let addresses = [];
      Array.isArray(data) && data.forEach(function (item) {
        codes.push(item.code);
        names.push(item.name);
        contacters.push(item.contacter);
        contactNumbers.push(item.contactNumber);
        addresses.push(item.address);
      });
      if(nextProps.value) {
        let value = JSON.parse(nextProps.value);
        let code = value.code;
        let name = value.name;
        let contacter = value.contacter;
        let contactNumber = value.contactNumber;
        let address = value.address;
        if(codes.indexOf(code) === -1) {
          data.push(value)
        }
        if(Array.isArray(data) && !data[data.length-1].uuid) {
          if(data[data.length-1].name !== value.name) {
            data[data.length-1].name = value.name;
          }
          if(data[data.length-1].address !== value.address) {
            data[data.length-1].address = value.address;
          }
          if(data[data.length-1].contacter !== value.contacter) {
            data[data.length-1].contacter = value.contacter;
          }
          if(data[data.length-1].contactNumber !== value.contactNumber) {
            data[data.length-1].contactNumber = value.contactNumber;
          }
        }
        // if(codes.indexOf(code) > -1) {
        //   Array.isArray(data) && data.forEach(function (item) {
        //     if(code === item.code && name!== item.name) {
        //       item.name = name;
        //     }
        //     if(code === item.code && contacter!== item.contacter) {
        //       item.contacter = contacter;
        //     }
        //     if(code === item.code && contactNumber!== item.contactNumber) {
        //       item.contactNumber = contactNumber;
        //     }
        //     if(code === item.code && address!== item.address) {
        //       item.address = address;
        //     }
        //   });
        // }

      }
      this.setState({
        data: data
      });
    }
  }

  componentDidMount() {
    this.onSearch(null);
  }

  buildOptions = () => {
    let options = [];
    let data = this.state.data && this.state.data.records ? this.state.data.records : this.props.store.data.list;
    // console.log('所有值', data);
    data && Array.isArray(data) && data.forEach(function (item) {
      if(item.uuid && item.address) {
        options.push(
          <Select.Option key={item.code} value={JSON.stringify({
            uuid: item.uuid,
            code: item.code,
            name: item.name,
            type: 'Store',
            address: addressToStr1(item.address),
            contacter: item.contactor,
            contactNumber: item.contactPhone,
          })}> {item.code} </Select.Option>
        );
      } else {
        options.push(
          <Select.Option key={item.code} value={JSON.stringify({
            uuid: item.uuid,
            code: item.code,
            name: item.name,
            type: 'Store',
            address: item.address ? item.address : '',
            contacter: item.contacter,
            contactNumber: item.contactNumber,
          })}> {item.code} </Select.Option>
        );
      }
    });
    // console.log('值值22',options[22]);
    // console.log('值值10',options[10]);
    return options;
  }

  onSearch = (value1) => {
    const { state } = this.props;
    let searchKeyValues = {
      state: state,
      codeName: value1,
      companyUuid: loginCompany().uuid
    }
    let nowValue = {
      uuid: '',
      code: value1,
      name: '',
      type: 'Store',
      address: '',
      contacter: '',
      contactNumber: '',
    };
    this.props.dispatch({
      type: 'store/query',
      payload: {
        page: 0,
        pageSize: 0,
        searchKeyValues: {
          ...searchKeyValues
        },
        sortFields: {
          code: false
        }
      },
      callback: response => {
        if (response && response.success && response.data){
          if (!response.data.records) {
            response.data.records = [];
            response.data.records.push(nowValue)
          }
          this.setState({
            data: { ...response.data }
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
      // value: this.state.value,
      autoFocus:this.props.autoFocus?true:false,
      filterOption:false,
      disabled: this.props.disabled?true:false
    };

    if (this.state.value) {
      selectProps['value'] = this.state.value;
    }else if ((this.state.value == undefined || this.state.value === '')) {
      selectProps.value = this.state.value;
    }

    return (
      <Select {...selectProps} placeholder={this.props.placeholder} id='store'>
        {this.buildOptions()}
      </Select>
    );
  }
};
