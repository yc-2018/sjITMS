import { Component } from 'react';
import { Button, Form, Input, Row, Col, Select, message, Checkbox } from 'antd';
import { connect } from 'dva';
import FormPanel from '@/pages/Component/Form/FormPanel';
import CFormItem from '@/pages/Component/Form/CFormItem';
import { loginOrg, loginCompany } from '@/utils/LoginContext';
import {
  commonLocale,
  placeholderChooseLocale,
} from '@/utils/CommonLocale';
import { WorkType } from '@/pages/Account/User/WorkTypeConstants';

const FormItem = Form.Item;
const Option = Select.Option;

const workTypeOptions = [];
Object.keys(WorkType).forEach(function(key) {
  workTypeOptions.push(<Option key={WorkType[key].name} value={WorkType[key].name}>{WorkType[key].caption}</Option>);
});

@connect(({ workType }) => ({
  workType,
}))
@Form.create()
export default class ArticleBusinessForm extends Component {
  state = {
    userUuid: this.props.userUuid,
    workTypeName: this.props.workTypeName,
    switchWorkTypeEditorState: this.props.switchWorkTypeEditorState
  };

  componentDidMount() {
    const { workTypeName } = this.state;
    let endWorkTypeName = [];
    Array.isArray(workTypeName) && workTypeName.forEach(function(item){
      endWorkTypeName.push(item.userPro)
    })
    this.setState({
      endWorkTypeName: endWorkTypeName
    })
  }

  handleAddOrModify = () => {
    const { form, switchWorkTypeEditorState, refresh, userUuid,userCode,userName } = this.props;
    const { endWorkTypeName } = this.state;
    let creation = {
      userUuid: userUuid,
      userCode: userCode,
      userName: userName,
      companyUuid: loginCompany().uuid,
      dispatchCenterUuid: loginOrg().uuid,
      userPros: endWorkTypeName ? endWorkTypeName : workTypeName,
    }
    this.setState({
      confirmLoading: true,
    })

    this.props.dispatch(
      {
        type: 'workType/onSave',
        payload: creation,
        callback: response => {
          if (response && response.success) {
            switchWorkTypeEditorState(false)
            refresh();
          }
        }
      }
    )
    this.setState({
      confirmLoading: false,
    })
  }

  handleWorkTypeChange = (e) => {
    this.setState({
      endWorkTypeName: e,
      // workTypeName: e,
    })
  }

  render() {
    const { workTypeName, switchWorkTypeEditorState, form } = this.props;
    const {endWorkTypeName} = this.state;
    let cols = [
      <div style={{width:'200px',marginTop:'-38px',display:'inline-block'}}>
        <CFormItem key='workType' label={'工种'}>
          {form.getFieldDecorator('workType', {
            initialValue: endWorkTypeName ? endWorkTypeName : undefined,
          })(<Select
            mode={"multiple"}
            placeholder={placeholderChooseLocale('工种')}
            style={{ width: '100%' }}
            onChange = {this.handleWorkTypeChange}
          >
            {workTypeOptions}
          </Select>)}
        </CFormItem>
      </div>,
      <div style={{marginTop:'-38px',marginLeft:'500px',display:'inline-block'}}>
        <Button style={{ marginRight: 10 }} onClick={() => switchWorkTypeEditorState(false)}>
          {commonLocale.cancelLocale}
        </Button>
        <Button loading={this.state.confirmLoading} type="primary" htmlType="submit" onClick={this.handleAddOrModify}>
          {commonLocale.confirmLocale}
        </Button>
      </div>,
    ];
    return [
      <FormPanel style={{marginTop:'-100px'}} cols={cols}/>,
    ];
  }
}
