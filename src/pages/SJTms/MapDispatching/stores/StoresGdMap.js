// ////////////////////////////////////// 门店地图高德版 //////////////////////////////// //
import React, { Component } from 'react';
import AMapLoader from '@amap/amap-jsapi-loader'


import { Button, Row, Col, Spin, message, Input, PageHeader, Select, Upload, Drawer, Card, } from 'antd';
import moment from 'moment';
import * as XLSX from 'xlsx';
import copy from 'copy-to-clipboard';

import { AMAP_KEY, AMapDefaultConfigObj, getMyjIcon } from '@/utils/mapUtil'
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { shencopy } from '@/utils/SomeUtil';

import SearchForm from '@/pages/SJTms/MapDispatching/stores/SearchForm';
import Page from '@/pages/Component/RapidDevelopment/CommonLayout/Page/Page';
import AddressReportForm from '@/pages/SJTms/AddressReport/AddressReportForm';

import LoadingIcon from '@/pages/Component/Loading/LoadingIcon';
import noStore from '@/assets/common/no_store.jpeg';

import PageHeaderWrapper from '@/components/PageHeaderWrapper';

import { updateEntity } from '@/services/quick/Quick';
import { queryAuditedOrderByStoreMap, queryStoreMaps } from '@/services/sjitms/OrderBill';

import style from './DispatchingMap.less';
import  mapStyle from  './storesGdMap.less'
import MyjRedIcon from '@/assets/common/MyjRedMin.png'

const { Search } = Input;
const { Option } = Select;
const { Meta } = Card;

export default class StoresGdMap extends Component {
  basicOrders = [];
  text = null                   // 高德地图文本对象
  myjRedMarkers = []           // 美宜佳红色坐标记录列表
  myjGreenMarkers = []         // 美宜佳绿色坐标记录列表
  AMap = null                   // 高德地图对象
  map = null                    // 高德地图实例
  openDragStore = false     // 是否开启拖拽门店
  searchStoreMarkers = []     // 搜索门店点位列表
  infoWindow = null            // 高德搜索点位信息窗体
  currentMarker = null         // 拖拽门店当前点位
  newMarker = null             // 拖拽门店新点位

  state = {
    storeInfoVisible: false,
    loading: false,
    pageFilter: [],
    orders: [],
    otherData: [],
    storePages: '500',
    storeParams: [],
    reviewVisible: false,    // 门店审核抽屉
    storeView: undefined,    // 抽屉的门店数据
    searchStoreList: [],     // 搜索门店列表（左边渲染)
    openDragStore: false,    // 是否开启门店拖拽
  }

  componentDidMount = async () => {
    try { // 加载高德地图，放在最前面
      const AMap = await AMapLoader.load({key: AMAP_KEY, version: "2.0"});
      this.AMap = AMap;
      window.setTimeout(() => {
        this.map = new AMap.Map('GdStoreMap', AMapDefaultConfigObj)  // GdStoreMap是高德要加载的元素的id，🔴一定要唯一🔴
        this.addAMapMenu()  // 右键菜单
      }, 100)
    } catch (error) {
      message.error(`获取高德地图类对象失败:${error}`)
    }

    this.changePage('500')
  }

  /** 增加菜单 */
  addAMapMenu = () => {
    const { map, AMap } = this
    const contextMenu = new AMap.ContextMenu()  // 创建右键菜单

    contextMenu.addItem('门店审核', () => {
      contextMenu.close()
      this.setState({ reviewVisible: true })
    }, 1)

    contextMenu.addItem('今日配送门店', () => {
      contextMenu.close()
      const startDate = moment(new Date()).format('YYYY-MM-DD 00:00:00')
      const endDate = moment(new Date()).format('YYYY-MM-DD 23:59:59')
      this.refresh([{
        field: 'created',
        type: 'DateTime',
        rule: 'between',
        val: `${startDate}||${endDate}`,
      }])
    }, 2)

    // contextMenu.addItem(`${this.openDragStore ? '关闭' : '开启'}拖拽门店`, () => {
    //   contextMenu.close()
    //   this.openDragStore = !this.openDragStore // 允许拖拽
    //   this.myjRedMarkers.forEach(item => {
    //     item.setDraggable(this.openDragStore)
    //     item.setCursor(this.openDragStore ? 'move' : 'pointer')
    //   })
    //   this.addAMapMenu()      // 自我调用：重新加载右键菜单
    // }, 3)

    // 地图绑定鼠标右击事件——弹出右键菜单
    map.on('rightclick', e => {
      const { openDragStore } = this.state
      if (openDragStore) return // 开启拖拽时，右键菜单无效
      contextMenu.open(map, e.lnglat)
    })
  }

