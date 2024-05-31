import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage'
import { Button, Col, Icon, message, Popconfirm, Row } from 'antd'
import { connect } from 'dva'
import React from 'react'
import CreatePageModal from '@/pages/Component/RapidDevelopment/OnlForm/QuickCreatePageModal'
import { dynamicDelete } from '@/services/quick/Quick'
import { loginOrg } from '@/utils/LoginContext'

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class ReleaseSlipsPermissionsSearch extends QuickFormSearchPage {
  state = {
    ...this.state,
    noTable: true,      // 框架的表格不显示
  }

  /**
   * 查询数据(重写为了把每页改成99条数据 和 分调度中心）
   * @author ChenGuangLong
   * @since 2024/5/31 14:16
   */
  getData = pageFilters => {
    pageFilters.pageSize = 99     // 一页
    pageFilters.superQuery.queryParams[0] = {
      field: 'dispatchcenterUuid',
      type: 'VarChar',
      rule: 'eq',
      val: loginOrg().uuid        // 分调度中心
    }

    const { dispatch } = this.props
    dispatch({
      type: 'quick/queryData',
      payload: pageFilters,
      callback: response => {
        if (response.data) this.initData(response.data)
      },
    })
  }

  /**
   * 该方法会覆盖所有的上层按钮
   * @author ChenGuangLong
   * @since 2024/5/31 10:35
   */
  drawActionButton = () => <Button onClick={() => this.createPageModalRef.show()}>新增放行权限人</Button>

  /**
   * 绘制搜索
   * @author ChenGuangLong
   * @since 2024/5/31 10:34
   */
  drawSearchPanel = () => {}

  /**
   * 该方法会覆盖所有的中间功能按钮
   * @author ChenGuangLong
   * @since 2024/5/31 10:35
   */
  drawToolbarPanel = () => {}

  /**
   * 画出主要界面
   * @author ChenGuangLong
   * @since 2024/5/31 14:23
   */
  drawOtherCom = () => {
    const { data } = this.state
    return (
      <>
        <Row type="flex" justify="start">
          {data?.list?.map((item, index) =>
            <Col span={6} key={index}>
              <div
                style={{
                  margin: 10,
                  padding: 10,
                  border: '1px solid #ccc',
                  borderRadius: 10,
                  background: '#fafafa',
                }}
              >
                <b>{index + 1}、</b> [{item.RELEASECODE}]{item.RELEASENAME}

                {/* 靠右的删除按钮 */}
                <Popconfirm
                  title={`你确定要删除${item.RELEASENAME}的放行权限吗?`}
                  onConfirm={() => this.delOne(item.RELEASECODE)}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button
                    type="danger"
                    style={{ float: 'right', marginTop: -5 }}
                  >
                    <Icon type="close"/>
                  </Button>
                </Popconfirm>
              </div>
            </Col>
          )}
        </Row>


        <CreatePageModal
          modal={{
            title: '新增放行人',
            width: 400,
            afterClose: () => this.onSearch(),
          }}
          page={{ quickuuid: 'sj_release_slips_permissions' }}
          onRef={node => (this.createPageModalRef = node)}
        />
      </>
    )
  }

  /** ————————————————————————————————————————————————————————————————————————————————————————————————————————————
   * 删除一条数据
   * @param primaryKey 这条数据的主键
   * @author ChenGuangLong
   * @since 2024/5/31 14:21
   */
  delOne = primaryKey => {
    dynamicDelete(
      {
        code: this.props.quickuuid,                       // quickuuid还是表名不知道，返回用一样的值就对了
        params: [{
          tableName: this.props.quickuuid.toUpperCase(),  // quickuuid就是表名小写，所以转大写
          condition: {
            params:
              [{ field: 'RELEASECODE', rule: 'eq', val: [primaryKey] }]
          }, 'deleteAll': 'false'
        }]
      }).then(r => {
      if (r.success) {
        this.onSearch()
        message.success('删除成功')
      } else message.error(r.message)
    })
  }

}
