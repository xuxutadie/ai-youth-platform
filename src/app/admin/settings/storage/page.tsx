"use client"
import { useEffect, useState } from 'react'
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api'

type Partition = {
  device: string
  mountpoint: string
  fstype: string
  sizeGB: number
  usedGB: number
  availGB: number
}

type ConfigRow = {
  id: string
  path: string
  maxGB: number
  priority: number
  enabled: boolean
  stats?: { maxGB: number; usedGB: number; availGB: number; usagePercent: number }
}

export default function Page() {
  const [parts, setParts] = useState<Partition[]>([])
  const [configs, setConfigs] = useState<ConfigRow[]>([])
  const [form, setForm] = useState<ConfigRow>({ id: '', path: '', maxGB: 10, priority: 1, enabled: true })
  const [msg, setMsg] = useState('')

  const loadAll = async () => {
    const p = await apiGet('/api/admin/storage/partitions').then(r => r.json())
    setParts(p.partitions || [])
    const c = await apiGet('/api/admin/storage/configs').then(r => r.json())
    setConfigs(c.configs || [])
  }

  useEffect(() => { loadAll() }, [])

  const add = async () => {
    if (!form.id || !form.path) { setMsg('请填写存储ID与存储路径'); return }
    const resp = await apiPost('/api/admin/storage/configs', form).then(r => r.json())
    setMsg(resp.message || resp.error || '')
    await loadAll()
  }

  const fillFromPart = (p: Partition) => {
    const id = p.mountpoint.replace(/[\/]+/g, '_').replace(/^_+|_+$/g, '')
    const path = `${p.mountpoint}/upload`
    setForm({ id, path, maxGB: p.sizeGB, priority: 2, enabled: true })
  }

  const update = async (row: ConfigRow, patch: Partial<ConfigRow>) => {
    const next = { ...row, ...patch }
    await apiPut('/api/admin/storage/configs', next)
    await loadAll()
  }

  const edit = async (row: ConfigRow) => {
    const newMax = prompt('设置最大容量(GB)，留空不变', String(row.maxGB))
    const newPri = prompt('设置优先级，留空不变', String(row.priority))
    const patch: Partial<ConfigRow> = {}
    if (newMax !== null && newMax.trim() !== '') patch.maxGB = Number(newMax)
    if (newPri !== null && newPri.trim() !== '') patch.priority = Number(newPri)
    if (Object.keys(patch).length) await update(row, patch)
  }

  const remove = async (id: string) => {
    await apiDelete(`/api/admin/storage/configs?id=${encodeURIComponent(id)}`)
    await loadAll()
  }

  return (
    <div className="p-6 space-y-6 bg-white text-black dark:bg-white dark:text-black" style={{ backgroundColor: '#fff', color: '#000' }}>
      <h1 className="text-2xl font-bold">存储管理</h1>

      <section className="rounded border p-4 bg-white text-black dark:bg-white dark:text-black" style={{ backgroundColor: '#fff', color: '#000' }}>
        <h2 className="font-semibold mb-2">系统分区（自动探测，已排除 EFI/临时分区）</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm bg-white text-black dark:bg-white dark:text-black" style={{ backgroundColor: '#fff', color: '#000' }}>
            <thead>
              <tr className="text-left">
                <th className="p-2">设备</th>
                <th className="p-2">挂载点</th>
                <th className="p-2">文件系统</th>
                <th className="p-2">总容量</th>
                <th className="p-2">已使用</th>
                <th className="p-2">可用</th>
                <th className="p-2">操作</th>
              </tr>
            </thead>
            <tbody>
              {parts.map(p => (
                <tr key={p.device} className="border-t bg-white text-black" style={{ backgroundColor: '#fff', color: '#000' }}>
                  <td className="p-2">{p.device}</td>
                  <td className="p-2">{p.mountpoint}</td>
                  <td className="p-2">{p.fstype}</td>
                  <td className="p-2">{p.sizeGB} GB</td>
                  <td className="p-2">{p.usedGB} GB</td>
                  <td className="p-2">{p.availGB} GB</td>
                  <td className="p-2"><button className="bg-green-600 text-white px-3 py-1 rounded" onClick={() => fillFromPart(p)}>添加为存储</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded border p-4 space-y-3 bg-white text-black dark:bg-white dark:text-black" style={{ backgroundColor: '#fff', color: '#000' }}>
        <h2 className="font-semibold">添加存储配置</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          <input className="border p-2 bg-white text-black placeholder-black dark:bg-white dark:text-black" style={{ backgroundColor: '#fff', color: '#000' }} placeholder="存储ID" value={form.id} onChange={e => setForm({ ...form, id: e.target.value })} />
          <input className="border p-2 bg-white text-black placeholder-black dark:bg-white dark:text-black" style={{ backgroundColor: '#fff', color: '#000' }} placeholder="存储路径" value={form.path} onChange={e => setForm({ ...form, path: e.target.value })} />
          <input className="border p-2 bg-white text-black placeholder-black dark:bg-white dark:text-black" style={{ backgroundColor: '#fff', color: '#000' }} type="number" placeholder="最大容量(GB)" value={form.maxGB} onChange={e => setForm({ ...form, maxGB: Number(e.target.value) })} />
          <input className="border p-2 bg-white text-black placeholder-black dark:bg-white dark:text-black" style={{ backgroundColor: '#fff', color: '#000' }} type="number" placeholder="优先级" value={form.priority} onChange={e => setForm({ ...form, priority: Number(e.target.value) })} />
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.enabled} onChange={e => setForm({ ...form, enabled: e.target.checked })} />启用</label>
        </div>
        <div className="flex items-center gap-2"><button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={add}>添加</button><span className="text-gray-600">{msg}</span></div>
      </section>

      <section className="rounded border p-4 bg-white text-black dark:bg-white dark:text-black" style={{ backgroundColor: '#fff', color: '#000' }}>
        <h2 className="font-semibold mb-2">存储配置列表</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm bg-white text-black dark:bg-white dark:text-black" style={{ backgroundColor: '#fff', color: '#000' }}>
            <thead>
              <tr className="text-left">
                <th className="p-2">ID</th>
                <th className="p-2">路径</th>
                <th className="p-2">最大容量</th>
                <th className="p-2">已使用</th>
                <th className="p-2">可用</th>
                <th className="p-2">使用率</th>
                <th className="p-2">优先级</th>
                <th className="p-2">状态</th>
                <th className="p-2">操作</th>
              </tr>
            </thead>
            <tbody>
              {configs.map(c => (
                <tr key={c.id} className="border-t bg-white text-black" style={{ backgroundColor: '#fff', color: '#000' }}>
                  <td className="p-2">{c.id}</td>
                  <td className="p-2">{(c as any).absPath || c.path}</td>
                  <td className="p-2">{c.stats?.maxGB ?? c.maxGB} GB</td>
                  <td className="p-2">{c.stats?.usedGB ?? 0} GB</td>
                  <td className="p-2">{c.stats?.availGB ?? 0} GB</td>
                  <td className="p-2">{c.stats?.usagePercent ?? 0}%</td>
                  <td className="p-2">{c.priority}</td>
                  <td className="p-2">{c.enabled ? '启用' : '禁用'}</td>
                  <td className="p-2 space-x-2">
                    <button className="bg-gray-600 text-white px-3 py-1 rounded" onClick={() => edit(c)}>编辑</button>
                    <button className="bg-indigo-600 text-white px-3 py-1 rounded" onClick={() => update(c, { enabled: !c.enabled })}>{c.enabled ? '禁用' : '启用'}</button>
                    <button className="bg-red-600 text-white px-3 py-1 rounded" onClick={() => remove(c.id)}>删除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}