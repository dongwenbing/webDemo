const getters = {
    cachePages: state => {
        return state.cachePages;
    },
    paramData: state => {
        return state.paramData;
    },
    tableHeight: state => {
        return state.tableHeight
    },
    visitedViews: state => {
        return state.visitedViews;
    },
    isExpand: state => {
        return state.global.isExpand;
    },
    loginInfo: state => {
        return state.loginInfo;
    },
    activitystatusGet: state => {
        return state.activitystatusList;
    },
    stopRouters: state => state.stopRouters,
}

export default getters