/**
 * editor-autosave.ts
 * Dual-layer Auto Save Draft Client Script
 * 1. LocalStorage Instant Crash-Recovery (debounced 2s on typing)
 * 2. Background Server Sync (for new / draft posts)
 * 3. Manual "Simpan Draf" (Save Draft) button
 */

export const editorAutoSaveScript = `
window.__CMS_AUTOSAVE = {
    timer: null,
    serverInterval: null,

    getDraftKey: function(id) {
        return 'sa_cms_draft_' + (id || 'new');
    },

    saveLocal: function(ctx) {
        if (typeof window === 'undefined' || !window.localStorage) return false;
        if (!ctx || !ctx.form) return false;

        var title = (ctx.form.title || '').trim();
        var body = (ctx.form.body || '').trim();
        if (!title && !body) return false;

        try {
            var key = this.getDraftKey(ctx.editingId);
            var now = new Date();
            var timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            var payload = {
                id: ctx.editingId || null,
                timestamp: now.getTime(),
                timeStr: timeStr,
                data: {
                    title: ctx.form.title || '',
                    slug: ctx.form.slug || '',
                    body: ctx.form.body || '',
                    excerpt: ctx.form.excerpt || '',
                    meta_title: ctx.form.meta_title || '',
                    meta_description: ctx.form.meta_description || '',
                    status: ctx.form.status || 'draft',
                    category: ctx.form.category || 'Berita',
                    tags: ctx.form.tags || '',
                    featured_image: ctx.form.featured_image || '',
                    featured_image_caption: ctx.form.featured_image_caption || '',
                    featured_image_alt: ctx.form.featured_image_alt || '',
                    type: ctx.form.type || 'post',
                    video_url: ctx.form.video_url || ''
                }
            };

            localStorage.setItem(key, JSON.stringify(payload));
            ctx.autoSaveStatus = 'saved';
            ctx.lastSavedTime = timeStr;
            return true;
        } catch (e) {
            console.warn('[AutoSave Local Error]', e);
            return false;
        }
    },

    checkLocal: function(ctx) {
        if (typeof window === 'undefined' || !window.localStorage) return;
        if (!ctx || !ctx.form) return;

        try {
            var key = this.getDraftKey(ctx.editingId);
            var raw = localStorage.getItem(key);
            if (!raw) {
                ctx.hasLocalDraft = false;
                return;
            }

            var draft = JSON.parse(raw);
            if (!draft || !draft.data) {
                ctx.hasLocalDraft = false;
                return;
            }

            var currentTitle = (ctx.form.title || '').trim();
            var currentBody = (ctx.form.body || '').trim();
            var draftTitle = (draft.data.title || '').trim();
            var draftBody = (draft.data.body || '').trim();

            var hasDifference = (draftTitle !== currentTitle) || (draftBody !== currentBody);
            var hasContent = Boolean(draftTitle || draftBody);

            if (hasDifference && hasContent) {
                ctx.hasLocalDraft = true;
                ctx.localDraftTime = draft.timeStr || new Date(draft.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                ctx.localDraftData = draft.data;
            } else {
                ctx.hasLocalDraft = false;
            }
        } catch (e) {
            ctx.hasLocalDraft = false;
        }
    },

    restoreLocal: function(ctx) {
        if (!ctx || !ctx.localDraftData) return;
        var d = ctx.localDraftData;

        ctx.form.title = d.title || ctx.form.title;
        ctx.form.slug = d.slug || ctx.form.slug;
        ctx.form.body = d.body || ctx.form.body;
        ctx.form.excerpt = d.excerpt || ctx.form.excerpt;
        ctx.form.meta_title = d.meta_title || ctx.form.meta_title;
        ctx.form.meta_description = d.meta_description || ctx.form.meta_description;
        ctx.form.category = d.category || ctx.form.category;
        ctx.form.tags = d.tags || ctx.form.tags;
        ctx.form.featured_image = d.featured_image || ctx.form.featured_image;
        ctx.form.featured_image_caption = d.featured_image_caption || ctx.form.featured_image_caption;
        ctx.form.featured_image_alt = d.featured_image_alt || ctx.form.featured_image_alt;
        ctx.form.type = d.type || ctx.form.type;
        ctx.form.video_url = d.video_url || ctx.form.video_url;

        if (typeof document !== 'undefined') {
            var editorEl = document.querySelector('[x-ref="editor"]');
            if (editorEl) editorEl.innerHTML = ctx.form.body;
            var htmlEl = document.querySelector('[x-ref="htmlSource"]');
            if (htmlEl) htmlEl.value = ctx.form.body;
        }

        ctx.hasLocalDraft = false;
        ctx.autoSaveStatus = 'saved';
        ctx.lastSavedTime = ctx.localDraftTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        if (typeof window !== 'undefined' && window.showToast) {
            window.showToast('Draf lokal berhasil dipulihkan!', 'success');
        }
    },

    discardLocal: function(ctx) {
        if (typeof window === 'undefined' || !window.localStorage) return;
        var key = this.getDraftKey(ctx.editingId);
        localStorage.removeItem(key);
        ctx.hasLocalDraft = false;
        ctx.localDraftData = null;
        if (typeof window !== 'undefined' && window.showToast) {
            window.showToast('Draf lokal diabaikan.', 'info');
        }
    },

    clearLocal: function(id) {
        if (typeof window === 'undefined' || !window.localStorage) return;
        try {
            localStorage.removeItem(this.getDraftKey(id));
            if (!id) localStorage.removeItem(this.getDraftKey('new'));
        } catch (_) {}
    },

    trigger: function(ctx) {
        if (!ctx) return;
        ctx.autoSaveStatus = 'unsaved';

        var self = this;
        if (this.timer) clearTimeout(this.timer);
        this.timer = setTimeout(function() {
            var saved = self.saveLocal(ctx);
            if (saved) {
                self.syncServerIfDraft(ctx);
            }
        }, 2000);
    },

    syncServerIfDraft: async function(ctx) {
        if (!ctx || ctx.isSaving || ctx.isAutoSaving) return;
        if (ctx.form.status && ctx.form.status !== 'draft') return;
        if (!ctx.form.title && !ctx.form.body) return;

        try {
            ctx.isAutoSaving = true;
            ctx.autoSaveStatus = 'saving';

            var token = ctx.getToken ? ctx.getToken() : '';
            if (!token) {
                ctx.isAutoSaving = false;
                ctx.autoSaveStatus = 'saved';
                return;
            }

            var method = ctx.editingId ? 'PUT' : 'POST';
            var url = ctx.editingId ? ('/api/posts/' + ctx.editingId) : '/api/posts';

            var payload = {
                id: ctx.editingId || undefined,
                title: ctx.form.title || 'Draf Tanpa Judul',
                slug: ctx.form.slug || (ctx.form.title ? ctx.sanitizeSlug(ctx.form.title) : ('draft-' + Date.now())),
                body: ctx.form.body || '',
                excerpt: ctx.form.excerpt || '',
                meta_title: ctx.form.meta_title || '',
                meta_description: ctx.form.meta_description || '',
                og_image: ctx.form.og_image || '',
                status: 'draft',
                category: ctx.form.category || 'Berita',
                tags: ctx.form.tags || '',
                featured_image: ctx.form.featured_image || '',
                type: ctx.form.type || 'post',
                video_url: ctx.form.video_url || ''
            };

            var res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                var r = await res.json();
                var newId = r.id || ctx.editingId;
                if (newId && !ctx.editingId) {
                    ctx.editingId = newId;
                    if (typeof window !== 'undefined') {
                        window.editingId = newId;
                        if (window.history && window.history.replaceState) {
                            window.history.replaceState(null, '', '#edit-' + newId);
                        }
                    }
                    this.clearLocal('new');
                }
                var now = new Date();
                ctx.lastSavedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                ctx.autoSaveStatus = 'saved';
            }
        } catch (e) {
            console.warn('[AutoSave Server Sync Error]', e);
        } finally {
            ctx.isAutoSaving = false;
        }
    },

    saveDraftManual: async function(ctx) {
        if (!ctx) return;
        ctx.form.status = 'draft';
        if (typeof window !== 'undefined' && window.showToast) {
            window.showToast('Menyimpan draf ke server...', 'info');
        }
        await ctx.save();
        this.clearLocal(ctx.editingId);
        var now = new Date();
        ctx.lastSavedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        ctx.autoSaveStatus = 'saved';
    }
};
`;
