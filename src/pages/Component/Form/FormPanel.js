import React, { PureComponent } from 'react';
import { Col, Form, Row } from 'antd';
import styles from '@/pages/Component/Page/inner/Page.less';
import panelStyles from './FormPanel.less';
import EFormPanel from '@/pages/Component/Form/EFormPanel';
import { isEmpty } from '@/utils/utils';
import CFormItem from '@/pages/Component/Form/CFormItem';
//<FormPanel key='profileItemsLocale' cols={profileItems} noteCol={this.drawNotePanel()}/>

// <FormPanel key='basicInfo' title={commonLocale.basicInfoLocale} cols={basicCols} noNote={this.state.noNote} noteCol={this.drawNotePanel()}/>,
// <FormPanel key='basicInfo' title={commonLocale.basicInfoLocale} cols={basicCols} noteCol={this.state.noNote ? undefined : this.drawNotePanel()}/>,
// <FormPanel key='basicInfo' title={commonLocale.basicInfoLocale} cols={basicCols} noteCol={this.drawNotePanel()}/>,
/**
 * 表单信息面板
 * 默认按照 label 进行自动调整
 *
 * @param {string} title:
 * @param {boolean} canCollapse: 是否可收缩
 * @param {boolean} noNote: 无备注表单项
 * @param {boolean} noteNotOneCol: 备注不作为一列
 * @param {boolean} firstColNarrow: 首行固定label宽度与备注、多个表单的首行对其
 * @param {string} layout: 布局类型， topmenu
 * @param {number} maxRowCols: 最大一行展示的列个数
 * @param {number[]} gutterCols: 每列显示的个数
 * @param {Component} noteCol: 备注表单项
 * @param {Component[]} cols: 表单项, labelSpan 可覆盖默认 FormItem 显示, span 可配合 gutterCols 控制占据行的比例
 * @param {function} drawOther: 表单项尾部组件
 * @param {number} noteLabelSpan: 备注表单项的 labelSpan,
 */
export default class FormPanel extends PureComponent {

