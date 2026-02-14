// js/cookie-consent.js
(function() {
    if (localStorage.getItem('cookieConsent')) return;
    
    const banner = document.createElement('div');
    banner.id = 'cookieConsentBanner';
    banner.style.cssText = `
        position: fixed; bottom: 0; left: 0; right: 0; background: #0a2540;
        color: white; padding: 20px; z-index: 9999; box-shadow: 0 -5px 20px rgba(0,0,0,0.2);
        display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 20px;
    `;
    
    banner.innerHTML = `
        <div style="flex:1; min-width:280px;">
            <strong style="font-size:16px; display:block; margin-bottom:5px;">🍪 Cookie Consent</strong>
            <p style="margin:0; font-size:14px; opacity:0.9;">We use cookies to enhance your experience. By continuing, you consent to our use of cookies.</p>
        </div>
        <div style="display:flex; gap:10px;">
            <button id="acceptCookies" style="background:#c19a6b; color:white; border:none; padding:10px 25px; border-radius:40px; cursor:pointer; font-weight:600;">Accept</button>
            <button id="rejectCookies" style="background:transparent; color:white; border:1px solid white; padding:10px 25px; border-radius:40px; cursor:pointer; font-weight:600;">Reject</button>
            <a href="/privacy.html" style="background:transparent; color:white; border:1px solid white; padding:10px 25px; border-radius:40px; text-decoration:none; font-weight:600;">Learn More</a>
        </div>
    `;
    
    document.body.appendChild(banner);
    
    document.getElementById('acceptCookies').addEventListener('click', function() {
        localStorage.setItem('cookieConsent', 'accepted');
        banner.remove();
    });
    
    document.getElementById('rejectCookies').addEventListener('click', function() {
        localStorage.setItem('cookieConsent', 'rejected');
        banner.remove();
    });
})();
