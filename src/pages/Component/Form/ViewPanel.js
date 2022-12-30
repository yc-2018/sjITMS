import React, { PureComponent } from 'react';
import styles from './ViewPanel.less';
import { Col, Collapse, Icon, Row } from 'antd';
import { formatMessage } from 'umi/locale';
import Empty from '@/pages/Component/Form/Empty';
import { guid } from '@/utils/utils';
import { commonLocale } from '@/utils/CommonLocale';
import IconFont from '@/components/IconFont';
import IToolTip from '@/pages/Component/IToolTip';

const Panel = Collapse.Panel;

/**
 * @param {number[]} title:
 * @param {number[]} rightTile:
 * @param {Object[]} items: 显示的项,
 * @param {number[]} gutterCols: 控制没列显示的行数
 * @param {function?} onCollapse:
 * @param {function} drawOther:
 * @param {boolean} isClose:
 * @param {Object} style: 最顶层 Div 样式
 * @param {function} onEdit:
 */
export default class ViewPanel extends PureComponent {
  constructor(props) {
    super(props);
  }

  drawRows = () => {
    let items = this.props.items;
    const gutterCols = this.props.gutterCols;
    let rows = [];
    let currentRowCols = [];

    //对于备注等items长度为1的，单独处理
    for (let i = 0; i < items.length; i++) {
      let value =
        !isNaN(items[i].value) && !typeof items[i].value == 'string'
          ? parseFloat(items[i].value)
          : items[i].value;
      let label = items[i].label;
      let hasValue = items[i].value || items[i].value === 0;
      if (items[i].label === commonLocale.noteLocale) {
        rows.push(
          <Row gutter={[24, 12]} key={guid()}>
            {currentRowCols}
          </Row>
        );
        const noteCols = [];
        noteCols.push(
          <Col className={styles.leftSpan} key={guid()} span={24}>
            {items[i].label + '：'}
            {items[i].value || items[i].value === 0 ? items[i].value : <Empty />}
          </Col>
        );
        rows.push(
          <Row gutter={[24, 12]} key={guid()}>
            {noteCols}
          </Row>
        );
        currentRowCols = [];
      } else if (items[i].dbLength > 1000) {
        rows.push(
          <Row gutter={[12, 12]}>
            <Col span={2} style={{ fontWeight: 600 }}>
              {items[i].label + '：'}
            </Col>
            <Col
              span={22}
              className={styles.leftSpan}
              style={{ border: '1px dashed #000', marginTop: 5 }}
            >
              {items[i].value || <Empty />}
            </Col>
          </Row>
        );
      } else {
        if (items[i].rows && items[i].rows > 1) {
        }
        // if (currentRowCols.length < 4) {
        const index = rows.length === 0 ? 0 : rows.length;
        let rowCnt = gutterCols ? gutterCols[index] : 4;
        if (currentRowCols.length < rowCnt) {
          if (hasValue) {
            currentRowCols.push(
              <Col
                className={items[i].fontWeight ? styles.weightLeftSpan : styles.leftSpan}
                key={guid()}
                span={24 / rowCnt}
              >
                <IToolTip>
                  {label + '：'}
                  {value}
                </IToolTip>
              </Col>
            );
          } else {
            currentRowCols.push(
              <Col
                className={items[i].fontWeight ? styles.weightLeftSpan : styles.leftSpan}
                key={guid()}
                span={24 / rowCnt}
              >
                {label + '：'} <Empty />
              </Col>
            );
          }
        } else {
          rows.push(
            <Row gutter={[24, 12]} key={guid()}>
              {currentRowCols}
            </Row>
          );
          rowCnt = gutterCols ? gutterCols[index + 1] : 4;
          currentRowCols = [];
          if (hasValue) {
            currentRowCols.push(
              <Col
                className={items[i].fontWeight ? styles.weightLeftSpan : styles.leftSpan}
                key={guid()}
                span={24 / rowCnt}
              >
                <IToolTip>
                  {label + '：'}
                  {value}
                </IToolTip>
              </Col>
            );
          } else {
            currentRowCols.push(
              <Col
                className={items[i].fontWeight ? styles.weightLeftSpan : styles.leftSpan}
                key={guid()}
                span={24 / rowCnt}
              >
                {label + '：'} <Empty />
              </Col>
            );
          }
        }
      }
      if (i === items.length - 1 && currentRowCols.length > 0) {
        rows.push(
          <Row gutter={[24, 12]} key={guid()}>
            {currentRowCols}
          </Row>
        );
      }
    }

    return rows;
  };

  stopPropagation = event => {
    event.stopPropagation();
    this.props.onEdit();
  };

  stopCollapse = e => {
    e.stopPropagation();
  };

  render() {
    const genExtra = () =>
      this.props.onEdit && (
        <a className={styles.edit} onClick={event => this.stopPropagation(event)}>
          <Icon type="form" />
          <span>{formatMessage({ id: 'company.detail.label.edit' })}</span>
        </a>
      );
    //header={this.props.rightTile && <div onClick={e => this.stopCollapse(e)} style={{ float: 'right' }}>{this.props.rightTile}</div>}
    return (
      <div className={styles.viewPanelWrapper} style={this.props.style ? this.props.style : null}>
        <div className={styles.collapse}>
          <Collapse
            bordered={false}
            defaultActiveKey={this.props.isClose ? ['0'] : ['1']}
            style={{ backgroundColor: 'white' }}
            onChange={e => this.onCollapse(e)}
            expandIcon={({ isActive }) => (
              <div className={styles.titleWrappr}>
                <div className={styles.navTitle}>
                  <span>{this.props.title} </span>
                  {isActive ? (
                    <IconFont
                      style={{
                        fontSize: '16px',
                        color: '#848C96',
                        position: 'relative',
                        top: '1px',
                      }}
                      type="icon-arrow_fold"
                    />
                  ) : (
                    <IconFont
                      style={{
                        fontSize: '16px',
                        color: '#848C96',
                        position: 'relative',
                        top: '1px',
                      }}
                      type="icon-arrow_unfold"
                    />
                  )}
                </div>
              </div>
            )}
          >
            <Panel
              showArrow={!this.props.noCollapse}
              disabled={this.props.noCollapse}
              header={
                this.props.rightTile && (
                  <div
                    onClick={e => this.stopCollapse(e)}
                    style={{
                      float: 'right',
                      marginTop: '-12px',
                    }}
                  >
                    {this.props.rightTile}
                  </div>
                )
              }
              key="1"
              extra={genExtra()}
              style={{ border: 0 }}
            >
              <div className={styles.contentWrapper}>
                {this.props.children}
                {!this.props.children && this.drawRows()}
                {this.props.drawOther && this.props.drawOther}
              </div>
            </Panel>
          </Collapse>
        </div>
      </div>
    );
  }

  onCollapse = e => {
    if (this.props.onCollapse) {
      setTimeout(this.props.onCollapse, 5);
    }
  };
}