  buildFormItems = () => {
    // 自适应 label:input 比例
    let cols = this.props.cols ? this.props.cols : [];
    // filter null, not CFormItem, empty CFormItem
    // TOOPT CFormItem 属性为空，有 children 的情况也作为布局控制使用
    cols = cols.filter(Boolean)
    // .filter(val => val.type && val.type.name === 'CFormItem')
      .filter(val => val.type === CFormItem)
      .filter(val => !isEmpty(val.props))
    // .filter((val, index) => val.props.label)
    ;
    let noNote = this.props.noNote ? true : !this.props.noteCol;
    const isTop = this.props.layout === 'topmenu' || !this.props.layout;
    let formItems = [];
    const baseSpan = isTop ? 4 : 5;
    const addedSpan = isTop ? 1 : 2;
    let firstColLabelSpan = baseSpan;
    let twoColLabelSpan = baseSpan;
    let threeColLabelSpan = baseSpan;
    let fourColLabelSpan = baseSpan;
    let firstLabelLength = 2;
    let twoLabelLength = 2;
    let threeLabelLength = 2;
    let fourLabelLength = 2;
    for (let i = 0; i < cols.length; i = i + 4) {
      if (!cols[i].props.label) {
        continue;
      }
      let thisLength = cols[i].props.label.length;
      if (thisLength > firstLabelLength) {
        firstLabelLength = thisLength;
      }
    }
    // if(firstColLabelSpan<firstLabelLength){
    //   firstColLabelSpan=firstLabelLength
    // }
    let firstAddedSpan = this.props.firstColNarrow ? addedSpan * 4 : (noNote ? addedSpan * 6 : addedSpan * 4);
    firstColLabelSpan = firstColLabelSpan + firstAddedSpan;

    // if (firstLabelLength === 2) {
    //   firstColLabelSpan = firstColLabelSpan + firstAddedSpan;
    // }
    // if (firstLabelLength === 3) {
    //   firstColLabelSpan = firstColLabelSpan + firstAddedSpan;
    // }
    // if (firstLabelLength === 4) {
    //   firstColLabelSpan = firstColLabelSpan + firstAddedSpan;
    // }

    for (let i = 1; i < cols.length; i = i + 4) {
      if (!cols[i].props.label) {
        continue;
      }
      let thisLength = cols[i].props.label.length;
      if (thisLength > twoLabelLength) {
        twoLabelLength = thisLength;
      }
    }
    // if(twoColLabelSpan<twoLabelLength){
    //   twoColLabelSpan=twoLabelLength
    // }
    twoColLabelSpan = twoColLabelSpan + addedSpan * 4;
    // if (twoLabelLength === 3) {
    //   twoColLabelSpan = twoColLabelSpan + addedSpan * 4;
    // }
    //
    // if (twoLabelLength === 4) {
    //   twoColLabelSpan = twoColLabelSpan + addedSpan * 4;
    // }

    for (let i = 2; i < cols.length; i = i + 4) {
      if (!cols[i].props.label) {
        continue;
      }
      let thisLength = cols[i].props.label.length;
      if (thisLength > threeLabelLength) {
        threeLabelLength = thisLength;
      }
    }
    // if(threeColLabelSpan<threeLabelLength){
    //   threeColLabelSpan=threeLabelLength
    // }
    threeColLabelSpan = threeColLabelSpan + addedSpan * 4;
    // if (threeLabelLength === 3) {
    //   threeColLabelSpan = threeColLabelSpan + addedSpan * 4;
    // }
    //
    // if (threeLabelLength === 4) {
    //   threeColLabelSpan = threeColLabelSpan + addedSpan * 4;
    // }

    for (let i = 3; i < cols.length; i = i + 4) {
      if (!cols[i].props.label) {
        continue;
      }
      let thisLength = cols[i].props.label.length;
      if (thisLength > fourLabelLength) {
        fourLabelLength = thisLength;
      }
    }
    // if(fourColLabelSpan<fourLabelLength){
    //   fourColLabelSpan=fourLabelLength
    // }
    fourColLabelSpan = fourColLabelSpan + addedSpan * 4;

    // if (fourLabelLength === 3) {
    //   fourColLabelSpan = fourColLabelSpan + addedSpan * 4;
    // }
    //
    // if (fourLabelLength === 4) {
    //   fourColLabelSpan = fourColLabelSpan + addedSpan * 4;
    // }

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
      labelSpan = cols[i].props.labelSpan ? cols[i].props.labelSpan : labelSpan;
      const formItemLayout = {
        labelCol: { span: labelSpan },
        wrapperCol: { span: 24 - labelSpan },
      };
      // TODO FormPanel 配合 CFormItem.span 控制行中的布局
      formItems.push(
        // <Col key={cols[i].props.label} span={6}>
        <Form.Item {...formItemLayout} labelAlign="left" label={cols[i].props.label}>
          {cols[i]}
        </Form.Item>,
        // </Col>,
      );
    }
    return formItems;
  };

  filterRows = () => {
    let cols = this.props.cols ? this.props.cols : [];
    cols = cols.filter(Boolean)
    // .filter(val => !(val.type && val.type.name === 'CFormItem'))
      .filter(val => !(val.type === CFormItem))
      // .filter((val, index) => !val.props.label)
      // .filter((val, index) => !(Object.keys(val.props).length === 0 && val.props.constructor === Object))
      .filter((val, index) => !isEmpty(val.props))
    ;

    return cols;
  };

  drawFormRows = () => {
    let cols = this.buildFormItems();
    const gutterCols = this.props.gutterCols;
    let rows = [];
    let currentRowCols = [];

    for (let i = 0; i < cols.length; i++) {
      const index = rows.length === 0 ? 0 : rows.length;
      let rowCnt = this.props.maxRowCols ? this.props.maxRowCols : 4;
      rowCnt = gutterCols ? gutterCols[index] : 4;
      let colSpan = cols[i].props.children && cols[i].props.children.props
      && cols[i].props.children.props.span ? cols[i].props.children.props.span : 24 / rowCnt;
      if (currentRowCols.length < rowCnt) {
        currentRowCols.push(<Col key={cols[i].props.label} span={colSpan}>
          {cols[i]}
        </Col>);
      } else {
        rows.push(<Row key={'row' + rows.length}>{currentRowCols}</Row>);
        rowCnt = gutterCols ? gutterCols[index + 1] : 4;
        currentRowCols = [];
        let colSpan = cols[i].props.children && cols[i].props.children.props
        && cols[i].props.children.props.span ? cols[i].props.children.props.span : 24 / rowCnt;
        currentRowCols.push(<Col key={cols[i].props.label} span={colSpan}>
            {cols[i]}
          </Col>,
        );
      }
      // TODO 自动对齐
      if (i === cols.length - 1 && this.props.noteNotOneCol) {
        let noNote = this.props.noNote ? true : !this.props.noteCol;
        if (!noNote) {
          let noteCol = this.props.noteCol;
          const formItemLayout = {
            labelCol: { span: this.props.noteLabelSpan?this.props.noteLabelSpan:4 },
            wrapperCol: { span: 24 - this.props.noteLabelSpan?this.props.noteLabelSpan:4},
          };
          let formCol = (
            <Col key={noteCol.props.label} span={12}>
              <Form.Item {...formItemLayout} labelAlign="left" label={noteCol.props.label}>
                {noteCol}
              </Form.Item>
            </Col>
          );
          if (currentRowCols.length < rowCnt - 1) {
            currentRowCols.push(formCol);
            rows.push(<Row key={'row' + rows.length}>{currentRowCols}</Row>);
          } else {

            rows.push(<Row key={'row' + rows.length}>{currentRowCols}</Row>);
            rows.push(<Row key={'row' + rows.length}>{formCol}</Row>);
          }
        } else {
          rows.push(<Row key={'row' + rows.length}>{currentRowCols}</Row>);
        }
      } else if (i === cols.length - 1) {
        rows.push(<Row key={'row' + rows.length}>{currentRowCols}</Row>);
      }
    }
    if (!this.props.noteNotOneCol) {
      let noNote = this.props.noNote ? true : !this.props.noteCol;
      if (!noNote) {
        let noteCol = this.props.noteCol;
        const formItemLayout = {
          labelCol: { span: this.props.noteLabelSpan?this.props.noteLabelSpan:3  },
          wrapperCol: { span: 24 - this.props.noteLabelSpan?this.props.noteLabelSpan:3  },
        };
        let formCol = (
          <Col key={noteCol.props.label} span={12}>
            <Form.Item {...formItemLayout} labelAlign="left" label={noteCol.props.label}>
              {noteCol}
            </Form.Item>
          </Col>
        );
        rows.push(<Row key={'row' + rows.length}>{formCol}</Row>);
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
