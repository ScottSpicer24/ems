// src/test/Login.test.jsx
//
// Unit Tests for Login.jsx
// Uses: Vitest + React Testing Library + axios mock
// Run with: npm test
// ─────────────────────────────────────────────────────────────────────────────

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import Login from '../pages/Login'

// ─── 1. MOCK AXIOS ───────────────────────────────────────────────────────────
//
// We mock the entire axios module so no real HTTP requests are made.
// vi.mock() is hoisted to the top of the file by Vitest automatically,
// so it always runs before imports — no ordering issues.
//
vi.mock('axios')
import axios from 'axios'

// ─── 2. MOCK REACT-ROUTER useNavigate ────────────────────────────────────────
//
// useNavigate() is a hook from react-router-dom. We replace it with a
// vi.fn() spy so we can assert that navigate('/') was called on success.
//
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,                          // keep MemoryRouter, Route, etc.
    useNavigate: () => mockNavigate,    // replace only useNavigate
  }
})

// ─── 3. HELPER: renderLogin ──────────────────────────────────────────────────
//
// Login uses useNavigate internally, which requires a Router context.
// We wrap it in <MemoryRouter> so tests don't blow up with a missing context.
//
function renderLogin() {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  )
}

// ─── 4. CLEANUP BETWEEN TESTS ────────────────────────────────────────────────
//
// - Clear all mocks so spy call counts reset between tests.
// - Clear localStorage so token/role stored in one test don't bleed into another.
//
beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
})

afterEach(() => {
  localStorage.clear()
})

// ─────────────────────────────────────────────────────────────────────────────
// TEST SUITE
// ─────────────────────────────────────────────────────────────────────────────

