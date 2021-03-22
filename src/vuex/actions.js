import utils from 'utils/util.js';
let oneLevelModules = [];
const filterData = (arr) => {
  arr.map(item => {
    if (!item.ac_permissions_id && item.child) {
        oneLevelModules.push(item);
      filterData(item.child);
    }
  })
}
export default {
    getAllAddress({commit},params){
        utils.gateway(utils.api.getAllTree,{...params},'addr_list').then(res => {
            if(res.code === 0 && res.content && Array.isArray(res.content)){
                localStorage.setItem("allAddress",JSON.stringify(res.content));
                commit('setAllAddress',res.content);
            }
        })
    },
    getUserOwnerPermission({ commit }, params){
        let {employee_id,access_control_source_id,to} = params;
        return utils.gateway(utils.api.getUserOwnerPermissions, { employee_id, resource_type_id: 10017, source_id: access_control_source_id },'must_checked').then(res => {
            if(res.code === 0 && Array.isArray(res.content)){
                filterData(res.content);
                if(to.meta.title){
                    let obj = oneLevelModules.find(item => item.module_name === to.meta.title);
                   if (obj && Array.isArray(obj.child) && obj.child.length > 0) {
                       let keyMap = obj.child.filter(ii => ii.permissions_key).map(oo => oo.permissions_key);
                       commit('setUserPermission', keyMap);
                   }
                }
                
                return res;
            }
        })
    }
    // getPermissonList({commit},params){
    //     console.log('dd',commit);
    //     return utils.gateway(utils.api.getPermissionList,{...params});
    // }
}