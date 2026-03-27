import { useEffect, useState } from 'react'
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
    const username = localStorage.getItem('username') || 'Unknown'

    const loadEmployees = () => {
        API.get('/employees/')
            .then((res) => setEmployees(res.data))
            .catch((err) => setError(err.response?.data?.detail || 'Failed to load employees.'))
    }

    useEffect(() => {
        loadEmployees()
    }, [])

    // Open the modal
    const openModal = () => {
        setFormData(EMPTY_FORM)
        setFormError('')
        setShowModal(true)
    }

    // Close the modal
    const closeModal = () => {
        setShowModal(false)
        setFormError('')
    }

    // Handle change for the form
    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    }

    // Handle submit for adding a new employee
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
        <div>
            <h2 style={{ marginTop: '2rem' }}>Welcome, {username}</h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <h1 style={{ margin: 0 }}>Employees</h1>
                <button onClick={openModal}>+ Add Employee</button>
            </div>

            {error && <p role="alert">{error}</p>}

            <table border="1" cellPadding="8" cellSpacing="0">
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
                            <td>{emp.status}</td>
                            <td>{emp.createdAt ? new Date(emp.createdAt).toLocaleDateString() : '—'}</td>
                        </tr>
                    ))}
                    {employees.length === 0 && !error && (
                        <tr>
                            <td colSpan="7">No employees found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
            
            {/* Add Employee Modal */}
            {showModal && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-title"
                    style={{
                        position: 'fixed', inset: 0,
                        background: 'rgba(0,0,0,0.5)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 1000,
                    }}
                >
                    <div style={{
                        background: '#fff', borderRadius: '8px',
                        padding: '2rem', minWidth: '360px', maxWidth: '480px', width: '100%',
                    }}>
                        <h2 id="modal-title" style={{ marginTop: 0 }}>Add Employee</h2>

                        {formError && (
                            <p role="alert" style={{ color: 'red', marginBottom: '1rem' }}>
                                {formError}
                            </p>
                        )}

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {[
                                { label: 'Employee ID', name: 'employeeId', type: 'text' },
                                { label: 'Name',        name: 'name',       type: 'text' },
                                { label: 'Email',       name: 'email',      type: 'email' },
                                { label: 'Position',    name: 'position',   type: 'text' },
                                { label: 'Department',  name: 'department', type: 'text' },
                            ].map(({ label, name, type }) => (
                                <label key={name} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    {label}
                                    <input
                                        type={type}
                                        name={name}
                                        value={formData[name]}
                                        onChange={handleChange}
                                        required
                                    />
                                </label>
                            ))}

                            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                Status
                                <select name="status" value={formData.status} onChange={handleChange} required>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </label>

                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                                <button type="button" onClick={closeModal} disabled={submitting}>
                                    Cancel
                                </button>
                                <button type="submit" disabled={submitting}>
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