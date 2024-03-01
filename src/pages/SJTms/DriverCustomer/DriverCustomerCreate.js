/*
* @Description: 司机服务新建和编辑页面
* @authors: xuqifeng ChenGuangLong
* @注意：低代码配置里面要设置全部允许空值  因为重写了也看不到那些必填的字段 会导致无法校验
*/
import React from "react";
import { connect } from "dva";
import PageHeaderWrapper from "@/components/PageHeaderWrapper";
import Page from "@/pages/Component/Page/inner/Page";
import NavigatorPanel from "@/pages/Component/Page/inner/NavigatorPanel";
import { Button, Form, Modal, message, Table, Spin } from "antd";
import QuickCreatePage from "@/pages/Component/RapidDevelopment/OnlForm/Base/QuickCreatePage";
import { loginOrg } from "@/utils/LoginContext";
import LoadingIcon from "@/pages/Component/Loading/LoadingIcon";
import DriverCustomerLessBuy from "@/pages/SJTms/DriverCustomer/DriverCustomerLessBuy";
import DriverCustomerDutyBuy from "@/pages/SJTms/DriverCustomer/DriverCustomerDutyBuy";
import { getCargoDetails, onSaveGoodsDetailRecord } from "@/services/sjitms/DriverCustomerService";
import moment from "moment";

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
@Form.create()
export default class DriverCustomerCreate extends QuickCreatePage {
  state = {
    ...this.state,// QuickCreatePage的state
    loading: false,
    isModalVisible: false,// 货物搜索打开开关
    serviceBill: {},
    selectDetails: [], // 所选择的货品明细数据
    assistanceType: ""// 当前选中的协助类型 用来控制页面的变化
  }

  //表单加载的时候
  formLoaded = async () => {
    const { showPageNow } = this.props;
    const mainName = 'sj_driver_customer_service';
    if (showPageNow == 'create') {
      this.entity[mainName][0].WAREHOUSE = loginOrg().uuid;// 仓库
      this.entity[mainName][0].WAREHOUSENAME = loginOrg().name;// 仓库名称
      this.entity[mainName][0]['FEEDBACKTIME'] = moment().format('YYYY-MM-DD HH:mm:ss');//反馈时间
      //处理状态 默认是保存状态
      this.entity[mainName][0]['PROCESSINGSTATE'] = "Saved";
    }

    if (showPageNow === "update") {
      const serviceBill = this.props.params.entity;
      let { selectDetails } = this.state;
      // 处理状态（驳回保存变保存状态）
      if (serviceBill.PROCESSINGSTATE === "Rejected") {
        this.entity[mainName][0].PROCESSINGSTATE = "Saved";
      }
      //货品明细
      if (serviceBill.ASSISTANCETYPE !== "PROBLEMFEEDBACK") {
        const response = await getCargoDetails(serviceBill.UUID)
        if (response.success && response.data) {
          // 字段变量变来又变去真的有够麻烦的
          selectDetails = response.data?.map(item => {
            return {
              ...item,
              STORE: `[${item.customercode}]${item.customername}`,
              STORECODE: item.customercode,// 门店号码
              STORENAME: item.customername,// 门店名称
              SKU: `[${item.productcode}]${item.productname}`,// 货物
              SKUCODE: item.productcode,// 货物代码
              SKUNAME: item.productname,// 货物名称
              PICKBIN: item.productposition,// 货位
              QTY: item.productquantity,// 数量
              DELIVERYDATE: item.deliverydate,// 配送日期
              AMOUNT: item.productamount,// 总金额，与MONEY相同
              ISTAKEDELIVERY: item.istakedelivery || 0, // 是否取货，默认为0
              PRICE: item.productprice// 货品价格
            }
          });
        }
      }
      this.setState({ serviceBill, selectDetails, assistanceType: serviceBill.ASSISTANCETYPE });
    }
  }

  //字段change
  exHandleChange = columnEvent => {
    const { fieldName, valueEvent } = columnEvent;
    if (fieldName == 'ASSISTANCETYPE' && valueEvent) {
      this.setState({ assistanceType: valueEvent.value });
    }
    if (fieldName == 'PROBLEMTYPE' && valueEvent) {
      const timeLiness = this.entity.sj_driver_customer_service[0].PROCESSINGTIMELINESS;
      this.entity.sj_driver_customer_service[0].DEADLINE = moment().add(timeLiness, "h").format("YYYY-MM-DD HH:mm:ss");

      //盖章取消 协助内容非必填
      const { formItems } = this.state;
      const rules = formItems['sj_driver_customer_service_ASSISTCONTENT']?.rules || [];
      rules.forEach(rule => {
        if (rule.hasOwnProperty('required')) {
          rule.required = valueEvent.value != "PSTAMPOFF";
        }
      });
      this.setState({ formItems });
    }
  }

