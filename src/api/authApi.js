import request from "@/utils/request";

const authApi = {
  // 获取分类列表（分页）
  authList(param = {}) {
    return request({
      url: "/auth",
      method: "get",
      params: param,
    });
  },

  // 获取一条分类信息
  getauthById(id) {
    return request({
      url: "/auth/" + id,
      method: "get",
    });
  },

  // 添加一条分类信息
  insertauth(param = {}) {
    return request({
      url: "/auth",
      method: "post",
      data: param,
    });
  },

  // 更改一条分类信息
  editauth(param = {}) {
    return request({
      url: "/auth",
      method: "put",
      data: param,
    });
  },

  // 删除一条分类信息
  deleteauth(param = {}) {
    return request({
      url: "/auth",
      method: "delete",
      data: param,
    });
  },
};

export default authApi;
