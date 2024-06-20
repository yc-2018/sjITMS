import { connect } from 'dva'
import { Button, Form, Modal } from 'antd'
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage'
import React from 'react'

/**
 * 搜索列表界面
 * @author ChenGuangLong
 * @since 2024/5/30 17:21
 */
@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))

@Form.create()
export default class AddrReportSearch extends QuickFormSearchPage {
  state = {
    ...this.state,
    showMyjRegister: false,
    showCarrierRegister: false,
  };

  /**
   * 中间的按钮
   * @author ChenGuangLong
   * @since 2024/6/19 17:37
   */
  drawToolsButton = () =>
    <>
      <Button onClick={() => this.setState({ showMyjRegister: '美宜佳' })}>注册美宜佳账号</Button>
      <Button onClick={() => this.setState({ showCarrierRegister: '承运商门户' })}>注册承运商门户账号</Button>
    </>

  /**
   * 其他组件
   * @author ChenGuangLong
   * @since 2024/6/19 16:37
  */
  drawOtherCom = () => {
    const { showMyjRegister, showCarrierRegister, showModal } = this.state
    const registerType = showMyjRegister || showCarrierRegister
    return (

      <Modal
        width={'95%'}
        visible={registerType}
        style={{ top: '3vh' }}
        onOk={() => this.setState({ showMyjRegister: false, showCarrierRegister: false })}
        onCancel={() => this.setState({ showMyjRegister: false, showCarrierRegister: false })}
      >
        666
      </Modal>

    )


  }

}