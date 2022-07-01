/*
 * @Author: Liaorongchang
 * @Date: 2022-06-30 09:27:20
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-07-01 12:01:10
 * @version: 1.0
 */
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { Button, Icon, Upload, message, Modal, Spin } from 'antd';
import configs from '@/utils/config';
import { loginKey } from '@/utils/LoginContext';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
//继承QuickFormSearchPage Search页面扩展
export default class ImportSearch extends QuickFormSearchPage {
  //需要操作列的显示 将noActionCol设置为false
  state = { ...this.state, noActionCol: false, isShow: false, isLoading: false };

  handleUploading = info => {
    if (info.file.status == 'uploading') {
      this.setState({ isLoading: true });
    }
    if (info.file.status === 'done') {
      this.setState({ isLoading: false });
      message.success(`上传成功`);
      this.refreshTable();
    } else if (info.file.status === 'error') {
      this.setState({ isLoading: false });
      Modal.confirm({
        title: '导入失败',
        content: <div style={{ whiteSpace: 'pre-line' }}>{info.file.response.message}</div>,
        okText: '确认',
        cancelText: '取消',
      });
    }
  };

  //该方法用于写最上层的按钮 多个按钮用<span>包裹
  drawToolsButton = () => {
    const { isLoading } = this.state;
    return (
      <span>
        <Upload
          name="file"
          action={configs[API_ENV].API_SERVER + '/itms-cost/itms-cost/import/upload'}
          showUploadList={false}
          headers={{ iwmsJwt: loginKey() }}
          accept=".xlsx"
          onChange={info => {
            this.handleUploading(info);
          }}
        >
          <Button>
            <Icon type="upload" loading={isLoading} />
            导入
          </Button>
        </Upload>
      </span>
    );
  };
}
