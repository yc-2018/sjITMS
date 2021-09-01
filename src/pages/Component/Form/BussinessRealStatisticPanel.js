import { PureComponent } from "react";
import styles from './ViewPanel.less';
import { Col, Row, Icon, Statistic, Tabs, Card, Collapse } from 'antd';
import { formatMessage } from 'umi/locale';
import { guid } from '@/utils/utils';
const { TabPane } = Tabs;
const Panel = Collapse.Panel;


export default class BussinessRealStatisticPanel extends PureComponent {
    constructor(props) {
        super(props);
    }

    drawTabPanes = () => {
        let tabPanes = [];

        let items = this.props.items;
        for (let i = 0; i < items.length; i++) {
            let planValue = items[i].planValue ? items[i].planValue : "0";
            let realValue = items[i].realValue ? items[i].realValue : "0";
            let itemTitle = items[i].planLabel + " | " + items[i].realLabel;
            let itemValue = planValue + " | " + realValue;
            tabPanes.push(
                <TabPane key={i} tab=
                    {
                        <Row gutter={8} style={{ width: 138, margin: '8px 0' }}>
                            <Col span={14}>
                                <Statistic title={itemTitle} value={itemValue} />
                            </Col>
                        </Row>
                    } />
            );
        }
        return tabPanes;
    }


    render() {
        return (
            <div className={styles.viewPanelWrapper}>
                <div className={styles.collapse}>
                    <Collapse bordered={false} defaultActiveKey={['0']}>
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
                                <Card
                                    className={styles.offlineCard}
                                    bordered={false}
                                    bodyStyle={{ padding: '0 0 0 0' }}
                                >
                                    <Tabs styles={{ 'border-bottom': 'none' }}>
                                        {this.drawTabPanes()}
                                    </Tabs>
                                </Card>
                            </div>
                        </Panel>
                    </Collapse>
                </div>
            </div>
        );
    }
}