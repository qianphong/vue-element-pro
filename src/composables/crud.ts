import { useGet, usePost, usePut, useDelete } from './index'
import {
  appMessage,
  appConfirm,
  replaceId,
  RequestPageKey,
  RequestLimitkey,
  RequestLimit,
} from '@/utils/index'
import type { Ref } from 'vue'
import type {
  ICrudSubmit,
  ICrudBeforeOpen,
  IFormSubmit,
  StringObject,
  UnknownObject,
  MaybeRef,
} from 'element-pro-components'
import type { PagesData } from '../types/index'

interface CommonConfig {
  url: MaybeRef<string>
  immediate?: MaybeRef<boolean>
}

export type ReqFormType = 'post' | 'put'

export interface UseFormConfig<T> {
  url: MaybeRef<string>
  showTip?: MaybeRef<boolean>
  type?: MaybeRef<ReqFormType>
  transform?: (form: T) => T
}

export interface UseFormReturn<T, K> {
  isFetching: Ref<boolean>
  form: Ref<T>
  submit: IFormSubmit
  submitForm: (type?: ReqFormType) => Promise<Ref<K | null>>
}

/**
 * 封装表单提交
 * @param config.url 请求地址
 * @param config.showTip 显示提示，默认: `true`
 * @param config.type 提交请求方式 post | put，默认: `post`
 * @param config.transform 转换表单
 */
export function useForm<Form = StringObject, Data = unknown>({
  url,
  transform,
  showTip = true,
  type = 'post',
}: UseFormConfig<Form>): UseFormReturn<Form, Data> {
  const isFetching = ref(false)
  const form = ref({}) as Ref<Form>
  const payload = computed(() => {
    return transform ? transform(unref(form)) : form.value
  })
  const _url = computed(() => {
    return replaceId(unref(url), (payload.value as { id?: string }).id)
  })
  const postForm = usePost<Data>(url, payload)
  const putForm = usePut<Data>(_url, payload)
  const submit: IFormSubmit = async (done, isValid) => {
    if (isValid) {
      const res = await submitForm()

      if (res.value) {
        unref(showTip) && appMessage('success', '提交成功！')
      } else if (res.value !== null) {
        unref(showTip) && appMessage('warning', '提交失败！')
      }
    }
    done()
  }

  async function submitForm(reqType = type) {
    isFetching.value = true
    if (unref(reqType) === 'post') {
      await postForm.execute()
      isFetching.value = false
      return postForm.data
    } else {
      await putForm.execute()
      isFetching.value = false
      return putForm.data
    }
  }

  return {
    isFetching,
    form,
    submit,
    submitForm,
  }
}

export interface UseDetailReturn<T> {
  isFetching: Ref<boolean>
  detailId: Ref<string | number | undefined>
  detail: Ref<T | null>
  loadDetail: () => Promise<void>
}

/**
 * 封装获取详情
 * @param config.url 请求地址
 * @param config.immediate 是否在修改ID时加载，默认: `true`
 */
export function useDetail<T = UnknownObject>({
  url,
  immediate = true,
}: CommonConfig): UseDetailReturn<T> {
  const detailId = ref<string | number | undefined>(undefined)
  const _url = computed(() => replaceId(unref(url), detailId.value))
  const { isFetching, data, execute } = useGet<T>(_url)

  unref(immediate) &&
    watch(detailId, (val) => {
      val !== undefined && loadDetail()
    })

  async function loadDetail() {
    if (isFetching.value) return
    await execute()
  }

  return {
    isFetching,
    detailId,
    detail: data,
    loadDetail,
  }
}

export interface UseDeleteItemConfig extends CommonConfig {
  showTip?: MaybeRef<boolean>
}

export interface UseDeleteItemReturn<T> {
  isFetching: Ref<boolean>
  deleteId: Ref<string | number | undefined>
  submitDelete: () => Promise<Ref<T | null> | undefined>
}

/**
 * 封装删除某项
 * @param config.url 请求地址
 * @param config.immediate 是否在修改ID时直接调用删除，默认: `false`
 * @param config.showTip 显示提示，默认: `true`
 */
export function useDeleteItem<T = unknown>({
  url,
  immediate = false,
  showTip = true,
}: UseDeleteItemConfig): UseDeleteItemReturn<T> {
  const deleteId = ref<string | number | undefined>(undefined)
  const _url = computed(() => replaceId(unref(url), deleteId.value))
  const { isFetching, data, execute } = useDelete<T>(_url)

  unref(immediate) &&
    watch(deleteId, (val) => {
      val !== undefined && submitDelete()
    })

  function submitDelete() {
    return appConfirm('警告', '您确定要删除该项吗?', { type: 'warning' })
      .then(async () => {
        await execute()

        if (data.value) {
          deleteId.value = undefined
          unref(showTip) && appMessage('success', '删除成功!')
        } else {
          unref(showTip) && appMessage('warning', '删除失败!')
        }
        return data
      })
      .catch(() => {
        deleteId.value = undefined
        appMessage('info', '已取消操作')
        return undefined
      })
  }

  return {
    isFetching,
    deleteId,
    submitDelete,
  }
}

