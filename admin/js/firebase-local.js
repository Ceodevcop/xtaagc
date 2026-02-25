// Firebase Local Loader
(function() {
    console.log('Loading Firebase locally...');
    
    const scripts = [
        'js/firebase-app.js',
        'js/firebase-auth.js', 
        'js/firebase-firestore.js'
    ];
    
    let loaded = 0;
    
    function loadNext() {
        if (loaded >= scripts.length) {
            console.log('✅ All Firebase scripts loaded');
            window.dispatchEvent(new CustomEvent('firebase-ready'));
            return;
        }
        
        const script = document.createElement('script');
        script.src = scripts[loaded];
        script.onload = () => {
            console.log(`✅ Loaded: ${scripts[loaded]}`);
            loaded++;
            loadNext();
        };
        script.onerror = () => {
            console.error(`❌ Failed to load: ${scripts[loaded]}`);
            document.getElementById('status').innerHTML = `❌ Failed to load Firebase. Please upload the SDK files to /admin/js/`;
        };
        document.head.appendChild(script);
    }
    
    loadNext();
})();
