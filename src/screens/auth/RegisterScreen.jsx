import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DataService     from '../../services/DataService.js';
import { useAuth }     from '../../contexts/AuthContext.jsx';
import { uid }         from '../../utils/helpers.js';

const ROLES  = [
  { id: 'standard',  label: 'Standard Patient',  desc: 'Full features, medicine management' },
  { id: 'senior',    label: 'Senior Citizen',    desc: 'Large text, voice assistant, simple UI' },
  { id: 'caregiver', label: 'Caregiver / Nurse', desc: 'Monitor multiple patients' },
  { id: 'selfcare',  label: 'Self-Care',         desc: 'Living alone — Mindie as companion' },
];
const CAREGIVER_TYPES = [
  { id: 'family', label: 'Family Member' }, { id: 'friend', label: 'Friend' },
  { id: 'home_nurse', label: 'Home Nurse' }, { id: 'nurse', label: 'Hospital Nurse' },
  { id: 'doctor', label: 'Doctor' },
];
const LOCK_TYPES = [
  { id: 'none', label: 'No lock' }, { id: 'pin', label: 'PIN' }, { id: 'pattern', label: 'Pattern' },
];

export default function RegisterScreen() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    role: 'standard', name: '', language: 'en',
    hardwareMode: 'software', caregiverType: 'family',
    lockType: 'pin',
  });
  const [pinEntry, setPinEntry] = useState('');
  const [err, setErr] = useState('');
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const STEPS = [
    <div key="0">
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>Choose your mode</p>
      {ROLES.map(r => (
        <button key={r.id} onClick={() => set('role', r.id)} style={{
          width: '100%', textAlign: 'left', background: form.role === r.id ? 'var(--blue-l)' : 'var(--gray)',
          border: `1.5px solid ${form.role === r.id ? 'var(--blue)' : 'var(--border)'}`,
          borderRadius: 12, padding: '11px 14px', cursor: 'pointer', fontFamily: 'var(--font)', marginBottom: 8,
        }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: form.role === r.id ? 'var(--blue)' : 'var(--text)' }}>{r.label}</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{r.desc}</p>
        </button>
      ))}
    </div>,

    <div key="1">
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 10 }}>Your details</p>
      <input className="input input-lg" placeholder="Full name"
        value={form.name} onChange={e => set('name', e.target.value)} style={{ marginBottom: 12 }} />
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {['en','ml'].map(l => (
          <button key={l} onClick={() => set('language', l)} style={{
            flex:1, padding:'10px 0', border:'none', borderRadius:10,
            background: form.language===l ? 'var(--blue)':'var(--gray)',
            color: form.language===l ? '#fff':'var(--text)',
            fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'var(--font)',
          }}>{l === 'en' ? 'English' : 'Malayalam'}</button>
        ))}
      </div>
      {form.role === 'caregiver' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
          {CAREGIVER_TYPES.map(t => (
            <button key={t.id} onClick={() => set('caregiverType', t.id)} style={{
              padding:'9px 0', border:'none', borderRadius:9,
              background: form.caregiverType===t.id ? 'var(--blue)':'var(--gray)',
              color: form.caregiverType===t.id ? '#fff':'var(--text)',
              fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'var(--font)',
            }}>{t.label}</button>
          ))}
        </div>
      )}
    </div>,

    <div key="2">
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 10 }}>App setup</p>
      {[{id:'software',label:'Software only',desc:'App on phone only — no hardware device needed.'},
        {id:'hardware',label:'Hardware dispenser',desc:'Connect to a smart pill dispenser.'}].map(m => (
        <button key={m.id} onClick={() => set('hardwareMode', m.id)} style={{
          width:'100%', textAlign:'left',
          background: form.hardwareMode===m.id ? 'var(--blue-l)':'var(--gray)',
          border:`1.5px solid ${form.hardwareMode===m.id ? 'var(--blue)':'var(--border)'}`,
          borderRadius:12, padding:'11px 14px', cursor:'pointer', fontFamily:'var(--font)', marginBottom:8,
        }}>
          <p style={{fontSize:14,fontWeight:700,color:form.hardwareMode===m.id?'var(--blue)':'var(--text)'}}>{m.label}</p>
          <p style={{fontSize:12,color:'var(--muted)',marginTop:2}}>{m.desc}</p>
        </button>
      ))}
    </div>,

    <div key="3">
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 10 }}>Set a lock (optional)</p>
      {LOCK_TYPES.map(l => (
        <button key={l.id} onClick={() => set('lockType', l.id)} style={{
          width:'100%', textAlign:'left',
          background: form.lockType===l.id ? 'var(--blue-l)':'var(--gray)',
          border:`1.5px solid ${form.lockType===l.id ? 'var(--blue)':'var(--border)'}`,
          borderRadius:10, padding:'11px 14px', cursor:'pointer', fontFamily:'var(--font)', marginBottom:8,
        }}>
          <p style={{fontSize:13,fontWeight:600,color:form.lockType===l.id?'var(--blue)':'var(--text)'}}>{l.label}</p>
        </button>
      ))}
      {form.lockType === 'pin' && (
        <div>
          <p style={{fontSize:12,color:'var(--muted)',marginBottom:8}}>Enter a 4-digit PIN</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
            {[1,2,3,4,5,6,7,8,9,null,0,'⌫'].map((k,i) => {
              if(k===null) return <div key={i}/>;
              const isBack = k==='⌫';
              return (
                <button key={i}
                  onClick={() => isBack ? setPinEntry(p=>p.slice(0,-1)) : (pinEntry.length<4 && setPinEntry(p=>p+k))}
                  style={{background:'var(--gray)',border:'none',borderRadius:10,padding:'12px 0',
                    fontSize:18,fontWeight:700,color:isBack?'var(--red)':'var(--text)',
                    cursor:'pointer',fontFamily:'var(--font)'}}>
                  {k}
                </button>
              );
            })}
          </div>
          <div style={{display:'flex',justifyContent:'center',gap:10,marginTop:10}}>
            {[0,1,2,3].map(i=>(
              <div key={i} style={{width:12,height:12,borderRadius:'50%',
                background:i<pinEntry.length?'var(--blue)':'var(--border)'}}/>
            ))}
          </div>
        </div>
      )}
      {err && <p style={{color:'var(--red)',fontSize:12,marginTop:8}}>{err}</p>}
    </div>,
  ];

  const canNext = [!!form.role, form.name.trim().length>=2, !!form.hardwareMode,
    form.lockType==='none' || (form.lockType==='pin' && pinEntry.length===4) || form.lockType==='pattern'];

  const handleFinish = () => {
    if (!canNext[3]) { setErr('Please complete the lock setup.'); return; }
    const finalPin = form.lockType==='pin' ? pinEntry : (Math.floor(1000+Math.random()*9000)+'');
    const newUser = { id:uid(), name:form.name.trim(), pin:finalPin,
      role:form.role==='selfcare'?'standard':form.role, isSelfCare:form.role==='selfcare',
      language:form.language,
      medicineReminders: true,
      missedDoseAlerts: true,
      refillReminders: false,
      mode: form.role === 'selfcare' ? 'selfcare' : form.role,
      hardwareMode:form.hardwareMode,
      hardwareEnabled: form.hardwareMode === 'hardware',
      caregiverType:form.caregiverType, lockType:form.lockType, linkedPatients:[] };
    DataService.saveUser(newUser);
    const result = login(finalPin);
    if(result.success) {
      const dest = newUser.role==='senior'?'/senior':newUser.role==='caregiver'?'/caregiver':'/standard';
      navigate(dest, {replace:true});
    }
  };

  return (
    <div style={{minHeight:'100vh',background:'var(--navy)',display:'flex',flexDirection:'column'}}>
      <div style={{padding:'20px 20px 14px',color:'#fff'}}>
        <p style={{fontSize:20,fontWeight:700,marginBottom:12}}>Create account</p>
        <div style={{display:'flex',gap:5}}>
          {['Role','Details','Setup','Security'].map((s,i)=>(
            <div key={s} style={{flex:1}}>
              <div style={{height:3,borderRadius:2,background:i<=step?'var(--blue)':'rgba(255,255,255,.2)',transition:'background .3s'}}/>
              <p style={{fontSize:9,color:i<=step?'rgba(255,255,255,.7)':'rgba(255,255,255,.25)',marginTop:4,textAlign:'center'}}>{s}</p>
            </div>
          ))}
        </div>
      </div>
      <div style={{flex:1,background:'#fff',borderRadius:'24px 24px 0 0',padding:'24px 20px 0',overflow:'auto'}}>
        {STEPS[step]}
      </div>
      <div style={{background:'#fff',padding:'12px 20px 24px',display:'flex',gap:10}}>
        {step>0
          ? <button onClick={()=>setStep(s=>s-1)} className="btn btn-ghost btn-lg" style={{flex:1}}>Back</button>
          : <button onClick={()=>navigate('/login')} className="btn btn-ghost btn-lg" style={{flex:1}}>Sign in</button>
        }
        {step<3
          ? <button onClick={()=>{setErr('');setStep(s=>s+1);}} disabled={!canNext[step]}
              className="btn btn-navy btn-lg" style={{flex:1,opacity:canNext[step]?1:.5}}>Continue</button>
          : <button onClick={handleFinish} className="btn btn-green btn-lg" style={{flex:1}}>Create account</button>
        }
      </div>
    </div>
  );
}