  //保存明细
  buildDetails = () => {
    const { selectDetails, assistanceType } = this.state;
    if (assistanceType !== "PROBLEMFEEDBACK") {
      return selectDetails?.map(dtl => {
        return {
          CUSTOMERCODE: dtl.STORECODE,// 门店号码
          CUSTOMERNAME: dtl.STORENAME,// 门店名称
          PRODUCTCODE: dtl.SKUCODE,// 货物代码
          PRODUCTNAME: dtl.SKUNAME,// 货物名称
          PRODUCTPOSITION: dtl.PICKBIN,// 货位
          PRODUCTQUANTITY: dtl.QTY,// 货物数量
          DELIVERYDATE: dtl.APPLICATIONDATE,// 配送日期
          PRODUCTAMOUNT: dtl.AMOUNT,// 货物金额
          ISTAKEDELIVERY: 0,// 是否取货
          PRODUCTPRICE: dtl.PRICE// 货品价格
        }
      });
    }
  }

  //保存前校验
  beforeSave = () => {
    const { selectDetails, assistanceType } = this.state;
    if (selectDetails.length === 0 && assistanceType !== "PROBLEMFEEDBACK") {
      message.error("请先选择货品！");
      return false;
    }
    const details = this.buildDetails();
    this.entity.sj_driver_store_goods_detail = details;
  }

  //子传父的货品明细数据
  getGoodsDetail = (isModalVisible, selectedRows) => {
    this.setState({ isModalVisible: isModalVisible, selectDetails: selectedRows });
  };

  render() {
    const { isModalVisible, selectDetails, assistanceType } = this.state;
    const isDutyBuy = assistanceType === "CARGOHANDLING";
    return (
      <PageHeaderWrapper>
        <Spin indicator={LoadingIcon("default")} delay={5} spinning={this.state.loading}>
          <Page>
            <NavigatorPanel
              title={"司机服务单"}
              style={{ marginLeft: -12 }}
              action={this.drawCreateButtons()}
            />
            <div style={{ height: "calc(100vh - 165px)", overflowY: "auto", overflowX: "hidden" }}>
              <Form onChange={this.onChange} autoComplete="off">
                {this.drawFormItems()}
              </Form>
              {/* 下面的货品选择框显示 */}
              {["REVIEWMONITORING", "STAMPOFF", "CARGOHANDLING"].includes(assistanceType) ?
                <div>
                  <div>
                    <Button type="primary"
                      style={{ margin: "0 20px" }}
                      onClick={() => this.setState({ isModalVisible: true })}>
                      搜索货品
                    </Button>
                    <Button type="danger"
                      onClick={() => this.setState({ selectDetails: [] })}>
                      清空货品
                    </Button>
                    <span
                      style={{ marginLeft: "34%", fontSize: "large", fontWeight: 800 }}
                      className={"ant-form-item-required"}>
                      {isDutyBuy ? "责任买单" : "少货买单"}
                      货品明细
                    </span>
                  </div>
                  <Modal
                    footer={null}
                    centered
                    onCancel={() => this.setState({ isModalVisible: false })}
                    visible={isModalVisible}
                    width={"90%"}
                    bodyStyle={{ height: "calc(90vh)", overflowY: "auto" }}
                  >
                    {assistanceType === "REVIEWMONITORING" || assistanceType === "STAMPOFF" ?
                      <DriverCustomerLessBuy
                        quickuuid="sj_driver_customer_lessbuy"
                        getGoodsDetail={this.getGoodsDetail}
                      />
                      :
                      isDutyBuy ?     /* 货物处理:责任买单 */
                        <DriverCustomerDutyBuy
                          quickuuid="sj_driver_customer_dutypayment"
                          getGoodsDetail={this.getGoodsDetail}
                        />
                        : <></>
                    }
                  </Modal>
                  <Table
                    size="small"
                    dataSource={selectDetails}
                    scroll={{ x: true }}
                    style={{ margin: 10 }}
                    pagination={false} // 隐藏分页并显示所有数据
                    bordered
                    columns={[
                      { title: "货品", dataIndex: "SKU", key: "1" },
                      { title: "门店", dataIndex: "STORE", key: "2" },
                      { title: "货位", dataIndex: "PICKBIN", key: "4" },
                      { title: "数量", dataIndex: "QTY", key: "3" },
                      { title: "价格", dataIndex: "PRICE", key: "5" },
                      { title: "金额", dataIndex: "AMOUNT", key: "6" },
                    ]}
                  />
                </div>
                : <></>}
            </div>
          </Page>
        </Spin>
      </PageHeaderWrapper>
    );
  }
}