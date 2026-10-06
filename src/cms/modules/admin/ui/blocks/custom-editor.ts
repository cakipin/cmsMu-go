export const customEditorTemplate = `
<div x-data="customEditorLogic()" 
     x-init="initEditor(form.body)" 
     class="custom-editor-wrapper" 
     style="display: flex; flex-direction: column; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; width: 100%;">
    
    <!-- Top Bar: Media Button (Left) & Mode Tabs Visual / HTML (Right) -->
    <div class="editor-top-bar">
        <div>
            <button type="button" @click="openMediaManager()" class="editor-media-btn" title="Tambah Media">
                <i class="fas fa-photo-video" style="color: #2563eb;"></i> <span>Add Media</span>
            </button>
        </div>

        <div style="display: flex; gap: 4px; align-items: flex-end;">
            <button type="button" @click="setMode('visual')" 
                    class="editor-tab-btn" 
                    :class="{ 'active': editorMode === 'visual' }">
                <i class="fas fa-eye" style="font-size: 11px;"></i> <span>Visual</span>
            </button>
            <button type="button" @click="setMode('html')" 
                    class="editor-tab-btn" 
                    :class="{ 'active': editorMode === 'html' }">
                <i class="fas fa-code" style="font-size: 11px;"></i> <span>Text / HTML</span>
            </button>
        </div>
    </div>

    <!-- Main Editor Box -->
    <div class="custom-editor-container" style="border: 1px solid #cbd5e1; border-radius: 0 6px 6px 6px; background: #fff; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
        <!-- WP Classic Style Toolbar (Shown in Visual Mode Only) -->
        <div x-show="editorMode === 'visual'" class="editor-toolbar">
            <select @change="execCmd('formatBlock', $event.target.value); $event.target.value=''" class="editor-select" title="Format">
                <option value="">Paragraph</option>
                <option value="H2">Heading 2</option>
                <option value="H3">Heading 3</option>
                <option value="H4">Heading 4</option>
                <option value="BLOCKQUOTE">Quote</option>
            </select>
            
            <span class="toolbar-divider"></span>

            <button type="button" @click="execCmd('bold')" class="editor-btn" :class="{'active': activeFormats.bold}" title="Bold"><i class="fas fa-bold"></i></button>
            <button type="button" @click="execCmd('italic')" class="editor-btn" :class="{'active': activeFormats.italic}" title="Italic"><i class="fas fa-italic"></i></button>
            <button type="button" @click="execCmd('underline')" class="editor-btn" :class="{'active': activeFormats.underline}" title="Underline"><i class="fas fa-underline"></i></button>
            <button type="button" @click="execCmd('strikeThrough')" class="editor-btn" :class="{'active': activeFormats.strikeThrough}" title="Strikethrough"><i class="fas fa-strikethrough"></i></button>
            
            <span class="toolbar-divider"></span>
            
            <button type="button" @click="execCmd('insertUnorderedList')" class="editor-btn" :class="{'active': activeFormats.ul}" title="Bulleted List"><i class="fas fa-list-ul"></i></button>
            <button type="button" @click="execCmd('insertOrderedList')" class="editor-btn" :class="{'active': activeFormats.ol}" title="Numbered List"><i class="fas fa-list-ol"></i></button>
            
            <span class="toolbar-divider"></span>
            
            <button type="button" @click="execCmd('justifyLeft')" class="editor-btn" :class="{'active': activeFormats.alignLeft}" title="Align Left"><i class="fas fa-align-left"></i></button>
            <button type="button" @click="execCmd('justifyCenter')" class="editor-btn" :class="{'active': activeFormats.alignCenter}" title="Align Center"><i class="fas fa-align-center"></i></button>
            <button type="button" @click="execCmd('justifyRight')" class="editor-btn" :class="{'active': activeFormats.alignRight}" title="Align Right"><i class="fas fa-align-right"></i></button>
            <button type="button" @click="execCmd('justifyFull')" class="editor-btn" :class="{'active': activeFormats.alignJustify}" title="Justify"><i class="fas fa-align-justify"></i></button>

            <span class="toolbar-divider"></span>
            
            <!-- Link Dropdown Wrapper -->
            <div style="position:relative; display:inline-flex; align-items:center;">
                <button type="button" @click="promptLink()" class="editor-btn" :class="{'active': linkModalOpen}" title="Add Link"><i class="fas fa-link"></i></button>
                
                <!-- Dropdown Popover muncul di bawah tombol -->
                <div x-show="linkModalOpen" x-cloak
                     @keydown.escape.window="closeLinkModal()"
                     style="position:absolute; top:calc(100% + 6px); left:0; z-index:9999; background:#fff; border:1px solid #c3c4c7; border-radius:6px; padding:12px; width:280px; box-shadow:0 4px 15px rgba(0,0,0,0.15);">
                    <div style="font-size:12px; font-weight:600; color:#1d2327; margin-bottom:8px;">Masukkan URL</div>
                    <input x-model="linkUrl" @keydown.enter="confirmLinkModal()" type="url" placeholder="https://example.com"
                           style="width:100%; padding:7px 9px; border:1px solid #8c8f94; border-radius:3px; font-size:13px; box-sizing:border-box; outline:none;"
                           onfocus="this.style.borderColor='#2271b1'" onblur="this.style.borderColor='#8c8f94'">
                    <div style="display:flex; gap:6px; margin-top:8px;">
                        <button type="button" @click="closeLinkModal()" style="flex:1; padding:6px; background:#f0f0f1; border:1px solid #c3c4c7; border-radius:3px; cursor:pointer; font-size:12px;">Batal</button>
                        <button type="button" @click="confirmLinkModal()" style="flex:2; padding:6px; background:#2271b1; color:#fff; border:none; border-radius:3px; cursor:pointer; font-size:12px; font-weight:600;">Tambah Link</button>
                    </div>
                </div>
            </div>
            <button type="button" @click="execCmd('unlink')" class="editor-btn" title="Remove Link"><i class="fas fa-unlink"></i></button>
            <span class="toolbar-divider"></span>
            <button type="button" @click="cleanEditor()" class="editor-btn" title="Bersihkan Format Sampah (Clean HTML)"><i class="fas fa-broom" style="color: #0d9488;"></i></button>
        </div>

        <!-- The ContentEditable Editor (Visual Mode) -->
        <div x-show="editorMode === 'visual'"
             x-ref="editor" 
             contenteditable="true" 
             class="modern-editor-content"
             style="min-height: 400px; padding: 20px; outline: none; font-size: 16px; line-height: 1.6; color: #2c3338; background: #fff; overflow-y: auto; max-height: 700px;"
             @mouseup="checkSelection" 
             @keyup="checkSelection(); updateContent()"
             @input="updateContent()"
             @keydown.enter="handleEnter"
             @paste="handlePaste($event)">
        </div>

        <!-- The Raw HTML Source Editor (HTML Mode) -->
        <div x-show="editorMode === 'html'" style="display: none; background: #f8fafc; border-top: 1px solid #c3c4c7;">
            <textarea x-ref="htmlSource"
                      x-model="form.body"
                      @input="onHtmlInput()"
                      placeholder="Ketik atau tempel kode HTML di sini..."
                      style="width: 100%; min-height: 420px; padding: 16px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 13px; line-height: 1.6; color: #0f172a; background: #f8fafc; border: none; outline: none; resize: vertical; box-sizing: border-box;"></textarea>
        </div>

        <style>
            .editor-top-bar {
                display: flex !important;
                justify-content: space-between !important;
                align-items: flex-end !important;
                margin-bottom: -1px !important;
                z-index: 2 !important;
                width: 100% !important;
            }
            .editor-tab-btn {
                display: inline-flex !important;
                align-items: center !important;
                gap: 6px !important;
                border: 1px solid #cbd5e1 !important;
                border-bottom: 1px solid #cbd5e1 !important;
                border-radius: 6px 6px 0 0 !important;
                padding: 6px 14px !important;
                font-size: 12px !important;
                font-weight: 500 !important;
                color: #64748b !important;
                background: #f1f5f9 !important;
                cursor: pointer !important;
                transition: all 0.15s ease !important;
                outline: none !important;
                line-height: 1.2 !important;
                text-decoration: none !important;
            }
            .editor-tab-btn:hover {
                background: #e2e8f0 !important;
                color: #1e293b !important;
            }
            .editor-tab-btn.active {
                background: #ffffff !important;
                border-color: #cbd5e1 !important;
                border-bottom-color: #ffffff !important;
                color: #0f172a !important;
                font-weight: 700 !important;
            }
            .editor-media-btn {
                display: inline-flex !important;
                align-items: center !important;
                gap: 6px !important;
                background: #ffffff !important;
                border: 1px solid #cbd5e1 !important;
                border-bottom-color: #ffffff !important;
                border-radius: 6px 6px 0 0 !important;
                padding: 6px 14px !important;
                font-size: 13px !important;
                font-weight: 600 !important;
                color: #1e293b !important;
                cursor: pointer !important;
                box-shadow: 0 -1px 2px rgba(0,0,0,0.02) !important;
                outline: none !important;
            }
            .editor-media-btn:hover {
                background: #f8fafc !important;
            }
            .editor-toolbar {
                display: flex !important;
                flex-direction: row !important;
                flex-wrap: wrap !important;
                align-items: center !important;
                gap: 4px !important;
                padding: 6px 10px !important;
                background: #f8fafc !important;
                border-bottom: 1px solid #e2e8f0 !important;
                box-sizing: border-box !important;
            }
            .editor-toolbar select.editor-select {
                display: inline-block !important;
                height: 28px !important;
                padding: 2px 8px !important;
                border: 1px solid #cbd5e1 !important;
                border-radius: 4px !important;
                background: #ffffff !important;
                font-size: 12px !important;
                font-weight: 500 !important;
                color: #334155 !important;
                cursor: pointer !important;
                outline: none !important;
                flex-shrink: 0 !important;
            }
            .editor-toolbar button.editor-btn {
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                width: 28px !important;
                height: 28px !important;
                min-width: 28px !important;
                max-width: 28px !important;
                padding: 0 !important;
                color: #475569 !important;
                background: transparent !important;
                border: 1px solid transparent !important;
                border-radius: 4px !important;
                cursor: pointer !important;
                transition: all 0.15s ease !important;
                font-size: 13px !important;
                flex-shrink: 0 !important;
                outline: none !important;
            }
            .editor-toolbar button.editor-btn:hover {
                background: #ffffff !important;
                border-color: #cbd5e1 !important;
                color: #0f172a !important;
                box-shadow: 0 1px 2px rgba(0,0,0,0.05) !important;
            }
            .editor-toolbar button.editor-btn.active {
                background: #e2e8f0 !important;
                border-color: #94a3b8 !important;
                color: #1e40af !important;
            }
            .editor-toolbar .toolbar-divider {
                display: inline-block !important;
                width: 1px !important;
                height: 18px !important;
                background: #cbd5e1 !important;
                margin: 0 3px !important;
                flex-shrink: 0 !important;
            }

            .modern-editor-content { font-family: inherit; }
            .modern-editor-content h2 { font-size: 1.8em; font-weight: 600; margin-top: 1.2em; margin-bottom: 0.5em; line-height: 1.3; color: #1d2327; }
            .modern-editor-content h3 { font-size: 1.5em; font-weight: 600; margin-top: 1.2em; margin-bottom: 0.5em; line-height: 1.3; color: #1d2327; }
            .modern-editor-content h4 { font-size: 1.2em; font-weight: 600; margin-top: 1em; margin-bottom: 0.5em; line-height: 1.3; color: #1d2327; }
            .modern-editor-content p { margin-bottom: 1em; }
            .modern-editor-content blockquote { border-left: 4px solid #72aee6; padding-left: 16px; color: #50575e; font-style: italic; margin: 1.5em 0; background: #f6f7f7; padding: 12px 16px; }
            .modern-editor-content a { color: #2271b1; text-decoration: underline; }
            .modern-editor-content a:hover { color: #135e96; }
            .modern-editor-content img { max-width: 100%; height: auto; border-radius: 4px; margin: 1em 0; display: block; cursor: pointer; transition: outline 0.15s, box-shadow 0.15s; }
            .modern-editor-content img.img-selected { outline: 3px solid #2563eb; outline-offset: 2px; box-shadow: 0 0 0 6px rgba(37,99,235,0.15); border-radius: 4px; }
            .modern-editor-content ul { list-style-type: disc; padding-left: 24px; margin-bottom: 1em; }
            .modern-editor-content ol { list-style-type: decimal; padding-left: 24px; margin-bottom: 1em; }
            .modern-editor-content:empty:before { content: 'Mulai menulis atau ketik / untuk memilih blok'; color: #8c8f94; pointer-events: none; display: block; }
            
            .img-toolbar-btn {
                padding: 7px 10px; color: rgba(255,255,255,0.8); background: transparent; border: none; border-radius: 5px; cursor: pointer;
                transition: all 0.15s; font-size: 13px; display: flex; align-items: center; justify-content: center;
            }
            .img-toolbar-btn:hover { background: rgba(255,255,255,0.15); color: #fff; }
            .img-toolbar-active { background: rgba(255,255,255,0.2) !important; color: #60a5fa !important; }
            .img-toolbar-delete { color: #f87171 !important; }
            .img-toolbar-delete:hover { background: rgba(239,68,68,0.2) !important; color: #fca5a5 !important; }
        </style>
    </div>
</div>
`;

