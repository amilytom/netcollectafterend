import request from "@/utils/request";

const groupApi = {
  // 获取用户组列表
  groupList(param = {}) {
    return request({
      url: "/group",
      method: "get",
      params: param,
    });
  },

  // 获取一条管理员信息
  getGroupByRole(role) {
    return request({
      url: "/group/" + role,
      method: "get",
    });
  },

  // 更改一条管理组信息
  editGroup(param = {}) {
    return request({
      url: "/group",
      method: "put",
      data: param,
    });
  },
};

export default groupApi;
