import { PureComponent, Fragment, Component } from "react";
import { Button, Table, Popconfirm, message, Modal, Divider } from 'antd';
import FormTitle from '@/pages/Component/Form/FormTitle';
import ToolbarPanel from '@/pages/Component/Page/inner/ToolbarPanel';
import { VehiclePerm } from './VehicleLocale';

export default class ItemEditTable extends Component {

    constructor(props) {
        super(props);

        this.state = {
            selectedRows: props.selectedRows ? props.selectedRows : [],
            selectedRowKeys: props.selectedRowKeys ? props.selectedRowKeys : [],
            data: props.data ? props.data : [],
            index: 0
        };
    };

    componentWillReceiveProps(nextProps) {
        this.setState({
            data: nextProps.data ? nextProps.data : [],
            selectedRows: nextProps.selectedRows ? nextProps.selectedRows : [],
            selectedRowKeys: nextProps.selectedRowKeys ? nextProps.selectedRowKeys : [],
        });
    };

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
    };

    batchAdd = () => {
        this.props.handlebatchAddVisible();
    };

    batchRemove = () => {
        const { selectedRowKeys, data, index, selectedRows } = this.state;
        if (selectedRowKeys.length === 0) {
            message.warn('请先选择要删除行！');
            return;
        }
        this.props.batchRemove ? this.props.batchRemove(selectedRows) :
            Modal.confirm({
                title: '是否要删除选择行？',
                okText: '确定',
                cancelText: '取消',
                onOk: () => {
                    for (let i = data.length - 1; i >= 0; i--) {
                        if (selectedRowKeys.indexOf(data[i].line) >= 0) {
                            data.splice(i, 1);
                        }
                    }

                    for (let i = 0; i < data.length; i++) {
                        data[i].line = i + 1;
                    }

                    this.setState({
                        data: data,
                        index: index + 1,
                        selectedRows: [],
                        selectedRowKeys: []
                    });
                }
            });
    }

    newMember = () => {
        if (this.props.newMember) {
            this.props.newMember();
            return;
        }

        const { data, index } = this.state;
        data.push({
            line: data.length + 1,
            edit: true,
        });
        this.setState({
            data: data,
            index: index + 1
        });
    }

    handleFieldChange = (e, field, line) => {
        const { data, index } = this.state;
        data[line - 1][field] = e.target.value;
        this.setState({
            data: data,
            index: index + 1
        });
    }

    onEdit = (record) => {
        const { data } = this.state;
        data.forEach(element => {
            if (element.uuid === record.uuid && element.line === record.line)
                element.edit = true
        });
        this.setState({
            data: data
        })
    }

    onCancel = (record) => {
        const { data } = this.state;
        data.forEach(element => {
            if (element.line === record.line)
                element.edit = false
        });
        this.setState({
            data: data
        })
    }

    buildColumns = () => {
        const { columns } = this.props;

        if (columns[columns.length - 1].key === 'action') {
            return columns;
        }



        columns.push(
            {
                title: '操作',
                key: 'action',
                render: (text, record) => {
                    if (record.edit) {
                        if (record.vehicle)
                            return (<div>
                                <a onClick={() => this.props.save && this.props.save(record)}>保存</a>
                                <Divider type="vertical" />
                                <a onClick={() => this.onCancel}>取消</a>
                            </div>)
                        else return (<div>
                            <a onClick={() => this.props.save && this.props.save(record)}>保存</a>
                            <Divider type="vertical" />
                            <a onClick={() => this.props.remove ? this.props.remove(record) : this.remove(record)}>删除</a>
                        </div>)
                    }
                    return (
                        <span>
                            <a onClick={() => this.onEdit(record)} disabled={!VehiclePerm.ADDEMP}>编辑</a>
                            <Divider type="vertical" />
                            <Popconfirm title="是否要删除此行？" onConfirm={() => this.props.remove ? this.props.remove(record) : this.remove(record.line)}>
                                <a disabled={!VehiclePerm.DELETEEMP}>删除</a>
                            </Popconfirm>
                        </span>
                    );
                },
            }
        );
        return columns;
    }

    rowSelection = {
        columnWidth: 40,
        onChange: (selectedRowKeys, selectedRows) => {
            this.setState({
                selectedRows: selectedRows,
                selectedRowKeys: selectedRowKeys
            });
        }
    };

    render() {
        const { data } = this.state;
        this.rowSelection.selectedRowKeys = this.state.selectedRowKeys;

        return (
            <div>
                {this.props.title && <FormTitle title={this.props.title} />}
                {/*<ToolbarPanel>*/}
                    {/*<div style={{ float: "right", marginBottom: 12 }}>*/}
                        {/*/!* <a onClick={this.batchRemove} disabled={!VehiclePerm.DELETEEMP}>批量删除</a> *!/*/}
                        {/*<Popconfirm title="是否要删除所选数据？" onConfirm={this.batchRemove}>*/}
                            {/*<Button disabled={!VehiclePerm.DELETEEMP} type='primary'>删除</Button>*/}
                        {/*</Popconfirm>*/}
                    {/*</div>*/}

                    {/*&nbsp;*/}
                {/*</ToolbarPanel>*/}
                <Table
                  rowSelection={!this.props.unShowRow ? this.rowSelection : ''}
                  rowKey={record => record.line}
                    columns={this.buildColumns()}
                    dataSource={data}
                    pagination={false}
                    scroll={this.props.scroll}
                    size='middle'
                // selectedRows={this.state.selectedRows}
                />
                {
                    this.props.batchAdd ? null :
                        <Button
                            style={{ width: '100%', marginTop: 16, marginBottom: 8 }}
                            type="dashed"
                            onClick={this.newMember}
                            icon="plus"
                            disabled={!VehiclePerm.ADDEMP}
                        >
                            新增明细
                  </Button>
                }
            </div>
        );
    }
}
