/*
 * @Author: guankongjin
 * @Date: 2022-07-13 14:22:18
 * @LastEditors: guankongjin
 * @LastEditTime: 2023-04-11 16:10:09
 * @Description: 司机刷卡
 * @FilePath: \iwms-web\src\pages\SJTms\Schedule\DriverSwipeInAndOut.js
 */
/* eslint-disable import/extensions */
/* eslint-disable no-nested-ternary */

import React, { PureComponent } from 'react'
import { Card, Col, Input, Row, Spin, Select, message, Modal, Table } from 'antd'
import LoadingIcon from '@/pages/Component/Loading/LoadingIcon'
import Empty from '@/pages/Component/Form/Empty'
import { getReleaseNote, getSwipeSchedule, swipeByScheduleUuid } from '@/services/sjitms/ScheduleProcess'
import { queryDictByCode } from '@/services/quick/Quick'
import NavigatorPanel from '@/pages/Component/Page/inner/NavigatorPanel'
import { loginOrg } from '@/utils/LoginContext'

export default class Swiper extends PureComponent {
  state = {
    loading: false,
    dict: [],
    scheduleBill: {},
    empId: '',
    msg: undefined,     // 长名和antd冲突
    errMsg: '',
    isShip: false,
    companyUuid: undefined,
    dispatchUuid: undefined,
    dispatchName: undefined,
    isModalOpen: false,
    swipeFlag: 'inAndOut', // 刷卡标识用于区分出回车，开始结束装车 刷卡
    releaseNote: {},        // 司机放行条数据
  }

  componentDidMount () {
    this.empInputRef.focus()
    // 查询字典
    queryDictByCode(['dispatchCenter']).then(res => this.setState({ dict: res.data }))
    if (
      localStorage.getItem('dispatchUuid') !== undefined &&
      localStorage.getItem('dispatchName') &&
      localStorage.getItem('companyUuid')
    ) {
      this.setState({
        dispatchUuid: localStorage.getItem('dispatchUuid'),
        dispatchName: localStorage.getItem('dispatchName'),
        companyUuid: localStorage.getItem('companyUuid'),
      })
    }
  }

  speech = msg => {
    const Speech = new SpeechSynthesisUtterance()
    Speech.lang = 'zh'
    Speech.rate = 0.7
    Speech.pitch = 1.5
    Speech.text = msg
    speechSynthesis.speak(Speech)
  }

  // 刷卡
  onSubmit = async event => {
    const empId = event.target.value
    const { dispatchUuid, companyUuid, swipeFlag } = this.state
    if (dispatchUuid === undefined || companyUuid === undefined) {
      message.error('企业中心或调度中心值缺失！')
      return
    }
    localStorage.setItem('showMessage', '0')
    this.setState({ loading: true, errMsg: undefined })
    const response = await getSwipeSchedule(empId, swipeFlag, companyUuid, dispatchUuid)
    if (response.success) {
      this.setState({
        empId: '',
        loading: false,
        scheduleBill: response.data,
      })
      if (
        (Date.parse(new Date()) - Date.parse(response.data.dispatchTime)) / 3600000 < 3 &&
        (loginOrg().uuid === '000000750000005' ||
          loginOrg().uuid === '000008150000001' ||
          loginOrg().uuid === '000000750000006' ||
          loginOrg().uuid === '000008150000003')
      ) {
        this.setState({ isModalOpen: true })
      } else {
        this.swipeByUuid()
      }
    } else {
      this.speech('获取可刷卡排车单失败')
      this.setState({ empId: '', loading: false, scheduleBill: {}, errMsg: response.message })
    }

    // 司机放行条获取
    const resp = await getReleaseNote(empId)
    if (resp?.data) {
      this.setState({ releaseNote: resp.data })
      message.success('获取司机放行条成功')
    }else this.setState({releaseNote: {}})  // 清空放行条
  }

