import React, { Component } from 'react'
import {Table,Button} from 'antd';
import {connect} from 'dva'

@connect(({ zztest, loading }) => ({
    zztest,
    loading: loading.models.zztest,
  }))
export default class ZzList extends Component {

    /**
     * 显示新建/编辑界面
     */
    onCreate = (uuid) => {
       
        const payload = {
        showPage: 'create'
        }
        if (uuid != '') {
        payload.entityUuid = uuid;
        }
        this.props.dispatch({
        type: 'zztest/showPage',
        payload: {
            ...payload
        }
        });
    }
    
    render() {
        // console.log("zzzzz",this.props.list)
        const columns = [
            {
              title: '姓名',
              dataIndex: 'name',
              key: 'name',
            //   sorter: true,
            //   width: colWidth.codeColWidth,
              align:'center'
              // render: text => <a>{text}</a>,
            },
            {
              title: '年龄',
              dataIndex: 'age',
              key: 'age',
              align:'center'
            },
            {
              title: '地址',
              dataIndex: 'address',
              key: 'address',
              align:'center'
            },
            {
              title: '性别',
              key: 'sex',
              dataIndex: 'sex',
              align:'center'
            },
            {
              title: '手机号',
              key: 'phone',
              dataIndex: 'phone',
              align:'center'
            },
            {
              title: '操作',
              key: 'action',
              align:'center',
              render: (text, record) => (
                <div>
                  <Button >修改</Button>
                  <Button >删除</Button>
                </div>
              ),
            },
          ];
        return (
            <div>
                <button onClick={this.onCreate}>新建</button>
                <Table  bordered='true'  columns={columns}  dataSource={this.props.list} rowKey="id"/>
            </div>
           
        )
    }
}
