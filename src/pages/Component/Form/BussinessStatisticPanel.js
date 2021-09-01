import { PureComponent } from "react";
import styles from './ViewPanel.less';
import { Col, Row, Icon, Statistic, Tabs, Card, Collapse } from 'antd';
import { formatMessage } from 'umi/locale';
import { guid } from '@/utils/utils';
const { TabPane } = Tabs;
const Panel = Collapse.Panel;


export default class BussinessStatisticPanel extends PureComponent {
    constructor(props) {
        super(props);
    }

    drawTabPanes = () => {
        let tabPanes = [];

        let items = this.props.items;
        for (let i = 0; i < items.length; i++) {

            tabPanes.push(
                <TabPane key={i} tab=
                    {
                        <Row gutter={8} style={{ width: 138, margin: '8px 0' }}>
                            <Col span={14}>
                                <Statistic title={items[i].label} value={items[i].value ? items[i].value : "0"} />
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