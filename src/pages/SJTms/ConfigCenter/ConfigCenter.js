import SiderPage from '@/pages/Component/Page/SiderPage';
import { configLocale } from './ConfigLocale';
import { Menu, Icon, Button, Modal, Form, Row, Col, Input, message } from 'antd';
import siderStyle from '@/pages/Component/Page/inner/SiderPage.less';
import {
  getConfigMenus,
  saveOrUpdateConfig,
  deleteConfig,
} from '@/services/sjconfigcenter/ConfigCenter';
import ConfigSearchPageE from './ConfigSearchPage/ConfigSearchPageE';
import { notNullLocale } from '@/utils/CommonLocale';
import { havePermission } from '@/utils/authority';

@Form.create()
export default class ConfigCenter extends SiderPage {
  constructor(props) {
    super(props);

    this.state = {
      searchPage: undefined,
      queryKey: 0,
      configColumns: [],
      configMenus: [],
      visibleCreate: false,
      // title: configLocale.title,
      openKeys: [],
      selectedKeys: [],
      siderStyle: {
        height: window.innerHeight, //'650px',
        overflowy: 'auto',
      },
      contentStyle: {
        height: window.innerHeight, //'650px',
        overflow: 'auto',
      },
      authority: props.route?.authority ? props.route.authority[0] : null,
    };
  }

  componentDidMount() {
    this.init();
  }

  init = async () => {
    let res = await getConfigMenus();
    if (res?.success && res?.data) {
      this.setState({ configMenus: res.data }, () => {
        this.onClickMenu({ key: this.state.selectedKeys[0] });
      });
    }
  };

  onOpenChange = openKeys => {
    this.setState({
      openKeys: openKeys,
    });
  };

  onClickMenu = e => {
    if (!e?.key) return;
    const { configMenus } = this.state;
    let contentProps = configMenus.find(x => x.configNameEn === e.key);
    // let searchPage = <ConfigSearchPageE contentProps={contentProps} />;
    this.setState(
      {
        selectedKeys: new Array(e.key),
        searchPage: undefined,
      },
      () => {
        this.setState({
          searchPage: (
            <ConfigSearchPageE contentProps={contentProps} refreshAll={this.onClickMenu} />
          ),
        });
      }
    );
  };

  remove = key => {
    const { configColumns } = this.state;
    this.setState({ configColumns: configColumns.filter(x => x.key !== key) });
  };

  add = () => {
    const { configColumns, queryKey } = this.state;
    const nextConfigColumns = configColumns.concat({
      key: queryKey,
      configNameEN: '',
      configName: '',
    });
    this.setState({ configColumns: nextConfigColumns, queryKey: queryKey + 1 });
  };

  onEdit = () => {
    const { selectedKeys, configMenus } = this.state;
    let { queryKey } = this.state;
    if (!selectedKeys || selectedKeys.length < 0) {
      message.error('请选择一个配置！');
      return;
    }

    let config = configMenus.find(e => e.configNameEn === selectedKeys[0]);
    if (config) {
      config.columns?.map(e => {
        (e.key = queryKey), queryKey++;
      });
    }
    this.setState({ visibleCreate: true, queryKey, configColumns: config ? config.columns : [] });
  };

  hidden = () => {
    this.setState({ visibleCreate: false, queryKey: 0, configColumns: [] });
  };

  handleOk = async () => {
    const { form } = this.props;
    form.validateFields(async errors => {
      if (errors) return;
      const {
        configName,
        configNameEn,
        keyCn,
        keyEn,
        sort,
        note,
      } = this.props.form.getFieldsValue();
      let entityList = [];
      keyEn.map((e, index) => {
        let entity = {
          configName: configName,
          configNameEn: configNameEn,
          keyEn: keyEn[index],
          keyCn: keyCn[index],
          sort: sort[index],
          note: note[index],
        };
        entityList.push(entity);
      });
      let e = await saveOrUpdateConfig(entityList);
      if (e.success) {
        message.success('新增/修改成功');
        this.hidden();
        this.init();
      } else message.error('失败');
    });
  };