  /** 查询 */
  refresh = (params, pageSize, storeParams) => {
    if (this.state.openDragStore) {                           // 拖拽中，关闭
      this.setState({ openDragStore: false })           // 关闭拖拽变量
      this.map.remove([this.currentMarker, this.newMarker])
    }
    if (params.length <= 0) {
      this.changePage(
        this.state.storePages || '500',
        'onlySearchStore',
        storeParams
      );
      return;
    }
    this.setState({ loading: true });
    let { pageFilter, storePages } = this.state;
    let filter = {
      pageSize: pageSize || storePages,
      superQuery: { matchType: 'and', queryParams: [] },
    };
    pageFilter = params || pageFilter;

    const isOrgQuery = [
      { field: 'COMPANYUUID', type: 'VarChar', rule: 'eq', val: loginCompany().uuid },
      { field: 'DISPATCHCENTERUUID', type: 'VarChar', rule: 'eq', val: loginOrg().uuid },
    ];
    filter.superQuery.queryParams = [
      ...pageFilter,
      ...isOrgQuery,
      { field: 'PENDINGTAG', type: 'VarChar', rule: 'eq', val: 'Normal' },
    ];
    queryAuditedOrderByStoreMap(filter).then(async response => {
      if (response.success) {
        let data = response.data.records ?? [];
        data = data.filter(x => x.longitude && x.latitude)
        let otherData = response.data.otherRecords ?? [];
        otherData = otherData.filter(x => x.longitude && x.latitude)
        this.basicOrders = data;
        // 查询门店
        let storeRes = [];
        if (storeParams && JSON.stringify(storeParams) !== '{}') {
          storeRes = await this.getStoreMaps(pageSize || storePages, storeParams);
        }
        data.forEach(item => {item.isOrder = true})
        const orders = [...data, ...storeRes];
        setTimeout(() => {
          this.createMyjMarkers()
          this.map.setFitView() // 无参数时，自动自适应所有覆盖物
        }, 500);
        this.setState({ orders, otherData });
      }
      this.setState({ loading: false, pageFilter });
    });
  };


/**
 * 增加海量点
 * @author ChenGuangLong
 * @since 2024/10/23 15:00
*/
  addMassMarks = () => {
    const { orders = [] } = this.state
    const { map, AMap } = this
    this.redMass?.clear()
    if (orders.length === 0) return

    // 创建海量点
    this.redMass = new AMap.MassMarks(orders.map(item => ({
      lnglat: `${item.longitude},${item.latitude}]`,
      item,
    })), {
      zIndex: 111,
      cursor: 'pointer',
      style: {
        url: MyjRedIcon,
        anchor: new AMap.Pixel(10, 10),   // 锚点位置 一半一半 就是中心位置为锚点  以底部中心为锚点就应该是 new AMap.Pixel(10, 20)
        size: new AMap.Size(20, 20),
        zIndex: 12,
      },
    })

    // 中文就创建一次 循环利用
    this.text = this.text ?? new AMap.Text({
      anchor: 'bottom-center',
      offset: new AMap.Pixel(0, -10),             // 设置文本标注偏移量 因为坐标偏移一半 所以是大小的一半+1
    });
    // ——————————鼠标移入——————————
    this.redMass.on('mouseover', ({ data }) => {
      this.text.setPosition(new AMap.LngLat(data.item.longitude, data.item.latitude)) // 改变经纬度
      this.text.setText(this.setMarkerText(data.item))                                // 设置文本标注内容
      map.add(this.text);
    })
    // ——————————鼠标移出——————————
    this.redMass.on('mouseout', () => {
      this.text && map.remove(this.text)
    })
    // ——————————点击——————————
    this.redMass.on('click', ({ data }) => {
      if (data.item.address) {
        copy(data.item.address)
        this.setState({ storeInfoVisible: true, storeView: data.item })
        message.success('复制门店地址成功')
      } else {
        message.error('门店地址复制失败，检查该门店是否维护了地址！！')
      }
    })
    // ——————————双击——————————
    this.redMass.on('dblclick', ({ data }) => {
      map.setFitView([new AMap.Marker({ position: [data.item.longitude, data.item.latitude]})])
    })

    this.redMass.setMap(map)
  }


