/*
* 司机服务取货组件
*/
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { connect } from 'dva';
import { Button, Input, message, Popconfirm } from 'antd'
import React from 'react';
import { driverSvcPickup } from '@/services/sjitms/DriverCustomerService'

@connect(({ quick, loading }) => ({
    quick,
    loading: loading.models.quick,
}))
export default class extends QuickFormSearchPage {
    constructor(props) {
        super(props);
        this.state = {
            successList:[],     // 成功的UUID列表
            noTable:true,
            ...this.state,
            DRIVERCODE:'',   // 司机工号
        };
    }

    componentDidMount() {
        this.queryCoulumns()
        this.getCreateConfig()
        this.empInputRef?.focus() //进来直接获取司机工号输入框焦点
    }


    componentDidUpdate(_prevProps, prevState,_) {
        // 有数据才显示表格
        if (prevState.data !== this.state.data) {
            if (this.state.data?.list?.length > 0)
                this.setState({ noTable: false })
            else
                this.setState({ noTable: true })
        }
    }


    /** 确认取货 */
    confirmPickup = async () => {
        const { selectedRows } = this.state;
        if (selectedRows.length === 0) return message.error('请至少选中一条货品数据!');
        const uuidList = selectedRows.map(item => item.UUID)    // 选中的全部UUID
        const uuids = uuidList.filter(item => !this.state.successList.includes(item))   // 过滤掉已经成功的UUID
        if (uuids.length === 0) return message.info('你选择的货品都已经取货啦')
        if (uuids.length !== uuidList.length) message.warning('已过滤已取货的~')

       const resp = await driverSvcPickup(uuids)
        if (resp.success) {
            message.success('操作成功!')
            this.setState({ successList: [...this.state.successList, ...uuids]})
        }
    };

    /**
     * @description 改变每一行的数据展示（这里改变颜色）
     * @param row 一行数据
     * */
    drawcell = row => {
        if (this.state.successList.includes(row.record.UUID)) {
            row.component = (
                <div style={{ backgroundColor: '#47ff00' }}>{row.val}✔</div>
            )
        }
    }


    //该方法会覆盖所有的上层按钮
    drawActionButton = () => <></>;

    /** 绘制搜索 */
    drawSearchPanel = () => {
        let { isOrgQuery } = this.state;
        return <div style={{ fontSize: 16, textAlign: 'center' }}>
            司机工号：
            <Input
                ref={input => (this.empInputRef = input)}
                allowClear
                style={{ width: 250, height: 40, fontSize: 16, margin: 15, }}
                onPressEnter={() =>
                    this.setState({
                        pageFilters:
                            {
                                ...this.state.pageFilters, superQuery: {
                                    matchType: 'and',
                                    queryParams: [{
                                        field: 'DRIVERCODE',
                                        rule: 'eq',
                                        type: 'VarChar',
                                        val: this.state.DRIVERCODE, //司机代码
                                    },...isOrgQuery],
                                }
                            },noTable: false
                    },()=>this.getData(this.state.pageFilters))
                }
                placeholder={'输入司机工号'}
                onChange={e => this.setState({ DRIVERCODE: e.target.value })}
            />
        </div>
    }

    //该方法会覆盖所有的中间功能按钮
    drawToolbarPanel = () =>
        <div style={{ marginBottom: 10 }}>
            <Popconfirm
                title="确认取货?"
                onConfirm={this.confirmPickup}
                style={{ marginLeft: 10 }}
            >
                <Button type={'primary'}  style={{ marginLeft: 10, visibility: this.state.selectedRows.length > 0 ? 'visible' :'hidden'}}>
                    确认取货
                </Button>
            </Popconfirm>
        </div>


    /** 绘制其他组件：没数据时提示组件 */
    drawOtherCom = () =>
        <div style={{ marginBottom: 10, fontSize: 55, textAlign: 'center', color: '#ff0000'}}>
            {!this.state.pageFilters?.superQuery?.queryParams?.[0]?.val? '请输入司机工号获取数据':
            this.state.data?.list?.length > 0 || this.props.loading ? <></> : '该工号暂无数据\n请检查输入是否正确'}
        </div>

}

