/**
 * 审核门店经纬度
 * @author ChenGuangLong
 * @since 2024/5/27
*/
import { Button, Col, Empty, Form, message, Modal, Popconfirm, Row } from 'antd'
import { connect } from 'dva'
import React from 'react'
import AMapLoader from '@amap/amap-jsapi-loader'
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage'
import MyImg from '@/components/MyImg'
import styles from './AddrReportSearch.less'
import { audit, getStoreImgList, voided } from '@/services/sjitms/AddressReport'
import configs from '@/utils/config'
import { havePermission } from '@/utils/authority'
import BatchProcessConfirm from '@/pages/SJTms/Dispatching/BatchProcessConfirm'
import { AMapDefaultLoaderObj } from '@/utils/mapUtil'
import AddrReportGdMap from '@/pages/SJTms/AddrReport/AddrReportGdMap'

/**
 * 搜索列表界面
 * @author ChenGuangLong
 * @since 2024/5/23 14:23
 */
@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))

@Form.create()
export default class AddrReportSearch extends QuickFormSearchPage {
  map                   // 地图对象
  AMap                  // 高德地图类
  state = {
    ...this.state,
    isRadio: true,      // 【父类】表行是否单选
    MapVisible: false,  // 地图弹窗
    storeImages: [],    // 门店图片
    isAudited: false,   // 是否审核
  };

  componentDidMount = async () => {
    // 父类内容
    this.queryCoulumns();
    this.getCreateConfig();
    // 加载高德地图
    try {
      this.AMap = await AMapLoader.load(AMapDefaultLoaderObj);
    } catch (error) {
      message.error(`获取高德地图类对象失败:${error}`)
    }
  }

  /**
   * 搜索下方 表格上方的【自定义按钮】
   * @author ChenGuangLong
   * @since 2024/5/23 14:55
  */
  drawToolsButton = () => {
    const { selectedRows, MapVisible, storeImages, isAudited } = this.state
    const item = selectedRows[0] ?? {}

    return (
      <>
        {/* ——————————————-------------审核按钮-------------———————————————— */}
        <Button
          hidden={!havePermission(`${this.state.authority}.examine`)}
          type="primary"
          onClick={() => {
            if (selectedRows.length === 0) return message.error('请选择一条审核项')
            if (selectedRows.length > 1) return message.error('每次只能选择一条审核')
            const audited = item.STATNAME !== '待审核' // 不是待审核状态也能点进去看地图 就是控制按钮显示与否
            if (audited) message.error(`${item.STATNAME}状态不能审核,允许查看`)

            this.setState({ isAudited: audited, MapVisible: true, storeImages: [] }, () => {
            })
            // 请求门店图片
            getStoreImgList(item.UUID).then(res => {
              this.setState({
                storeImages: res?.data?.map(i => `${configs[API_ENV].API_SERVER}/itms-schedule/itms-schedule/addressReport/seeImg/${i.imgUrl}`) ?? []
              })
            })
          }}
        >
          单张详细审核
        </Button>

        {/* ------------一键通过---------------- */}
        <Button
          onClick={() => {
            if (selectedRows.length === 0) return message.error('请选择一条及以上审核项')
            // 全部都要是待审核状态
            if (selectedRows.some(i => i.STATNAME !== '待审核')) return message.error(`${selectedRows.find(i => i.STATNAME !== '待审核').STATNAME}状态不能审核`)
            this.batchProcessConfirmRef.show('审核', selectedRows, x => audit(x.UUID), this.onSearch, <b style={{color: 'red'}}>请认真检查经纬度！以免后续司机找不到门店位置！</b>)
          }}
        >
          一键通过
        </Button>

        {/* ------------一键作废---------------- */}
        <Button
          onClick={() => {
            if (selectedRows.length === 0) return message.error('请选择一条及以上要作废的项')
            if (selectedRows.some(i => i.STATNAME !== '待审核')) return message.error(`${selectedRows.find(i => i.STATNAME !== '待审核').STATNAME}状态不能作废`)
            this.batchProcessConfirmRef.show('作废', selectedRows, x => voided(x.UUID), this.onSearch)
          }}
        >
          一键作废
        </Button>
        <BatchProcessConfirm onRef={node => (this.batchProcessConfirmRef = node)}/>


        {/* ——————————————-------------地图审核弹窗-------------———————————————— */}
        <Modal
          className={styles.mapReviewIkunModal}
          style={{ top: 0 }}
          title="门店经纬度 地图审核"
          visible={MapVisible}
          width="100%"
          onCancel={() => this.setState({ MapVisible: false })}
          footer={
            <>
              {!isAudited &&
                <>
                  <Popconfirm title="确认通过审核？" onConfirm={() => this.handleAudit('通过')}>
                    <Button type="primary">通过审核</Button>
                  </Popconfirm>

                  <Popconfirm title="确认作废该单？" onConfirm={() => this.handleAudit('作废')}>
                    <Button type="danger">作废该单</Button>
                  </Popconfirm>
                </>
              }
              <Button onClick={() => this.setState({ MapVisible: false })}>返回</Button>
            </>
          }
        >
          <Row>
            {/* ------———-----———————————左边地图———————————————--------- */}
            <Col span={19}>
              <div style={{ fontWeight: 'bold', textAlign: 'center', marginBottom: 5 }}>
                <span style={{ marginRight: 40 }}>排车单: {item.BILLNUMBER}</span>
                <span style={{ marginRight: 40 }}>司机: {item.CARRIERCODENAME}</span>
                <span style={{ marginRight: 40 }}>送货点: {item.DELIVERYPOINTCODENAME}</span>
              </div>
              <div style={{ fontWeight: 'bold', textAlign: 'center', marginBottom: 10 }}>
                <span style={{ marginRight: 40 }}>送货点位置: {item.DELIVERYPOINTADDRESS}</span>
                <span style={{ marginRight: 40 }}>经度: {item.LONGITUDE}</span>
                <span style={{ marginRight: 40 }}>纬度: {item.LATITUDE}</span>
              </div>
              <AddrReportGdMap AMap={this.AMap} reportData={item}/>
            </Col>

            {/* ------———-----———————————右边图片———————————————--------- */}
            <Col span={5}>
              <div style={{ fontWeight: 'bold', textAlign: 'center', marginBottom: 20 }}>
                司机上传的门店图片
              </div>
              <div style={{ height: '81vh', overflow: 'auto' }}>
                {storeImages.length === 0 ? <Empty/> : <MyImg images={storeImages}/>}
              </div>
            </Col>
          </Row>
        </Modal>
      </>
    )
  }

  /**
   * 审核请求
   * @param {'通过'|'作废'} type - 必填， 请求类型
   * @author ChenGuangLong
   * @since 2024/5/27 9:44
  */
  handleAudit = async (type) => {
    const { selectedRows } = this.state;
    if (selectedRows?.length !== 1) return;
    const item = selectedRows[0]
    let reps  // case里面定义变量会提示 no-case-declarations

    switch (type) {
      case "通过":
        reps = await audit(item.UUID)
        if (reps.success) {
          this.onSearch()   // 刷新列表数据
          message.success('审核成功')
          return this.setState({ MapVisible: false })
        }
        return message.error(reps.message)

      case "作废":
        reps = await voided(item.UUID)
        if (reps.success) {
          this.onSearch()   // 刷新列表数据
          message.success('作废成功')
          return this.setState({ MapVisible: false })
        }
        return message.error(reps.message)

      default:
        message.error('请求值异常');
    }
  }

}