describe('Login Page', () => {

  // ── TEST 1: Rendering ───────────────────────────────────────────────────────
  //
  // PURPOSE: Verify the form elements are present when the page first loads.
  //
  // getByLabelText()  → finds input by its associated <label> text
  // getByRole()       → finds elements by ARIA role (button, heading, etc.)
  //
  describe('Rendering', () => {
    // TEST 1: Rendering the username input field
    it('renders the username input field', () => {
      renderLogin()
      // Looks for an <input> associated with a <label> containing "Username"
      const usernameInput = screen.getByLabelText(/username/i)
      expect(usernameInput).toBeInTheDocument()
      expect(usernameInput).toHaveAttribute('type', 'text')
    })

    // TEST 2: Rendering the password input field
    it('renders the password input field', () => {
      renderLogin()
      const passwordInput = screen.getByLabelText(/password/i)
      expect(passwordInput).toBeInTheDocument()
      expect(passwordInput).toHaveAttribute('type', 'password')
    })

    // TEST 3: Rendering the submit button
    it('renders the submit button', () => {
      renderLogin()
      // getByRole('button') finds <button> elements; { name } matches button text
      const submitButton = screen.getByRole('button', { name: /login/i })
      expect(submitButton).toBeInTheDocument()
    })

    // TEST 4: Does not show an error message on initial render
    it('does not show an error message on initial render', () => {
      renderLogin()
      // role="alert" is what we put on the error <p> in Login.jsx
      // queryByRole returns null (not throw) when element is absent
      const errorMessage = screen.queryByRole('alert')
      expect(errorMessage).not.toBeInTheDocument()
    })

  })

  // ── TEST 2: Input Validation ────────────────────────────────────────────────
  //
  // PURPOSE: Verify that required fields prevent form submission when empty.
  //
  // We use the HTML5 `required` attribute on inputs, so the browser blocks
  // submission natively. We assert the axios.post was never called.
  //
  describe('Input Validation', () => {
    // Test 5: Does not submit the form when username is empty
    it('does not submit the form when username is empty', async () => {
      const user = userEvent.setup()
      renderLogin()

      // Only fill in password — leave username blank
      await user.type(screen.getByLabelText(/password/i), 'user123')
      await user.click(screen.getByRole('button', { name: /login/i }))

      // axios.post should never have been called
      expect(axios.post).not.toHaveBeenCalled()
    })

    // Test 6: Does not submit the form when password is empty
    it('does not submit the form when password is empty', async () => {
      const user = userEvent.setup()
      renderLogin()

      // Only fill in username — leave password blank
      await user.type(screen.getByLabelText(/username/i), 'user')
      await user.click(screen.getByRole('button', { name: /login/i }))

      expect(axios.post).not.toHaveBeenCalled()
    })

    // Test 7: Does not submit the form when both fields are empty
    it('does not submit the form when both fields are empty', async () => {
      const user = userEvent.setup()
      renderLogin()

      await user.click(screen.getByRole('button', { name: /login/i }))

      expect(axios.post).not.toHaveBeenCalled()
    })

    it('accepts typed values in the username and password fields', async () => {
      const user = userEvent.setup()
      renderLogin()

      await user.type(screen.getByLabelText(/username/i), 'user')
      await user.type(screen.getByLabelText(/password/i), 'user123')

      // toHaveValue() checks the current value of the input element
      expect(screen.getByLabelText(/username/i)).toHaveValue('user')
      expect(screen.getByLabelText(/password/i)).toHaveValue('user123')
    })

  })

  // ── TEST 3: Failed Login ────────────────────────────────────────────────────
  //
  // PURPOSE: Verify the error message appears when the API call fails.
  //
  // axios.post.mockRejectedValueOnce() makes axios simulate a network/API error.
  // The error object must mirror what axios normally provides:
  //   err.response.data.message — the custom backend message
  //
  describe('Failed Login', () => {

    it('displays a server error message when login fails', async () => {
      // Tell axios.post to reject with a 401-style error object
      axios.post.mockRejectedValueOnce({
        response: { data: { message: 'Invalid credentials' } },
      })

      const user = userEvent.setup()
      renderLogin()

      await user.type(screen.getByLabelText(/username/i), 'wrong_user')
      await user.type(screen.getByLabelText(/password/i), 'wrongpassword')
      await user.click(screen.getByRole('button', { name: /login/i }))

      // waitFor() keeps retrying the assertion until it passes or times out.
      // This is necessary because the error state update is async.
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
        expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials')
      })
    })

    it('displays a fallback error message when server returns no message', async () => {
      // Simulate a network error with no response body
      axios.post.mockRejectedValueOnce(new Error('Network Error'))

      const user = userEvent.setup()
      renderLogin()

      await user.type(screen.getByLabelText(/username/i), 'user')
      await user.type(screen.getByLabelText(/password/i), 'user123')
      await user.click(screen.getByRole('button', { name: /login/i }))

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(
          'Login failed. Please try again.'
        )
      })
    })

    it('does not store anything in localStorage when login fails', async () => {
      axios.post.mockRejectedValueOnce({
        response: { data: { message: 'Invalid credentials' } },
      })

      const user = userEvent.setup()
      renderLogin()

      await user.type(screen.getByLabelText(/username/i), 'user')
      await user.type(screen.getByLabelText(/password/i), 'wrongpassword')
      await user.click(screen.getByRole('button', { name: /login/i }))

      await waitFor(() => screen.getByRole('alert'))

      expect(localStorage.getItem('token')).toBeNull()
      expect(localStorage.getItem('role')).toBeNull()
    })

  })

  // ── TEST 4: Successful Login ────────────────────────────────────────────────
  //
  // PURPOSE: Verify that on success, the JWT token and role are stored in
  // localStorage and the user is redirected to the home page.
  //
  // axios.post.mockResolvedValueOnce() makes axios return a fake success response.
  //
  describe('Successful Login', () => {

    it('calls axios.post with the correct endpoint and credentials', async () => {
      axios.post.mockResolvedValueOnce({
        data: { access_token: 'fake-jwt-token', role: 'admin' },
      })

      const user = userEvent.setup()
      renderLogin()

      await user.type(screen.getByLabelText(/username/i), 'admin')
      await user.type(screen.getByLabelText(/password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /login/i }))

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith('http://127.0.0.1:8000/auth/login', {
          username: 'admin',
          password: 'password123',
        })
      })
    })

    it('stores the JWT token in localStorage on successful login', async () => {
      axios.post.mockResolvedValueOnce({
        data: { access_token: 'fake-jwt-token', role: 'admin' },
      })

      const user = userEvent.setup()
      renderLogin()

      await user.type(screen.getByLabelText(/username/i), 'admin')
      await user.type(screen.getByLabelText(/password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /login/i }))

      await waitFor(() => {
        expect(localStorage.getItem('token')).toBe('fake-jwt-token')
      })
    })

    it('stores the user role in localStorage on successful login', async () => {
      axios.post.mockResolvedValueOnce({
        data: { access_token: 'fake-jwt-token', role: 'employee' },
      })

      const user = userEvent.setup()
      renderLogin()

      await user.type(screen.getByLabelText(/username/i), 'emp_user')
      await user.type(screen.getByLabelText(/password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /login/i }))

      await waitFor(() => {
        expect(localStorage.getItem('role')).toBe('employee')
      })
    })

    it('redirects to the home page after successful login', async () => {
      axios.post.mockResolvedValueOnce({
        data: { access_token: 'fake-jwt-token', role: 'admin' },
      })

      const user = userEvent.setup()
      renderLogin()

      await user.type(screen.getByLabelText(/username/i), 'admin')
      await user.type(screen.getByLabelText(/password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /login/i }))

      // mockNavigate is the vi.fn() spy we injected for useNavigate()
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/')
      })
    })

    it('does not show an error message on successful login', async () => {
      axios.post.mockResolvedValueOnce({
        data: { access_token: 'fake-jwt-token', role: 'admin' },
      })

      const user = userEvent.setup()
      renderLogin()

      await user.type(screen.getByLabelText(/username/i), 'admin')
      await user.type(screen.getByLabelText(/password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /login/i }))

      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      })
    })

  })

})