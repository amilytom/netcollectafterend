<template>
  <div class="table">
    <div class="crumbs">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item
        ><i class="el-icon-star-on"></i> {{ title }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="container">
      <div class="handle-box">
        <el-input
          v-model.trim="searchName"
          placeholder="搜索功能名称"
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
        v-loading="tableLoading"
        class="table"
        ref="multipleTable"
        @selection-change="handleSelectionChange"
      >
        <el-table-column prop="id" label="功能ID" sortable></el-table-column>
        <el-table-column prop="oname" label="功能名称"></el-table-column>
        <el-table-column prop="parentName" label="父级功能"></el-table-column>
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
          :current-page="curPage"
          :page-size="rows"
          layout="prev, pager, next"
          :total="count"
        >
        </el-pagination>
      </div>
    </div>

    <!-- 添加弹出框 -->
    <el-dialog title="添加功能" :visible.sync="addVisible" width="30%">
      <el-form ref="form" :model="addForm" label-width="100px">
        <el-form-item label="功能名称">
          <el-input v-model="addForm.oname"></el-input>
        </el-form-item>
        <el-form-item label="上级功能">
          <el-select
            v-model="addForm.pid"
            placeholder="请选择"
            style="width: 100%"
          >
            <el-option
              v-for="(item, index) in authList"
              :key="index"
              :label="item.oname"
              :value="item.id"
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
    <el-dialog title="修改功能" :visible.sync="editVisible" width="30%">
      <el-form ref="form" :model="editForm" label-width="100px">
        <el-form-item label="功能">
          <el-input v-model="editForm.oname"></el-input>
        </el-form-item>
        <el-form-item label="上级功能">
          <el-select
            v-model="editForm.pid"
            placeholder="请选择"
            style="width: 100%"
          >
            <el-option
              v-for="(item, index) in authList"
              :key="index"
              :label="item.oname"
              :value="item.id"
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
      title="删除功能提示"
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
  import authApi from '../api/authApi';

  export default {
    data() {
      return {
        title: this.$route.meta.title,
        tableData: [],
        curPage: 1,
        rows: 5,
        multipleSelection: [],
        addVisible: false,
        editVisible: false,
        delVisible: false,
        editForm: {
          oname: '',
          pid: ''
        },
        addForm: {
          oname: '',
          pid: ''
        },
        count: 0,
        searchName: '',
        tableLoading: false,
        btnLoading: false,
        cid: 0,
        parentName: '',
        authList: [],
        goodList: [
          {
            value: 0,
            label: '无'
          },
          {
            value: 1,
            label: '推荐'
          }
        ]
      };
    },
    created() {
      this.getData();
      this.getTopauthByPid();
    },
    methods: {
      // 分页导航
      handleCurrentChange(val) {
        this.curPage = val;
        this.getData();
      },
      // 获取列表数据（分页）
      getData(search) {
        this.tableLoading = true;
        let params = {
          page: search ? 1 : this.curPage,
          rows: this.rows,
          oname: this.searchName
        };
        authApi
          .authList(params)
          .then((res) => {
            this.count = parseInt(res.data.count);
            this.tableData = res.data.list;
            res.data.list.forEach((item, index) => {
              if (item.pid != 0) {
                authApi
                  .getauthById(item.pid)
                  .then((res2) => {
                    this.$set(
                      this.tableData[index],
                      'parentName',
                      res2.data.oname
                    );
                    this.tableLoading = false;
                  })
                  .catch((err2) => {
                    console.log(err2);
                    this.tableLoading = false;
                  });
              } else {
                this.tableData[index].parentName = '无';
                this.tableLoading = false;
              }
            });
            //console.log(this.tableData);
          })
          .catch((err) => {
            this.tableLoading = false;
            console.log(err);
          });
      },
      // 获取顶级功能（下拉）
      getTopauthByPid() {
        this.tableLoading = true;
        let params = {
          dropList: true,
          pid: 0
        };
        authApi
          .authList(params)
          .then((res) => {
            res.data.list.forEach((item, index) => {
              this.authList[index] = {
                id: item.id,
                oname: item.oname,
                pid: item.pid
              };
            });
            this.authList.unshift({
              id: 0,
              oname: '无上级',
              pid: 0
            });
            this.tableLoading = false;
          })
          .catch((err) => {
            this.tableLoading = false;
            console.log(err);
          });
      },
      search() {
        this.curPage = 1;
        this.getData(true);
      },
      // 删除搜索的内容刷新用户列表
      queryClearfresh() {
        this.curPage = 1; // 重置页数
        this.getData();
      },
      handleAdd() {
        this.addForm = {
          oname: '',
          pid: ''
        };
        this.addVisible = true;
      },
      handleEdit(row) {
        this.id = row.id;
        this.editForm = {
          oname: row.oname,
          pid: row.pid
        };
        this.editVisible = true;
      },
      handleDelete(row) {
        this.id = row.id;
        this.delVisible = true;
      },
      handleSelectionChange(val) {
        this.multipleSelection = val;
      },
      // 添加
      saveAdd() {
        this.btnLoading = true;
        let params = {
          oname: this.addForm.oname,
          pid: this.addForm.pid
        };
        console.log(params);
        authApi
          .insertauth(params)
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
          id: this.id,
          oname: this.editForm.oname,
          pid: this.editForm.pid
        };
        authApi
          .editauth(params)
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
      // 确定删除
      deleteRow() {
        this.btnLoading = true;
        let params = {
          id: this.id
        };
        authApi
          .deleteauth(params)
          .then((res) => {
            this.btnLoading = false;
            this.$message.success('删除成功');
            this.delVisible = false;
            this.getData();
          })
          .catch((err) => {
            console.log(err);
            this.btnLoading = false;
          });
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
</style>
