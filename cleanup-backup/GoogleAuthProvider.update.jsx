/**
 * Updates to GoogleAuthProvider.jsx to fix COOP issues and token handling
 * Replace the existing loginWithGoogle implementation with this one
 */

const loginWithGoogle = useGoogleLogin({
  flow: 'implicit',
  scope: 'email profile',  // Explicitly request email and profile scopes
  onSuccess: async credentialResponse => {
    try {
      setLoading(true); setError(null);
      console.log("Google auth success response:", credentialResponse);
      
      // Some flows return access_token only; we prefer id_token. If absent, we can't verify server-side.
      const id_token = credentialResponse.credential || credentialResponse.id_token || credentialResponse.code || credentialResponse.access_token;
      
      if (!id_token) throw new Error('Google authentication did not return a token');
      setIdToken(id_token);
      
      // Exchange with backend
      const appUser = await backendGoogleLogin(id_token);
      if (appUser && appUser.error) throw new Error(appUser.error);
      
      const r = Array.isArray(appUser.roles) ? appUser.roles : (appUser.role ? [appUser.role] : []);
      setUser(appUser);
      setRoles(r);
      persist({ user: appUser, roles: r, idToken: id_token });
    } catch (e) {
      console.error('Google login failed', e);
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  },
  onError: (error) => {
    console.error("Google login error:", error);
    setError('Google authentication failed: ' + (error?.message || 'Unknown error'));
  },
  // Add these options to fix Cross-Origin-Opener-Policy warnings
  popup_url_options: { 
    height: 800, 
    width: 500,
    popup: true,
    // These options help prevent COOP issues
    noopener: true,
    noreferrer: true
  }
});