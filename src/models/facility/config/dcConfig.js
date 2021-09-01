export default {
  namespace: 'dcConfig',

  state: {
  },
  effects: {
    *chooseMenu({ payload }, { call, put }) {
      yield put({
        type: 'onChooseMenu',
        openKeys: payload.openKeys,
        selectedKeys: payload.selectedKeys
      });
    },
  },
  reducers: {
    onChooseMenu(state, action) {
      return {
        openKeys: action.openKeys,
        selectedKeys: action.selectedKeys
      }
    }
  },
}