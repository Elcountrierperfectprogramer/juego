// Crear consola flotante
(function() {
    const consoleDiv = document.createElement('div');
    consoleDiv.id = 'floatingConsole';
    consoleDiv.style.cssText = `
        position: fixed;
        bottom: 10px;
        right: 10px;
        width: 90%;
        max-width: 300px;
        background: rgba(0,0,0,0.9);
        color: #0f0;
        font-family: monospace;
        font-size: 12px;
        padding: 10px;
        border-radius: 10px;
        z-index: 9999;
        max-height: 200px;
        overflow-y: auto;
        word-wrap: break-word;
        border: 1px solid #0f0;
    `;
    
    const titleBar = document.createElement('div');
    titleBar.style.cssText = `
        font-weight: bold;
        margin-bottom: 5px;
        cursor: pointer;
        color: #fff;
    `;
    titleBar.innerHTML = '📱 CONSOLA (toca para minimizar)';
    consoleDiv.appendChild(titleBar);
    
    const contentDiv = document.createElement('div');
    contentDiv.id = 'consoleContent';
    consoleDiv.appendChild(contentDiv);
    
    document.body.appendChild(consoleDiv);
    
    let minimized = false;
    titleBar.onclick = () => {
        minimized = !minimized;
        contentDiv.style.display = minimized ? 'none' : 'block';
        consoleDiv.style.maxHeight = minimized ? '40px' : '200px';
    };
    
    // Guardar console.log original
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    
    function addMessage(type, args) {
        const message = Array.from(args).map(arg => {
            if (typeof arg === 'object') {
                try {
                    return JSON.stringify(arg);
                } catch(e) {
                    return String(arg);
                }
            }
            return String(arg);
        }).join(' ');
        
        const msgDiv = document.createElement('div');
        const color = type === 'error' ? '#f00' : (type === 'warn' ? '#ff0' : '#0f0');
        msgDiv.style.cssText = `color: ${color}; border-top: 1px solid #333; padding: 3px 0; font-size: 10px;`;
        msgDiv.innerHTML = `[${type.toUpperCase()}] ${message}`;
        
        contentDiv.appendChild(msgDiv);
        consoleDiv.scrollTop = consoleDiv.scrollHeight;
        
        // Limitar a 50 mensajes
        while(contentDiv.children.length > 50) {
            contentDiv.removeChild(contentDiv.firstChild);
        }
    }
    
    console.log = function() { addMessage('log', arguments); originalLog.apply(console, arguments); };
    console.error = function() { addMessage('error', arguments); originalError.apply(console, arguments); };
    console.warn = function() { addMessage('warn', arguments); originalWarn.apply(console, arguments); };
    
    console.log('✅ Consola activada! Los errores aparecerán aquí');
    console.log('📱 Pantalla: ' + window.innerWidth + 'x' + window.innerHeight);
})();
