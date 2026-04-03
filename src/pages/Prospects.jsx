import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'
import { useAuth } from '../contexts/AuthContext'
import ProspectModal from '../components/ProspectModal'
const STATUSES = {nuevo:{label:'Nuevo',bg:'bg-blue-100',text:'text-blue-800'},contactado:{label:'Contactado',bg:'bg-purple-100',text:'text-purple-800'},entrevista:{label:'Entrevista agendada',bg:'bg-amber-100',text:'text-amber-800'},reclutado:{label:'Reclutado',bg:'bg-green-100',text:'text-green-800'},no_interesado:{label:'No interesado',bg:'bg-red-100',text:'text-red-800'},no_contesta:{label:'No contesta',bg:'bg-gray-100',text:'text-gray-700'},ghosted:{label:'Ghosted',bg:'bg-pink-100',text:'text-pink-800'},no_califica:{label:'No califica',bg:'bg-orange-100',text:'text-orange-800'}}
const FINALS = ['reclutado','no_interesado','no_califica']
function ini(n){return n.split(' ').slice(0,2).map(w=>w[0]||'').join('').toUpperCase()}
function fd(d){if(!d)return '';try{return new Date(d+'T12:00:00').toLocaleDateString('es-US',{month:'short',day:'numeric',year:'numeric'})}catch{return d}}
function fdt(d){if(!d)return '';try{return new Date(d).toLocaleString('es-US',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}catch{return d}}
export default function Prospects() {
  const {isMaster,profile} = useAuth()
  const [prospects,setProspects] = useState([])
  const [loading,setLoading] = useState(true)
  const [filter,setFilter] = useState('todos')
  const [search,setSearch] = useState('')
  const [modalOpen,setModalOpen] = useState(false)
  const [editP,setEditP] = useState(null)
  const today = new Date().toISOString().split('T')[0]
  const load = useCallback(async()=>{
    setLoading(true)
    let q = supabase.from('prospects').select(`*, assigned:profiles!prospects_assigned_to_fkey(name,role)`)
    if(!isMaster) q = q.eq('assigned_to',profile?.id)
    const {data} = await q.order('created_at',{ascending:false})
    setProspects(data||[]);setLoading(false)
  },[isMaster,profile])
  useEffect(()=>{load()},[load])
  const filtered = prospects.filter(p=>{
    const ms = filter==='todos'||p.status===filter
    const q = search.toLowerCase()
    const mq = !q||p.name.toLowerCase().includes(q)||(p.phone||'').includes(q)||(p.city||'').toLowerCase().includes(q)||(p.email||'').toLowerCase().includes(q)
    return ms&&mq
  })
  const kpis = {total:prospects.length,reclutados:prospects.filter(p=>p.status==='reclutado').length,entrevistas:prospects.filter(p=>p.status==='entrevista').length,followup:prospects.filter(p=>p.followup_date&&p.followup_date<=today&&!FINALS.includes(p.status)).length}
  return(
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[{label:'Total prospectos',val:kpis.total,color:'text-primary'},{label:'Reclutados',val:kpis.reclutados,color:'text-green-600'},{label:'Entrevistas',val:kpis.entrevistas,color:'text-amber-600'},{label:'Seguimiento pendiente',val:kpis.followup,color:'text-red-600'}].map(k=>(
          <div key={k.label} className="card"><p className="text-xs text-gray-500 mb-1">{k.label}</p><p className={`text-3xl font-bold ${k.color}`}>{k.val}</p></div>
        ))}
      </div>
      {kpis.followup>0&&<div className="bg-amber-50 border-l-4 border-amber-400 px-4 py-3 rounded-r-lg mb-4 text-sm text-amber-800">⚠️ {kpis.followup} prospecto{kpis.followup>1?'s':''} requiere{kpis.followup===1?'':'n'} seguimiento hoy o con fecha vencida.</div>}
      <div className="flex flex-wrap gap-2 items-center mb-4">
        <input className="input max-w-xs text-sm" placeholder="Buscar nombre, teléfono, ciudad..." value={search} onChange={e=>setSearch(e.target.value)}/>
        <div className="flex flex-wrap gap-1.5">
          {['todos',...Object.keys(STATUSES)].map(s=>(
            <button key={s} onClick={()=>setFilter(s)} className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${filter===s?'bg-primary text-white border-primary':'bg-white text-gray-600 border-gray-300'}`}>{s==='todos'?'Todos':STATUSES[s].label}</button>
          ))}
        </div>
        <button onClick={()=>{setEditP(null);setModalOpen(true)}} className="btn btn-primary ml-auto">+ Nuevo prospecto</button>
      </div>
      {loading?<div className="text-center py-12 text-gray-500 text-sm">Cargando...</div>:filtered.length===0?<div className="text-center py-12 text-gray-400 text-sm">No hay prospectos que mostrar.</div>:(
        <div className="space-y-2">
          {filtered.map(p=>{
            const s=STATUSES[p.status]||STATUSES.nuevo
            const ov=p.followup_date&&p.followup_date<=today&&!FINALS.includes(p.status)
            const colors=['bg-blue-100 text-blue-800','bg-purple-100 text-purple-800','bg-green-100 text-green-800','bg-amber-100 text-amber-800','bg-teal-100 text-teal-800']
            const ci=p.name.split('').reduce((a,c)=>a+c.charCodeAt(0),0)%5
            return(
              <div key={p.id} onClick={()=>{setEditP(p);setModalOpen(true)}} className="card hover:border-primary/30 cursor-pointer transition-all">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${colors[ci]}`}>{ini(p.name)}</div>
                  <div className="flex-1 min-w-0"><p className="font-medium text-sm text-gray-900 truncate">{p.name}</p><p className="text-xs text-gray-500 mt-0.5">{p.phone}{p.city?` · ${p.city}":''}</p></div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <span className={`badge ${s.bg} ${s.text}`}>{s.label}</span>
                    <span className="text-xs text-gray-400">{fd(p.created_at?.split('T')[0])}</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-3">
                  {p.source&&<span className="text-xs text-gray-500">Fuente: <strong className="text-gray-700">{p.source}</strong></span>}
                  {p.assigned?.name&&<span className="text-xs text-gray-500">Asignado: <strong className="text-gray-700">{p.assigned.name}</strong></span>}
                  {p.interview_date&&<span className="text-xs text-gray-500">Entrevista: <strong className="text-gray-700">{fdt(p.interview_date)}</strong></span>}
                  {p.followup_date&&<span className={`text-xs ${ov?'text-red-600 font-semibold':'text-gray-500'}`}>{ov?'⚠ ':''}Seguimiento: <strong>{fd(p.followup_date)}</strong></span>}
                  {p.notes&&<span className="text-xs text-gray-500 flex-1 min-w-full">Nota: <strong className="text-gray-700">{p.notes.substring(0,100)}{p.notes.length>100?'...':''}</strong></span>}
                </div>
              </div>
            )
          })}
        </div>
      )}
      {modalOpen&&<ProspectModal prospect={editP} onClose={()=>setModalOpen(false)} onSaved={()=>{setModalOpen(false);load()}}/>}
    </div>
  )
}
