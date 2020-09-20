import request from "@/utils/request";

const loginApi = {
  // 登录
  login(param = {}) {
    return request({
      url: "/login",
      method: "post",
      data: param,
    });
  },
  regist(param = {}) {
    return request({
      url: "/regist",
      method: "post",
      data: param,
    });
  },
};

export default loginApi;
