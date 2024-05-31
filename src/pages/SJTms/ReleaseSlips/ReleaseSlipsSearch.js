import { connect } from 'dva'
import { Button, Form, Modal } from 'antd'
import stylus from './stylus.less'
import ReleaseSlipsPermissionsSearch from './ReleaseSlipsPermissionsSearch'
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
    showModal: false,
  };

  /**
   * 最上方按钮
   * @author ChenGuangLong
   * @since 2024/5/30 17:20
   */
  drawActionButton = () =>
    <Button onClick={() => this.setState({ showModal: true })}>放行权限人设置</Button>


  //该方法会覆盖所有的中间功能按钮
  drawToolbarPanel = () => {}

  drawOtherCom = () => {
    const { showModal } = this.state
    let params= { title: '' }
    return (

      <Modal
        width={'95%'}
        visible={showModal}
        style={{ top: '3vh' }}
        className={stylus.permissionIkunModal}
        onOk={() => this.setState({ showModal: false })}
        onCancel={() => this.setState({ showModal: false })}
      >
        <ReleaseSlipsPermissionsSearch
          quickuuid="sj_release_slips_permissions"
          location={{ pathname: '/tmsexec/releaseSlipsPermissions' }}
          isModal
        />
      </Modal>

    )


  }

}