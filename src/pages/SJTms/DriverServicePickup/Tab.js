/*
* 责任买单组件
*/
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { connect } from 'dva';
import { Button, Input, message, Popconfirm } from 'antd'
import React from 'react';

@connect(({ quick, loading }) => ({
    quick,
    loading: loading.models.quick,
}))
export default class extends QuickFormSearchPage {
    constructor(props) {
        super(props);
        this.state = {
            ...this.state,
            DRIVERCODE:'',
            //设置弹出框的样式
            data: [{
                BILLUUID: "bd504e0c19fb436ea747e8cc13ff81f8",
                CUSTOMERCODE: "24250",
                CUSTOMERNAME: "(A)广东深圳龙华共和优乐佳美宜佳",
                ISTAKEDELIVERY: 0,
                PRODUCTAMOUNT: 4.3,
                PRODUCTCODE: "24054710",
                PRODUCTNAME: "魔爪能量风味饮料(奇异果苹果混合果味)330ml",
                PRODUCTPOSITION: "202_10",
                PRODUCTPRICE: 4.3,
                PRODUCTQUANTITY: 1,
                ROW_ID: 1,
                UUID: "4eb31f49-ebac-4d82-86d3-4725cbb1ba0a"}],
        };
    }

    componentDidMount() {
        this.queryCoulumns();
        this.getCreateConfig();
        this.empInputRef.focus()
    }
    //确认取货
    confirmPickup = () => {
        const { selectedRows } = this.state;
        if (selectedRows.length === 0) {
            message.error('请至少选中一条货品数据!');
        }
        console.log('███████selectedRows>>>>', selectedRows,'<<<<██████')
    };

    //该方法会覆盖所有的上层按钮
    drawActionButton = () => <></>;

    /** 绘制搜索表格 */
    drawSearchPanel = () => {
        let { isOrgQuery, defaultSort } = this.state;
        const { quickuuid } = this.props;
        return <div style={{ fontSize: 16, textAlign: 'center' }}>
            司机工号：
            <Input
                ref={input => (this.empInputRef = input)}
                allowClear
                style={{ width: 250, height: 40, fontSize: 16, margin: 15, }}
                onPressEnter={() => this.getData({
                    pageSize: 20,
                    order: defaultSort,
                    quickuuid: quickuuid,
                    superQuery: {
                        matchType: 'and',
                        queryParams: [...isOrgQuery,{
                            field: "DRIVERCODE",
                            rule: "eq",
                            type: "VarChar",
                            val: this.state.DRIVERCODE, //司机代码
                        }],
                    },
                })}
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
                <Button type={'primary'}  style={{ marginLeft: 10 }}>
                    确认取货
                </Button>
            </Popconfirm>
        </div>



}
