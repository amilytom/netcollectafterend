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
          placeholder="搜索标题"
          class="handle-input mr10"
          @clear="queryClearfresh"
          @blur="queryClearfresh"
          clearable
        ></el-input>
        <el-input
          v-model.trim="searchKey"
          placeholder="搜索关键词"
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
        <el-table-column
          prop="id"
          label="ID"
          sortable
          width="60"
        ></el-table-column>
        <el-table-column prop="title" label="标题"></el-table-column>
        <el-table-column prop="url" label="网址"></el-table-column>
        <el-table-column prop="key" label="关键词"></el-table-column>
        <el-table-column label="分类名称" width="90">
          <template slot-scope="scope"
            >{{ getCateName(scope.row.cid) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="createdAt"
          label="创建时间"
          width="160"
        ></el-table-column>
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
    <el-dialog
      title="添加链接"
      :visible.sync="addVisible"
      width="60%"
      top="8vh"
    >
      <el-form ref="form" :model="addForm" label-width="100px">
        <el-form-item label="标题">
          <el-input v-model="addForm.title"></el-input>
        </el-form-item>
        <el-form-item label="网址">
          <el-input type="textarea" rows="5" v-model="addForm.url"></el-input>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="addForm.key"></el-input>
        </el-form-item>
        <el-form-item label="所属分类">
          <el-select v-model="addForm.cat" placeholder="请选择">
            <el-option
              :label="cate.name"
              :value="cate.cid"
              v-for="(cate, index) in cateList"
              :key="index"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="是否置顶">
          <el-select
            v-model="addForm.istop"
            placeholder="请选择"
            style="width: 100%"
          >
            <el-option
              v-for="(item, index) in topList"
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
    <el-dialog
      title="修改文章"
      :visible.sync="editVisible"
      width="60%"
      top="8vh"
    >
      <el-form ref="form" :model="editForm" label-width="100px">
        <el-form-item label="标题">
          <el-input v-model="editForm.title"></el-input>
        </el-form-item>
        <el-form-item label="网址">
          <el-input type="textarea" rows="5" v-model="editForm.url"></el-input>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="editForm.key"></el-input>
        </el-form-item>
        <el-form-item label="所属分类">
          <el-select v-model="editForm.cat" placeholder="请选择">
            <el-option
              :label="cate.name"
              :value="cate.cid"
              v-for="(cate, index) in cateList"
              :key="index"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="是否置顶">
          <el-select
            v-model="editForm.istop"
            placeholder="请选择"
            style="width: 100%"
          >
            <el-option
              v-for="(item, index) in topList"
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
      title="删除文章提示"
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
import linkApi from "../api/linkApi";
import cateApi from "../api/cateApi";

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
        title: "",
        url: "",
        key: "",
        cat: "",
        istop: "",
      },
      addForm: {
        title: "",
        url: "",
        key: "",
        cat: "",
        istop: "",
      },
      cid: 0,
      count: 0,
      searchName: "",
      searchKey: "",
      tableLoading: false,
      btnLoading: false,
      cateList: [],
      topList: [
        {
          value: 0,
          label: "无",
        },
        {
          value: 1,
          label: "置顶",
        },
      ],
    };
  },
  created() {
    this.getData();
    this.getCateList();
  },
  methods: {
    // 分页导航
    handleCurrentChange(val) {
      this.curPage = val;
      this.getData();
    },
    // 获取列表数据
    getData(search) {
      this.tableLoading = true;
      let params = {
        page: search ? 1 : this.curPage,
        rows: this.rows,
        title: this.searchName,
        key: this.searchKey,
      };
      linkApi
        .linkList(params)
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
    // 获取分类下拉列表数据
    getCateList(search) {
      this.tableLoading = true;
      let params = {
        dropList: true,
      };
      cateApi
        .cateList(params)
        .then((res) => {
          this.cateList = res.data.list;
          this.tableLoading = false;
        })
        .catch((err) => {
          this.tableLoading = false;
          console.log(err);
        });
    },
    // 获取分类id对应的分类名称
    getCateName(id) {
      let cateName;
      this.cateList.forEach((item) => {
        if (id == item.cid) {
          cateName = item.name;
        }
      });
      return cateName;
    },
    search() {
      this.curPage = 1; // 重置页数
      this.getData(true);
    },
    // 删除搜索的内容刷新用户列表
    queryClearfresh() {
      this.curPage = 1; // 重置页数
      this.getData();
    },
    handleAdd() {
      this.addForm = {
        title: "",
        url: "",
        key: "",
        cat: "",
        istop: "",
      };
      this.addVisible = true;
    },
    handleEdit(row) {
      this.cid = row.id;
      this.editForm = {
        title: row.title,
        url: row.url,
        key: row.key,
        cat: row.cat,
        istop: row.istop,
      };
      this.editVisible = true;
    },
    handleDelete(row) {
      this.cid = row.id;
      this.delVisible = true;
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    // 添加
    saveAdd() {
      this.btnLoading = true;
      let params = {
        title: this.addForm.title,
        url: this.addForm.url,
        key: this.addForm.key,
        cat: this.addForm.cat,
        istop: this.addForm.istop,
      };
      //console.log(params);
      linkApi
        .insertlink(params)
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
        id: this.cid,
        title: this.editForm.title,
        url: this.editForm.url,
        key: this.editForm.key,
        cat: this.editForm.cat,
        istop: this.editForm.istop,
      };
      linkApi
        .editlink(params)
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
        id: this.cid,
      };
      linkApi
        .deletelink(params)
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
