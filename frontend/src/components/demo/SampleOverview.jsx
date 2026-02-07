import { useEffect, useState } from 'react';
import api from '../../utils/axiosConfig';

export default function SampleOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/admin/sample-overview');
        setData(res.data);
      } catch (e) {
        // Show clearer error including attempted URL
        const attempted = (api.defaults && api.defaults.baseURL ? api.defaults.baseURL : window.location.origin + '/api') + '/admin/sample-overview';
        const serverMsg = e?.response?.data || e?.message || JSON.stringify(e);
        setErr({ attempted, serverMsg });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div>Loading demo overview...</div>;
  if (err) return (
    <div style={{color:'red', padding:16}}>
      <h4>Failed to load demo overview</h4>
      <p><strong>Attempted URL:</strong> {err.attempted || err}</p>
      <pre style={{whiteSpace:'pre-wrap'}}>{JSON.stringify(err.serverMsg || err, null, 2)}</pre>
      <p>Make sure the backend is running and `REACT_APP_API_URL` (if set) points to the backend API.</p>
    </div>
  );

  const breakdown = data.statusBreakdown || {};
  const pending = data.pendingDoctorApplications || {};

  return (
    <div style={{padding:16}}>
      <h2>Sample Overview (Public)</h2>

      <section style={{marginTop:12}}>
        <h3>Appointment Status Breakdown</h3>
        <div style={{display:'flex', gap:12, flexWrap:'wrap'}}>
          {breakdown.byStatus && Object.entries(breakdown.byStatus).map(([status, count]) => (
            <div key={status} style={{minWidth:140, padding:12, border:'1px solid #eee', borderRadius:8}}>
              <div style={{textTransform:'capitalize', color:'#333', fontWeight:600}}>{status.replace('_',' ')}</div>
              <div style={{fontSize:22, marginTop:6}}>{count}</div>
            </div>
          ))}
        </div>

        <div style={{marginTop:12}}>
          <strong>Total appointments:</strong> {breakdown.totalAppointments || 0}
        </div>
      </section>

      <section style={{marginTop:20}}>
        <h3>Pending Doctor Applications ({pending.pendingCount || (pending.applications && pending.applications.length) || 0})</h3>

        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:12}}>
          {(pending.applications || []).map(app => (
            <div key={app._id} style={{border:'1px solid #eee', padding:12, borderRadius:8}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <div>
                  <div style={{fontWeight:700}}>{app.fullName || app.fullName || app.fullname || `${app.firstName} ${app.lastName}`}</div>
                  <div style={{fontSize:12, color:'#666'}}>{app.specialty}</div>
                </div>
                <div style={{fontSize:12, color:'#d97706', fontWeight:600}}>Pending</div>
              </div>
              <div style={{marginTop:8, fontSize:13}}>
                <div><strong>Submitted:</strong> {app.submittedAt}</div>
                <div style={{marginTop:6}}><strong>Credentials:</strong> {app.credentials && app.credentials.join(', ')}</div>
                <div style={{marginTop:6}}><strong>Contact:</strong> {app.contact?.email || app.email || '—'}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
