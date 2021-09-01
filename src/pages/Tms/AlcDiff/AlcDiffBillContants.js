/**状态 */
export const State = {
    SAVED: {
        name: 'SAVED',
        caption: '已保存'
    },
    INITIAL: {
        name: 'INITIAL',
        caption: '初始'
    },
    APPROVED: {
        name: 'APPROVED',
        caption: '已批准'
    },
    AUDITED: {
        name: 'AUDITED',
        caption: '已审核'
    }
};

/**状态 */
export const Type = {
    LESSALC: {
        name: 'LESSALC',
        caption: '少配'
    },
    MOREALC: {
        name: 'MOREALC',
        caption: '多配'
    },
    GOOD_RETURN_WAREHOUSE_LOSS: {
      name: 'GOOD_RETURN_WAREHOUSE_LOSS',
      caption: '好退-仓库报损'
    }
};

export const AlcType = {
    手工差错: {
        name: '手工差错',
        caption: '手工差错'
    },
    自动差错: {
        name: '自动差错',
        caption: '自动差错'
    }
};

export const AlcClassify = {
  WAREHOUSE_DIFF: {
    name: 'WAREHOUSE_DIFF',
    caption: '内部差异'
  },
  STORE_DIFF : {
    name: 'STORE_DIFF',
    caption: '门店差异'
  }
};
