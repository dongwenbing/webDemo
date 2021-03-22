const getUserRouters = () => {
    let json = window.sessionStorage.getItem("userRouters");
    if (json) {
        return JSON.parse(json)
    } else {
        return []
    }
}
let state = {
    tableHeight: '500',
    cachePages: [], //缓存页
    visitedViews: [], //已打开菜单列表
    bar: { lists: [] },
    global: {
        isExpand: true,
        login: {
            data: {}
        }
    },
    paramData: { proId: '' },
    loginInfo: {},
    allAddress: [],
    // allPersmission:[]
    userPermission: [],
    userRouters: getUserRouters(),
    stopRouters: ['workForceManagement']
};

export default state;