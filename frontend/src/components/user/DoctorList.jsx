import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/axiosConfig';
import './DoctorList.css';

const DoctorList = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [specializationsList, setSpecializationsList] = useState([]);
  const [minFees, setMinFees] = useState('');
  const [maxFees, setMaxFees] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    loadDoctors();
  }, [search, specialization, minFees, maxFees, page]);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (specialization) params.append('specialization', specialization);
      if (minFees) params.append('minFees', minFees);
      if (maxFees) params.append('maxFees', maxFees);
      params.append('page', page);
      params.append('limit', 10);

      const res = await api.get(`/doctors?${params.toString()}`);
      setDoctors(res.data.doctors);
      setPagination(res.data.pagination);
      // Build specialization list from returned doctors
      try {
        const specs = Array.from(new Set((res.data.doctors || []).map(d => d.specialization).filter(Boolean)));
        setSpecializationsList(specs);
      } catch (e) {
        setSpecializationsList([]);
      }
    } catch (err) {
      console.error(err?.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && doctors.length === 0) {
    return <div className="text-center py-5"><p>Loading doctors...</p></div>;
  }

  return (
    <div className="doctor-list">
      <h2 className="mb-4">Find Doctors</h2>

      {/* Filters */}
      <div className="card p-4 mb-4">
        <div className="row g-3">
          <div className="col-md-3">
            <input type="text" placeholder="Search..." className="form-control" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <div className="col-md-3">
            <select className="form-control" value={specialization} onChange={e => { setSpecialization(e.target.value); setPage(1); }}>
              <option value="">All Specializations</option>
              {specializationsList.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>
          <div className="col-md-2">
            <input type="number" placeholder="Min fees" className="form-control" value={minFees} onChange={e => { setMinFees(e.target.value); setPage(1); }} />
          </div>
          <div className="col-md-2">
            <input type="number" placeholder="Max fees" className="form-control" value={maxFees} onChange={e => { setMaxFees(e.target.value); setPage(1); }} />
          </div>
          <div className="col-md-2">
            <button className="btn btn-secondary w-100" onClick={() => { setSearch(''); setSpecialization(''); setMinFees(''); setMaxFees(''); setPage(1); }}>Clear</button>
          </div>
        </div>
      </div>

      {/* Doctors Grid */}
      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading doctors...</p>
        </div>
      ) : doctors.length === 0 ? (
        <div className="empty-state-container">
          <div className="empty-state">
            <h3>📭 No doctors found</h3>
            <p>Try adjusting your search filters or specialization preferences.</p>
            <button 
              className="btn btn-primary"
              onClick={() => { setSearch(''); setSpecialization(''); setMinFees(''); setMaxFees(''); setPage(1); }}
            >
              Reset Filters
            </button>
          </div>
        </div>
      ) : (
        <div className="row">
          {doctors.map(d => (
            <div key={d._id} className="col-12 mb-4">
              <div className="card h-100 doctor-card">
                <div className="card-body d-flex flex-column">
                  <div className="doctor-card-top d-flex align-items-start gap-3">
                    <div className="avatar">{(d.fullname || 'Dr').split(' ').map(n=>n[0]).slice(0,2).join('')}</div>
                    <div className="doctor-meta" style={{flex:1}}>
                      <div className="d-flex justify-content-between align-items-start">
                        <h5 className="card-title mb-1">{d.fullname}</h5>
                        <div className="fees-badge">₹{d.fees}</div>
                      </div>
                      <p className="specialization-badge" style={{marginTop:6}}>{d.specialization}</p>
                      {d.about && <p className="about-text mt-2">{d.about.length > 120 ? d.about.slice(0,120) + '…' : d.about}</p>}
                    </div>
                  </div>

                  <div className="mt-auto">
                    <div className="doctor-info mb-3">
                      <p className="mb-1"><strong>Experience:</strong> {d.experience} years</p>
                      <p className="mb-0"><strong>Contact:</strong> {d.phone || d.email}</p>
                    </div>
                    <Link to={`/book/${d._id}`} className="btn btn-primary w-100">Book Appointment</Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <nav className="mt-4">
          <ul className="pagination justify-content-center">
            {page > 1 && <li className="page-item"><button className="page-link" onClick={() => setPage(page - 1)}>Previous</button></li>}
            {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
              const pageNum = page > 3 ? page - 2 + i : i + 1;
              return pageNum <= pagination.pages ? (
                <li key={pageNum} className={`page-item ${page === pageNum ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => setPage(pageNum)}>{pageNum}</button>
                </li>
              ) : null;
            })}
            {page < pagination.pages && <li className="page-item"><button className="page-link" onClick={() => setPage(page + 1)}>Next</button></li>}
          </ul>
        </nav>
      )}
    </div>
  );
};

export default DoctorList;