  /**
   * 创建美宜佳坐标点
   * @author ChenGuangLong
   * @since 2024/10/4 15:44
  */
  createMyjMarkers = () => {
    const { otherData = [] } = this.state
    const { map, AMap } = this
    if (!map) return message.info('地图加载中')

    this.text = this.text ?? new AMap.Text({      // 中文就创建一次 循环利用
      anchor: 'bottom-center',
      offset: new AMap.Pixel(0, -10),             // 设置文本标注偏移量 因为坐标偏移一半 所以是大小的一半+1
    });
    // ——————————先清除————————————
    // if (this.myjRedMarkers.length > 0) {
    //   map.remove(this.myjRedMarkers)
    //   this.myjRedMarkers = []
    // }
    if (this.myjGreenMarkers.length > 0) {
      map.remove(this.myjGreenMarkers)
      this.myjGreenMarkers = []
    }

    // 创建红色海量点
    this.addMassMarks()
    // ————————创建红色图标————————————————————————————————————————————————————————————————
    // if (orders.length > 0) {
    //   const redMyjIcon = getMyjIcon(AMap, 'red')
    //   this.myjRedMarkers = orders/* .map(item => bdToGd(item)) */.map(order => {   // 🫵🫵🫵百度转高德🫵🫵🫵; 再创建坐标点
    //     const marker = new AMap.Marker({                   // 创建一个Marker对象
    //       position: [order.longitude, order.latitude],          // 设置Marker的位置
    //       icon: redMyjIcon,                                     // 红色图标
    //       anchor: 'center',                                     // 设置Marker的锚点
    //       draggable: this.openDragStore,                        // 是否允许拖拽
    //       cursor: this.openDragStore ? 'move' : 'pointer',      // 鼠标移入时的鼠标样式
    //     })
    //     marker.on('mouseover', () => {                                        // 鼠标移入————————————
    //       this.text.setPosition(new AMap.LngLat(order.longitude, order.latitude))   // 改变经纬度
    //       this.text.setText(this.setMarkerText(order))                              // 设置文本标注内容
    //       map.add(this.text);
    //     })
    //     marker.on('mouseout', () => {                                         // 鼠标移出————————————
    //       this.text && map.remove(this.text)
    //     })
    //     marker.on('click', () => {                                            // 左键单击—————————————
    //       if (order.address) {
    //         copy(order.address);
    //         this.setState({ storeInfoVisible: true, storeView: order });
    //         message.success('复制门店地址成功');
    //       } else {
    //         message.error('门店地址复制失败，检查该门店是否维护了地址！！');
    //       }
    //     })
    //     marker.on('dblclick', () => {                                        // 双击——————————————————
    //       map.setFitView([marker]);
    //     })
    //     marker.on('dragend', e => {                                                // 拖拽结束事件——————————————————
    //       this.changePoint(e, order, marker)
    //     })
    //     return marker
    //   })
    //   map.add(this.myjRedMarkers)
    // }
    // ————————创建绿色图标——————————————————————————————————————————————————————————
    if (otherData.length > 0) {
      const greenMyjIcon = getMyjIcon(AMap, 'green')
      this.myjGreenMarkers = otherData/* .map(item => bdToGd(item)) */.map(order => {   // 🫵🫵🫵百度转高德🫵🫵🫵; 再创建坐标点
        const marker = new AMap.Marker({                   // 创建一个Marker对象
          position: [order.longitude, order.latitude],          // 设置Marker的位置
          icon: greenMyjIcon,                                   // 绿色图标
          anchor: 'center',                                     // 设置Marker的锚点
        })
        marker.on('mouseover', () => {
          this.text.setPosition(new AMap.LngLat(order.longitude, order.latitude))         // 改变经纬度
          this.text.setText(this.setMarkerText(order))                                    // 设置文本标注内容
          map.add(this.text);
        })
        marker.on('mouseout', () => {
          this.text && map.remove(this.text)
        })
        marker.on('click', () => {                                                  // 左键单击—————————————
          if (order.address) {
            copy(order.address);
            this.setState({ storeInfoVisible: true, storeView: order });
            message.success('复制门店地址成功');
          } else {
            message.error('门店地址复制失败，检查该门店是否维护了地址！！');
          }
        })
        marker.on('dblclick', () => {                                               // 双击——————————————————
          map.setFitView([marker]);
        })
        return marker
      })
      map.add(this.myjGreenMarkers)
    }
  };