export const customEditorLogicScript = `
function customEditorLogic() {
    return {
        activeFormats: { 
            bold: false, italic: false, underline: false, strikeThrough: false,
            ul: false, ol: false, alignLeft: false, alignCenter: false, alignRight: false, alignJustify: false 
        },
        savedSelection: null,
        linkModalOpen: false,
        linkUrl: '',
        
        selectedImage: null,
        _imgToolbar: null,
        
        initEditor(initialContent) {
            this.$watch('form.body', (val) => {
                if(this.$refs.editor.innerHTML !== val && document.activeElement !== this.$refs.editor) {
                    this.$refs.editor.innerHTML = val || '<p><br></p>';
                }
            });
            setTimeout(() => {
                if (this.$refs.editor && !this.$refs.editor.innerHTML.trim()) {
                    this.$refs.editor.innerHTML = initialContent || '<p><br></p>';
                }
            }, 100);
            
            // Create image toolbar element (pure DOM, no Alpine dependency)
            if (!this._imgToolbar) {
                const tb = document.createElement('div');
                tb.className = 'img-floating-toolbar';
                tb.style.cssText = 'position:fixed; z-index:99999; background:#1e293b; border-radius:8px; padding:4px 6px; display:none; gap:2px; box-shadow:0 8px 25px rgba(0,0,0,0.25); pointer-events:auto;';
                tb.innerHTML = 
                    '<button class="img-toolbar-btn" data-align="left" title="Rata Kiri"><i class="fas fa-align-left"></i></button>' +
                    '<button class="img-toolbar-btn" data-align="center" title="Tengah"><i class="fas fa-align-center"></i></button>' +
                    '<button class="img-toolbar-btn" data-align="right" title="Rata Kanan"><i class="fas fa-align-right"></i></button>' +
                    '<span style="width:1px; background:rgba(255,255,255,0.2); margin:4px 2px;"></span>' +
                    '<button class="img-toolbar-btn" data-align="none" title="Reset"><i class="fas fa-undo"></i></button>' +
                    '<button class="img-toolbar-btn img-toolbar-delete" data-action="delete" title="Hapus"><i class="fas fa-trash-alt"></i></button>';
                document.body.appendChild(tb);
                this._imgToolbar = tb;
                
                // Button click handlers
                const self = this;
                tb.querySelectorAll('button[data-align]').forEach(btn => {
                    btn.addEventListener('mousedown', (ev) => {
                        ev.preventDefault();
                        ev.stopPropagation();
                        self.alignImage(btn.dataset.align);
                        self._updateToolbarActive(btn.dataset.align);
                    });
                });
                tb.querySelector('button[data-action="delete"]')?.addEventListener('mousedown', (ev) => {
                    ev.preventDefault();
                    ev.stopPropagation();
                    self.removeImage();
                });
            }
            
            // Image click listener — show floating toolbar above the image
            this.$refs.editor.addEventListener('click', (e) => {
                // Remove previous selection highlight
                this.$refs.editor.querySelectorAll('img.img-selected').forEach(i => i.classList.remove('img-selected'));
                
                if (e.target.tagName === 'IMG') {
                    e.target.classList.add('img-selected');
                    this.selectedImage = e.target;
                    
                    // Detect current alignment
                    const fl = e.target.style.float;
                    const mx = e.target.style.margin;
                    let align = 'none';
                    if (fl === 'left') align = 'left';
                    else if (fl === 'right') align = 'right';
                    else if (mx && mx.includes('auto')) align = 'center';
                    
                    // Position toolbar centered above the image
                    const rect = e.target.getBoundingClientRect();
                    const tb = this._imgToolbar;
                    tb.style.display = 'flex';
                    const top = Math.max(8, rect.top - 44);
                    tb.style.top = top + 'px';
                    tb.style.left = (rect.left + rect.width / 2) + 'px';
                    tb.style.transform = 'translateX(-50%)';
                    this._updateToolbarActive(align);
                } else {
                    this._hideToolbar();
                }
            });
            
            // Hide toolbar on scroll
            this.$refs.editor.addEventListener('scroll', () => this._hideToolbar());
            // Hide on click outside editor
            document.addEventListener('click', (e) => {
                if (this._imgToolbar && !this._imgToolbar.contains(e.target) && !this.$refs.editor?.contains(e.target)) {
                    this._hideToolbar();
                }
            });
            
            // Listen for image insertion from Media Manager (kita perlu trigger dari luar)
            window.addEventListener('insert-media', (e) => {
                const url = e.detail.url;
                if(url) {
                    this.restoreSelection();
                    const imgHtml = \`<img src="\${url}" alt="Image" />\`;
                    document.execCommand('insertHTML', false, imgHtml);
                    this.updateContent();
                }
            });
        },
        
        editorMode: 'visual',
        _autoExcerpt: '',
        _autoDesc: '',
        
        // ==========================================
        // SMART HTML SANITIZER & CLEANER (DOM-BASED)
        // ==========================================
        cleanHtml(rawHtml) {
            if (!rawHtml || typeof rawHtml !== 'string') return '';
            try {
                var parser = new DOMParser();
                var doc = parser.parseFromString(rawHtml, 'text/html');
                var body = doc.body;

                // 1. Hapus tag sampah & berbahaya
                var trash = body.querySelectorAll('script, style, meta, link, noscript, xml, object, embed, iframe:not([src*="youtube"]):not([src*="vimeo"])');
                trash.forEach(function(el) { el.remove(); });

                // 2. Fungsi rekursif pembersih node
                function sanitizeNode(node) {
                    if (node.nodeType === 1) {
                        var el = node;
                        var tag = el.tagName.toLowerCase();

                        // Konversi H1 menjadi H2 (H1 untuk judul utama)
                        if (tag === 'h1') {
                            var h2 = doc.createElement('h2');
                            while (el.firstChild) h2.appendChild(el.firstChild);
                            el.parentNode && el.parentNode.replaceChild(h2, el);
                            return sanitizeNode(h2);
                        }

                        // Unwrap span berlebih
                        if (tag === 'span') {
                            var fw = (el.style.fontWeight || '').toLowerCase();
                            var fs = (el.style.fontStyle || '').toLowerCase();
                            var isBold = fw === 'bold' || fw === 'bolder' || parseInt(fw) >= 600;
                            var isItalic = fs === 'italic';

                            if (isBold && isItalic) {
                                var strong = doc.createElement('strong');
                                var em = doc.createElement('em');
                                while (el.firstChild) em.appendChild(el.firstChild);
                                strong.appendChild(em);
                                el.parentNode && el.parentNode.replaceChild(strong, el);
                                return sanitizeNode(strong);
                            } else if (isBold) {
                                var strongEl = doc.createElement('strong');
                                while (el.firstChild) strongEl.appendChild(el.firstChild);
                                el.parentNode && el.parentNode.replaceChild(strongEl, el);
                                return sanitizeNode(strongEl);
                            } else if (isItalic) {
                                var emEl = doc.createElement('em');
                                while (el.firstChild) emEl.appendChild(el.firstChild);
                                el.parentNode && el.parentNode.replaceChild(emEl, el);
                                return sanitizeNode(emEl);
                            } else {
                                var parent = el.parentNode;
                                if (parent) {
                                    while (el.firstChild) parent.insertBefore(el.firstChild, el);
                                    parent.removeChild(el);
                                    return;
                                }
                            }
                        }

                        // Bersihkan seluruh atribut sampah (data-*, aria-*, id, class luar, dll)
                        var attrs = Array.from(el.attributes);
                        for (var i = 0; i < attrs.length; i++) {
                            var attrName = attrs[i].name.toLowerCase();
                            if (attrName.indexOf('data-') === 0 || attrName.indexOf('aria-') === 0 || attrName.indexOf('on') === 0 || attrName === 'id') {
                                el.removeAttribute(attrs[i].name);
                            } else if (attrName === 'class') {
                                if (attrs[i].value.indexOf('img-selected') === -1) {
                                    el.removeAttribute('class');
                                }
                            } else if (attrName === 'style') {
                                var textAlign = el.style.textAlign;
                                var floatVal = el.style.float;
                                var marginVal = el.style.margin;

                                el.removeAttribute('style');
                                if (textAlign && ['left', 'center', 'right', 'justify'].indexOf(textAlign) !== -1) {
                                    el.style.textAlign = textAlign;
                                }
                                if (tag === 'img') {
                                    if (floatVal) el.style.float = floatVal;
                                    if (marginVal) el.style.margin = marginVal;
                                }
                            }
                        }

                        // Bersihkan anak-anaknya secara rekursif
                        var children = Array.from(el.childNodes);
                        for (var j = 0; j < children.length; j++) {
                            sanitizeNode(children[j]);
                        }
                    }
                }

                var rootChildren = Array.from(body.childNodes);
                for (var k = 0; k < rootChildren.length; k++) {
                    sanitizeNode(rootChildren[k]);
                }

                return body.innerHTML.trim();
            } catch (err) {
                console.error('[Editor Sanitizer Error]', err);
                return rawHtml;
            }
        },

        // Handler Smart Paste untuk event @paste
        handlePaste(e) {
            e.preventDefault();
            var clipboard = e.clipboardData || window.clipboardData;
            if (!clipboard) return;

            var html = clipboard.getData('text/html');
            var text = clipboard.getData('text/plain');

            if (html && html.trim()) {
                var clean = this.cleanHtml(html);
                document.execCommand('insertHTML', false, clean);
            } else if (text && text.trim()) {
                var rawLines = text.split(String.fromCharCode(10));
                var blocks = [];
                var currentBlock = [];
                for (var i = 0; i < rawLines.length; i++) {
                    var line = rawLines[i].trim();
                    if (!line) {
                        if (currentBlock.length > 0) {
                            blocks.push('<p>' + currentBlock.join('<br>') + '</p>');
                            currentBlock = [];
                        }
                    } else {
                        currentBlock.push(line);
                    }
                }
                if (currentBlock.length > 0) {
                    blocks.push('<p>' + currentBlock.join('<br>') + '</p>');
                }
                var pContent = blocks.length > 0 ? blocks.join('') : ('<p>' + text + '</p>');
                document.execCommand('insertHTML', false, pContent);
            }
            this.updateContent();
        },

        // Tombol Bersihkan Format (Sapu) di toolbar
        cleanEditor() {
            var raw = (this.$refs.editor ? this.$refs.editor.innerHTML : '') || (this.form ? this.form.body : '');
            var cleaned = this.cleanHtml(raw);
            if (this.$refs.editor) {
                this.$refs.editor.innerHTML = cleaned || '<p><br></p>';
            }
            if (this.$refs.htmlSource) {
                this.$refs.htmlSource.value = cleaned;
            }
            if (this.form) {
                this.form.body = cleaned;
            }
            this.autoFillSeo();
            if (window.showToast) {
                window.showToast('Kode HTML berhasil dibersihkan dari format sampah!', 'success');
            }
        },

        setMode(m) {
            if (m === 'html') {
                this.updateContent();
                var raw = this.form ? this.form.body : '';
                var cleaned = this.cleanHtml(raw);
                if (this.form) this.form.body = cleaned;
                if (this.$refs.editor) this.$refs.editor.innerHTML = cleaned || '<p><br></p>';
                this.editorMode = 'html';
                this.$nextTick(() => {
                    if (this.$refs.htmlSource) {
                        this.$refs.htmlSource.value = cleaned;
                        this.$refs.htmlSource.focus();
                    }
                });
            } else {
                this.editorMode = 'visual';
                if (this.$refs.editor) {
                    var raw = this.form ? this.form.body : '';
                    var cleaned = this.cleanHtml(raw);
                    this.$refs.editor.innerHTML = cleaned || '<p><br></p>';
                    this.$refs.editor.focus();
                }
            }
        },
        
        onHtmlInput() {
            if (this.$refs.editor) {
                this.$refs.editor.innerHTML = this.form.body || '<p><br></p>';
            }
            this.autoFillSeo();
        },

        autoFillSeo() {
            if (!this.form) return;
            const text = (this.$refs.editor ? (this.$refs.editor.innerText || this.$refs.editor.textContent || '') : '')
                .replace(/\s+/g, ' ').trim();
            if (text) {
                const snippet = text.slice(0, 160);
                if (!this.form.excerpt || this.form.excerpt === this._autoExcerpt) {
                    this.form.excerpt = snippet;
                    this._autoExcerpt = snippet;
                }
                if (!this.form.meta_description || this.form.meta_description === this._autoDesc) {
                    this.form.meta_description = snippet;
                    this._autoDesc = snippet;
                }
            }
        },

        updateContent() {
            if (this.$refs.editor) {
                this.form.body = this.$refs.editor.innerHTML;
            }
            this.autoFillSeo();
        },
        
        checkSelection() {
            this.updateActiveFormats();
            this.saveSelection();
        },
        
        updateActiveFormats() {
            this.activeFormats = {
                bold: document.queryCommandState('bold'),
                italic: document.queryCommandState('italic'),
                underline: document.queryCommandState('underline'),
                strikeThrough: document.queryCommandState('strikeThrough'),
                ul: document.queryCommandState('insertUnorderedList'),
                ol: document.queryCommandState('insertOrderedList'),
                alignLeft: document.queryCommandState('justifyLeft'),
                alignCenter: document.queryCommandState('justifyCenter'),
                alignRight: document.queryCommandState('justifyRight'),
                alignJustify: document.queryCommandState('justifyFull')
            };
        },
        
        execCmd(command, value = null) {
            this.restoreSelection();
            if (command === 'formatBlock') {
                document.execCommand(command, false, \`<\${value}>\`);
            } else {
                document.execCommand(command, false, value);
            }
            this.updateActiveFormats();
            this.updateContent();
            this.$refs.editor.focus();
        },
        
        promptLink() {
            this.saveSelection(); // simpan posisi cursor sebelum focus pindah ke input
            this.linkUrl = '';
            this.linkModalOpen = true;
            // auto focus input setelah render
            this.$nextTick(() => {
                const inp = this.$el.querySelector('input[type="url"]');
                if (inp) inp.focus();
            });
        },
        
        closeLinkModal() {
            this.linkModalOpen = false;
            this.linkUrl = '';
        },
        
        confirmLinkModal() {
            if (this.linkUrl) {
                this.restoreSelection();
                document.execCommand('createLink', false, this.linkUrl);
                this.updateContent();
            }
            this.linkModalOpen = false;
        },

        openMediaManager() {
            this.saveSelection(); // Ensure we know where to insert
            
            // Trigger the media manager modal inside Alpine parent
            // We can dispatch a custom event that editor.page.ts listens to
            window.dispatchEvent(new CustomEvent('open-editor-media'));
        },

        handleEnter(e) {
            // Default behavior for contenteditable usually handles paragraph breaks nicely in modern browsers
            this.updateContent();
        },
        
        alignImage(pos) {
            if (!this.selectedImage) return;
            this.selectedImage.style.float = '';
            this.selectedImage.style.display = '';
            this.selectedImage.style.margin = '';
            
            if (pos === 'left') {
                this.selectedImage.style.float = 'left';
                this.selectedImage.style.margin = '0 1em 1em 0';
            } else if (pos === 'right') {
                this.selectedImage.style.float = 'right';
                this.selectedImage.style.margin = '0 0 1em 1em';
            } else if (pos === 'center') {
                this.selectedImage.style.display = 'block';
                this.selectedImage.style.margin = '1em auto';
            }
            this.updateContent();
        },
        
        removeImage() {
            if (!this.selectedImage) return;
            this.selectedImage.remove();
            this._hideToolbar();
            this.updateContent();
        },
        
        _hideToolbar() {
            if (this._imgToolbar) this._imgToolbar.style.display = 'none';
            this.selectedImage = null;
            this.$refs.editor?.querySelectorAll('img.img-selected').forEach(i => i.classList.remove('img-selected'));
        },
        
        _updateToolbarActive(align) {
            if (!this._imgToolbar) return;
            this._imgToolbar.querySelectorAll('.img-toolbar-btn[data-align]').forEach(btn => {
                btn.classList.toggle('img-toolbar-active', btn.dataset.align === align);
            });
        },
        
        saveSelection() {
            const sel = window.getSelection();
            if (sel.getRangeAt && sel.rangeCount) {
                this.savedSelection = sel.getRangeAt(0);
            }
        },
        restoreSelection() {
            if (this.savedSelection) {
                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(this.savedSelection);
            } else {
                this.$refs.editor.focus();
            }
        }
    };
}
`;
