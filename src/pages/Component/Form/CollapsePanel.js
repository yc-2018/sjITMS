import { PureComponent } from "react";
import styles from './ViewPanel.less';
import { Collapse } from 'antd';
import { formatMessage } from 'umi/locale';
import StandardTable from '@/components/StandardTable';

const Panel = Collapse.Panel;
export default class CollapsePanel extends PureComponent {
  drawPanel = () => {
    let items = this.props.items;
    let panels = [];
    items.forEach(function (item, index) {
      panels.push(
        <Panel header={
          item.props.header &&
          <div className={styles.titleWrappr}>
            <div className={styles.navTitle}>
              <span>{item.props.header}</span>
            </div>
          </div>
        }
               key={index}
               showArrow={false}
               style={{ 'border': 0 }}>
          {item}
        </Panel>);
    });
    return panels;
  }
  render() {
    return (
      <div className={styles.viewPanelWrapper}>
        <Collapse bordered={false} defaultActiveKey={this.props.defaultOpen ? ['0'] : ['1']} style={{backgroundColor:'white'}}>
          {this.drawPanel()}
        </Collapse>
      </div>
    );
  }
}
