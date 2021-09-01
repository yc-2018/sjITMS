import { PureComponent } from "react";
import styles from './ViewPanel.less';
import { Tabs, Collapse } from 'antd';
import { formatMessage } from 'umi/locale';
import StandardTable from '@/components/StandardTable';

const Panel = Collapse.Panel;
const TabPane = Tabs.TabPane;
export default class TabsPanel extends PureComponent {
    drawPanel = () => {
        let items = this.props.items;
        let panels = [];
        items.forEach(function (item, index) {
            panels.push(
                <TabPane tab={item.props.title}
                    key={index + 1}
                >
                    {item}
                </TabPane>);
        });
        return panels;
    }
    render() {
        return (
            <div className={styles.viewPanelWrapper}>
                <div className={styles.collapse}>
                    <Collapse bordered={false} defaultActiveKey={['1']}>
                        <Panel header={
                            this.props.title &&
                            <div className={styles.titleWrappr}>
                                <div className={styles.navTitle}>
                                    <span>{this.props.title}</span>
                                </div>
                            </div>}
                            key="1"
                            style={{ 'border': 0 }}
                            showArrow={false}>
                            <div className={styles.contentWrapper}>
                                <Tabs bordered={false} defaultActiveKey="1">
                                    {this.drawPanel()}
                                </Tabs>
                            </div>
                        </Panel>
                    </Collapse>
                </div>
            </div>
        );
    }
}