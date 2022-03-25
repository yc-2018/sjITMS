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
    
    let formItems = [];
    
    // let totalLength = 0;
    // for (let i = 0; i < cols.length; i++) {
    //   if (!cols[i].props.label) {
    //     continue;
    //   }
    //   let length = cols[i].props.label.length;
    //   totalLength += length;
    // }
    const avgLength = 7;

    for (let i = 0; i < cols.length; i++) {
      const formItemLayout = {
        labelCol: {
          xs: { span: avgLength },
          sm: { span: avgLength },
          md: { span: avgLength },
          lg: { span: avgLength },
          xl: { span: avgLength },
          xxl: { span: avgLength },
        },
        wrapperCol: {
          xs: { span: 24 - avgLength },
          sm: { span: 24 - avgLength },
          md: { span: 24 - avgLength },
          lg: { span: 24 - avgLength },
          xl: { span: 24 - avgLength },
          xxl: { span: 24 - avgLength }
        },
      };

      formItems.push(
        <Form.Item {...formItemLayout} labelAlign="left" label={cols[i].props.label}>
          {cols[i]}
        </Form.Item>,
      );
    }
    return formItems;
  };

  filterRows = () => {
    let cols = this.props.cols ? this.props.cols : [];
    cols = cols.filter(val => !(val.type === CFormItem) && !isEmpty(val.props));
    return cols;
  };

  drawFormRows = () => {
    let cols = this.buildFormItems();
    const gutterCols = this.props.gutterCols;
    let rows = [];
    let currentRowCols = [];

    for (let i = 0; i < cols.length; i++) {
      const index = rows.length;
      const rowCnt = gutterCols ? gutterCols[index] : 4;
      let colSpan = cols[i].props?.children?.props?.span ? cols[i].props.children.props.span : 24 / rowCnt;
      currentRowCols.push(
        <Col key={cols[i].props.label} span={colSpan}>
          {cols[i]}
        </Col>);

      if (currentRowCols.length == rowCnt || i == cols.length - 1) {
        rows.push(<Row key={'row' + rows.length}>{currentRowCols}</Row>);
        currentRowCols = [];
      }
    }

    // 非表单项填充 ...
    let otherRows = this.filterRows();
    rows.push(otherRows);

    return <div className={styles.tableListForm}>
      <div className={panelStyles.formPanel}>
        {rows}
      </div>
    </div>;
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
