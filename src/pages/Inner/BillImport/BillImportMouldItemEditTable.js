import { PureComponent, Fragment } from "react";
import { Button, Table, Popconfirm, Input, message, Modal } from 'antd';
import FormTitle from '@/pages/Component/Form/FormTitle';
import ToolbarPanel from '@/pages/Component/Page/inner/ToolbarPanel';
import { itemColWidth } from '@/utils/ColWidth';
import { placeholderLocale, commonLocale } from '@/utils/CommonLocale';

/**
 * 单据明细编辑表格，自带新增一行、删除一行、批量删除功能
 * 如果新增一行时有需要初始化的值可通过传入属性newMember来自定义新增方法，也可在列渲染的时候当该列为空时给默认值
 * 明细列自带：行号、备注、操作列，调用者不用关心这些列
 * 调用者传入data属性，展示表格初始行，并提供fieldChange方法监控每个列输入框的变化，实时渲染表格
 * 调入者传入 notNote 则不显示备注列
 */
export default class BillImportMouldItemEditTable extends PureComponent {

    constructor(props) {
        super(props);

        this.state = {
            selectedRows: props.selectedRows ? props.selectedRows : [],
            selectedRowKeys: props.selectedRowKeys ? props.selectedRowKeys : [],
            data: props.data,
            infinityData: [],
            index: 0
        };
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            data: nextProps.data
        });
        if (nextProps.selectedRows && (nextProps.selectedRows.length == 0 && this.state.selectedRows.length != 0)) {
            this.setState({
                selectedRows: nextProps.selectedRows ? nextProps.selectedRows : [],
                selectedRowKeys: nextProps.selectedRowKeys ? nextProps.selectedRowKeys : [],
            });
        }
    }

    remove = (line) => {
        const { data, index } = this.state;
        for (let i = data.length - 1; i >= 0; i--) {
            if (data[i].line === line) {
                data.splice(i, 1);
            }
        }

        for (let i = 0; i < data.length; i++) {
            data[i].line = i + 1;
        }

        this.setState({
            data: data,
            index: index + 1
        });
        this.props.onTableChange();
    }

    newMember = () => {
        if (this.props.newMember) {
            this.props.newMember();
            return;
        }

        const { data, index } = this.state;
        data.push({
            line: data.length + 1,
            unAdd: true,
            remove: true
        });
        this.setState({
            data: data,
            index: index + 1
        });
        this.props.onTableChange();
    }

    handleFieldChange = (e, field, line) => {
        const { data, index } = this.state;
        data[line - 1][field] = e.target.value;
        this.setState({
            data: data,
            index: index + 1
        });
    }

    buildColumns = () => {
        const { columns } = this.props;
        if (columns[columns.length - 1].key === 'action') {
            return columns;
        }

        if (!columns.find(item => item.key === 'line')) {
            columns.unshift(
                {
                    title: commonLocale.lineLocal,
                    dataIndex: 'line',
                    key: 'line',
                    width: itemColWidth.lineColWidth,
                    render: (text, record, index) => <span>{record.line}</span>
                }
            );
        }
        columns.push(
            {
                title: '操作',
                key: 'action',
                width: itemColWidth.operateColWidth,
                fixed: 'right',
                render: (text, record) => {
                    if (record.remove) {
                        return (
                            <span>
                                <Popconfirm title="是否要删除此行？" onConfirm={() => this.props.remove ? this.props.remove(record.line) : this.remove(record.line)}>
                                    <a>{commonLocale.deleteLocale}</a>
                                </Popconfirm>
                            </span>
                        );
                    }
                },
            }
        );
        return columns;
    }

    getTotalWidth = (columns) => {
        let totalWidth = 0;
        columns.forEach(e => {
            if (e.key !== 'action' && e.width) {
                totalWidth = totalWidth + e.width;
            }
        });

        return totalWidth;
    }

    rowSelection = {
        columnWidth: 40,
        onChange: (selectedRowKeys, selectedRows) => {
            this.setState({
                selectedRows: selectedRows,
                selectedRowKeys: selectedRowKeys
            });
            if (this.props.rowSelection)
                this.props.rowSelection(selectedRowKeys, selectedRows);
        }
    };

    handleFetch = () => {
        if (!this.state.data)
            return;

        let startIndex = this.state.infinityData.length;
        if (startIndex >= this.state.data.length)
            return;

        let infinityData = this.state.infinityData;
        let newData = this.state.data.slice(startIndex, startIndex + 10);

        this.setState({
            infinityData: infinityData.concat(newData)
        });
    };

    refreshColumns = (columns) => {
        columns.forEach(e => {
            if (e.width) {
                e.onCell = () => {
                    return {
                        style: {
                            maxWidth: e.width,
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                            cursor: 'pointer'
                        }
                    }
                }
            }
        });
    }
    render() {
        const { data } = this.state;
        this.rowSelection.selectedRowKeys = this.state.selectedRowKeys;
        let button = <Button
            style={{ width: '100%', marginTop: 16, marginBottom: 8 }}
            type="dashed"
            onClick={this.newMember}
            icon="plus"
        >新增明细</Button>;
        let rMargin = 100 + parseInt(data.length / 10) * 24 + 'px';
        const columns = this.buildColumns();
        const tableElement = document.getElementById("editTable");
        let totalWidth = this.getTotalWidth(columns);
        const tableWidth = tableElement ? tableElement.offsetWidth : 0;

        let noteWidth = 0;
        if (!this.props.notNote) {
            noteWidth = itemColWidth.noteEditColWidth;
        }
        let scroll;
        if (totalWidth > tableWidth || (totalWidth + noteWidth) > tableWidth) {
            scroll = { x: (totalWidth + noteWidth) };
        }
        this.refreshColumns(columns);
        return (
            <div id="editTable">
                {this.props.title && <FormTitle title={this.props.title} />}
                <Table
                    // rowSelection={this.rowSelection}
                    rowKey={record => record.line}
                    columns={this.buildColumns()}
                    dataSource={data}
                    pagination={true}
                    scroll={this.props.scroll ? this.props.scroll : scroll}
                    size='middle'
                />
                {
                    button
                }
            </div>
        );
    }
}