  /**
   * 设置鼠标悬浮文字
   * @author ChenGuangLong
   * @since 2024/10/5 9:51
  */
  setMarkerText = order => {
    const storeCode = order.deliveryPoint?.code || order.code || '[空]'
    const storeName = order.deliveryPoint?.name || order.name || '<空>'
    const cartonCount = () => order.cartonCount ? `
      <div>
        <hr style="margin: 5px 0 0 0;"/>
        <div style="display: flex; margin-top: 5px">
          <div style="flex: 1">整件数</div>
          <div style="flex: 1">散件数</div>
          <div style="flex: 1">周转箱</div>
          <div style="flex: 1">体积</div>
          <div style="flex: 1">重量</div>
        </div>
        <div style="display: flex">
          <div style="flex: 1">${order.cartonCount}</div>
          <div style="flex: 1">${order.scatteredCount}</div>
          <div style="flex: 1">${order.containerCount}</div>
          <div style="flex: 1">${order.volume}</div>
          <div style="flex: 1">${(order.weight / 1000).toFixed(3)}</div>
        </div>
      </div>
    ` : ''

    return `
      <div style="width: auto; height: auto; padding: 5px; background: #FFF;" >
        <div style="font-weight:bold; overflow: hidden; white-space:nowrap;">
          [${storeCode}]${storeName}
        </div>
        <div>
          线路：${order.archLine?.code || order.archlinecode || '<空>'} &nbsp;
          所属区域：${order.shipareaname || '<空>'}
        </div>
        <div>门店地址：${order.address || '<空>'}</div>
        ${cartonCount()}
      </div>
  `
  }


  /** 保存拖拽改变门店经纬度 */
  changePoint = async (order,lnglat) => {
    let sets = {
      LATITUDE: lnglat.lat,
      LONGITUDE: lnglat.lng,
    };
    let param = {
      tableName: 'sj_itms_ship_address',
      sets,
      condition: { params: [{ field: 'UUID', rule: 'eq', val: [order.uuid] }] },
      updateAll: false,
    };
    let result = await updateEntity(param);
    if (result.success) {
      message.success(`门店 [${order.name}] 修改经纬度成功`)
      order.longitude = lnglat.lng
      order.latitude = lnglat.lat
      this.map.remove([this.currentMarker, this.newMarker])   // 清除地图上拖拽辅助点
      this.setState({ openDragStore: false })           // 关闭拖拽变量
      this.createMyjMarkers()                                // 重新创建地图上门店图标
    } else {
      message.error(`门店 [${order.name}] 修改经纬度失败,请刷新页面重试`)
    }
  };

