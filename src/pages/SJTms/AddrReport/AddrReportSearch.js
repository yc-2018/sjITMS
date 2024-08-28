/**
 * 审核门店经纬度
 * @author ChenGuangLong
 * @since 2024/5/27
*/
import { Button, Col, Empty, Form, message, Modal, Popconfirm, Row } from 'antd'
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { Map, Marker } from 'react-bmapgl'
import React from 'react'
import MyImg from '@/components/MyImg'
import ShopIcon from '@/assets/common/22.png';
import  styles from './AddrReportSearch.less'
import { audit, getStoreImgList, voided } from '@/services/sjitms/AddressReport'
import configs from '@/utils/config'
import { havePermission } from '@/utils/authority'
import BatchProcessConfirm from '@/pages/SJTms/Dispatching/BatchProcessConfirm'

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
  state = {
    ...this.state,
    MapVisible: false,  // 地图弹窗
    storeImages: [],    // 门店图片
    isAudited: false,   // 是否审核
  };

  /**
   * 搜索下方 表格上方的【自定义按钮】
   * @author ChenGuangLong
   * @since 2024/5/23 14:55
  */
  drawToolsButton = () => {
    const { selectedRows, MapVisible, storeImages, isAudited } = this.state
    const isOneItem = selectedRows?.length === 1
    const item = selectedRows[0] ?? {}

    return (
      <>
        {/* ——————————————-------------开始审核按钮-------------———————————————— */}
        <Button
          hidden={!havePermission(this.state.authority + '.examine')}
          type="primary"
          onClick={() => {
            if (selectedRows.length === 0) return message.error('请选择一条审核项')
            if (selectedRows.length > 1) return message.error('每次只能选择一条审核')
            if (item.STATNAME !== '待审核') message.error(`${item.STATNAME}状态不能审核,允许查看`)
            this.setState({ isAudited: item.STATNAME !== '待审核' })

            this.setState({ MapVisible: true, storeImages: [] })
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
            this.batchProcessConfirmRef.show('审核', selectedRows, this.onAudit, this.onSearch, <b style={{color: 'red'}}>请认真检查经纬度！以免后续司机找不到门店位置！</b>)
          }}
        >
          一键通过
        </Button>

        {/* ------------一键作废---------------- */}
        <Button
          onClick={() => {
            if (selectedRows.length === 0) return message.error('请选择一条及以上要作废的项')
            if (selectedRows.some(i => i.STATNAME !== '待审核')) return message.error(`${selectedRows.find(i => i.STATNAME !== '待审核').STATNAME}状态不能作废`)
            this.batchProcessConfirmRef.show('作废', selectedRows, this.onVoided, this.onSearch)
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
          width={'100%'}
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
              <Map
                center={                                    // 中心点坐标
                  isOneItem
                    ? new BMapGL.Point(item.LONGITUDE, item.LATITUDE)
                    : new BMapGL.Point(113.809388, 23.067107)
                }
                zoom={19}
                // tilt={30}                                // 地图倾斜角度
                enableTilt={false}                          // 是否开启地图倾斜功能
                enableRotate={false}                        // 是否开启地图旋转功能
                enableScrollWheelZoom                       // 是否开启鼠标滚轮缩放
                style={{ height: '78vh' }}                  // 地图容器父元素的style样式
                mapStyleV2={{ styleJson: eval(mapStyle) }}  // 个性化地图样式
              >
                {isOneItem &&
                  <Marker
                    icon={new BMapGL.Icon(ShopIcon, new BMapGL.Size(30, 30))}
                    position={new BMapGL.Point(item.LONGITUDE, item.LATITUDE)}
                  />
                }
              </Map>
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

    switch (type) {
      case "通过":
        const successReps = await audit(item.UUID)
        if (successReps.success) {
          this.onSearch()   // 刷新列表数据
          message.success('审核成功')
          return this.setState({ MapVisible: false })
        }else return message.error(successReps.message)

      case "作废":
        const voidedReps = await voided(item.UUID)
        if (voidedReps.success) {
          this.onSearch()   // 刷新列表数据
          message.success('作废成功')
          return this.setState({ MapVisible: false })
        } else return message.error(voidedReps.message)

      default:
        message.error('请求值异常');
    }
  }

  /**
   * 批量用，批量通过
   * @author ChenGuangLong
   * @since 2024/7/15 16:49
  */
  onAudit = async item => {
    return await audit(item.UUID);
  };

  /**
   * 批量用，批量作废
   * @author ChenGuangLong
   * @since 2024/7/15 16:48
  */
  onVoided = async item => {
    return await voided(item.UUID);
  };

}


/** 地图样式 */
const mapStyle=[
  {
    // 地图背景
    featureType: 'land',
    elementType: 'all',
    stylers: {
      color: '#dee8da',
      lightness: -1,
    },
  },
  {
    // 水路背景
    featureType: 'water',
    elementType: 'all',
    stylers: {
      color: '#a2c4c9ff',
      lightness: -1,
    },
  },
  {
    // 绿地背景
    featureType: 'green',
    elementType: 'all',
    stylers: {
      color: '#ffffccff',
      lightness: -1,
    },
  },
  {
    // 教育地区
    featureType: 'education',
    elementType: 'all',
    stylers: {
      color: '#d5a6bdff',
      lightness: -1,
    },
  },
]