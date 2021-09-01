import { PureComponent } from "react";
import styles from './ViewPanel.less';
import { Col, Row, Icon, Collapse, Spin } from 'antd';
import { formatMessage } from 'umi/locale';
import Empty from '@/pages/Component/Form/Empty';
import { guid } from '@/utils/utils';
import { commonLocale } from '@/utils/CommonLocale';
const Panel = Collapse.Panel;

export default class ViewPanel extends PureComponent {
  constructor(props) {
    super(props);

  }

  drawRows = () => {
    let items = this.props.items;

    let rows = [];
    let currentRowCols = [];

    //对于备注等items长度为1的，单独处理
    if (items.length === 1) {
      if (items[0].label && items[0].label!==commonLocale.noteLocale)
        currentRowCols.push(<Col className={styles.leftSpan} key={guid()} span={3}>{items[0].label}</Col>);
      currentRowCols.push(<Col key={guid()} span={21} style={{ wordBreak: "break-all" }}>{(items[0].value || items[0].value === 0) ? items[0].value : <Empty />}</Col>);
      rows.push(<Row key={guid()}>{currentRowCols}</Row>);
      rows.push(<br key={guid()} />);
    } else {
      for (let i = 0; i < items.length; i++) {
        if (currentRowCols.length < 4) {
          currentRowCols.push(<Col className={styles.leftSpan} key={guid()} span={6}>{items[i].label}:&nbsp;&nbsp;{(items[i].value || items[i].value === 0) ? items[i].value : <Empty />}</Col>);
        } else {
          rows.push(<Row key={guid()}>{currentRowCols}</Row>);
          rows.push(<br key={guid()} />);
          currentRowCols = [];
          currentRowCols.push(<Col className={styles.leftSpan} key={guid()} span={6}>{items[i].label}:&nbsp;&nbsp;{(items[i].value || items[i].value === 0) ? items[i].value : <Empty />}</Col>);
        }

        if (i === items.length - 1) {
          rows.push(<Row key={guid()}>{currentRowCols}</Row>);
        }
      }
    }
    return rows;
  }


  stopPropagation = (event) => {
    event.stopPropagation();
    this.props.onEdit();
  }

  render() {

    const genExtra = () => (

      this.props.onEdit && (
        <a className={styles.edit} onClick={event => this.stopPropagation(event)}>
          <Icon type="form" />
          <span>{formatMessage({ id: 'company.detail.label.edit' })}</span>
        </a>
      )
    );

    return (
      <Spin spinning={this.props.showOrNot} tip="导入中...">
      <div className={styles.viewPanelWrapper}>
        <div className={styles.collapse}>
          <Collapse bordered={false} defaultActiveKey={this.props.isClose ? ['0'] : ['1']}>
            <Panel header={
              this.props.title &&
              <div className={styles.titleWrappr}>
                <div className={styles.navTitle}>
                  <span>{this.props.title}</span>
                </div>
              </div>}
              key="1"
              extra={genExtra()}
              style={{ 'border': 0 }}
              showArrow={false}>
              <div className={styles.contentWrapper}>
                {this.props.children}
                {!this.props.children && this.drawRows()}
              </div>
            </Panel>
          </Collapse>
        </div>
      </div>
      </Spin>
    );
  }
}
