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
          v-model.trim="selectName"
          placeholder="搜索角色名称"
          class="handle-input mr10"
          @clear="queryClearfresh"
          @blur="queryClearfresh"
          clearable
        ></el-input>
        <el-button type="primary" icon="search" @click="search">搜索</el-button>
      </div>

      <el-table
        :data="tableData"
        border
        class="table"
        ref="multipleTable"
        v-loading="tableLoading"
        @selection-change="handleSelectionChange"
      >
        <el-table-column prop="role" label="ID" sortable width="80">
        </el-table-column>
        <el-table-column prop="name" label="角色名称"></el-table-column>
        <el-table-column prop="permit" label="角色权限">
          <template slot-scope="scope"
          >{{ getAuthName(scope.row.permit) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center">
          <template slot-scope="scope">
            <el-button
              type="text"
              icon="el-icon-edit"
              @click="handleEdit(scope.row)"
            >权限设置
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 添加弹出框 -->
    <el-dialog
      title="添加权限"
      :visible.sync="addVisible"
      width="50%"
      class="authbox"
    >
      <el-tree
        :data="authData"
        show-checkbox
        default-expand-all
        node-key="id"
        ref="authtree"
        highlight-current
        :props="defaultProps"
      >
      </el-tree>

      <span slot="footer" class="dialog-footer">
        <el-button @click="addVisible = false">取 消</el-button>
        <el-button type="primary" @click="AddPermit" v-loading="btnLoading"
        >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import groupApi from '../api/groupApi';
  import authApi from '../api/authApi';

  export default {
    data() {
      return {
        title: this.$route.meta.title,
        tableData: [],
        multipleSelection: [],
        editForm: {
          role: '',
          name: '',
          permit: ''
        },
        selectName: '',
        tableLoading: false,
        btnLoading: false,
        addVisible: false,
        authData: [],
        defaultProps: {
          children: 'children',
          label: 'oname'
        }
      };
    },
    created() {
      this.getData();
      this.getAuthList();
    },
    methods: {
      // 获取列表数据
      getData(search) {
        this.tableLoading = true;
        let params = {
          name: this.selectName
        };
        groupApi
          .groupList(params)
          .then((res) => {
            this.tableData = res.data.list;
            this.tableLoading = false;
          })
          .catch((err) => {
            this.tableLoading = false;
            console.log(err);
          });
      },
      getAuthList() {
        this.btnLoading = true;
        let params = {
          dropList: true
        };
        authApi
          .authList(params)
          .then((res) => {
            this.btnLoading = false;
            //console.log(res.data.list);
            this.authData = this.toTree(res.data.list);
            //console.log(this.authData);
          })
          .catch((err) => {
            console.log(err);
            this.btnLoading = false;
          });
      },
      search() {
        this.getData(true);
      },
      // 删除搜索的内容刷新用户列表
      queryClearfresh() {
        this.getData();
      },
      handleEdit(row) {
        this.editForm.role = row.role;
        this.editForm.name = row.name;
        console.log(row.permit);
        this.addVisible = true;
        this.$nextTick(() => {
          this.$refs.authtree.setCheckedKeys(JSON.parse(row.permit));
        });
        //this.$refs.authtree.setCheckedKeys(row.permit, true);
      },
      handleSelectionChange(val) {
        this.multipleSelection = val;
      },
      // 添加权限
      AddPermit() {
        this.btnLoading = true;
        let params = {
          role: this.editForm.role,
          name: this.editForm.name,
          permit: JSON.stringify(this.$refs.authtree.getCheckedKeys())
        };
        console.log(params);
        groupApi
          .editGroup(params)
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
      getAuthName(data) {
        let arr = JSON.parse(data);
        let aname = '';
        this.authData.forEach((item, index) => {
          if (arr.includes(item.id)) {
            aname += item.oname + ' ';
          }
        });
        return aname;
      },
      // 列表组装成树形数据算法
      toTree(data) {
        let result = [];
        if (!Array.isArray(data)) {
          return result;
        }
        data.forEach((item) => {
          delete item.children;
        });
        let map = {};
        data.forEach((item) => {
          map[item.id] = item;
        });
        data.forEach((item) => {
          let parent = map[item.pid];
          if (parent) {
            (parent.children || (parent.children = [])).push(item);
          } else {
            result.push(item);
          }
        });
        //console.log(result);
        return result;
      }
    }
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

  .authbox /deep/ .el-tree-node__label {
    font-size: 16px;
  }

  .authbox /deep/ .el-tree-node__content {
    height: 32px;
  }
</style>
