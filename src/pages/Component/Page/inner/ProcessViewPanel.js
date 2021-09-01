import { PureComponent } from "react";
import { Drawer, Row, Col, Timeline } from 'antd';
import { guid } from '@/utils/utils';
import Empty from '@/pages/Component/Form/Empty';
import styles from './ProcessViewPanel.less';

export default class ProcessViewPanel extends PureComponent {
    constructor(props) {
        super();

        let current = 0;
        if (props.data && Array.isArray(props.data)) {
            for (let i = 0; i < props.data.length; i++) {
                if (props.data[i].current) {
                    current = i;
                }
            }
        }
        this.state = {
            visible: props.visible,
            current: current
        }
    }

    componentWillReceiveProps(nextProps) {
        let current = 0;
        if (nextProps.data && Array.isArray(nextProps.data)) {
            for (let i = 0; i < nextProps.data.length; i++) {
                if (nextProps.data[i].current) {
                    current = i;
                }
            }
        }
        this.setState({
            visible: nextProps.visible,
            current: current
        });
    }

    onClose = () => {
        this.setState({
            visible: false
        });
        if (this.props.closeCallback) {
            this.props.closeCallback();
        }
    }

    drawDescription = (items) => {
        if (items && Array.isArray(items)) {
            const rows = [];
            let currentRowCols = [];
            for (let i = 0; i < items.length; i++) {
                if (currentRowCols.length < 3) {
                    currentRowCols.push(<Col key={guid()} span={8}>{items[i].label + "："}
                        {((items[i].value || items[i].value === 0) ? items[i].value : <Empty />)}</Col>);
                } else {
                    rows.push(<Row gutter={[24, 8]} key={guid()}>{currentRowCols}</Row>);
                    currentRowCols = [];
                    currentRowCols.push(<Col key={guid()} span={8}>{items[i].label + "："}{
                        ((items[i].value || items[i].value === 0) ? items[i].value : <Empty />)}</Col>);
                }

                if (i === items.length - 1) {
                    rows.push(<Row gutter={[24, 8]} key={guid()}>{currentRowCols}</Row>);
                }
            }
            return <div className={styles.info}>{rows}</div>;
        }
        return "";
    }

    drawStep = () => {
        const teps = [];
        const { data } = this.props;
        if (data && Array.isArray(data)) {
            for (let i = 0; i < data.length; i++) {
                const item = data[i];
                teps.push(<Timeline.Item className={i <= this.state.current - 1 ? styles.TimelineItem : ""} color={i <= this.state.current ? '#3B77E3' : 'gray'}>
                    {item.title} <span className={styles.subTitle}>{item.subTitle}</span>
                    {this.drawDescription(data[i].description)}
                </Timeline.Item>);
            }
        }
        return teps;
    }

    render() {
        const { data } = this.props;
        const { visible, current } = this.state;
        return (
            <Drawer
                headerStyle={{ height: '46px' }}
                title={this.props.title ? this.props.title : "流程进度"}
                placement="right"
                closable={true}
                visible={visible}
                onClose={this.onClose}
                width={this.props.width ? this.props.width : '618px'}
                maskClosable={true}
            >
                <Timeline className={styles.Timeline}>
                    {this.drawStep()}
                </Timeline>
            </Drawer>
        );
    }
}
