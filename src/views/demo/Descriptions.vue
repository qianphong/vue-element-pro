<template>
  <ProCard shadow="never">
    <ProDescriptions
      v-loading="isFetching"
      :columns="columns"
      :detail="detail || {}"
      :column="2"
    >
      <template #tag="{ item, size }">
        <ElTag
          v-for="(e, i) in item.tag"
          :key="i"
          :size="size"
          class="tag-item"
        >
          {{ e }}
        </ElTag>
      </template>
    </ProDescriptions>
  </ProCard>
</template>

<script setup lang="ts">
import { useDetail } from '@/composables/index'
import { Api } from '@/utils/index'
import type { ArticleItem } from '@/types/index'

const { isFetching, detailId, detail } = useDetail<ArticleItem>({
  url: Api.article,
})
const columns = defineDescriptionsColumns<ArticleItem>([
  {
    label: '标题',
    prop: 'title',
  },
  {
    label: '作者',
    prop: 'author',
  },
  {
    label: '标签',
    prop: 'tag',
  },
  {
    label: '创建时间',
    prop: 'createTime',
  },
  {
    label: '内容',
    prop: 'content',
  },
])

// INFO: 修改 detailId 值将自动获取详情。id 值可以通过路由或其它方式传值
detailId.value = 1
</script>

<style scoped>
.tag-item:nth-child(n + 2) {
  margin-left: 6px;
}
</style>
