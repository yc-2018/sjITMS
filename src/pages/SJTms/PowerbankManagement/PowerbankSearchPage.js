/**
 * 电宝主页左边主表
 * @author ChenGuangLong
 * @since 2024/7/15 14:36
*/
import { connect } from 'dva'
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage'
import PageHeaderWrapper from '@/components/PageHeaderWrapper'
import Page from '@/pages/Component/Page/inner/Page'
import { DndProvider } from 'react-dnd'
import { Form } from 'antd'
import styles from './powerbankStyles.less'

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
@Form.create()
export default class PowerbankSearchPage extends QuickFormSearchPage {
  state = {
    ...this.state,
    isRadio: true,    // 是否单选
  }

  /** 渲染前钩子 */
  componentDidMount () {
    // 本来的方法
    this.queryCoulumns();
    this.getCreateConfig();
    // 搜索方法给弹窗用，不用传来传去的
    window.PowerbankSearchPage = { onSearch: this.onSearch }
  }

  /**
   * 点击某行时调用，父组件会调用，给明细页刷新对应的数据
   * @author ChenGuangLong
   * @since 2024/7/15 14:44
  */
  handleSelectRows = (rows, s) => {
    this.setState({ selectedRows: rows })
    this.changeSelectedRows && this.changeSelectedRows(rows)
    this.props.refreshSelectedRow(rows)
  }

  /** 该方法会覆盖所有的上层按钮 */
  drawActionButton = () => <></>
  /** 绘制批量工具栏 */
  drawToolbarPanel = () => <></>

  render () {
    return (
      <div style={{ marginTop: '24px' }}>
        <PageHeaderWrapper wrapperClassName={styles.mainTable}>
          <Page withCollect={true} pathname={this.props.pathname}>
            {this.drawPage()}
          </Page>
        </PageHeaderWrapper>
      </div>
    )
  }

}