export interface UseListConfig<T> extends CommonConfig {
  transform?: (form: T) => T
}

export interface UseListReturn<T, K> {
  query: Ref<K>
  isFetching: Ref<boolean>
  page: Ref<number>
  limit: Ref<number>
  total: Ref<number>
  list: Ref<T[]>
  search: IFormSubmit
  loadList: () => Promise<void>
}

/**
 * 封装获取列表
 * @param config.url 请求地址
 * @param config.immediate 是否在初始化时加载，默认: `true`
 * @param config.transform 转换搜索
 */
export function useList<Item = StringObject, Serach = Item>({
  url,
  transform,
  immediate = true,
}: UseListConfig<Serach>): UseListReturn<Item, Serach> {
  const page = ref(1)
  const limit = ref(RequestLimit)
  const total = ref(0)
  const query = ref<Serach>({} as Serach) as Ref<Serach>
  const payload = computed(() => {
    const _query = transform ? transform(unref(query)) : query.value
    return {
      ..._query,
      [RequestPageKey]: page.value,
      [RequestLimitkey]: limit.value,
    }
  })
  const { isFetching, data, execute } = useGet<PagesData<Item>>(url, payload)
  const list = ref<Item[]>([]) as Ref<Item[]>
  const search: IFormSubmit = async (done, isValid) => {
    if (isValid) {
      page.value = 1
      await loadList()
    }
    done()
  }

  unref(immediate) && loadList()

  async function loadList() {
    if (isFetching.value) return
    await execute()

    if (data.value) {
      list.value = data.value.list
      total.value = data.value.total
    }
  }

  return {
    query,
    isFetching,
    page,
    limit,
    total,
    list,
    search,
    loadList,
  }
}

export interface UseCrudConfig<T, K>
  extends CommonConfig,
    Pick<UseFormConfig<T>, 'showTip' | 'transform'> {
  syncDetail?: MaybeRef<boolean>
  transformQuery?: (form: K) => K
  transformDetail?: (form: T) => T
}

export interface UseCrudReturn<T, K, Q, M>
  extends UseListReturn<T, Q>,
    Pick<UseFormReturn<K, M>, 'form' | 'submitForm'> {
  beforeOpen: ICrudBeforeOpen<T>
  submit: ICrudSubmit
  deleteRow: (row: T) => Promise<void>
}

/**
 * 封装 Crud
 * @param config.url 请求地址
 * @param config.immediate 是否在初始化时加载，默认: `true`
 * @param config.showTip 显示提示，默认: `true`
 * @param config.syncDetail 是否需要异步加载详情，默认: `false`
 * @param config.transform 转换表单
 * @param config.transformQuery 转换搜索
 * @param config.transformDetail 转换详情到表单
 */
export function useCrud<
  Item = StringObject,
  Form = Item,
  Serach = Item,
  Data = unknown
>({
  url,
  immediate = true,
  showTip = true,
  syncDetail = false,
  transform,
  transformQuery,
  transformDetail,
}: UseCrudConfig<Form, Serach>): UseCrudReturn<Item, Form, Serach, Data> {
  const listCore = useList<Item, Serach>({
    url,
    immediate,
    transform: transformQuery,
  })
  const { form, submitForm } = useForm<Form, Data>({ url, showTip, transform })
  const { deleteId, submitDelete } = useDeleteItem<Data>({ url, showTip })
  const { detailId, detail, loadDetail } = useDetail<Form>({
    url,
    immediate: false,
  })
  const beforeOpen: ICrudBeforeOpen = async (done, type, row) => {
    if (type === 'edit' || type === 'detail') {
      let value = row
      if (unref(syncDetail)) {
        const _row = row as Item & { id: string | number }

        if (_row.id) {
          detailId.value = _row.id
          await loadDetail()

          if (detail.value) {
            value = detail.value
          }
        }
      }

      form.value = transformDetail ? transformDetail(value) : value
    }
    done()
  }
  const submit: ICrudSubmit = async (close, done, type, isValid) => {
    if (isValid) {
      const res = await submitForm(type === 'add' ? 'post' : 'put')

      if (res.value) {
        showTip && appMessage('success', '提交成功！')
        listCore.loadList()
        close()
      } else if (res.value !== null) {
        showTip && appMessage('warning', '提交失败！')
      }
    }
    done()
  }

  async function deleteRow(row: Item) {
    const _row = row as Item & { id: string | number }
    deleteId.value = _row.id
    const res = await submitDelete()
    res?.value && listCore.loadList()
  }

  return {
    ...listCore,
    form,
    beforeOpen,
    submit,
    submitForm,
    deleteRow,
  }
}
