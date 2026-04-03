import { useState, useRef } from 'react'
import * as XLSX from 'xlsx'
import { supabase } from '../supabase'
import { useAuth } from '../contexts/AuthContext'
const FIELDS = [{k:'name',l:'Nombre *',req:true},{k:'phone',l:'Teléfono *',req:true},{k:'email',l:'Email'},{k:'city',l:'Ciudad / Estado'},{k:'source',l:'Fuente'}]
export default function Import() {
  const {profile} = useAuth()
  const fileRef = useRef()
  const [headers,setHeaders] = useState([])
  const [rows,setRows] = useState([])
  const [fileName,setFileName] = useState('')
  const [mapping,setMapping] = useState({})
  const [dragOver,setDragOver] = useState(false)
  const [importing,setImporting] = useState(false)
  const [progress,setProgress] = useState(0)
  const [result,setResult] = useState(null)
  function processFile(file){
    const reader = new FileReader()
    reader.onload = e=>{
      try{
        const wb=XLSX.read(new Uint8Array(e.target.result),{type:'array'})
        const ws=wb.Sheets[wb.SheetNames[0]]
        const data=XLSX.utils.sheet_to_json(ws,{header:1,defval:''})
        if(!data||data.length<2){alert('El archivo está vacío.');return}
        const hdrs=data[0].map(String)
        const rws=data.slice(1).filter(r=>r.some(c=>String(c).trim()!==''))
        setHeaders(hdrs);setRows(rws);setFileName(file.name);autoMap(hdrs);setResult(null)
      }catch{alert('Error al leer el archivo.')}
    }
    reader.readAsArrayBuffer(file)
  }
  function autoMap(hdrs){
    const m={}
    FIELDS.forEach(f=>{
      const match=hdrs.find(h=>{
        const hl=h.toLowerCase()
        return f.k==='name'?(hl.includes('nombre')||hl.includes('name')):f.k==='phone'?(hl.includes('tel')||hl.includes('phone')||hl.includes('cel')):f.k==='email'?hl.includes('email')||hl.includes('correo'):f.k==='city'?(hl.includes('ciudad')||hl.includes('city')):f.k==='source'?(hl.includes('fuente')||hl.includes('source')):false
      })
      if(match)m[f.k]=match
    })
    setMapping(m)
  }
  function getVal(row,col){if(!col)return '';const i=headers.indexOf(col);return i>=0?String(row[i]||'').trim():''}
  async function runImport(){
    if(!mapping.name){alert('Debes mapear la columna Nombre.');return}
    if(!mapping.phone){alert('Debes mapear la columna Teléfono.');return}
    setImporting(true);setProgress(0)
    let added=0,skipped=0
    const toInsert=[]
    for(let i=0;i<rows.length;i++){
      const row=rows[i];const name=getVal(row,mapping.name);const phone=getVal(row,mapping.phone)
      if(!name){skipped++;continue}
      toInsert.push({name,phone,email:getVal(row,mapping.email)||null,city:getVal(row,mapping.city)||null,source:getVal(row,mapping.source)||'Excel',status:'nuevo',created_by:profile?.id,assigned_to:profile?.id})
      setProgress(Math.round(((i+1)/rows.length)*50))
    }
    const BATCH=20
    for(let i=0;i<toInsert.length;i+=BATCH){
      const batch=toInsert.slice(i,i+BATCH)
      const{error}=await supabase.from('prospects').insert(batch)
      if(!error)added+=batch.length;else skipped+=batch.length
      setProgress(50+Math.round(((i+BATCH)/toInsert.length)*50))
    }
    setImporting(false);setProgress(100);setResult({added,skipped})
    setRows([]);setHeaders([]);setFileName('');setMapping({})
  }
  function cancel(){setRows([]);setHeaders([]);setFileName('');setMapping({});setResult(null)}
  return(
    <div className="max-w-2xl">
      <div className="mb-6"><h1 className="text-lg font-semibold text-gray-900">Importar prospectos desde Excel</h1><p className="text-sm text-gray-500 mt-0.5">Sube tu archivo .xlsx o .csv, mapea las columnas y el CRM importa todo automáticamente.</p></div>
      {result&&<div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-sm text-green-800">✅ Importación completada: <strong>{result.added} prospectos agregados</strong>{result.skipped>0?` · ${result.skipped} omitidos":''}<button onClick={()=>setResult(null)} className="ml-3 text-green-600 hover:underline text-xs">Importar otro archivo</button></div>}
      {!headers.length?(
        <>
          <div className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors mb-6 ${dragOver?'border-primary bg-primary-light/20':'border-gray-300 hover:border-gray-400'}`} onClick={()=>fileRef.current?.click()} onDragOver={e=>{e.preventDefault();setDragOver(true)}} onDragLeave={()=>setDragOver(false)} onDrop={e=>{e.preventDefault();setDragOver(false);const f=e.dataTransfer.files[0];if(f)processFile(f)}}>
            <div className="text-4xl mb-3">📄</div>
            <p className="text-sm font-medium text-gray-700">Arrastra tu archivo aquí o haz clic para seleccionar</p>
            <p className="text-xs text-gray-400 mt-1">Soporta .xlsx · .xls · .csv</p>
          </div>
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={e=>{const f=e.target.files[0];if(f)processFile(f)}}/>
          <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600"><p className="font-medium mb-2">Columnas recomendadas:</p><div className="flex flex-wrap gap-2">{['Nombre','Teléfono','Email','Ciudad','Fuente'].map(c=><span key={c} className="badge bg-gray-200 text-gray-700">{c}</span>)}</div></div>
        </>
      ):(
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">📄 {fileName} · <strong>{rows.length}</strong> filas encontradas</p>
          <div className="overflow-x-auto border border-gray-200 rounded-xl mb-5"><table className="text-xs w-full"><thead><tr>{headers.map(h=><th key={h} className="bg-gray-50 px-3 py-2 text-left font-medium text-gray-600 border-b border-gray-200 whitespace-nowrap">{h}</th>)}</tr></thead><tbody>{rows.slice(0,5).map((row,i)=><tr key={i} className="border-b border-gray-100 last:border-0">{headers.map((_,j)=><td key={j} className="px-3 py-2 text-gray-700 whitespace-nowrap">{row[j]||''}</td>)}</tr>)}</tbody></table></div>
          <p className="text-sm font-medium text-gray-700 mb-2">Mapear columnas al CRM:</p>
          <div className="grid grid-cols-2 gap-3 mb-5">
            {FIELDS.map(f=>(
              <div key={f.k} className="flex items-center gap-2">
                <label className="text-xs text-gray-600 min-w-[90px]">{f.l}</label>
                <select className="input text-xs flex-1" value={mapping[f.k]||''} onChange={e=>setMapping(m=>({...m,[f.k]:e.target.value}))}>
                  <option value="">(no importar)</option>{headers.map(h=><option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            ))}
          </div>
          {importing&&<div className="mb-4"><div className="bg-gray-200 rounded-full h-2 mb-1"><div className="bg-primary h-2 rounded-full transition-all" style={{width:`${progress}%`}}/></div><p className="text-xs text-gray-500">Importando... {progress}%</p></div>}
          <div className="flex gap-2">
            <button onClick={runImport} disabled={importing} className="btn btn-primary">{importing?'Importando...':`Importar ${rows.length} prospectos`}</button>
            <button onClick={cancel} disabled={importing} className="btn btn-secondary">Cancelar</button>
          </div>
        </div>
      )}
    </div>
  )
}
