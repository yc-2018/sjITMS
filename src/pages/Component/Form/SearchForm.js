import React, { Component } from 'react';
import SearchPanel from '@/pages/Component/Page/inner/SearchPanel';
import { formatMessage } from 'umi/locale';
import { Button, Col, Form, Row, Input } from 'antd';
import IconFont from '@/components/IconFont';
import { commonLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { getQueryBillDays } from '@/utils/LoginContext';
import PreTypeSelect from '@/pages/Component/Select/PreTypeSelect';
import { loginOrg } from '@/utils/LoginContext';
import { PRETYPE } from '@/utils/constants';

/**
 * 搜索表单面板基类
 * 
 * 如需收缩和展开功能，在子类state中定义toggle
 * 子类提供onReset方法，当表单重置时会调用该方法刷新搜索结果
 * 子类提供onSearch方法，当表单提交时会调用该方法重新搜索结果
 */
export default class SearchForm extends Component {
  componentDidUpdate() {
    if (this.drawRows()) {

      let id = this.drawRows()[0].props.children[0].key;

      if (document.getElementById(id) != null && (document.activeElement.tagName == 'A' ||
        document.activeElement.tagName == 'BODY' || document.activeElement.id == id)) {
        document.getElementById(id).focus();

        if (document.getElementById(id).firstChild != null) {
          if (document.querySelector('.ant-select-selection') === document.getElementById(id).firstChild) {
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
      toggle: !toggle,
    }, () => {
      if (this.props.toggleCallback) {
        this.props.toggleCallback();
      }
    });
  };

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
  };

  /**搜索 */
  handlerSearch = (e) => {
    const { form } = this.props;

    e.preventDefault();
    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const data = {
        ...fieldsValue,
      };
      if (this.onSearch) {
        this.onSearch(data);
        return;
      }
      if (this.props.refresh) {
        this.props.refresh(data);
      }
    });
  };

  /**提交按钮 */
  drawSubmitButton = () => {
    return (
      <Button type="primary" htmlType="submit" loading={this.props.loading}>
        {formatMessage({ id: 'company.index.search.button.search' })}
      </Button>
    );
  };

  /**重置按钮 */
  drawResetButton = () => {
    return (
      <Button style={{ marginLeft: 10, background: '#516173', color: '#FFFFFF' }} onClick={this.reset}>
        {formatMessage({ id: 'company.index.search.button.reset' })}
      </Button>
    );
  };

  /**展开更多条件的超链接 */
  drawToggle = () => {
    return (
      <a style={{ marginRight: '10px' }} onClick={this.toggleForm}>
        收起 <IconFont style={{ margin: '0px 0px 0px 0px' }} type="icon-line_up"/>
      </a>
    );
  };

  /**收缩条件的超链接 */
  drawNormal = () => {
    return (
      <a style={{ marginRight: '10px' }} onClick={this.toggleForm}>
        展开 <IconFont style={{ margin: '0px 0px 0px 0px' }} type="icon-line_down"/>
      </a>
    );
  };

  /**按钮组 */
  drawButtonGroup = () => {
    const toggle = this.state ? this.state.toggle : undefined;
    return (
      <Col span={6} key='btnGroup' style={{ float: 'right' }}>
        <div style={{ float: 'right' }}>
          {toggle == undefined && ''}
          {toggle != undefined && toggle && this.drawToggle()}
          {toggle != undefined && !toggle && this.drawNormal()}
          {this.drawSubmitButton()}
          {this.drawResetButton()}
        </div>
      </Col>
    );
  };

  buildFormItems = () => {
    const { form, filterValue } = this.props;
    const { getFieldDecorator } = form;
    let cols = this.drawCols ? this.drawCols() : [];
    const isTop = this.props.layout === 'topmenu' || !this.props.layout;
    const collapsed = this.props.collapsed;
    let formItems = [];
    // const baseSpan = isTop ? 4 : 5;
    const baseSpan = 4;
    const addedSpan = 1;
    let firstColLabelSpan = baseSpan;
    let twoColLabelSpan = baseSpan;
    let threeColLabelSpan = baseSpan;
    let fourColLabelSpan = baseSpan;
    let firstLabelLength = 2;
    let twoLabelLength = 2;
    let threeLabelLength = 2;
    let fourLabelLength = 2;
    if (this.state && this.state.showLimitDays && this.state.showLimitDays == true)
      cols.push(
        <SFormItem key="days" label={"最近天数"}>
          {getFieldDecorator('days', {
            initialValue: filterValue && filterValue.days ? filterValue.days : getQueryBillDays() ? getQueryBillDays() : ''
          })(
            <PreTypeSelect
              hasAll
              preType={PRETYPE.dateLimit}
              orgUuid={loginOrg().uuid}
            />
          )}
        </SFormItem>
      )
    for (let i = 0; i < cols.length; i = i + 4) {
      if (!cols[i].props.label) {
        continue;
      }
      let thisLength = cols[i].props.label.length;
      if (thisLength > firstLabelLength) {
        firstLabelLength = thisLength;
      }
    }
    if (firstLabelLength === 3) {
      firstColLabelSpan = firstColLabelSpan + addedSpan*3;
    }

    if (firstLabelLength === 4) {
      firstColLabelSpan = firstColLabelSpan + addedSpan*3;
    }

    for (let i = 1; i < cols.length; i = i + 4) {
      if (!cols[i].props.label) {
        continue;
      }
      let thisLength = cols[i].props.label.length;
      if (thisLength > twoLabelLength) {
        twoLabelLength = thisLength;
      }
    }
    if (twoLabelLength === 3) {
      twoColLabelSpan = twoColLabelSpan + addedSpan * 3;
    }

    if (twoLabelLength === 4) {
      twoColLabelSpan = twoColLabelSpan + addedSpan * 3;
    }

    for (let i = 2; i < cols.length; i = i + 4) {
      if (!cols[i].props.label) {
        continue;
      }
      let thisLength = cols[i].props.label.length;
      if (thisLength > threeLabelLength) {
        threeLabelLength = thisLength;
      }
    }
    if (threeLabelLength === 3) {
      threeColLabelSpan = threeColLabelSpan + addedSpan * 3;
    }

    if (threeLabelLength === 4) {
      threeColLabelSpan = threeColLabelSpan + addedSpan * 3;
    }

    for (let i = 3; i < cols.length; i = i + 4) {
      if (!cols[i].props.label) {
        continue;
      }
      let thisLength = cols[i].props.label.length;
      if (thisLength > fourLabelLength) {
        fourLabelLength = thisLength;
      }
    }
    if (fourLabelLength === 3) {
      fourColLabelSpan = fourColLabelSpan + addedSpan * 3;
    }

    if (fourLabelLength === 4) {
      fourColLabelSpan = fourColLabelSpan + addedSpan * 3;
    }

    for (let i = 0; i < cols.length; i++) {
      let labelSpan = firstColLabelSpan;
      if (i % 4 === 1) {
        labelSpan = twoColLabelSpan;
      }
      if (i % 4 === 2) {
        labelSpan = threeColLabelSpan;
      }
      if (i % 4 === 3) {
        labelSpan = fourColLabelSpan;
      }
      labelSpan = cols[i].props.labelSpan ? cols[i].props.labelSpan : 7;
      const formItemLayout = {
        labelCol: { span: labelSpan },
        wrapperCol: { span: 24 - labelSpan },
      };
      // TODO 扩展 SForm 自定义
      const colSpan = cols[i].props.span ? cols[i].props.span : 6;
      formItems.push(
        <Col key={cols[i].props.label} span={colSpan}>
          <Form.Item {...formItemLayout} labelAlign="left" label={cols[i].props.label}>
            {cols[i]}
          </Form.Item>
        </Col>,
      );
    }
    return formItems;
  };

  /**根据子类构造的查询条件列，构造搜索表单的行 */
  drawRows = () => {
    let rows = [];
    let currentRowCols = [];
    let cols = this.buildFormItems();


    for (let i = 0; i < cols.length; i++) {
      let col = cols[i];
      if (currentRowCols.length < 4) {
        currentRowCols.push(col);
      } else {
        rows.push(<Row key={rows.length} gutter={16}>{currentRowCols}</Row>);
        currentRowCols = [];
        currentRowCols.push(col);
      }

      if (i === cols.length - 1) {
        if (currentRowCols.length < 4) {
          currentRowCols.push(this.drawButtonGroup());
          rows.push(<Row key={rows.length} gutter={16}>{currentRowCols}</Row>);
        } else {
          rows.push(<Row key={rows.length} gutter={16}>{currentRowCols}</Row>);
          const buttonRowCols = [];
          buttonRowCols.push(this.drawButtonGroup());
          rows.push(<Row key={rows.length} gutter={16}>{buttonRowCols}</Row>);
        }
      }
    }
    return rows;
  };

  render() {
    return (
      <SearchPanel>
        <Form onSubmit={this.handlerSearch} autoComplete="off">
          {this.drawRows()}
        </Form>
      </SearchPanel>
    );
  }
}
