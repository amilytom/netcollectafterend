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
          placeholder="搜索分类名称"
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
        <el-table-column prop="cid" label="分类ID" sortable></el-table-column>
        <el-table-column prop="name" label="分类名称"></el-table-column>
        <el-table-column prop="parentName" label="上级分类"></el-table-column>
        <el-table-column label="是否推荐">
          <template slot-scope="scope"
          >{{ scope.row.isgood == 1 ? '推荐' : '无' }}
          </template>
        </el-table-column>
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
    <el-dialog title="添加分类" :visible.sync="addVisible" width="30%">
      <el-form ref="form" :model="addForm" label-width="100px">
        <el-form-item label="分类名称">
          <el-input v-model="addForm.name"></el-input>
        </el-form-item>
        <el-form-item label="上级分类">
          <el-select
            v-model="addForm.pid"
            placeholder="请选择"
            style="width: 100%"
          >
            <el-option
              v-for="(item, index) in cateList"
              :key="index"
              :label="item.name"
              :value="item.cid"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="是否推荐">
          <el-select
            v-model="addForm.isgood"
            placeholder="请选择"
            style="width: 100%"
          >
            <el-option
              v-for="(item, index) in goodList"
              :key="index"
              :label="item.label"
              :value="item.value"
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
    <el-dialog title="修改分类" :visible.sync="editVisible" width="30%">
      <el-form ref="form" :model="editForm" label-width="100px">
        <el-form-item label="分类">
          <el-input v-model="editForm.name"></el-input>
        </el-form-item>
        <el-form-item label="上级分类">
          <el-select
            v-model="editForm.pid"
            placeholder="请选择"
            style="width: 100%"
          >
            <el-option
              v-for="(item, index) in cateList"
              :key="index"
              :label="item.name"
              :value="item.cid"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="是否推荐">
          <el-select
            v-model="editForm.isgood"
            placeholder="请选择"
            style="width: 100%"
          >
            <el-option
              v-for="(item, index) in goodList"
              :key="index"
              :label="item.label"
              :value="item.value"
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
      title="删除分类提示"
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
  import cateApi from '../api/cateApi';

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
          name: '',
          pid: '',
          isgood: ''
        },
        addForm: {
          name: '',
          pid: '',
          isgood: ''
        },
        count: 0,
        searchName: '',
        tableLoading: false,
        btnLoading: false,
        cid: 0,
        parentName: '',
        cateList: [],
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
      this.getTopCateByPid();
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
          name: this.searchName
        };
        cateApi
          .cateList(params)
          .then((res) => {
            this.count = parseInt(res.data.count);
            this.tableData = res.data.list;
            res.data.list.forEach((item, index) => {
              if (item.pid != 0) {
                cateApi
                  .getcateById(item.pid)
                  .then((res2) => {
                    //this.tableData[index].parentName = res2.data.name;
                    this.$set(
                      this.tableData[index],
                      'parentName',
                      res2.data.name
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
          })
          .catch((err) => {
            this.tableLoading = false;
            console.log(err);
          });
      },
      // 获取顶级分类（下拉）
      getTopCateByPid() {
        this.tableLoading = true;
        let params = {
          dropList: true,
          pid: 0
        };
        cateApi
          .cateList(params)
          .then((res) => {
            res.data.list.forEach((item, index) => {
              this.cateList[index] = {
                cid: item.cid,
                name: item.name,
                pid: item.pid
              };
            });
            this.cateList.unshift({
              cid: 0,
              name: '无上级',
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
          name: '',
          pid: '',
          isgood: ''
        };
        this.addVisible = true;
      },
      handleEdit(row) {
        this.cid = row.cid;
        this.editForm = {
          name: row.name,
          pid: row.pid,
          isgood: row.isgood
        };
        this.editVisible = true;
      },
      handleDelete(row) {
        this.cid = row.cid;
        this.delVisible = true;
      },
      handleSelectionChange(val) {
        this.multipleSelection = val;
      },
      // 添加
      saveAdd() {
        this.btnLoading = true;
        let params = {
          name: this.addForm.name,
          pid: this.addForm.pid,
          isgood: this.addForm.isgood
        };
        console.log(params);
        cateApi
          .insertcate(params)
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
          cid: this.cid,
          name: this.editForm.name,
          pid: this.editForm.pid,
          isgood: this.editForm.isgood
        };
        cateApi
          .editcate(params)
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
          cid: this.cid
        };
        cateApi
          .deletecate(params)
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
