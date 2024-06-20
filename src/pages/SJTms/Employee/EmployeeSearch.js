import { connect } from 'dva'
import { Button, Form, message, Modal } from 'antd'
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage'
import React from 'react'
import { registerCarrier, registerMyj } from '@/services/sjitms/employeeApi'

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
export default class EmployeeSearch extends QuickFormSearchPage {
  state = {
    ...this.state,
    loading:false,
  }

  /**
   * 中间的按钮
   * @author ChenGuangLong
   * @since 2024/6/19 17:37
   */
  drawToolsButton = () =>
    <>
      <Button onClick={() => this.registerAccount('美宜佳')} loading={this.state.loading}>
        注册美宜佳账号
      </Button>

      <Button onClick={() => this.registerAccount('承运商门户')} loading={this.state.loading}>
        注册承运商门户账号
      </Button>
    </>

  /**
   * 注册用户
   * @param registerType{'美宜佳'|'承运商门户'} 注册类型
   * @author ChenGuangLong
   * @since 2024/6/20 9:20
  */
  registerAccount = async (registerType) => {
    const { selectedRows } = this.state
    if (selectedRows.length === 0) return message.warning('请选择要注册账号的一个用户')
    if (selectedRows.length > 1) return message.warning('请只勾选一个用户')
    const employee = selectedRows[0]
    if (employee.JOB_STATE === 0) return message.error('请选择在职的用户')
    this.setState({ loading: true })
    if (registerType === '承运商门户') {
      const reps = await registerCarrier(employee.CODE)
      reps.success && this.showModel('承运商门户注册成功',`[${employee.CODE}]${employee.NAME} 注册成功\n初始密码为: Sj+手机号后6位`)
    }
    if (registerType === '美宜佳') {
      const reps = await registerMyj(employee.CODE)
      reps.success ?
        this.showModel(
          '美宜佳账号注册成功',
          `[${employee.CODE}]${employee.NAME} 注册成功\n账号为: ${reps.data.usercode} \n初始密码为: Sj+手机号后6位`)
        :
        Modal.error({ title: '美宜佳账号注册失败', content: reps.message })
    }
    this.setState({ loading: false })
  }


  /**
   * 显示模态框
   *
   * @author ChenGuangLong
   * @since 2024/6/19 16:37
   */
  showModel = (title = '注册成功', content) =>
    Modal.success({ title, content })

}