  onDelete = () => {
    Modal.confirm({
      title: '提示',
      content: '确认删除吗????删除后将无法恢复！',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        const { selectedKeys, configMenus } = this.state;
        if (selectedKeys.length <= 0) {
          message.error('请选择一条数据删除!');
          return;
        }
        let res = await deleteConfig({ configNameEn: selectedKeys[0] });
        if (res.success) {
          message.success('删除成功');
          this.setState({ selectedKeys: [], searchPage: undefined }, () => {
            this.init();
          });
        } else message.error('删除失败');
      },
    });
  };

  getCreateFormItem = () => {
    const { configColumns } = this.state;
    const { getFieldDecorator } = this.props.form;
    // console.log('configColumns', configColumns);
    const formItems = configColumns.map(configColumn => (
      <Row gutter={16} key={configColumn.key}>
        <Col span={4}>
          列配置EN:
          <Form.Item key={[configColumn.key, 'keyEn']}>
            {getFieldDecorator(`keyEn[${configColumn.key}]`, {
              initialValue: configColumn.keyEn,
              rules: [{ required: true, message: notNullLocale('列配置EN') }],
            })(
              <Input placeholder={'请输入列配置EN'} disabled={configColumn.keyEn ? true : false} />
            )}
          </Form.Item>
        </Col>
        <Col span={4}>
          列配置CN:
          <Form.Item key={[configColumn.key, 'keyCn']}>
            {getFieldDecorator(`keyCn[${configColumn.key}]`, {
              initialValue: configColumn.keyCn,
              rules: [{ required: true, message: notNullLocale('配置CN') }],
            })(<Input placeholder={'请输入列配置CN'} />)}
          </Form.Item>
        </Col>
        <Col span={2}>
          列排序:
          <Form.Item key={[configColumn.key, 'sort']}>
            {getFieldDecorator(`sort[${configColumn.key}]`, {
              initialValue: configColumn.sort,
            })(<Input placeholder={'排序'} />)}
          </Form.Item>
        </Col>
        <Col span={12}>
          列备注:
          <Form.Item key={[configColumn.key, 'note']}>
            {getFieldDecorator(`note[${configColumn.key}]`, {
              initialValue: configColumn.note,
            })(<Input placeholder={'请输入列备注'} />)}
          </Form.Item>
        </Col>
        <Col span={1}>
          {configColumns.length > 1 ? (
            <Icon
              className="dynamic-delete-button"
              style={{ marginTop: '25px' }}
              type="minus-circle-o"
              onClick={() => this.remove(configColumn.key)}
            />
          ) : null}
        </Col>
      </Row>
    ));
    return formItems;
  };

  drawSider = () => {
    const { openKeys, selectedKeys, configMenus, configColumns } = this.state;
    if (configMenus.length <= 0) return;
    const formItems = this.getCreateFormItem();
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 5 },
      wrapperCol: { span: 19 },
    };
    return (
      <div>
        <div className={siderStyle.navigatorPanelWrapper}>
          <span className={siderStyle.title}>{configLocale.title}</span>
          <Button
            type="primary"
            style={{ marginLeft: '20px' }}
            onClick={() => {
              this.setState({ visibleCreate: true });
            }}
            hidden={!havePermission(this.state.authority + '.create')}
          >
            新建
          </Button>
          <Button
            type="primary"
            style={{ marginLeft: '5px' }}
            onClick={this.onEdit}
            hidden={!havePermission(this.state.authority + '.edit')}
          >
            编辑
          </Button>
          <Button
            type="danger"
            style={{ marginLeft: '5px' }}
            onClick={this.onDelete}
            hidden={!havePermission(this.state.authority + '.delete')}
          >
            删除
          </Button>
        </div>
        <Menu
          mode="inline"
          openKeys={openKeys}
          onOpenChange={this.onOpenChange}
          onClick={this.onClickMenu}
          selectedKeys={selectedKeys}
        >
          {configMenus.map(e => {
            return <Menu.Item key={e.configNameEn}>{e.configName}</Menu.Item>;
          })}
        </Menu>
        <Modal
          title="新建配置"
          visible={this.state.visibleCreate}
          onOk={this.handleOk}
          onCancel={this.hidden}
          width={1100}
          style={{ top: 40 }}
          destroyOnClose
          bodyStyle={{ maxHeight: window.innerHeight - 180, overflowY: 'auto' }}
        >
          <Form onSubmit={this.handleOk}>
            <Row>
              <Col span={10}>
                <Form.Item {...formItemLayout} key={'configNameEn'} label={'配置名称EN'}>
                  {getFieldDecorator('configNameEn', {
                    initialValue: configColumns[0]?.configNameEn,
                    rules: [{ required: true, message: notNullLocale('配置名称EN') }],
                  })(<Input disabled={configColumns[0]?.configNameEn ? true : false} />)}
                </Form.Item>
              </Col>
              <Col span={10}>
                <Form.Item {...formItemLayout} key={'configName'} label={'配置名称CN'}>
                  {getFieldDecorator('configName', {
                    initialValue: configColumns[0]?.configName,
                    rules: [{ required: true, message: notNullLocale('配置名称CN') }],
                  })(<Input />)}
                </Form.Item>
              </Col>
              <Col span={2} offset={1}>
                <Button type="dashed" onClick={this.add}>
                  <Icon type="plus" /> 添加
                </Button>
              </Col>
            </Row>
            {formItems}
          </Form>
        </Modal>
      </div>
    );
  };

  drawContent = () => {
    // const { selectedKeys, configMenus } = this.state;

    // let currentSelectedKey = selectedKeys[0];
    // if (!currentSelectedKey) return;
    // let contentProps = configMenus.find(e => e.configNameEn === currentSelectedKey);
    // return <ConfigSearchPageE contentProps={contentProps} />;
    const { searchPage } = this.state;
    if (!searchPage) return;
    return searchPage;
  };
}
