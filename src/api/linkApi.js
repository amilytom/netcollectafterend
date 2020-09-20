import request from "@/utils/request";

const linkApi = {
  // 获取文章列表（分页）
  linkList(param = {}) {
    return request({
      url: "/link",
      method: "get",
      params: param,
    });
  },

  // 获取一条文章信息
  getlinkById(id) {
    return request({
      url: "/link/" + id,
      method: "get",
    });
  },

  // 添加一条文章信息
  insertlink(param = {}) {
    return request({
      url: "/link",
      method: "post",
      data: param,
    });
  },

  // 更改一条文章信息
  editlink(param = {}) {
    return request({
      url: "/link",
      method: "put",
      data: param,
    });
  },

  // 删除一条文章信息
  deletelink(param = {}) {
    return request({
      url: "/link",
      method: "delete",
      data: param,
    });
  },
};

export default linkApi;
