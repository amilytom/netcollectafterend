<template>
  <div class="table">
    <div class="crumbs">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item
          ><i class="el-icon-user-solid"></i> {{ title }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="container">
      <div class="handle-box">
        <el-input
          v-model.trim="selectUsername"
          placeholder="搜索用户名"
          class="handle-input mr10"
          @clear="queryClearfresh"
          @blur="queryClearfresh"
          clearable
        ></el-input>
        <el-input
          v-model.trim="selectName"
          placeholder="搜索姓名"
          class="handle-input mr10"
          @clear="queryClearfresh"
          @blur="queryClearfresh"
          clearable
        ></el-input>
        <el-button type="primary" icon="search" @click="search">搜索</el-button>
        <el-button type="primary" icon="search" @click="handleAdd"
          >添加
        </el-button>
      </div>

      <el-table
        :data="tableData"
        border
        class="table"
        ref="multipleTable"
        v-loading="tableLoading"
        @selection-change="handleSelectionChange"
      >
        <el-table-column prop="username" label="用户名" sortable>
        </el-table-column>
        <el-table-column prop="name" label="姓名"></el-table-column>
        <el-table-column prop="groupName" label="角色"></el-table-column>
        <el-table-column prop="createdAt" label="创建时间"></el-table-column>
        <el-table-column label="操作" width="180" align="center">
          <template slot-scope="scope">
            <el-button
              type="text"
              icon="el-icon-edit"
              @click="handleEdit(scope.row)"
              >修改
            </el-button>
            <el-button
              type="text"
              icon="el-icon-delete"
              class="red"
              @click="handleDelete(scope.row)"
              >删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <el-pagination
          background
          @current-change="handleCurrentChange"
          :current-page="cur_page"
          :page-size="rows"
          layout="prev, pager, next"
          :total="count"
        >
        </el-pagination>
      </div>
    </div>

    <!-- 添加弹出框 -->
    <el-dialog title="添加管理员" :visible.sync="addVisible" width="30%">
      <el-form ref="form" :model="addForm" label-width="60px">
        <el-form-item label="用户名">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="addForm.name"></el-input>
        </el-form-item>
        <el-form-item label="角色">
          <el-select
            v-model="addForm.role"
            placeholder="请选择角色"
            style="width: 100%"
          >
            <el-option
              v-for="(item, index) in groupList"
              :key="index"
              :label="item.name"
              :value="item.role"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveAdd" v-loading="btnLoading"
          >确 定</el-button
        >
      </span>
    </el-dialog>

    <!-- 编辑弹出框 -->
    <el-dialog title="修改管理员" :visible.sync="editVisible" width="30%">
      <el-form ref="form" :model="editForm" label-width="60px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="editForm.password" show-password></el-input>
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="editForm.name"></el-input>
        </el-form-item>
        <el-form-item label="角色">
          <el-select
            v-model="editForm.role"
            placeholder="请选择角色"
            style="width: 100%"
          >
            <el-option
              v-for="(item, index) in groupList"
              :key="index"
              :label="item.name"
              :value="item.role"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveEdit" v-loading="btnLoading"
          >确 定</el-button
        >
      </span>
    </el-dialog>

    <!-- 删除提示框 -->
    <el-dialog
      title="删除管理员提示"
      :visible.sync="delVisible"
      width="300px"
      center
    >
      <div class="del-dialog-cnt">删除不可恢复，是否确定删除？</div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="delVisible = false">取 消</el-button>
        <el-button type="primary" @click="deleteRow" v-loading="btnLoading"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import userApi from "../api/userApi";
import groupApi from "../api/groupApi";

export default {
  data() {
    return {
      title: this.$route.meta.title,
      tableData: [],
      cur_page: 1,
      rows: 5,
      multipleSelection: [],
      addVisible: false,
      editVisible: false,
      delVisible: false,
      editForm: {
        username: "",
        password: "",
        name: "",
        role: "",
      },
      addForm: {
        username: "",
        password: "",
        name: "",
        role: "",
      },
      cid: 0,
      count: 0,
      selectUsername: "",
      selectName: "",
      tableLoading: false,
      btnLoading: false,
      groupList: [],
    };
  },
  created() {
    this.getData();
    this.getGroupList();
  },
  methods: {
    // 分页导航
    handleCurrentChange(val) {
      this.cur_page = val;
      this.getData();
    },
    // 获取列表数据
    getData(search) {
      this.tableLoading = true;
      let params = {
        page: search ? 1 : this.cur_page,
        rows: this.rows,
        username: this.selectUsername,
        name: this.selectName,
      };
      userApi
        .adminList(params)
        .then((res) => {
          this.tableData = res.data.list;
          this.count = parseInt(res.data.count);
          this.tableLoading = false;
        })
        .catch((err) => {
          this.tableLoading = false;
          console.log(err);
        });
    },
    getGroupList() {
      this.tableLoading = true;
      let params = {};
      groupApi
        .groupList(params)
        .then((res) => {
          this.groupList = res.data.list;
          this.tableLoading = false;
        })
        .catch((err) => {
          this.tableLoading = false;
          console.log(err);
        });
    },
    search() {
      this.getData(true);
    },
    // 删除搜索的内容刷新用户列表
    queryClearfresh() {
      this.cur_page = 1; // 重置页数
      this.getData();
    },
    handleAdd() {
      // 清空对象
      this.addForm = {
        username: "",
        password: "",
        name: "",
        role: "",
      };
      this.addVisible = true;
    },
    handleEdit(row) {
      this.cid = row.uid;
      this.btnLoading = true;
      userApi
        .getAdminById(this.cid)
        .then((res) => {
          this.btnLoading = false;
          this.editForm = {
            name: res.data.name,
            username: res.data.username,
            password: res.data.password,
            role: res.data.role,
          };
        })
        .catch((err) => {
          console.log(err);
          this.btnLoading = false;
        });

      this.editVisible = true;
    },
    handleDelete(row) {
      this.cid = row.uid;
      this.delVisible = true;
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    // 添加
    saveAdd() {
      this.btnLoading = true;
      let params = {
        username: this.addForm.username,
        password: this.addForm.password,
        name: this.addForm.name,
        role: this.addForm.role,
      };
      userApi
        .insertAdmin(params)
        .then((res) => {
          this.btnLoading = false;
          this.$message.success(`添加成功`);
          this.addVisible = false;
          this.getData();
        })
        .catch((err) => {
          console.log(err);
          this.btnLoading = false;
        });
    },
    // 修改
    saveEdit() {
      this.btnLoading = true;
      let params = {
        uid: this.cid,
        username: this.editForm.username,
        password: this.editForm.password,
        name: this.editForm.name,
        role: this.editForm.role,
      };
      console.log(params);
      userApi
        .editAdmin(params)
        .then((res) => {
          this.btnLoading = false;
          this.$message.success(`修改成功`);
          this.editVisible = false;
          this.getData();
        })
        .catch((err) => {
          console.log(err);
          this.btnLoading = false;
        });
    },
    // 确定删除u
    deleteRow() {
      let params = {
        uid: this.cid,
      };
      //console.log(params);
      userApi
        .deleteAdmin(params)
        .then((res) => {
          this.btnLoading = false;
          this.$message.success("删除成功");
          this.delVisible = false;
          this.getData();
        })
        .catch((err) => {
          console.log(err);
          this.btnLoading = false;
        });
    },
  },
};
</script>

<style scoped>
.handle-box {
  margin-bottom: 20px;
}

.handle-select {
  width: 120px;
}

.handle-input {
  width: 300px;
  display: inline-block;
}

.del-dialog-cnt {
  font-size: 16px;
  text-align: center;
}

.table {
  width: 100%;
  font-size: 14px;
}

.red {
  color: #ff0000;
}

.mr10 {
  margin-right: 10px;
}
</style>
