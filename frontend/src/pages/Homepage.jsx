import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api/api'

const EMPTY_FORM = {
    employeeId: '',
    name: '',
    email: '',
    position: '',
    department: '',
    status: 'active',
}

export default function Homepage() {
    const [employees, setEmployees] = useState([])
    const [error, setError] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [formData, setFormData] = useState(EMPTY_FORM)
    const [formError, setFormError] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [loggingOut, setLoggingOut] = useState(false)
    const username = localStorage.getItem('username') || 'Unknown'
    const role = localStorage.getItem('role')
    const navigate = useNavigate()

    const handleLogout = async () => {
        setLoggingOut(true)
        try {
            await API.post('/auth/logout')
        } catch {
            // Proceed with client-side logout even if the request fails
        } finally {
            localStorage.removeItem('token')
            localStorage.removeItem('username')
            localStorage.removeItem('role')
            navigate('/login')
        }
    }

    const loadEmployees = () => {
        API.get('/employees/')
            .then((res) => setEmployees(res.data))
            .catch((err) => setError(err.response?.data?.detail || 'Failed to load employees.'))
    }

    useEffect(() => {
        loadEmployees()
    }, [])

    const openModal = () => {
        setFormData(EMPTY_FORM)
        setFormError('')
        setShowModal(true)
    }

    const closeModal = () => {
        setShowModal(false)
        setFormError('')
    }

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        setFormError('')
        try {
            await API.post('/employees/employee', formData)
            closeModal()
            loadEmployees()
        } catch (err) {
            const status = err.response?.status
            if (status === 403) {
                setFormError('You must be an admin to add an employee.')
            } else {
                setFormError(err.response?.data?.detail || 'Failed to create employee.')
            }
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="homepage">
            <div className="homepage-header">
                <div>
                    <h1>Employees</h1>
                    <p className="welcome-text">Logged in as <strong>{username}</strong></p>
                </div>
                <div className="header-actions">
                    {role === 'admin' && (
                        <button className="btn btn-primary" onClick={openModal}>
                            + Add Employee
                        </button>
                    )}
                    <button
                        className="btn btn-danger"
                        onClick={handleLogout}
                        disabled={loggingOut}
                    >
                        {loggingOut ? 'Logging out…' : 'Logout'}
                    </button>
                </div>
            </div>

            {error && <p role="alert" className="alert alert-error">{error}</p>}

            <div className="table-wrapper">
                <table className="emp-table">
                    <thead>
                        <tr>
                            <th>Employee ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Position</th>
                            <th>Department</th>
                            <th>Status</th>
                            <th>Created At</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map((emp) => (
                            <tr key={emp.employeeId}>
                                <td>{emp.employeeId}</td>
                                <td>{emp.name}</td>
                                <td>{emp.email}</td>
                                <td>{emp.position}</td>
                                <td>{emp.department}</td>
                                <td>
                                    <span className={`badge badge-${emp.status}`}>
                                        {emp.status}
                                    </span>
                                </td>
                                <td>{emp.createdAt ? new Date(emp.createdAt).toLocaleDateString() : '—'}</td>
                            </tr>
                        ))}
                        {employees.length === 0 && !error && (
                            <tr className="empty-row">
                                <td colSpan="7">No employees found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add Employee Modal */}
            {showModal && (
                <div
                    className="modal-overlay"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-title"
                >
                    <div className="modal-card">
                        <h2 id="modal-title">Add Employee</h2>

                        {formError && (
                            <p role="alert" className="alert alert-error">{formError}</p>
                        )}

                        <form onSubmit={handleSubmit}>
                            {[
                                { label: 'Employee ID', name: 'employeeId', type: 'text' },
                                { label: 'Name',        name: 'name',       type: 'text' },
                                { label: 'Email',       name: 'email',      type: 'email' },
                                { label: 'Position',    name: 'position',   type: 'text' },
                                { label: 'Department',  name: 'department', type: 'text' },
                            ].map(({ label, name, type }) => (
                                <div className="form-group" key={name}>
                                    <label htmlFor={`modal-${name}`}>{label}</label>
                                    <input
                                        id={`modal-${name}`}
                                        type={type}
                                        name={name}
                                        value={formData[name]}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            ))}

                            <div className="form-group">
                                <label htmlFor="modal-status">Status</label>
                                <select
                                    id="modal-status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={closeModal}
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={submitting}
                                >
                                    {submitting ? 'Saving…' : 'Save Employee'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