  /** 界面左边：门店地址查询 */
  storeAddrQuery = keyword => {
    const { AMap, map } = this
    this.setState({ storeInfo: keyword })
    if (this.infoWindow) map.remove(this.infoWindow)
    if (this.searchStoreMarkers.length > 0) map.remove(this.searchStoreMarkers)
    if (!keyword || keyword.trim().length === 0) return this.setState({ searchStoreList: [] })

    AMap.plugin('AMap.AutoComplete', () => {   // 注意：输入提示插件2.0版本需引入AMap.AutoComplete，而1.4版本应使用AMap.Autocomplete
      const autoOptions = { city: '全国' }
      const autoComplete = new AMap.AutoComplete(autoOptions)  // 实例化AutoComplete
      autoComplete.search(keyword, (status, result) => {                   // 搜索成功时，result即是对应的匹配数据
        if (status === 'complete' && result.info === 'OK') {
          const searchStoreList = result.tips.filter(item => item.location) // 筛选掉没有经纬度的数据
          this.setState({ searchStoreList })                                     // 显示左边搜索结果
          this.searchStoreMarkers = searchStoreList.map((item, index) => {    // 显示右边地图点
            const marker = new AMap.Marker({
              position: [item.location.lng, item.location.lat],
              content: this.markerNumContent(index + 1),
              anchor: 'bottom-center',
              extData: index,                                                         // 给个索引，方便点击事件获取
            })
            // 搜索第一个直接显示信息窗口
            if (index === 0) this.setInfoWindow(marker.getPosition(), item)

            marker.on('click', () => {
              this.setInfoWindow(marker.getPosition(), item)
            })
            return marker
          })
          map.add(this.searchStoreMarkers)
          map.setFitView(this.searchStoreMarkers)
        } else {
          this.setState({ searchStoreList: [] })
          message.error(`查询地址没有结果:${keyword}`)
        }
      })
    })
  }

  /**
   * 窗口显示地址信息
   * @param position    位置对象
   * @param dateContext 搜索数据对象
   * @author ChenGuangLong
   * @since 2024/10/7 9:32
  */
  setInfoWindow = (position,dateContext) => {
    const { AMap,map } = this

    // 创建一个信息窗体 一次就够了
    this.infoWindow = this.infoWindow ?? new AMap.InfoWindow({ offset: new AMap.Pixel(0, -35)})
    this.infoWindow.setContent(`
        <div>
          <div> ${dateContext.name}</div>
          <div>地址:${dateContext.district || ''}${dateContext.address}</div>
          <div>坐标:${dateContext.location.lng},${dateContext.location.lat}</div>
        </div>
    `)
    this.infoWindow.open(map, position)
  }

  /**
   * 带数字的坐标点
   * @author ChenGuangLong
   * @since 2024/10/5 15:52
  */
  markerNumContent = (num, isRed = true) => `
      <div class=${mapStyle.customContentMarker}>
        <img src="//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-${isRed ? 'red' : 'default'}.png" alt>
        <div class=${mapStyle.num}>${num}</div>
      </div>`

  changePage = async (e, key, storeParamsp) => {
    if (this.state.openDragStore) {                           // 拖拽中，关闭
      this.setState({ openDragStore: false })           // 关闭拖拽变量
      this.map.remove([this.currentMarker, this.newMarker])
    }
    const { pageFilter, storeParams } = this.state;

    if (pageFilter.length > 0 && !key) {
      this.refresh(pageFilter, e, storeParams);
    } else {
      this.setState({ loading: true });
      if (key !== 're' && (!storeParamsp || JSON.stringify(storeParamsp) === '{}')) {
        storeParamsp = storeParams;
      }
      let params = {
        ...storeParamsp,
        companyuuid: loginCompany().uuid,
        dispatchcenteruuid: loginOrg().uuid,
        cur: 1,
        pageSize: e,
      };
      let res = await queryStoreMaps(params);
      if (res.success && res.data) {
        // 查询门店时 显示其他门店
        if (storeParamsp && 'DELIVERYPOINTCODE' in storeParamsp) {
          this.setState(
            {
              otherData: res.data.records,
              orders: res.data.otherRecords?.filter(item => item.uuid !== res.data.records[0].uuid) ?? [],
              pageFilter: [],
              loading: false,
              storeParams: storeParamsp,
            },
            () => {
              setTimeout(() => {
                this.createMyjMarkers()
                this.map.setFitView() // 无参数时，自动自适应所有覆盖物
              }, 100);
            }
          );
        } else {
          this.setState(
            {
              orders: res.data.records,
              otherData: [],
              pageFilter: [],
              loading: false,
              storeParams: storeParamsp,
            },
            () => {
              setTimeout(() => {
                this.createMyjMarkers()
                this.map.setFitView() // 无参数时，自动自适应所有覆盖物
              }, 500);
            }
          );
        }
      } else {
        this.setState(
          {
            orders: [],
            otherData: [],
            pageFilter: [],
            loading: false,
            storeParams: storeParamsp,
          });
      }
    }
    this.setState({ storePages: e })
  };

