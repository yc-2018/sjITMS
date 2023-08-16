/*
 * @Author: guankongjin
 * @Date: 2022-12-14 16:59:01
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-07-27 17:53:18
 * @Description: file content
 * @FilePath: \iwms-web\src\pages\Component\RapidDevelopment\CommonLayout\Form\FormPanel.js
 */
import React, { PureComponent } from 'react';
import { Col, Form, Row } from 'antd';
import { isEmpty } from '@/utils/utils';
import styles from '@/pages/Component/Page/inner/Page.less';
import panelStyles from './FormPanel.less';
import EFormPanel from '@/pages/Component/RapidDevelopment/CommonLayout/Form/EFormPanel';
import CFormItem from '@/pages/Component/RapidDevelopment/CommonLayout/Form/CFormItem';

/**
 * 表单信息面板
 * 默认按照 label 进行自动调整
 *
 * @param {string} title:
 * @param {boolean} canCollapse: 是否可收缩
 * @param {number[]} gutterCols: 每列显示的个数
 * @param {Component[]} cols: 表单项, labelSpan 可覆盖默认 FormItem 显示, span 可配合 gutterCols 控制占据行的比例
 * @param {function} drawOther: 表单项尾部组件
 */
export default class FormPanel extends PureComponent {
  buildFormItems = () => {
    let cols = this.props.cols ? this.props.cols : [];
    cols = cols.filter(val => val.type === CFormItem && !isEmpty(val.props));
    return cols.map(col => {
      let colSpan = col.props?.children.props?.span;
      let secondColSpan = col.props?.children.props?.children?.props?.span;
      const formItemLayout =
        colSpan == 24 || secondColSpan == 24
          ? { labelCol: { span: 2 }, wrapperCol: { span: 22 } }
          : { labelCol: { span: 7 }, wrapperCol: { span: 17 } };
      return (
        <Form.Item {...formItemLayout} labelAlign="left" label={col.props.label}>
          {secondColSpan == 24 ? col.props.children : col}
        </Form.Item>
      );
    });
  };

  filterRows = () => {
    let cols = this.props.cols ? this.props.cols : [];
    cols = cols.filter(val => !(val.type === CFormItem) && !isEmpty(val.props));
    return cols;
  };

  drawFormRows = () => {
    let cols = this.buildFormItems();
    const { rowCount } = this.props;
    let currentRowCols = [];

    for (let i = 0; i < cols.length; i++) {
      let colSpan = cols[i].props?.children.props?.children?.props?.span;
      colSpan = colSpan ? colSpan : 24 / (rowCount || 4);
      currentRowCols.push(
        <Col key={cols[i].props.label} span={colSpan}>
          {cols[i]}
        </Col>
      );
    }
    let rows = [];
    rows.push(
      <Row type="flex" justify="start">
        {currentRowCols}
      </Row>
    );

    // 非表单项填充 ...
    let otherRows = this.filterRows();
    rows.push(otherRows);

    return (
      <div className={styles.tableListForm}>
        <div className={panelStyles.formPanel}>{rows}</div>
      </div>
    );
  };

  render() {
    return (
      <EFormPanel
        title={this.props.title}
        canCollapse={this.props.canCollapse}
        drawFormRows={this.drawFormRows()}
        drawOther={this.props.drawOther}
      />
    );
  }
}
