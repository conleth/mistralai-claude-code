/**
 * AuthContext tests
 */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';
describe('AuthContext', () => {
    const mockLogin = vi.fn();
    const mockRegister = vi.fn();
    const mockLogout = vi.fn();
    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();
        // Mock fetch
        global.fetch = vi.fn((url, options) => {
            if (url.includes('/api/v1/auth/login')) {
                const body = JSON.parse(options.body);
                if (body.email === 'test@example.com' && body.password === 'password123') {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({
                            token: 'test-token',
                            user: {
                                id: 'user-123',
                                name: 'Test User',
                                email: 'test@example.com',
                                role: 'developer'
                            }
                        })
                    });
                }
                return Promise.resolve({
                    ok: false,
                    json: () => Promise.resolve({ message: 'Invalid credentials' })
                });
            }
            if (url.includes('/api/v1/auth/register')) {
                const body = JSON.parse(options.body);
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({
                        id: 'user-456',
                        name: body.name,
                        email: body.email,
                        role: body.role
                    })
                });
            }
            return Promise.reject(new Error('Not mocked'));
        });
    });
    it('should provide initial state', () => {
        const { result } = renderHook(() => useAuth(), {
            wrapper: AuthProvider
        });
        expect(result.current.user).to.be.null;
        expect(result.current.token).to.be.null;
        expect(result.current.isAuthenticated).to.be.false;
        expect(result.current.isLoading).to.be.true;
    });
    it('should login successfully', async () => {
        const { result } = renderHook(() => useAuth(), {
            wrapper: AuthProvider
        });
        // Wait for initial loading
        await vi.waitFor(() => {
            expect(result.current.isLoading).to.be.false;
        });
        await act(async () => {
            await result.current.login('test@example.com', 'password123');
        });
        expect(result.current.user).to.exist;
        expect(result.current.user?.email).to.equal('test@example.com');
        expect(result.current.token).to.equal('test-token');
        expect(result.current.isAuthenticated).to.be.true;
    });
    it('should handle login failure', async () => {
        const { result } = renderHook(() => useAuth(), {
            wrapper: AuthProvider
        });
        await vi.waitFor(() => {
            expect(result.current.isLoading).to.be.false;
        });
        await expect(act(async () => {
            await result.current.login('test@example.com', 'wrongpassword');
        })).rejects.toThrow('Invalid credentials');
        expect(result.current.user).to.be.null;
        expect(result.current.token).to.be.null;
    });
    it('should register and auto-login', async () => {
        const { result } = renderHook(() => useAuth(), {
            wrapper: AuthProvider
        });
        await vi.waitFor(() => {
            expect(result.current.isLoading).to.be.false;
        });
        await act(async () => {
            await result.current.register('New User', 'new@example.com', 'password123', 'developer');
        });
        // Should be logged in after registration
        expect(result.current.user).to.exist;
        expect(result.current.user?.name).to.equal('New User');
        expect(result.current.isAuthenticated).to.be.true;
    });
    it('should logout', async () => {
        const { result } = renderHook(() => useAuth(), {
            wrapper: AuthProvider
        });
        await vi.waitFor(() => {
            expect(result.current.isLoading).to.be.false;
        });
        // First login
        await act(async () => {
            await result.current.login('test@example.com', 'password123');
        });
        expect(result.current.isAuthenticated).to.be.true;
        // Then logout
        await act(() => {
            result.current.logout();
        });
        expect(result.current.user).to.be.null;
        expect(result.current.token).to.be.null;
        expect(result.current.isAuthenticated).to.be.false;
    });
    it('should restore session from localStorage', () => {
        // Set up localStorage with existing session
        localStorage.setItem('token', 'restored-token');
        localStorage.setItem('user', JSON.stringify({
            id: 'user-789',
            name: 'Restored User',
            email: 'restored@example.com',
            role: 'developer'
        }));
        const { result } = renderHook(() => useAuth(), {
            wrapper: AuthProvider
        });
        expect(result.current.token).to.equal('restored-token');
        expect(result.current.user?.email).to.equal('restored@example.com');
        expect(result.current.isAuthenticated).to.be.true;
    });
    it('should handle invalid localStorage data', () => {
        // Set up invalid localStorage data
        localStorage.setItem('token', 'invalid-token');
        localStorage.setItem('user', 'invalid-json');
        const { result } = renderHook(() => useAuth(), {
            wrapper: AuthProvider
        });
        // Should not crash and should have null values
        expect(result.current.token).to.be.null;
        expect(result.current.user).to.be.null;
    });
});
//# sourceMappingURL=AuthContext.test.js.map