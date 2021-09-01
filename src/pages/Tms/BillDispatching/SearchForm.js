import React, { PureComponent } from 'react';
import SearchPanel from './SearchPanel';
import { formatMessage } from 'umi/locale';
import { Form, Row, Col, Button, Input } from 'antd';
import styles from './SearchForm.less';
import { commonLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import SFormItem from './SFormItem';
import { getQueryBillDays } from '@/utils/LoginContext';
/**
 * 搜索表单面板基类
 *
 * 如需收缩和展开功能，在子类state中定义toggle
 * 子类提供onReset方法，当表单重置时会调用该方法刷新搜索结果
 * 子类提供onSearch方法，当表单提交时会调用该方法重新搜索结果
 */
export default class SearchForm extends PureComponent {
  componentDidUpdate(){
    if(this.drawRows()){

      let id = this.drawRows()[0].props.children[0].key
      if(document.getElementById(id)!=null&&(document.activeElement.tagName=='A'||
        document.activeElement.tagName =='BODY'||document.activeElement.id == id)){
        document.getElementById(id).focus();
        if(document.getElementById(id).firstChild!=null){
          if(document.querySelector('.ant-select-selection')===document.getElementById(id).firstChild){
            document.querySelector('.ant-select-selection').focus();
          }
        }
      }


    }
  }
  /**展开或者收缩面板 */
  toggleForm = () => {
    const { toggle } = this.state;
    this.setState({
      toggle: !toggle
    });
  }
  /**重置搜索条件 */
  reset = () => {
    this.props.form.resetFields();
    if (this.onReset) {
      this.onReset();
      return;
    }
    if (this.props.refresh) {
      this.props.refresh();
    }
  }
  /**搜索 */
  handlerSearch = (e) => {
    const { form } = this.props;
    e.preventDefault();
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const data = {
        ...fieldsValue
      };
      if (this.onSearch) {
        this.onSearch(data);
        return;
      }
      if (this.props.refresh) {
        this.props.refresh(data);
      }
    });
  }
  /**提交按钮 */
  drawSubmitButton = () => {
    return (
      <Button type="primary" htmlType="submit">
        {formatMessage({ id: 'company.index.search.button.search' })}
      </Button>
    );
  }
  /**重置按钮 */
  drawResetButton = () => {
    return (
      <Button style={{ marginLeft: 12, background: '#516173', color: '#FFFFFF' }} onClick={this.reset}>
        {formatMessage({ id: 'company.index.search.button.reset' })}
      </Button>
    );
  }
  /**展开更多条件的超链接 */
  drawToggle = () => {
    return (
      <a style={{ marginRight: '40px' }} onClick={this.toggleForm} >
        收起更多
      </a>
    );
  }
  /**收缩条件的超链接 */
  drawNormal = () => {
    return (
      <a style={{ marginRight: '40px' }} onClick={this.toggleForm} >
        展开更多
      </a>
    );
  }
  /**按钮组 */
  drawButtonGroup = () => {
    const toggle = this.state ? this.state.toggle : undefined;
    return (
      <Col key='btnGroup' style={{ float: 'right' }}>
        <div>
          {toggle == undefined && ''}
          {toggle != undefined && toggle && this.drawToggle()}
          {toggle != undefined && !toggle && this.drawNormal()}
          {this.drawSubmitButton()}
          {this.drawResetButton()}
        </div>
      </Col>
    );
  }
  /**根据子类构造的查询条件列，构造搜索表单的行 */
  drawRows = () => {
    let rows = [];
    let currentRowCols = [];
    let cols = this.drawCols ? this.drawCols() : [];
    //增加查询天数条件
    const { form, filterValue } = this.props;
    const { getFieldDecorator } = form;
    if (this.state && this.state.showLimitDays && this.state.showLimitDays == true)
      cols.push(
        <SFormItem key="days" label={commonLocale.queryBillDays}>
          {getFieldDecorator('days', {
            initialValue: filterValue? filterValue.days ? filterValue.days : getQueryBillDays() ? getQueryBillDays() : '' : getQueryBillDays() ? getQueryBillDays() : ''
          })(
            <Input placeholder={placeholderLocale(commonLocale.queryBillDays)} />
          )}
        </SFormItem>
      )
    for (let i = 0; i < cols.length; i++) {
      let col = cols[i];
      if (currentRowCols.length < 4) {
        currentRowCols.push(col);
      } else {
        rows.push(<Row key={i} gutter={16}>{currentRowCols}</Row>);
        currentRowCols = [];
        currentRowCols.push(col);
      }
      if (i === cols.length - 1) {
        currentRowCols.push(this.drawButtonGroup());
        rows.push(<Row key={i + 'btn'} gutter={16}>{currentRowCols}</Row>);
      }
    }
    return rows;
  }
  render() {
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };
    return (
      <SearchPanel>
        <Form  {...formItemLayout} onSubmit={this.handlerSearch} autoComplete="off">
          {this.drawRows()}
        </Form>
      </SearchPanel>
    );
  }
}
