<template>
  <ProCard shadow="never">
    <ProCrud
      v-model:search="query"
      v-model:current-page="page"
      v-model:page-size="limit"
      v-loading="isFetching"
      :columns="columns"
      :menu="menu"
      :data="list"
      :total="total"
      :before-open="beforeOpen"
      border
      stripe
      layout="total, ->, jumper, prev, pager, next, sizes"
      @search="search"
      @load="loadList"
      @search-reset="loadList"
    >
      <template #menu-right="{ size }">
        <ElButton :size="size" type="primary" @click="toForm()">
          增加
        </ElButton>
      </template>
      <template #action>
        <ElButton
          :icon="Refresh"
          circle
          style="margin-right: 8px"
          @click="loadList"
        />
        <ProColumn-setting v-model="columns" />
      </template>
      <template #menu="{ row, size }">
        <ElButton :size="size" text @click="toForm(row.id)"> 编辑 </ElButton>
        <ElButton :size="size" text @click="deleteRow(row)"> 删除 </ElButton>
      </template>
      <template #table-tags="{ row, size }">
        <ElTag
          v-for="(item, index) in row.tags"
          :key="index"
          :size="size"
          class="tag-item"
        >
          {{ item }}
        </ElTag>
      </template>
    </ProCrud>
  </ProCard>
</template>

<script setup lang="ts">
import { Refresh } from '@element-plus/icons-vue'
import { useCrud, useCatesList } from '@/composables/index'
import { Api } from '@/utils/index'
import type { GoodsItem, GoodsForm, GoodsQuery } from '@/types/index'

const {
  query,
  isFetching,
  page,
  limit,
  total,
  list,
  beforeOpen,
  search,
  loadList,
  deleteRow,
} = useCrud<GoodsItem, GoodsForm, GoodsQuery>({ url: Api.goods })
const router = useRouter()
const catesList = useCatesList()
const menu = defineCrudMenuColumns({
  label: '操作',
  add: false,
  edit: false,
  detail: false,
  del: false,
})
// INFO: 当 columns 内部引用响应式数据时必须使用 `ref()` 包裹且数据不需要解构响应式数据，否则可以无法获取异步数据变化
const columns = ref(
  defineCrudColumns<GoodsItem>([
    {
      label: '基础信息',
      prop: 'id',
      hide: true,
    },
    {
      label: '商品名称',
      prop: 'title',
      component: markRaw(ElInput),
      search: true,
      props: {
        clearable: true,
        placeholder: '请输入商品名称',
      },
    },
    {
      label: '价格',
      prop: 'price',
    },
    {
      label: '成本',
      prop: 'cost',
      hide: true,
    },
    {
      label: '库存',
      prop: 'stock',
    },
    {
      label: '分类',
      prop: 'cates',
      component: markRaw(ProSelect),
      search: true,
      props: {
        data: catesList, // 这里不要通过 `catesList.value` 解构响应式数据
        clearable: true,
        placeholder: '请选择分类',
        style: 'width:100%',
      },
    },
    {
      label: '标签',
      prop: 'tags',
    },
    {
      label: '描述',
      prop: 'desc',
      hide: true,
    },
    {
      label: '规格信息',
      prop: '',
      children: [
        {
          label: '长',
          prop: 'length',
        },
        {
          label: '宽',
          prop: 'width',
        },
        {
          label: '高',
          prop: 'height',
        },
        {
          label: '重量',
          prop: 'weight',
        },
      ],
    },
    {
      label: '开始时间',
      prop: 'start',
      hide: true,
    },
    {
      label: '结束时间',
      prop: 'end',
      hide: true,
    },
    {
      label: '创建时间',
      prop: 'createTime',
      hide: true,
    },
  ])
)

function toForm(id?: string) {
  router.push({
    path: '/demo/complex-form',
    query: { id },
  })
}
</script>

<style scoped>
.tag-item:nth-child(n + 2) {
  margin-left: 6px;
}
</style>
