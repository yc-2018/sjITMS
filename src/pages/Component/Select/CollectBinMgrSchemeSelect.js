import React, { PureComponent } from 'react';
import { Select, message } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { STATE } from '@/utils/constants';

/**
* 集货位管理方案下拉选择控件
*
* 支持form表单initialValue设置初始值，也可通过属性value设置初始值,形式为JSON.stringify(entity.collectBinScheme)
* 支持通过form表单获取控件值，获取到的为集货位管理方案字符串形式的ucn，可通过JSON.parse(fieldName)转换格式
* disabled：是否禁用；multiple：是否多选
* forModify:是否为修改所用
* defScheme:默认方案
*/
@connect(({ collectBinScheme }) => ({
  collectBinScheme
}))
export default class CollectBinMgrSchemeSelect extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      value: props.value,
      defSchemeUuid: '',
      schemeUuids: []
    }
  }

  componentDidMount() {
    this.props.dispatch({
      type: 'collectBinScheme/getByDcUuid',
      payload: {
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid
      }
    });
  }

  componentWillReceiveProps(nextProps) {

    this.setState({
      value: nextProps.value,
      defSchemeUuid: nextProps.collectBinScheme.listSchemes ? (nextProps.collectBinScheme.listSchemes.data ? nextProps.collectBinScheme.listSchemes.data[0].uuid : null) : null,
    });
    if (this.props.defScheme) {
      this.props.defScheme.uuid = nextProps.collectBinScheme.listSchemes.data ? nextProps.collectBinScheme.listSchemes.data[0].uuid : '';
      this.props.defScheme.code = nextProps.collectBinScheme.listSchemes.data ? nextProps.collectBinScheme.listSchemes.data[0].code : '';
      this.props.defScheme.name = nextProps.collectBinScheme.listSchemes.data ? nextProps.collectBinScheme.listSchemes.data[0].name : '';
    }
  }

  buildOptions = () => {
    let options = [];
    let data = this.props.collectBinScheme.listSchemes ? this.props.collectBinScheme.listSchemes.data : [];
    if (this.props.hasAll) {
      options.push(<Select.Option key="all" value={undefined} > 全部 </Select.Option>);
    }
    if (this.props.showUndefined) {
      options.push(<Select.Option key='' value=''> 随统配集货</Select.Option>);
    }
    var that = this;
    Array.isArray(data) && data.forEach(function (scheme) {
      //TODO:去重
      that.state.schemeUuids.push(scheme.uuid);
      var value = ''
      if (that.props.defScheme) {
        value = scheme.uuid
      } else if (!that.props.defScheme && that.props.forModify) {
        value = scheme.uuid
      } else {
        value = JSON.stringify({
          uuid: scheme.uuid,
          code: scheme.code,
          name: scheme.name
        })
      }
      if (scheme.mgrType != that.props.mgrTypeDisabled) {
        options.push(
          <Select.Option key={scheme.uuid} value={value}> {'[' + scheme.code + ']' + scheme.name} </Select.Option>
        );
      }
    });
    if (this.state.value != '' && this.state.value != undefined &&
      this.state.schemeUuids.indexOf(JSON.parse(this.state.value).uuid) == -1) {
      this.setState({
        value: undefined
      })
    }
    return options;
  }

  onChange = (value) => {
    this.setState({
      value: value,
    });
    // 用于form表单获取控件值
    if (this.props.onChange)
      this.props.onChange(value);
  }

  render() {
    const { multiple } = this.props;
    const selectProps = {
      disabled: this.props.disabled,
      mode: multiple ? 'multiple' : '',
      onChange: this.onChange,
      placeholder: this.props.placeholder,
      autoFocus:this.props.autoFocus?true:false,
      value: this.props.defScheme && this.state.defSchemeUuid != '' && this.state.value === undefined ? this.state.defSchemeUuid : this.state.value
    };
    return (
      <Select {...selectProps}>
        {this.buildOptions()}
      </Select>
    );
  }
}
