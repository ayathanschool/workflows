import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { GoogleOAuthProvider, googleLogout, useGoogleLogin } from '@react-oauth/google';
import GoogleAuthContext from './GoogleAuthContext';
import * as api from '../api';

// Helper: decode basic JWT payload (roles may come from backend response instead)
function parseJwt(token) {
	try {
		const base = token.split('.')[1];
		return JSON.parse(atob(base.replace(/-/g,'+').replace(/_/g,'/')));
	} catch { return {}; }
}

function InnerAuthProvider({ children }) {
	const [user, setUser] = useState(null);      // full user object returned by backend
	const [roles, setRoles] = useState([]);      // normalized roles array
	const [idToken, setIdToken] = useState(null);// raw Google ID token
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	// Restore session from localStorage
	useEffect(() => {
		try {
			const stored = localStorage.getItem('sf_google_session');
			if (stored) {
				const parsed = JSON.parse(stored);
				setUser(parsed.user || null);
				setRoles(parsed.roles || []);
				setIdToken(parsed.idToken || null);
			}
		} catch {}
	}, []);

	const persist = (next) => {
		localStorage.setItem('sf_google_session', JSON.stringify({
			user: next.user,
			roles: next.roles,
			idToken: next.idToken
		}));
	};

	const backendGoogleLogin = async (authPayload) => {
		// Call backend to exchange Google auth info for application user & roles
		console.log("Sending Google auth info to backend...");
		try {
			const result = await api.googleLogin(authPayload);
			if (result && result.error) {
				console.error("Backend login error:", result.error);
				throw new Error(result.error);
			}
			// expected fields: email, name, roles (array), any other metadata
			return result;
		} catch (err) {
			console.error("Backend login failed:", err);
			throw err;
		}
	};

	const loginWithGoogle = useGoogleLogin({
		// Use auth-code flow with Google's OIDC endpoints
		flow: 'implicit',
		// Request both ID token and access token
		scope: 'email profile openid',
		// Set response_type to request both tokens
		onSuccess: async credentialResponse => {
			try {
				setLoading(true); setError(null);
				console.log("Google login response:", credentialResponse);
				
				// Google OAuth is returning access_token instead of id_token
				// We'll use the access token to get user info directly
				const accessToken = credentialResponse.access_token;
				if (!accessToken) {
					console.error("No access token received from Google OAuth:", credentialResponse);
					throw new Error('Failed to authenticate with Google. Please try again.');
				}
				
				console.log("Received Google access token, fetching user info...");
				
				// Use the access token to get user info from Google
				const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
					headers: { Authorization: `Bearer ${accessToken}` }
				});
				
				if (!userInfoResponse.ok) {
					throw new Error('Failed to get user info from Google');
				}
				
				const userInfo = await userInfoResponse.json();
				console.log("Google user info:", userInfo);
				
				// Use sub claim as the token for backend verification
				const googleId = userInfo.sub;
				setIdToken(accessToken);
				
				// Create a payload for backend with user info and access token
				const googleAuthPayload = {
					google_id: userInfo.sub,
					email: userInfo.email,
					name: userInfo.name,
					picture: userInfo.picture,
					access_token: accessToken
				};
				
				// Exchange Google auth info with backend
				const appUser = await backendGoogleLogin(googleAuthPayload);
				console.log("Backend login success:", appUser);
				
				const r = Array.isArray(appUser.roles) ? appUser.roles : (appUser.role ? [appUser.role] : []);
				setUser(appUser);
				setRoles(r);
				persist({ user: appUser, roles: r, idToken: accessToken });
			} catch (e) {
				console.error('Google login failed', e);
				setError(e.message || String(e));
			} finally {
				setLoading(false);
			}
		},
		onError: (errorResponse) => {
			console.error('Google OAuth error:', errorResponse);
			setError('Google authentication failed: ' + (errorResponse?.error_description || 'Unknown error'));
		},
		// Fix for COOP (Cross-Origin-Opener-Policy) issues
		// Disable the popup entirely and use a new window with a specific target
		// This prevents the browser from blocking access to window.closed
		useOneTap: false,
		// Overriding the default popup behavior
		overrideScope: true,
		// Add custom options that won't trigger COOP restrictions
		select_account: true,
		prompt: 'select_account',
		redirect_uri: window.location.origin,
		auto_select: false,
		// Using the newer window.open options with specific target name
		// to prevent COOP from blocking window.closed checks
		popup_url_options: { 
			height: 800, 
			width: 500,
			popup: false, // Use false to avoid built-in popup behavior
			target: 'google_oauth' + Date.now(), // Use unique name to avoid conflicts
		}
	});

	const logout = useCallback(() => {
		try { googleLogout(); } catch {}
		setUser(null); setRoles([]); setIdToken(null); setError(null);
		localStorage.removeItem('sf_google_session');
	}, []);

	const value = useMemo(() => ({ user, roles, idToken, loading, error, loginWithGoogle, logout }), [user, roles, idToken, loading, error, loginWithGoogle, logout]);

	return (
		<GoogleAuthContext.Provider value={value}>
			{children}
		</GoogleAuthContext.Provider>
	);
}

export default function GoogleAuthProvider({ children }) {
	const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
	if (!clientId) {
		console.warn('VITE_GOOGLE_CLIENT_ID not set: Google login will be disabled');
		return children;
	}
	return (
		<GoogleOAuthProvider clientId={clientId}>
			<InnerAuthProvider>{children}</InnerAuthProvider>
		</GoogleOAuthProvider>
	);
}
