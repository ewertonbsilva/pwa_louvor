/**
 * Gerenciador de Sincronização Offline (sync.js)
 * v1.0
 */

const SyncManager = {
    QUEUE_KEY: 'sync_queue',

    // Adiciona uma ação à fila de sincronização
    addToQueue(data) {
        let queue = this.getQueue();
        queue.push({
            id: Date.now(),
            timestamp: new Date().toISOString(),
            data: data
        });
        localStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));
        this.processQueue(); // Tenta processar imediatamente
    },

    getQueue() {
        return JSON.parse(localStorage.getItem(this.QUEUE_KEY) || '[]');
    },

    // Processa a fila enviando para o SCRIPT_URL
    async processQueue() {
        if (!navigator.onLine) return; // Offline, aborta

        let queue = this.getQueue();
        if (queue.length === 0) return;

        console.log(`Sincronizando ${queue.length} itens...`);

        // Processa um por um para garantir ordem
        const item = queue[0];
        try {
            const response = await fetch(APP_CONFIG.SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify(item.data)
            });
            const res = await response.json();

            if (res.status === "success") {
                // Remove o item processado e continua
                queue.shift();
                localStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));
                if (queue.length > 0) {
                    this.processQueue();
                } else {
                    console.log("Sincronização concluída!");
                    // Dispara evento para telas que precisam recarregar dados
                    window.dispatchEvent(new CustomEvent('syncCompleted'));
                }
            } else {
                console.error("Erro no script:", res.message);
                // Se for erro de duplicata ou algo que não deve ser retentado, talvez remover da fila?
                // Por agora, mantém para evitar perda de dados se o erro for temporário
            }
        } catch (e) {
            console.log("Falha na sincronização (conexão instável)");
        }
    },

    // Helper para atualizar o cache local imediatamente (otimismo UI)
    updateLocalCache(sheet, action, payload) {
        if (sheet === "Repertório") {
            let cached = JSON.parse(localStorage.getItem('offline_repertorio') || '[]');
            if (action === "delete") {
                cached = cached.filter(m =>
                    !(m.Músicas === payload.musica && m.Cantor === payload.cantor && m.Cultos === payload.culto)
                );
            } else if (action === "add" || !payload.action) {
                // Caso de Cadastro de Repertório
                const [musicaPart, cantorPart] = (payload.MusicaFull || "").split(" - ");
                cached.unshift({
                    "Cultos": payload.Cultos,
                    "Ministro": payload.Ministro,
                    "Músicas": musicaPart.trim(),
                    "Cantor": cantorPart ? cantorPart.trim() : "",
                    "Tons": payload.Tom || "--",
                    "Data": new Date().toISOString()
                });
            }
            localStorage.setItem('offline_repertorio', JSON.stringify(cached));
        } else if (sheet === "Musicas") {
            let cached = JSON.parse(localStorage.getItem('offline_musicas') || '[]');
            if (action === "add" || !payload.action) {
                // Mapeia Musica (do formulário) para Músicas (da planilha)
                cached.unshift({
                    "Tema": payload.Tema,
                    "Estilo": payload.Estilo,
                    "Músicas": payload.Musica || payload.Músicas,
                    "Cantor": payload.Cantor,
                    "Youtube": { link: "#" },
                    "Spotify": { link: "#" },
                    "Letras": { link: "#" },
                    "Cifras": { link: "#" }
                });
            }
            localStorage.setItem('offline_musicas', JSON.stringify(cached));
        }
    }
};

// Monitora volta da conexão
window.addEventListener('online', () => SyncManager.processQueue());

// Tenta sincronizar ao carregar qualquer página
SyncManager.processQueue();
