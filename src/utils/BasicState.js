export const basicState = {
    ONLINE: {
        name: 'ONLINE',
        caption: '启用'
    },
    OFFLINE: {
        name: 'OFFLINE',
        caption: '禁用'
    },
    REMOVE: {
        name: 'REMOVE',
        caption: '删除'
    },
    EDIT: {
        name: 'EDIT',
        caption: '编辑'
    }
}

export function getStateCaption(state) {
    let caption;

    for (let x in basicState) {
      if (basicState[x].name === state) {
        caption = basicState[x].caption;
      }
    }

    return caption;
}

export const basicStateSelect={
    ONLINE: {
        name: 'ONLINE',
        caption: '启用'
    },
    OFFLINE: {
        name: 'OFFLINE',
        caption: '禁用'
    },
}