  getStoreMaps = async (pageSize, storeParams) => {
    let params = {
      ...storeParams,
      companyuuid: loginCompany().uuid,
      dispatchcenteruuid: loginOrg().uuid,
      cur: 1,
      pageSize,
    };
    let res = await queryStoreMaps(params);
    if (res.success && res.data) {
      return res.data.records
    } return [];
  };

  /** 显示门店审核的门店坐标 */
  showStoreByReview = async e => {
    this.setState({ loading: true })
    let params = {
      DELIVERYPOINTCODE: e.DELIVERYPOINTCODE,
    }
    let store = await this.getStoreMaps('20', params)
    let reviewStore = []
    if (store?.length > 0) {
      let review = shencopy(store[0])
      store[0].code = `(旧)${store[0].code}`
      review.latitude = e.LATITUDE
      review.longitude = e.LONGITUDE
      review.code = `(新)${review.code}`
      reviewStore.push(review)
    }
    this.setState({ orders: store, otherData: reviewStore, pageFilter: [], loading: false },
      () => {
        setTimeout(() => {
          this.createMyjMarkers()
          this.map.setFitView(undefined, true, [60, 60, 60, 500])  // 四周边距，上、下、左、右
        }, 500)
      }
    )
  }

  tansfomer = arraylist => {
    let attributeList = arraylist[0];
    let tempdata = [];
    let slicedList = arraylist.slice(1);
    slicedList.forEach(item => {
      let tempobject = {};
      item.forEach((x, index) => {
        tempobject[attributeList[index]] = x;
      });
      tempdata.push(tempobject);
    });
    return tempdata;
  };

  getStoreInfoCard = () => {
    const { storeView,openDragStore } = this.state;
    if (!storeView) return;
    let storeCode = storeView.isOrder ? storeView.deliveryPoint.code : storeView.code;
    let storeName = storeView.isOrder ? storeView.name : storeView.name;
    // TODO 等门店图片上传后再添加门店图片
    return (
      <div>
        <Card
          cover={<img alt="example" src={noStore} style={{ height: '200px' }} />}
          title={`[${storeCode}]${storeName}`}
          style={{ width: 360 }}
        >
          <Meta
            style={{ fontSize: '14px' }}
            title="线路/区域"
            description={`${storeView.archlinecode || '<空>'}/${storeView.shipareaname || '<空>'}`}
          />
          <Meta
            title="地址"
            description={storeView.address}
            style={{ marginTop: '10px', fontSize: '14px' }}
          />
          <Meta
            title="备注"
            description={storeView.note || '无'}
            style={{ marginTop: '10px', fontSize: '14px' }}
          />
          <Meta
            title="经纬度"
            description={
              <>
                {storeView.longitude},{storeView.latitude}
                {!openDragStore &&
                  <Button type="primary" onClick={() => this.dragMarker(storeView)}>拖拽修改门店经纬度</Button>
                }
              </>
            }
            style={{ marginTop: '10px', fontSize: '14px' }}
          />
        </Card>
      </div>
    );
  };

