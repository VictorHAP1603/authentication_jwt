import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { setupAPIClient } from "../services/api";
import Router from 'next/router'
import { setCookie, parseCookies, destroyCookie } from 'nookies'
import { api } from "../services/apiClient";

type SignInCredentials = {
    email: string;
    password: string;
}

type AuthContextData = {
    signIn(credentials: SignInCredentials): Promise<void>;
    isAuthenticated: boolean,
    user: User
}

type AuthProviderProps = {
    children: ReactNode
}

type User = {
    email: string;
    permissions: string[];
    roles: string[];
}

const AuthContext = createContext({} as AuthContextData);

export function signOut() {
    destroyCookie(undefined, 'nextauth.token');
    destroyCookie(undefined, 'nextauth.refreshToken');

    Router.push('/')
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User>(null);
    const isAuthenticated = user ? true : false;

    useEffect(() => {
        const { 'nextauth.token': token } = parseCookies()

        if (token) {
            api.get('/me').then(res => {
                const { email, permissions, roles } = res.data
                setUser({ email, permissions, roles });
            }).catch(() => {
                signOut();
            })
        }

    }, [])

    async function signIn({ email, password }: SignInCredentials) {

        try {
            const { data } = await api.post('/sessions', {
                email,
                password
            });

            const { permissions, roles, token, refreshToken } = data

            setCookie(undefined, 'nextauth.token', token, {
                maxAge: 60 * 60 * 24 * 30, // 30 days
                path: '/'
            });

            setCookie(undefined, 'nextauth.refreshToken', refreshToken, {
                maxAge: 60 * 60 * 24 * 30, // 30 days
                path: '/'
            })

            setUser({
                email,
                permissions,
                roles
            })

            api.defaults.headers['Authorization'] = `Bearer ${token}`

            Router.push('/dashboard')

        } catch (err) {
            console.log(err)
        }
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, signIn, user }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth(): AuthContextData {
    const context = useContext(AuthContext)

    return context
}