  swipeByUuid = async () => {
    const { scheduleBill } = this.state
    this.setState({ loading: true, errMsg: undefined })
    const response = await swipeByScheduleUuid(scheduleBill.uuid)
    if (response.success) {
      this.speech('刷卡成功')
      this.setState({
        empId: '',
        loading: false,
        isModalOpen: false,
        msg: response.data.message,
        isShip: response.data.message.indexOf('装车') !== -1,
      })
    } else {
      this.speech('刷卡失败')
      this.setState({ empId: '', loading: false, isModalOpen: false, errMsg: response.message })
    }
  }

  render () {
    const {
      loading,
      dict,
      empId,
      scheduleBill,
      errMsg,
      msg,
      isShip,
      dispatchName,
      isModalOpen,
      releaseNote,
    } = this.state

    const { location } = this.props
    return (
      <div style={{ padding: 20, backgroundColor: '#fff' }}>
        <Spin indicator={LoadingIcon('default')} spinning={loading} size="small">
          <Modal
            title="回厂提醒"
            visible={isModalOpen}
            onOk={() => {
              this.swipeByUuid()
            }}
            onCancel={() => {
              this.setState({ isModalOpen: false })
            }}
          >
            <p style={{ fontSize: '2.5vh' }}>
              该排车单
              {scheduleBill.billNumber}
              发运时间未超过3小时，是否继续刷卡
            </p>
          </Modal>

          <div onClick={() => this.empInputRef.focus()}>
            <NavigatorPanel
              title="司机出入厂刷卡"
              canFullScreen={location.pathname !== '/driver/swipeInAndOut'}
            />
            <div
              style={{
                height: 100,
                lineHeight: '100px',
                borderBottom: '1px solid #e8e8e8',
              }}
            >
              <div style={{ float: 'left', width: '15%', paddingLeft: 24 }}>
                <Select
                  placeholder="请选择调度中心"
                  onChange={val => {
                    const item = dict.find(x => x.itemValue === val)
                    localStorage.setItem('dispatchUuid', val)
                    localStorage.setItem('dispatchName', item.itemText)
                    localStorage.setItem('companyUuid', item.description)
                    this.setState({
                      dispatchUuid: val,
                      dispatchName: item.itemText,
                      companyUuid: item.description,
                    })
                  }}
                  value={dispatchName}
                  allowClear
                  style={{ width: '100%' }}
                >
                  {dict.map(d => {
                    return <Select.Option key={d.itemValue}>{d.itemText}</Select.Option>
                  })}
                </Select>
              </div>
              {/* <div style={{ float: 'left', width: '8%', marginLeft: '1%' }}>
              <Checkbox>锁定</Checkbox>
            </div> */}
              <div
                style={{
                  fontSize: 55,
                  fontWeight: 'normal',
                  textAlign: 'center',
                  marginRight: '15%',
                  color: dispatchName === undefined ? 'red' : 'black',
                }}
              >
                {dispatchName === undefined ? '请选择调度中心' : `${dispatchName}出入厂刷卡`}
              </div>
            </div>

            <div style={{ fontSize: 16, textAlign: 'center' }}>
              工号：
              <Input
                style={{
                  width: 250,
                  height: 40,
                  fontSize: 16,
                  margin: 15,
                }}
                value={empId}
                ref={input => {this.empInputRef = input}}
                onChange={event => this.setState({ empId: event.target.value })}
                onPressEnter={this.onSubmit}
                placeholder="输入员工代码"
              />
            </div>


            <Card
              title={<b>刷卡结果</b>}
              bordered
              // style={{ height: '18vh', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)' }}
              headStyle={{textAlign: 'center'}}
              bodyStyle={{
                height: '10vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: 0,
              }}
            >
              {errMsg ? (
                <span style={{ color: '#F5222D', fontSize: '45px', margin: 'auto' }}>{errMsg}</span>
              ) : isShip ? (
                <span style={{ color: '#00DD00', fontSize: '45px', margin: 'auto' }}>
                  {msg}
                </span>
              ) : (
                <span style={{ color: '#1354DA', fontSize: '45px', margin: 'auto' }}>
                  {msg}
                </span>
              )}
              { // 放行条成功信息
                releaseNote.drivercode &&
                <span style={{ color: '#1dff0e', fontSize: '45px', margin: 'auto' }}>放行条获取成功</span>
              }
            </Card>


            <Card
              title={<b>排车单信息</b>}
              headStyle={{textAlign: 'center'}}
              bodyStyle={{ padding: '5px 24px' }}
              style={{ marginTop: 20, boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)' }}
            >
              <Row gutter={[4, 28]}>
                <Col span={6}>
                  <span style={{ fontSize: 15 }}>
                    排车单号：
                    {scheduleBill.billNumber ? scheduleBill.billNumber : <Empty />}
                  </span>
                </Col>
                <Col span={6}>
                  <span style={{ fontSize: 15 }}>
                    车牌号：
                    {scheduleBill.vehicle ? scheduleBill.vehicle.name : <Empty />}
                  </span>
                </Col>
                {/* <Col span={6}>
                <span style={{ fontSize: 15 }}>
                  重量(t)：
                  {scheduleBill.weight ?  (new Number(scheduleBill.weight)/1000).toFixed(3) : <Empty />}
                </span>
              </Col> */}
                <Col span={6}>
                  <span style={{ fontSize: 15 }}>
                    体积(m³)：
                    {scheduleBill.volume ? Number(scheduleBill.volume).toFixed(2) : <Empty />}
                  </span>
                </Col>
                <Col span={6}>
                  <span style={{ fontSize: 15 }}>
                    驾驶员：
                    {scheduleBill.carrier ? (
                      `[${scheduleBill.carrier.code}]${scheduleBill.carrier.name}`
                    ) : <Empty />
                    }
                  </span>
                </Col>
                <Col span={6}>
                  <span style={{ fontSize: 15 }}>
                    出车时间：
                    {scheduleBill.dispatchTime ? scheduleBill.dispatchTime : <Empty />}
                  </span>
                </Col>
                <Col span={6}>
                  <span style={{ fontSize: 15 }}>
                    回车时间：
                    {scheduleBill.returnTime ? scheduleBill.returnTime : <Empty />}
                  </span>
                </Col>
              </Row>
            </Card>


            <Card title={<b>放行条</b>} style={{ marginTop: 20 }} headStyle={{textAlign: 'center'}}>
              {releaseNote.drivercode &&
                <Table
                  dataSource={[releaseNote] ?? []}
                  pagination={false}           // 去掉翻页组件
                  scroll={{ x: true }}
                  columns={[
                    { title: '放行条单号', width: 100, dataIndex: 'num', key: 'num' },
                    {
                      title: '司机工号', width: 120, dataIndex: 'drivercode', key: 'drivercode',
                      render: (val, record) => { return <span>{`[${val}]${record.drivername}`}</span> }
                    },
                    { title: '车牌号', width: 70, dataIndex: 'licenseplatenum', key: 'licenseplatenum' },
                    {
                      title: '放行人', width: 120, dataIndex: 'releasecode', key: 'releasecode',
                      render: (val, record) => { return <span>{`[${val}]${record.releasename}`}</span> }
                    },
                    { title: '放行时间', width: 80, dataIndex: 'releasetime', key: 'releasetime' },
                    { title: '放行内容', width: 80, dataIndex: 'releasecontent', key: 'releasecontent' },
                    { title: '状态', width: 80, dataIndex: 'status', key: 'status' },
                    { title: '出园时间', width: 80, dataIndex: 'exittime', key: 'exittime' },
                  ]}
                />
              }
            </Card>
          </div>
        </Spin>
      </div>
    )
  }
}