  /**
   * 拖拽门店经纬度启动
   * @param store 门店数据
   * @author ChenGuangLong
   * @since 2024/10/28 11:19
  */
  dragMarker = store => {
    const { map, AMap } = this
    this.setState({ openDragStore: true })
    this.redMass?.clear()             // 关闭全部海量点
    map.remove(this.myjGreenMarkers)  // 关闭司机提交坐标点
    this.myjGreenMarkers = []
    this.currentMarker = new AMap.Marker({             // 创建一个Marker对象
      position: [store.longitude, store.latitude],          // 设置Marker的位置
      content: this.markerNumContent('现'),            // 图标
      anchor: 'bottom-center',                              // 设置Marker的锚点
    })

    this.newMarker = new AMap.Marker({                    // 创建一个Marker对象
      position: [store.longitude, store.latitude],             // 设置Marker的位置
      content: this.markerNumContent('新', false),  // 图标 蓝
      anchor: 'bottom-center',                                 // 设置Marker的锚点
      draggable: true,                                         // 是否允许拖拽
      cursor: 'move',                                          // 鼠标移入时的鼠标样式
      extData: store,                                          // 用户自定义属性
    })

    map.add([this.currentMarker, this.newMarker])
  }

  render() {
    const { loading, searchStoreList, openDragStore } = this.state
    const uploadProps = {
      name: 'file',
      // action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
      headers: {
        authorization: 'authorization-text',
      },
      showUploadList: false,
      accept: '.xls,.xlsx',
      beforeUpload: (_file, fileList) => {
        if (
          fileList.length < 0 ||
          (fileList[0].name.substring(fileList[0].name.lastIndexOf('.') + 1).toLowerCase() !==
            'xlsx' &&
            fileList[0].name.substring(fileList[0].name.lastIndexOf('.') + 1).toLowerCase() !==
              'xls')
        ) return message.error('请检查文件是否为excel文件！');

        let rABS = true
        const f = fileList[0]
        let reader = new FileReader()
        reader.onload = async (e) => {
          let data = e.target.result
          if (!rABS) data = new Uint8Array(data)
          let workbook = XLSX.read(data, {
            type: rABS ? 'binary' : 'array',
          })
          // 假设我们的数据在第一个标签
          let firstWorksheet = workbook.Sheets[workbook.SheetNames[0]]
          // XLSX自带了一个工具把导入的数据转成json
          let jsonArr = XLSX.utils.sheet_to_json(firstWorksheet, { header: 1 })
          let column = jsonArr[0][0]
          let storeNames = this.tansfomer(jsonArr).map(item => item[column]).join(',')
          let param = {
            companyuuid: loginCompany().uuid,
            dispatchcenteruuid: loginOrg().uuid,
            cur: 1,
            pageSize: '9999',
            DELIVERYPOINTCODE: storeNames,
          }
          let res = await queryStoreMaps(param)
          if (res.success) {
            let recordsUuids = res.data?.records.map(item => item.uuid)
            this.setState({
                otherData: res.data ? res.data?.records : [],
                orders: res.data ? res.data?.otherRecords.filter(item => recordsUuids.indexOf(item.uuid) === -1) : [],
                pageFilter: [],
                loading: false,
              },
              () => {
                setTimeout(() => {
                  this.createMyjMarkers()
                  this.map.setFitView() // 无参数时，自动自适应所有覆盖物
                  if (res.data) message.success('门店导入查询成功，绿色为导入门店，红色为与导入门店同区域门店！')
                  else message.error('门店导入查询失败，无门店数据或excel文件有错误')
                }, 500)
              }
            )
          }
        }
          if (rABS) reader.readAsBinaryString(f)
          else reader.readAsArrayBuffer(f)
          return false
      },
    };

    return (
      <PageHeaderWrapper>
        <Page withCollect pathname={this.props.location ? this.props.location.pathname : ''}>
          <div style={{ backgroundColor: '#ffffff' }}>
            <Row type="flex" justify="space-between">
              <Col span={22}>
                <SearchForm refresh={this.refresh} changePage={this.changePage}/>
              </Col>
              <Col span={1}>
                <Upload {...uploadProps}>
                  <Button shape="round" icon="upload" type="danger"/>

                </Upload>
              </Col>
              <Col span={1}>
                <Select
                  defaultValue={500}
                  onChange={e => this.changePage(e)}
                  value={this.state.storePages}
                >
                  <Option value="200">200</Option>
                  <Option value="500">500</Option>
                  <Option value="1000">1000</Option>
                  <Option value="2000">2000</Option>
                  <Option value="5000">3000</Option>
                  <Option value="99999">全部</Option>
                </Select>
              </Col>

            </Row>
            <Spin
              indicator={LoadingIcon('default')}
              spinning={loading}
              tip="加载中..."
              wrapperClassName={style.loading}
            >
              <Row type="flex" style={{ height: window.innerHeight - 200 }}>
                <Col
                  span={6}
                  style={{
                    height: '100%',
                    background: '#fff',
                    overflow: 'auto',
                  }}
                >

                  <PageHeader
                    title="门店地址查询"
                    subTitle="请输入门店地址或坐标建筑名"
                    style={{ border: '1px solid rgb(235, 237, 240)', width: '90%' }}
                  />
                  <div>
                    <Search
                      placeholder="请输入地址"
                      allowClear
                      onChange={event => this.storeAddrQuery(event.target.value)}
                      style={{ width: '90%', marginTop: '15px' }}
                      value={this.state.storeInfo}
                    />
                  </div>
                  {searchStoreList.map((item, index) =>
                    <div
                      key={item.id || index}
                      tabIndex="0"
                      className={mapStyle.gdSearchListCard}
                      onClick={() => {
                        const targetMarker = this.searchStoreMarkers.find(marker => index === marker.getExtData())
                        if (!targetMarker) return
                        const position = targetMarker.getPosition()
                        this.setInfoWindow(position, item)
                      }}
                    >
                      <b><span className={mapStyle.gdSearchListNum}>{index + 1}</span> {item.name}</b>
                      <div><b>地址：</b>{item.district || ''}{item.address}</div>
                      <div><b>坐标：</b>{item.location.lng},{item.location.lat}</div>
                    </div>
                  )}
                </Col>
                <Col span={18}>
                  {openDragStore &&
                    <div style={{ position: 'absolute', zIndex: 1 }}>
                      {/* ————保存门店改变位置———— */}
                      <Button
                        style={{ marginLeft: '10px' }}
                        type="primary"
                        onClick={() => {
                          const tLng = this.currentMarker.getPosition().lng === this.newMarker.getPosition().lng
                          const tLat = this.currentMarker.getPosition().lat === this.newMarker.getPosition().lat
                          if (tLng && tLat)
                            return message.error('未改变门店位置')
                          this.changePoint(this.newMarker.getExtData(), this.newMarker.getPosition())
                        }}
                      >
                        保存门店位置
                      </Button>
                      {/* ————取消保存改变门店位置———— */}
                      <Button
                        style={{ marginLeft: '10px' }}
                        onClick={() => {
                          this.map.remove([this.currentMarker, this.newMarker])
                          this.createMyjMarkers()
                          this.setState({ openDragStore: false })
                        }}
                      >
                        取消
                      </Button>
                    </div>
                  }

                  {/* 高德地图加载区域 */}
                  <div id="GdStoreMap" style={{height:'100%'}}/>
                  <Drawer
                    getContainer={false}
                    title="门店资料"
                    placement="right"
                    closable
                    onClose={() => this.setState({ storeInfoVisible: false })}
                    visible={this.state.storeInfoVisible}
                    mask={false}
                    maskClosable
                    width={400}
                    style={{ position: 'absolute' }}
                  >
                    {this.getStoreInfoCard()}
                  </Drawer>
                  <Drawer
                    getContainer={false}
                    title="门店审核"
                    placement="right"
                    closable
                    onClose={() => this.setState({ reviewVisible: false })}
                    visible={this.state.reviewVisible}
                    mask={false}
                    maskClosable={false}
                    width={400}
                    style={{ position: 'absolute' }}
                  >
                    <AddressReportForm
                      location={{ pathname: window.location.pathname }}
                      quickuuid="v_itms_store_address_report_t"
                      showStoreByReview={this.showStoreByReview}
                    />
                  </Drawer>
                </Col>
              </Row>
            </Spin>
          </div>
        </Page>
      </PageHeaderWrapper>
    )
  }
}
