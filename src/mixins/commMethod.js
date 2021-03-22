export default {

    install(Vue) {
        Vue.mixin({
            data() {
                return {}
            },
            methods: {
                searchQuery(_this = {}, queryArr = [], data = null) {
                    data = data ? data : 'search'
                    let query = _this.$route.query
                    if (queryArr && (Array.isArray(queryArr) && queryArr.length > 0)) { //指定参数
                        queryArr.forEach(el => {
                            if (query[el]) {
                                _this[data][el] = query[el]
                            }
                        });
                    } else if (_this[data]) {
                        queryArr = _this[data]
                        Object.getOwnPropertyNames(queryArr).forEach(function(el) {
                            //console.log('对象', el)
                            if (query[el]) {
                                _this[data][el] = query[el]
                            }
                        });
                    }
                    //console.log('搜索参数处理完毕', _this[data])
                },
                returnTagName(list, id) {
                    let name = ''
                    list.map((el) => {
                        if (id == el.tag_id) {
                            name = el.tag_name
                        }
                    })
                    return name
                }
            }
        })
    }
}