/**集货位管理类型 */
export const CollectBinMgrType = {
  NOCARE: {
    name: 'NOCARE',
    caption: '不管理',
  },
  CARELESS: {
    name: 'CARELESS',
    caption: '粗式管理',
  },
  CAREFUL: {
    name: 'CAREFUL',
    caption: '精细化管理',
  },
}

/**物流模式 */
export const LogisticMode = {
  UNIFY: {
    name: 'UNIFY',
    caption: '统配'
  },
  ONESTEPCROSS: {
    name: 'ONESTEPCROSS',
    caption: '一步越库'
  },
  TWOSTEPCROSS: {
    name: 'TWOSTEPCROSS',
    caption: '二步越库'
  }
};