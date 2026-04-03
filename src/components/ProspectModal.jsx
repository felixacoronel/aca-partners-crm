import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useAuth } from '../contexts/AuthContext'
const STATUSES = ['nuevo','contactado','entrevista','reclutado','no_interesado','no_contesta','ghosted','no_califica']
const SL = {nuevo:'Nuevo',contactado:'Contactado',entrevista:'Entrevista agendada',reclutado:'Reclutado',no_interesado:'No interesado',no_contesta:'No contesta',ghosted:'Ghosted',no_califica:'No califica'}
const SOURCES = ['Facebook','Instagram','Referido','LinkedIn','WhatsApp','Zadarma','Evento','Otro']
export default function ProspectModal({ prospect, onClose, onSaved }) {
  const { profile, isMaster } = useAuth()
  const [users, setUsers] = useState([])
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({name:'',phone:'',email:'',city:'',source:'Facebook',assigned_to:'',status:'nuevo',interview_date:'',followup_date:'',notes:''})
  useEffect(() => {
    supabase.from('profiles').select('id,name,role').eq('active',true).order('name').then(({data})=>setUsers(data||[]))
    if (prospect) setForm({name:prospect.name||'',phone:prospect.phone||'',email:prospect.email||'',city:prospect.city||'',source:prospect.source||'Facebook',assigned_to:prospect.assigned_to||'',status:prospect.status||'nuevo',interview_date:prospect.interview_date?prospect.interview_date.slice(0,16):'',followup_date:prospect.followup_date||'',notes:prospect.notes||''})
    else setForm(f=>({...f,assigned_to:profile?.id||''}))
  },[prospect])
  function set(k,v){setForm(f=>({...f,[k]:v}))}
  async function handleSave(){
    if(!form.name.trim()){alert('El nombre es requerido.');return}
    if(!form.phone.trim()){alert('El teléfono es requerido.');return}
    setSaving(true)
    const data={name:form.name.trim(),phone:form.phone.trim(),email:form.email.trim()||null,city:form.city.trim()||null,source:form.source,assigned_to:form.assigned_to||null,status:form.status,interview_date:form.interview_date||null,followup_date:form.followup_date||null,notes:form.notes.trim()||null,updated_at:new Date().toISOString()}
    if(prospect) await supabase.from('prospects').update(data).eq('id',prospect.id)
    else await supabase.from('prospects').insert({...data,created_by:profile?.id})
    setSaving(false);onSaved()
  }
  async function handleDelete(){if(!confirm('Eliminar?'))return;await supabase.from('prospects').delete().eq('id',prospect.id);onSaved()}
  return(
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">{prospect?'Editar prospecto':'Nuevo prospecto'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Nombre *</label><input className="input" value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Juan García"/></div>
            <div><label className="label">Teléfono *</label><input className="input" value={form.phone} onChange={e=>set('phone',e.target.value)} placeholder="+1 (305) 000-0000"/></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Email</label><input className="input" type="email" value={form.email} onChange={e=>set('email',e.target.value)}/></div>
            <div><label className="label">Ciudad</label><input className="input" value={form.city} onChange={e=>set('city',e.target.value)} placeholder="Houston, TX"/></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Fuente</label><select className="input" value={form.source} onChange={e=>set('source',e.target.value)}>{SOURCES.map(s=><option key={s}>{s}</option>)}</select></div>
            <div><label className="label">Asignado a</label><select className="input" value={form.assigned_to} onChange={e=>set('assigned_to',e.target.value)} disabled={!isMaster}><option value="">Sin asignar</option>{users.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}</select></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Estado</label><select className="input" value={form.status} onChange={e=>set('status',e.target.value)}>{STATUSES.map(s=><option key={s} value={s}>{SL[s]}</option>)}</select></div>
            {form.status==='entrevista'&&<div><label className="label">Fecha entrevista</label><input className="input" type="datetime-local" value={form.interview_date} onChange={e=>set('interview_date',e.target.value)}/></div>}
          </div>
          <div><label className="label">Seguimiento</label><input className="input" type="date" value={form.followup_date} onChange={e=>set('followup_date',e.target.value)}/></div>
          <div><label className="label">Notas</label><textarea className="input resize-none" rows={3} value={form.notes} onChange={e=>set('notes',e.target.value)} placeholder="Experiencia, disponibilidad..."/></div>
        </div>
        <div className="flex justify-between items-center px-5 py-4 border-t border-gray-100">
          {prospect&&isMaster?<button onClick={handleDelete} className="btn btn-danger text-xs">Eliminar</button>:<div/>}
          <div className="flex gap-2">
            <button onClick={onClose} className="btn btn-secondary">Cancelar</button>
            <button onClick={handleSave} disabled={saving} className="btn btn-primary">{saving?'Guardando...':'Guardar'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
