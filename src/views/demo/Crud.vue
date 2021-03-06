<template>
  <ProCard shadow="never">
    <ProCrud
      v-model="form"
      v-model:search="query"
      v-model:current-page="page"
      v-model:page-size="limit"
      v-loading="isFetching"
      :columns="columns"
      :menu="menu"
      :data="list"
      :detail="form"
      :total="total"
      :rules="rules"
      :before-open="beforeOpen"
      border
      stripe
      label-width="100px"
      layout="total, ->, jumper, prev, pager, next, sizes"
      @search="search"
      @submit="submit"
      @delete="deleteRow"
      @load="loadList"
      @search-reset="loadList"
    >
      <template #table-tag="{ row, size }">
        <ElTag
          v-for="(item, index) in row.tag"
          :key="index"
          :size="size"
          class="tag-item"
        >
          {{ item }}
        </ElTag>
      </template>
      <template #detail-tag="{ item, size }">
        <ElTag
          v-for="(v, i) in item.tag"
          :key="i"
          :size="size"
          class="tag-item"
        >
          {{ v }}
        </ElTag>
      </template>
    </ProCrud>
  </ProCard>
</template>

<script setup lang="ts">
import { useCrud } from '@/composables/index'
import { Api } from '@/utils/index'
import RichEditorVue from '../../components/RichEditor.vue'
import type { ArticleItem, ArticleForm, ArticleQuery } from '@/types/index'

const {
  query,
  form,
  isFetching,
  page,
  limit,
  total,
  list,
  beforeOpen,
  search,
  loadList,
  submit,
  deleteRow,
} = useCrud<ArticleItem, ArticleForm, ArticleQuery>({ url: Api.article })
const menu = defineCrudMenuColumns({ label: '操作' })
const columns = defineCrudColumns<ArticleItem>([
  {
    label: 'ID',
    prop: 'id',
  },
  {
    label: '标题',
    prop: 'title',
    component: markRaw(ElInput),
    search: true,
    form: true,
    detail: true,
    props: {
      clearable: true,
      placeholder: '请输入标题',
    },
  },
  {
    label: '作者',
    prop: 'author',
    component: markRaw(ElInput),
    search: true,
    form: true,
    detail: true,
    props: {
      clearable: true,
      placeholder: '请输入作者',
    },
  },
  {
    label: '标签',
    prop: 'tag',
    component: markRaw(ProInputTag),
    form: true,
    detail: true,
    props: {
      clearable: true,
      trigger: 'enter',
      placeholder: '请输入标签',
    },
  },
  {
    label: '内容',
    prop: 'content',
    component: markRaw(RichEditorVue),
    form: true,
    detail: true,
    hide: true,
  },
  {
    label: '创建时间',
    prop: 'createTime',
  },
])
const rules = {
  title: { required: true, message: '请输入标题', trigger: 'blur' },
  author: { required: true, message: '请输入作者', trigger: 'blur' },
  tag: { required: true, message: '请输入标签', trigger: 'blur' },
  content: { required: true, message: '请输入内容', trigger: 'blur' },
}
</script>

<style scoped>
.tag-item:nth-child(n + 2) {
  margin-left: 6px;
}
</style>
