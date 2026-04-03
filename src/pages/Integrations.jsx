const integrations = [
  {name:'WhatsApp Business',desc:'Envía mensajes automáticos a prospectos. Requiere bot n8n + Meta.',icon:'💬',bg:'bg-green-50',status:'config',label:'En configuración'},
  {name:'Zadarma',desc:'Realiza y registra llamadas a prospectos. Integra el sistema telefónico con el CRM.',icon:'📞',bg:'bg-blue-50',status:'pending',label:'Pendiente'},
  {name:'Google Calendar',desc:'Sincroniza entrevistas agendadas con tu calendario de Google.',icon:'📅',bg:'bg-indigo-50',status:'pending',label:'Pendiente'},
  {name:'Email (SMTP)',desc:'Envía emails de seguimiento automáticos a prospectos que no contestan.',icon:'✉️',bg:'bg-purple-50',status:'pending',label:'Pendiente'},
  {name:'n8n / Zapier',desc:'Dispara automatizaciones cuando un prospecto cambia de estado.',icon:'⚡',bg:'bg-amber-50',status:'pending',label:'Pendiente'},
  {name:'Google Sheets',desc:'Exporta e importa prospectos desde Google Sheets.',icon:'📊',bg:'bg-emerald-50',status:'pending',label:'Pendiente'},
  {name:'Facebook / Instagram Leads',desc:'Importa leads automáticamente desde tus campañas de Ads.',icon:'📱',bg:'bg-blue-50',status:'pending',label:'Pendiente'},
]
const sc = {active:'bg-green-100 text-green-800',config:'bg-amber-100 text-amber-800',pending:'bg-gray-100 text-gray-600'}
export default function Integrations() {
  return (
    <div className="max-w-2xl">
      <div className="mb-6"><h1 className="text-lg font-semibold text-gray-900">Integraciones</h1><p className="text-sm text-gray-500 mt-0.5">Conecta el CRM con tus herramientas.</p></div>
      <div className="space-y-3">
        {integrations.map(i=>(
          <div key={i.name} className="card flex items-center gap-4">
            <div className={`w-12 h-12 ${i.bg} rounded-xl flex items-center justify-center text-2xl flex-shrink-0`}>{i.icon}</div>
            <div className="flex-1 min-w-0"><p className="font-medium text-sm text-gray-900">{i.name}</p><p className="text-xs text-gray-500 mt-0.5">{i.desc}</p></div>
            <span className={`badge flex-shrink-0 ${sc[i.status]}`}>{i.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
