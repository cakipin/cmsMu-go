export const editorLogic = `
/**
 * 🛠️ GLOBAL LOGIC (Clean & Safe)
 */

// 1. DATA CLEANER (Wajib agar D1 tidak Error 500)
window.cleanData = function(form, editorContent) {
    return {
        id: (form.id && form.id !== 'null') ? form.id : undefined,
        title: form.title || '',
        slug: form.slug || (form.title ? form.title.toString().toLowerCase().trim().replace(/\\s+/g, '-').replace(/[^\\w\\-]+/g, '') : ''),
        content: editorContent || '', 
        status: form.status || 'draft',
        category: form.category || 'Uncategorized',
        tags: form.tags || '',
        featured_image: form.featured_image || '',
        date: form.date ? new Date(form.date).toISOString() : new Date().toISOString(),
        type: form.type || 'post'
    };
};

// 2. API WRAPPER
window.cmsApi = {
    load: async function(type) {
        try {
            const res = await fetch('/api/contents?type=' + type, {
                headers: { 'Authorization': 'Bearer ' + localStorage.getItem('labmu_token') }
            });
            const json = await res.json();
            return Array.isArray(json) ? json : (json.data || []);
        } catch (e) { return []; }
    },
    
    save: async function(payload) {
        try {
            const res = await fetch('/api/contents', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': 'Bearer ' + localStorage.getItem('labmu_token')
                },
                body: JSON.stringify(payload)
            });
            return res.ok;
        } catch (e) { alert('Gagal koneksi'); return false; }
    }
};

// 3. Init Editor
window.initEditor = function(id, content) {
    if(window.cmsEditor) { try { window.cmsEditor.destroy(); } catch(e){} }
    try {
        window.cmsEditor = SUNEDITOR.create(id, {
            display: 'block', width: '100%', height: '400px',
            buttonList: [['undo', 'redo'], ['bold', 'underline', 'italic'], ['list', 'align', 'table'], ['link', 'image', 'codeView']]
        });
        window.cmsEditor.setContents(content || '');
    } catch(e) {}
};
`;