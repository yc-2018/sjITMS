import { PureComponent } from "react";
import styles from './ViewPanel.less';
import { formatMessage } from 'umi/locale';
import StandardTable from '@/components/StandardTable';
import { Col, Row, Icon, Collapse } from 'antd';
import { itemColWidth } from '@/utils/ColWidth';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import Empty from '@/pages/Component/Form/Empty';
import { commonLocale } from '@/utils/CommonLocale';
import NestTable from '@/components/NestTable';
import IconFont from '@/components/IconFont';
const Panel = Collapse.Panel;
/**
 * noPagination true->不展示分页
 * notNote true -> 不展示备注
 * hasPagination ->自定义分页信息 用于分页查询出的明细
 */
export default class ViewNestTablePanel extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            page: 0,
            pageSize: 10,
            columns: this.props.columns ? this.props.columns : [],
            nestColumns: props.nestColumns? props.nestColumns : [],
            noteWidth: 0
        }
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.columns && nextProps.columns != this.props.columns) {
            this.setState({
                columns: nextProps.columns
            })
        }
        if (nextProps.columns.length > 0 && nextProps.notNote == undefined) {
            nextProps.columns.push({
                title: commonLocale.noteLocale,
                dataIndex: 'note',
                render: text => text ? <EllipsisCol colValue={text} /> : <Empty />,
                width: itemColWidth.noteEditColWidth
            });

            this.setState({
                noteWidth: itemColWidth.noteEditColWidth,
                columns: [...nextProps.columns]
            })
        }
    }

    getPageData = () => {
        const { page, pageSize } = this.state;
        const data = this.props.data;
        let pageData = [];
        let end = (page + 1) * pageSize;
        if (data.length < end) {
            end = data.length;
        }
        for (let i = page * pageSize; i < end; i++) {
            pageData.push(data[i]);
        }
        const pagination = {
            total: data.length,
            pageSize: pageSize,
            current: page + 1,
            showTotal: total => `共 ${total} 条`,
        }
        return {
            list: pageData,
            pagination: this.props.noPagination ? null : pagination
        };
    }

    /**
    * 表格内容改变时，调用此方法
    */
    handleStandardTableChange = (pagination, filtersArg, sorter) => {
        this.setState({
            page: pagination.current - 1,
            pageSize: pagination.pageSize
        });
        if (this.props.hasPagination)
            this.props.refreshTable(pagination.current - 1, pagination.pageSize);
    };

    getTotalWidth = (columns) => {
        let totalWidth = 0;
        columns.forEach(e => {
            if (e.width) {
                totalWidth = totalWidth + e.width;
            }
        });

        return totalWidth;
    }

    render() {
        const { columns, nestColumns, noteWidth } = this.state;

        const tableElement = document.getElementById("viewTable");
        let totalWidth = this.getTotalWidth(columns);
        const tableWidth = tableElement ? tableElement.offsetWidth : 0;
        let scroll;
        if (totalWidth > tableWidth || (totalWidth + noteWidth) > tableWidth) {
            scroll = { x: totalWidth + noteWidth };
        }
        const paginationProps = {
            showSizeChanger: true,
            showQuickJumper: true,
            ...this.props.pagination,
        };
        return (
            <div className={styles.viewTablePanelWrapper}>
                <Collapse bordered={false} defaultActiveKey={['1']}
                          expandIcon={({ isActive }) =>
                            <div className={styles.titleWrappr}>
                              <div className={styles.navTitle}>
                                <span>{this.props.title} </span>
                                {isActive ?
                                  <IconFont style={{ fontSize: '16px', color: '#848C96', position: 'relative', top: '1px' }}
                                            type="icon-arrow_fold"/> :
                                  <IconFont style={{ fontSize: '16px', color: '#848C96', position: 'relative', top: '1px' }}
                                            type="icon-arrow_unfold"/>}
                              </div>
                            </div>
                          }
                          style={{ backgroundColor: 'white' }} >
                    <Panel
                        key="1"
                        style={{ 'border': 0 }}
                       >
                        <div id="viewTable">
                            <NestTable
                                rowKey={record => record.uuid ?  record.uuid : record.line}
                                unShowRow={true}
                                data={this.props.hasPagination ? this.props.data : this.getPageData()}
                                columns={columns}
                                nestColumns={nestColumns}
                                onChange={this.handleStandardTableChange}
                                selectedRows={[]}
                                scroll={this.props.scroll ? this.props.scroll : scroll}
                                expandedRowRender={this.props.expandedRowRender ? this.props.expandedRowRender : undefined}
                                onExpand={this.props.onExpand ? this.props.onExpand : undefined}
                            />
                        </div>
                    </Panel>
                </Collapse>
            </div>
        );
    }
}
