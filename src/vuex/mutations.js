const cache_key = 'tab_bar_vue_cahce_' + window.localStorage.getItem('ep_access_token');
const hello = { name: 'home', meta: { title: '首页' }, path: '/', active: false, status: '' }
const mutations = {
    bar_open(state, obj) {
        var oldBar = window.sessionStorage[cache_key] ? eval('(' + window.sessionStorage[cache_key] + ')') : [];
        var has = false;
        for (var i in oldBar) {
            if (oldBar[i].name == obj.name) {
                has = true;
                oldBar[i].active = true;
                oldBar[i].status = '';
            } else {
                oldBar[i].active = false;
                oldBar[i].status = '';
            }
        }
        if (has == true) {
            state.visitedViews = oldBar;
        } else {
            let tmphello = hello;
            if (oldBar.length == 0) {
                var bar = [];
                if (obj.path == '/') {
                    tmphello.active = true;
                    bar = [tmphello];
                } else {
                    bar.push(tmphello);
                    bar.push({ ...obj, active: true, status: '' });
                }
                state.visitedViews = bar;
            } else {
                oldBar.push({ ...obj, active: true, status: '' });
                state.visitedViews = oldBar;
            }
        }
        window.sessionStorage[cache_key] = JSON.stringify(state.visitedViews);
        document.title = "资料管理系统 - " + obj.meta.title;
    },
    bar_active(state, path) {
        let bar = state.visitedViews;
        if (path !== '/') {
            bar = state.visitedViews.concat();
        }
        for (var i in bar) {
            bar[i].active = false;
            if (bar[i].path == path) {
                bar[i].active = true;
                document.title = "资料管理系统 - " + bar[i].meta.title;
            }
        }
        state.visitedViews = bar;
    },
    bar_close_me(state, path) {
        var bar = state.visitedViews.concat();
        var tmp = [];
        for (var i in bar) {
            if (bar[i].path == path) {
                mutations.removeCachePage(state, bar[i].name)
            } else {
                tmp.push(bar[i]);
            }
        }
        window.sessionStorage[cache_key] = JSON.stringify(tmp);
        state.visitedViews = tmp;

    },
    bar_close_all(state) {
        let tmphello = hello;
        tmphello.active = true;
        var tmp = [tmphello];
        window.sessionStorage[cache_key] = JSON.stringify(tmp);
        state.visitedViews = tmp;
        state.cachePages = [];
    },
    bar_close_other(state, path) {
        var bar = state.visitedViews.concat();
        var tmp = [];
        for (var i in bar) {
            if (bar[i].path == path) {
                if (bar[i].path != '/') tmp.push(hello);
                bar[i].active = true;
                tmp.push(bar[i]);
            }
        }
        window.sessionStorage[cache_key] = JSON.stringify(tmp);
        state.visitedViews = tmp;
        state.cachePages = [];
    },
    bar_tips(state, obj) {
        state.tips = obj;
    },
    visitedViewsSet(state, arr) {
        state.visitedViews = arr;
    },
    isExpandSet(state, obj) {
        state.global.isExpand = obj;
    },
    setParamData(state, obj) {
        state.paramData = obj;
    },
    loginInfoSet(state, obj) {
        state.loginInfo = obj;
    },
    setCachePages(state, name) {
        let i = state.cachePages.findIndex(item => {
            return item === name;
        })
        if (i == -1) {
            state.cachePages.push(name);
        }
    },
    removeCachePage(state, name) {
        let i = state.cachePages.findIndex(item => {
            return item == name;
        })
        if (i != -1) {
            state.cachePages.splice(i, 1);
        }
    },
    setTableHeight(state, height) {
        state.tableHeight = height;
    },
    setAllAddress(state, allAddress) {
        state.allAddress = localStorage.getItem('allAddress') ? JSON.parse(localStorage.getItem('allAddress')) : allAddress;
    },
    // setPermissionList(state,allPermission){
    //     state.allPersmission = allPermission
    // },
    setUserPermission(state, data) {
        state.userPermission = data;
    },
    setUserRouters(state, data) {
        state.userRouters = data;
        window.sessionStorage.setItem("userRouters", JSON.stringify(state.userRouters));
    },
    addStopRouter(state, data) {
        let index = state.stopRouters.findIndex(item => item === data );
        !!~index && state.stopRouters.push(data);
    },
    removeStopRouter(state, data){
        let index = state.stopRouters.findIndex(item => item === data );
        !~index && state.stopRouters.splice(index, 1);
    }
}
export default mutations;