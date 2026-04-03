import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useAuth } from '../contexts/AuthContext'
function ini(n){return n.split(' ').slice(0,2).map(w=>w[0]||'').join('').toUpperCase()}
export default function Users() {
  const {profile:me} = useAuth()
  const [users,setUsers] = useState([])
  const [loading,setLoading] = useState(true)
  const [modal,setModal] = useState(false)
  const [editUser,setEditUser] = useState(null)
  const [form,setForm] = useState({name:'',email:'',phone:'',role:'setter',notes:'',password:''})
  const [saving,setSaving] = useState(false)
  useEffect(()=>{loadUsers()},[])
  async function loadUsers(){setLoading(true);const{data}=await supabase.from('profiles').select('*').order('created_at');setUsers(data||[]);setLoading(false)}
  function openNew(){setEditUser(null);setForm({name:'',email:'',phone:'',role:'setter',notes:'',password:''});setModal(true)}
  function openEdit(u){setEditUser(u);setForm({name:u.name,email:u.email||'',phone:u.phone||'',role:u.role,notes:u.notes||'',password:''});setModal(true)}
  function set(k,v){setForm(f=>({...f,[k]:v}))}
  async function handleSave(){
    if(!form.name.trim()){alert('El nombre es requerido.');return}
    setSaving(true)
    if(!editUser){
      if(!form.email.trim()){alert('El email es requerido.');setSaving(false);return}
      if(form.password.length<6){alert('La contraseña debe tener al menos 6 caracteres.');setSaving(false);return}
      const{data,error}=await supabase.auth.signUp({email:form.email.trim(),password:form.password,options:{data:{name:form.name.trim(),role:form.role}}})
      if(error){alert('Error: '+error.message);setSaving(false);return}
      if(data?.user) await supabase.from('profiles').upsert({id:data.user.id,name:form.name.trim(),email:form.email.trim(),phone:form.phone.trim()||null,role:form.role,notes:form.notes.trim()||null,active:true})
    } else {
      await supabase.from('profiles').update({name:form.name.trim(),phone:form.phone.trim()||null,role:form.role,notes:form.notes.trim()||null}).eq('id',editUser.id)
    }
    setSaving(false);setModal(false);loadUsers()
  }
  async function toggleActive(u){
    if(u.id===me?.id){alert('No puedes desactivarte a ti mismo.');return}
    const masters=users.filter(x=>x.role==='master'&&x.active)
    if(u.role==='master'&&u.active&&masters.length<=1){alert('Debe haber al menos un Master activo.');return}
    await supabase.from('profiles').update({active:!u.active}).eq('id',u.id);loadUsers()
  }
  const rc = r=>r==='master'?'bg-blue-100 text-blue-800':'bg-purple-100 text-purple-800'
  const rl = r=>r==='master'?'⭐ Master':'👤 Appointment Setter'
  return(
    <div>
      <div className="flex items-start justify-between mb-6">
        <div><h1 className="text-lg font-semibold text-gray-900">Gestión de usuarios</h1><p className="text-sm text-gray-500 mt-0.5">Crea y administra el equipo de reclutamiento.</p></div>
        <button onClick={openNew} className="btn btn-primary">+ Agregar usuario</button>
      </div>
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-5 text-sm text-blue-700"><strong>Roles:</strong> Los <strong>Masters</strong> tienen acceso total. Los <strong>Appointment Setters</strong> solo ven los prospectos asignados a ellos.</div>
      {loading?<div className="text-center py-12 text-gray-400 text-sm">Cargando...</div>:(
        <div className="space-y-3">
          {users.map(u=>(
            <div key={u.id} className={`card flex items-center gap-4 ${!u.active?'opacity-60':''}`}>
              <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${rc(u.role)}`}>{ini(u.name)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-sm text-gray-900">{u.name}</p>
                  {u.id===me?.id&&<span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Tú</span>}
                  {!u.active&&<span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Inactivo</span>}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{u.email}{u.phone?` · ${u.phone}":''}</p>
                {u.notes&&<p className="text-xs text-gray-400 mt-0.5 italic">{u.notes}</p>}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                <span className={`badge ${rc(u.role)}`}>{rl(u.role)}</span>
                <button onClick={()=>openEdit(u)} className="btn btn-secondary text-xs py-1 px-3">Editar</button>
                {u.id!==me?.id&&<button onClick={()=>toggleActive(u)} className="btn btn-secondary text-xs py-1 px-3">{u.active?'Desactivar':'Activar'}</button>}
              </div>
            </div>
          ))}
        </div>
      )}
      {modal&&(
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={e=>e.target===e.currentTarget&&setModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100"><h2 className="font-semibold text-gray-900">{editUser?'Editar usuario':'Crear nuevo usuario'}</h2><button onClick={()=>setModal(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button></div>
            <div className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Nombre *</label><input className="input" value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Ana Martínez"/></div>
                <div><label className="label">Teléfono</label><input className="input" value={form.phone} onChange={e=>set('phone',e.target.value)} placeholder="+1 305 000 0000"/></div>
              </div>
              {!editUser&&<div className="grid grid-cols-2 gap-3">
                <div><label className="label">Email *</label><input className="input" type="email" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="ana@acapartners.org"/></div>
                <div><label className="label">Contraseña *</label><input className="input" type="password" value={form.password} onChange={e=>set('password',e.target.value)} placeholder="mín. 6 caracteres"/></div>
              </div>}
              <div><label className="label">Rol *</label><select className="input" value={form.role} onChange={e=>set('role',e.target.value)}><option value="master">⭐ Master — acceso total</option><option value="setter">👤 Appointment Setter</option></select></div>
              <div><label className="label">Notas</label><textarea className="input resize-none" rows={2} value={form.notes} onChange={e=>set('notes',e.target.value)} placeholder="Zona, horario, observaciones..."/></div>
              {!editUser&&<div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-xs text-amber-700">El usuario podrá iniciar sesión con estas credenciales desde cualquier dispositivo.</div>}
            </div>
            <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-100">
              <button onClick={()=>setModal(false)} className="btn btn-secondary">Cancelar</button>
              <button onClick={handleSave} disabled={saving} className="btn btn-primary">{saving?'Guardando...':editUser?'Guardar cambios':'Crear usuario'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
