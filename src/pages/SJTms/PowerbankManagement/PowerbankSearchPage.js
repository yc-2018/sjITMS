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
export default class ETCSearchPage extends QuickFormSearchPage {
  state = {
    ...this.state,
    showCancel: false,
    showApply: false,
    isRadio: true
  }

  componentDidMount () {
    this.queryCoulumns()
    this.getCreateConfig()
    this.props.onRef && this.props.onRef(this)
  }

  handleSelectRows = (rows, s) => {
    this.setState({
      selectedRows: rows
    })
    this.changeSelectedRows && this.changeSelectedRows(rows)
    this.props.refreshSelectedRow(rows)
  }

  drawToolbarPanel = () => <></>

  render () {
    let ret = (
      <div style={{ marginTop: '24px' }}>
        <PageHeaderWrapper wrapperClassName={styles.colNo}>
          <Page withCollect={true} pathname={this.props.pathname}>
            {this.drawPage()}
          </Page>
        </PageHeaderWrapper>
      </div>
    )
    if (this.state.isDrag) {
      return !this.props.row && <DndProvider backend={HTML5Backend}>{ret}</DndProvider>
    } else {
      return !this.props.row && ret
    }
  }
}
