// js/admin/guard.js - Admin route guard
// Include this in every admin page

(function() {
  const adminSession = localStorage.getItem('taagc_admin') || sessionStorage.getItem('taagc_admin');
  
  if (!adminSession) {
    window.location.href = '/admin/';
    return;
  }

  try {
    const adminData = JSON.parse(adminSession);
    
    // Verify with Firebase (optional but recommended)
    import { getAuth, onAuthStateChanged } from 'firebase/auth';
    import { auth } from '../firebase-config.js';
    
    onAuthStateChanged(auth, (user) => {
      if (!user || user.uid !== adminData.uid) {
        localStorage.removeItem('taagc_admin');
        sessionStorage.removeItem('taagc_admin');
        window.location.href = '/admin/';
      }
    });
  } catch (e) {
    localStorage.removeItem('taagc_admin');
    sessionStorage.removeItem('taagc_admin');
    window.location.href = '/admin/';
  }
})();
