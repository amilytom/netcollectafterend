import request from "@/utils/request";

const userApi = {
  // 获取管理员列表（分页）
  adminList(param = {}) {
    return request({
      url: "/user",
      method: "get",
      params: param,
    });
  },

  // 获取一条管理员信息
  getAdminById(id) {
    return request({
      url: "/user/" + id,
      method: "get",
    });
  },

  // 添加一条管理员信息
  insertAdmin(param = {}) {
    return request({
      url: "/user",
      method: "post",
      data: param,
    });
  },

  // 更改一条管理员信息
  editAdmin(param = {}) {
    return request({
      url: "/user",
      method: "put",
      data: param,
    });
  },

  // 更改一条管理员信息
  editAdminPwd(param = {}) {
    return request({
      url: "/user/pwd",
      method: "put",
      data: param,
    });
  },

  // 删除一条管理员信息
  deleteAdmin(param = {}) {
    return request({
      url: "/user",
      method: "delete",
      data: param,
    });
  },
};

export default userApi;
