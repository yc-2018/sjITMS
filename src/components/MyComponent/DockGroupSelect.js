import React, {PureComponent} from 'react';
import { Select, message } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { loginCompany } from '@/utils/LoginContext';
import { bool } from 'prop-types';

/**
* 码头集下拉选择控件
* 属性：支持form表单initialValue设置初始值，也可通过属性value设置初始值；hasAll：包含全部选项，可用于搜索条件;
* disabled：是否禁用；
* 事件：dockGroupChange，valueChange事件，默认的onChange事件获取的value为选中码头集的代码，dockGroupChange获取的值为选中货主的ucn
*/
@connect(({ dock }) => ({
    dock
}))
export default class DockGroupSelect extends PureComponent {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.dispatch({
      type: 'dock/getDockGroupByCompanyUuid',
      payload: {
        companyUuid: loginCompany().uuid
      }
    });
  }

  buildOptions = () => {
    let options = [];
    if (this.props.hasAll) {
      options.push(<Select.Option key="all" > 全部 </Select.Option>);
    }
    if (this.props.dock && this.props.dock.dockGroupList) {
      this.props.dock.dockGroupList.forEach(function(dockGroup) {
        let value = {
          uuid: dockGroup.uuid,
          code: dockGroup.code,
          name: dockGroup.name
        };
        options.push(
        <Select.Option key={value.uuid} value={value}> {'[' + dockGroup.code + ']' + dockGroup.name} </Select.Option>
          );
      });
    }
    return options;
  }

  render() {
    return (
      <Select allowClear ={true} defaultValue={this.props.value} onSelect={this.onSelect}
      disabled={this.props.disabled} mode={this.props.multiple ? 'multiple' : ''} onChange={this.props.dockGroupChange}>
       {this.buildOptions()}
      </Select>
    );
  }
}