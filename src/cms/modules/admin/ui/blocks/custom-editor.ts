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
            
            <!-- Format Dropdown (WP Classic Style - Anti Focus Theft) -->
            <div style="position:relative; display:inline-flex; align-items:center;" @click.outside="formatDropdownOpen = false">
                <button type="button" 
                        @mousedown.prevent 
                        @click="formatDropdownOpen = !formatDropdownOpen" 
                        class="editor-format-btn" 
                        title="Pilih Format Blok Teks">
                    <span x-text="formatLabels[currentBlockFormat] || 'Paragraph'">Paragraph</span>
                    <i class="fas fa-chevron-down" style="font-size: 9px; margin-left: 6px; opacity: 0.6;"></i>
                </button>

                <!-- Format Dropdown Menu -->
                <div x-show="formatDropdownOpen" x-cloak
                     style="position:absolute; top:calc(100% + 4px); left:0; z-index:9999; background:#ffffff; border:1px solid #cbd5e1; border-radius:6px; min-width:145px; box-shadow:0 4px 16px rgba(0,0,0,0.12); padding:4px 0;">
                    <button type="button" @mousedown.prevent @click="setBlockFormat('p')" class="editor-dropdown-item" :class="{'active': currentBlockFormat === 'p'}">Paragraph</button>
                    <button type="button" @mousedown.prevent @click="setBlockFormat('h2')" class="editor-dropdown-item" :class="{'active': currentBlockFormat === 'h2'}" style="font-size:15px; font-weight:700;">Heading 2</button>
                    <button type="button" @mousedown.prevent @click="setBlockFormat('h3')" class="editor-dropdown-item" :class="{'active': currentBlockFormat === 'h3'}" style="font-size:14px; font-weight:600;">Heading 3</button>
                    <button type="button" @mousedown.prevent @click="setBlockFormat('h4')" class="editor-dropdown-item" :class="{'active': currentBlockFormat === 'h4'}" style="font-size:13px; font-weight:600;">Heading 4</button>
                    <button type="button" @mousedown.prevent @click="setBlockFormat('blockquote')" class="editor-dropdown-item" :class="{'active': currentBlockFormat === 'blockquote'}" style="font-style:italic;">Quote</button>
                </div>
            </div>
            
            <span class="toolbar-divider"></span>

            <button type="button" @mousedown.prevent @click="execCmd('bold')" class="editor-btn" :class="{'active': activeFormats.bold}" title="Tebal (Bold)"><i class="fas fa-bold"></i></button>
            <button type="button" @mousedown.prevent @click="execCmd('italic')" class="editor-btn" :class="{'active': activeFormats.italic}" title="Miring (Italic)"><i class="fas fa-italic"></i></button>
            <button type="button" @mousedown.prevent @click="execCmd('underline')" class="editor-btn" :class="{'active': activeFormats.underline}" title="Garis Bawah (Underline)"><i class="fas fa-underline"></i></button>
            <button type="button" @mousedown.prevent @click="execCmd('strikeThrough')" class="editor-btn" :class="{'active': activeFormats.strikeThrough}" title="Coret (Strikethrough)"><i class="fas fa-strikethrough"></i></button>
            
            <span class="toolbar-divider"></span>
            
            <button type="button" @mousedown.prevent @click="execCmd('insertUnorderedList')" class="editor-btn" :class="{'active': activeFormats.ul}" title="Daftar Poin (Bulleted List)"><i class="fas fa-list-ul"></i></button>
            <button type="button" @mousedown.prevent @click="execCmd('insertOrderedList')" class="editor-btn" :class="{'active': activeFormats.ol}" title="Daftar Angka (Numbered List)"><i class="fas fa-list-ol"></i></button>
            
            <span class="toolbar-divider"></span>
            
            <!-- Alignment Buttons (Direct Block Style) -->
            <button type="button" @mousedown.prevent @click="setAlignment('left')" class="editor-btn" :class="{'active': activeFormats.alignLeft}" title="Rata Kiri"><i class="fas fa-align-left"></i></button>
            <button type="button" @mousedown.prevent @click="setAlignment('center')" class="editor-btn" :class="{'active': activeFormats.alignCenter}" title="Rata Tengah"><i class="fas fa-align-center"></i></button>
            <button type="button" @mousedown.prevent @click="setAlignment('right')" class="editor-btn" :class="{'active': activeFormats.alignRight}" title="Rata Kanan"><i class="fas fa-align-right"></i></button>
            <button type="button" @mousedown.prevent @click="setAlignment('justify')" class="editor-btn" :class="{'active': activeFormats.alignJustify}" title="Rata Kiri-Kanan (Justify)"><i class="fas fa-align-justify"></i></button>

            <span class="toolbar-divider"></span>
            
            <!-- Link Dropdown Wrapper -->
            <div style="position:relative; display:inline-flex; align-items:center;">
                <button type="button" @mousedown.prevent @click="promptLink()" class="editor-btn" :class="{'active': linkModalOpen}" title="Tambah Link"><i class="fas fa-link"></i></button>
                
                <!-- Dropdown Popover muncul di bawah tombol -->
                <div x-show="linkModalOpen" x-cloak
                     @click.outside="closeLinkModal()"
                     @keydown.escape.window="closeLinkModal()"
                     style="position:absolute; top:calc(100% + 6px); left:0; z-index:9999; background:#fff; border:1px solid #c3c4c7; border-radius:6px; padding:12px; width:280px; box-shadow:0 4px 15px rgba(0,0,0,0.15);">
                    <div style="font-size:12px; font-weight:600; color:#1d2327; margin-bottom:8px;">Masukkan URL Link</div>
                    <input x-model="linkUrl" @keydown.enter.prevent="confirmLinkModal()" type="url" placeholder="https://example.com"
                           style="width:100%; padding:7px 9px; border:1px solid #8c8f94; border-radius:3px; font-size:13px; box-sizing:border-box; outline:none;"
                           onfocus="this.style.borderColor='#2271b1'" onblur="this.style.borderColor='#8c8f94'">
                    <div style="display:flex; gap:6px; margin-top:8px;">
                        <button type="button" @click="closeLinkModal()" style="flex:1; padding:6px; background:#f0f0f1; border:1px solid #c3c4c7; border-radius:3px; cursor:pointer; font-size:12px;">Batal</button>
                        <button type="button" @click="confirmLinkModal()" style="flex:2; padding:6px; background:#2271b1; color:#fff; border:none; border-radius:3px; cursor:pointer; font-size:12px; font-weight:600;">Tambah Link</button>
                    </div>
                </div>
            </div>
            <button type="button" @mousedown.prevent @click="execCmd('unlink')" class="editor-btn" title="Hapus Link"><i class="fas fa-unlink"></i></button>
            <span class="toolbar-divider"></span>
            <button type="button" @mousedown.prevent @click="cleanEditor()" class="editor-btn" title="Bersihkan Format Sampah (Clean HTML)"><i class="fas fa-broom" style="color: #0d9488;"></i></button>
            <span class="toolbar-divider"></span>
            <button type="button" 
                    @mousedown.prevent 
                    @click="tidyWithAi()" 
                    class="editor-btn editor-btn-ai" 
                    :disabled="isAiTidying" 
                    title="✨ AI Rapikan Paragraf & Struktur SEO (Pecah paragraf panjang, buat sub-heading H2)">
                <i class="fas fa-wand-magic-sparkles" :class="isAiTidying ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'"></i>
                <span class="ai-text" x-text="isAiTidying ? 'Merapikan...' : 'Rapikan'">Rapikan</span>
            </button>
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
             @keydown.enter="handleEnter($event)"
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
            .editor-format-btn {
                display: inline-flex !important;
                align-items: center !important;
                justify-content: space-between !important;
                height: 28px !important;
                padding: 2px 10px !important;
                border: 1px solid #cbd5e1 !important;
                border-radius: 4px !important;
                background: #ffffff !important;
                font-size: 12px !important;
                font-weight: 500 !important;
                color: #334155 !important;
                cursor: pointer !important;
                outline: none !important;
                flex-shrink: 0 !important;
                transition: all 0.15s ease !important;
            }
            .editor-format-btn:hover {
                background: #f8fafc !important;
                border-color: #94a3b8 !important;
            }
            .editor-dropdown-item {
                display: block !important;
                width: 100% !important;
                text-align: left !important;
                padding: 6px 12px !important;
                background: transparent !important;
                border: none !important;
                font-size: 13px !important;
                color: #334155 !important;
                cursor: pointer !important;
                transition: background 0.1s ease !important;
                outline: none !important;
            }
            .editor-dropdown-item:hover {
                background: #f1f5f9 !important;
                color: #0f172a !important;
            }
            .editor-dropdown-item.active {
                background: #eff6ff !important;
                color: #2563eb !important;
                font-weight: 600 !important;
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
            .editor-toolbar button.editor-btn-ai {
                color: #7c3aed !important;
                background: #f5f3ff !important;
                border-color: #ddd6fe !important;
                transition: max-width 0.25s ease, padding 0.25s ease, background 0.15s ease !important;
            }
            .editor-toolbar button.editor-btn-ai:hover {
                max-width: 110px !important;
                width: auto !important;
                padding: 0 8px !important;
                background: #ede9fe !important;
                border-color: #c4b5fd !important;
                color: #6d28d9 !important;
                box-shadow: 0 1px 3px rgba(124, 58, 237, 0.2) !important;
            }
            .editor-toolbar button.editor-btn-ai .ai-text {
                font-size: 11px !important;
                font-weight: 600 !important;
                margin-left: 5px !important;
                opacity: 0 !important;
                max-width: 0 !important;
                transition: opacity 0.2s ease, max-width 0.25s ease !important;
                display: inline-block !important;
                overflow: hidden !important;
                color: #6d28d9 !important;
            }
            .editor-toolbar button.editor-btn-ai:hover .ai-text {
                opacity: 1 !important;
                max-width: 70px !important;
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
            .modern-editor-content h2 { font-size: 1.8em; font-weight: 700; margin-top: 1.2em; margin-bottom: 0.5em; line-height: 1.3; color: #1d2327; }
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
            
            /* Explicit Alignment Rules for Editor Content */
            .modern-editor-content [style*="text-align: left"], .modern-editor-content [align="left"] { text-align: left !important; }
            .modern-editor-content [style*="text-align: center"], .modern-editor-content [align="center"] { text-align: center !important; }
            .modern-editor-content [style*="text-align: right"], .modern-editor-content [align="right"] { text-align: right !important; }
            .modern-editor-content [style*="text-align: justify"], .modern-editor-content [align="justify"] { text-align: justify !important; text-justify: inter-word !important; }

            .modern-editor-content:empty:before { content: 'Mulai menulis atau ketik / untuk memilih blok'; color: #8c8f94; pointer-events: none; display: block; }
            
            .img-toolbar-btn {
                padding: 7px 10px; color: rgba(255,255,255,0.8); background: transparent; border: none; border-radius: 5px; cursor: pointer;
                transition: all 0.15s; font-size: 13px; display: flex; align-items: center; justify-content: center;
            }
            .img-toolbar-btn:hover { background: rgba(255,255,255,0.15); color: #fff; }
            .img-toolbar-active { background: rgba(255,255,255,0.2) !important; color: #60a5fa !important; }
            .img-toolbar-delete { color: #f87171 !important; }
            .img-toolbar-delete:hover { background: rgba(239,68,68,0.2) !important; color: #fca5a5 !important; }

            @media (max-width: 640px) {
                .editor-top-bar {
                    flex-wrap: wrap !important;
                    gap: 8px !important;
                    align-items: center !important;
                }
                .editor-media-btn, .editor-tab-btn {
                    padding: 6px 10px !important;
                    font-size: 11px !important;
                }
                .editor-toolbar {
                    padding: 6px !important;
                    gap: 3px !important;
                }
                .editor-toolbar button.editor-btn {
                    width: 32px !important;
                    height: 32px !important;
                    min-width: 32px !important;
                    font-size: 12px !important;
                }
            }
        </style>
    </div>
</div>
`;

export const customEditorLogicScript = `
function customEditorLogic() {
    return {
        editorMode: 'visual',
        currentBlockFormat: 'p',
        formatDropdownOpen: false,
        formatLabels: {
            'p': 'Paragraph',
            'h2': 'Heading 2',
            'h3': 'Heading 3',
            'h4': 'Heading 4',
            'blockquote': 'Quote'
        },
        activeFormats: { 
            bold: false, italic: false, underline: false, strikeThrough: false,
            ul: false, ol: false, alignLeft: false, alignCenter: false, alignRight: false, alignJustify: false 
        },
        savedSelection: null,
        linkModalOpen: false,
        linkUrl: '',
        
        selectedImage: null,
        _imgToolbar: null,
        _isInternalUpdate: false,
        _autoExcerpt: '',
        _autoDesc: '',
        isAiTidying: false,
        
        initEditor(initialContent) {
            try {
                document.execCommand('defaultParagraphSeparator', false, 'p');
            } catch (e) {}

            this.$watch('form.body', (val) => {
                if (this._isInternalUpdate) {
                    this._isInternalUpdate = false;
                    return;
                }
                if (this.$refs.editor && this.$refs.editor.innerHTML !== val) {
                    this.$refs.editor.innerHTML = val || '<p><br></p>';
                }
            });

            setTimeout(() => {
                if (this.$refs.editor && (!this.$refs.editor.innerHTML.trim() || this.$refs.editor.innerHTML === '<p><br></p>')) {
                    if (initialContent) {
                        this.$refs.editor.innerHTML = initialContent;
                    } else if (this.form && this.form.body) {
                        this.$refs.editor.innerHTML = this.form.body;
                    } else {
                        this.$refs.editor.innerHTML = '<p><br></p>';
                    }
                }
                this.updateActiveFormats();
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
            this.$refs.editor?.addEventListener('click', (e) => {
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
            this.$refs.editor?.addEventListener('scroll', () => this._hideToolbar());
            // Hide on click outside editor
            document.addEventListener('click', (e) => {
                if (this._imgToolbar && !this._imgToolbar.contains(e.target) && !this.$refs.editor?.contains(e.target)) {
                    this._hideToolbar();
                }
            });
            
            // Listen for image insertion from Media Manager
            window.addEventListener('insert-media', (e) => {
                const url = e.detail.url;
                if(url) {
                    if (this.$refs.editor) this.$refs.editor.focus();
                    this.restoreSelection();
                    const imgHtml = '<img src="' + url + '" alt="Image" />';
                    document.execCommand('insertHTML', false, imgHtml);
                    this.updateContent();
                }
            });
        },
        
        // ==========================================
        // SMART HTML SANITIZER & CLEANER (DOM-BASED)
        // ==========================================
        cleanHtml(rawHtml) {
            if (!rawHtml || typeof rawHtml !== 'string') return '';
            try {
                var str = rawHtml;
                // 1. Pre-process Regex: Hilangkan komentar HTML (MSO comment, conditional comment)
                str = str.replace(/<!--[\\s\\S]*?-->/g, '');
                // Hilangkan tag XML Word / MSO namespace seperti <o:p>, </o:p>, <w:sdt>, dll
                str = str.replace(/<\\/?(?:o|w|m|v|x):[^>]*>/gi, '');
                // Hilangkan tag xml, style, dan script block
                str = str.replace(new RegExp('<xml[\\\\s\\\\S]*?<\\\\/xml>', 'gi'), '');
                str = str.replace(new RegExp('<style[\\\\s\\\\S]*?<\\\\/style>', 'gi'), '');
                str = str.replace(new RegExp('<script[\\\\s\\\\S]*?<\\\\/script>', 'gi'), '');
                // Hilangkan zero-width spaces / soft hyphens
                str = str.replace(/[\\u200B-\\u200D\\uFEFF]/g, '');

                var parser = new DOMParser();
                var doc = parser.parseFromString(str, 'text/html');
                var body = doc.body;

                // 2. Hapus tag sampah & berbahaya
                var trash = body.querySelectorAll('script, style, meta, link, noscript, xml, object, embed, iframe:not([src*="youtube"]):not([src*="vimeo"])');
                trash.forEach(function(el) { el.remove(); });

                // Helper unwrap node tanpa menghapus anak-anaknya
                function unwrap(el) {
                    var parent = el.parentNode;
                    if (!parent) return;
                    while (el.firstChild) {
                        parent.insertBefore(el.firstChild, el);
                    }
                    parent.removeChild(el);
                }

                // 3. Fungsi rekursif pembersih node
                function sanitizeNode(node) {
                    if (!node) return;
                    if (node.nodeType === 8) { // Comment node
                        node.remove();
                        return;
                    }
                    if (node.nodeType === 1) { // Element node
                        var el = node;
                        var tag = el.tagName.toLowerCase();

                        // Penanganan Google Docs wrapper: <b style="font-weight:normal" id="docs-internal-guid-...">
                        if (tag === 'b' || tag === 'strong') {
                            var fw = (el.style.fontWeight || '').toLowerCase();
                            var isDocsGuid = (el.id && el.id.indexOf('docs-internal-guid') !== -1);
                            if (isDocsGuid || fw === 'normal' || fw === '400') {
                                var children = Array.from(el.childNodes);
                                unwrap(el);
                                for (var c1 = 0; c1 < children.length; c1++) {
                                    sanitizeNode(children[c1]);
                                }
                                return;
                            }
                        }

                        // Konversi H1 menjadi H2 (H1 diperuntukkan bagi judul artikel utama)
                        if (tag === 'h1') {
                            var h2 = doc.createElement('h2');
                            while (el.firstChild) h2.appendChild(el.firstChild);
                            el.parentNode && el.parentNode.replaceChild(h2, el);
                            el = h2;
                            tag = 'h2';
                        }

                        // Unwrap tag font usang
                        if (tag === 'font') {
                            var fontChildren = Array.from(el.childNodes);
                            unwrap(el);
                            for (var c2 = 0; c2 < fontChildren.length; c2++) {
                                sanitizeNode(fontChildren[c2]);
                            }
                            return;
                        }

                        // Tangani kontainer div/section/article
                        if (tag === 'div' || tag === 'section' || tag === 'article') {
                            var hasBlock = el.querySelector('p, h1, h2, h3, h4, h5, h6, div, blockquote, ul, ol, table');
                            if (hasBlock) {
                                var divChildren = Array.from(el.childNodes);
                                unwrap(el);
                                for (var c3 = 0; c3 < divChildren.length; c3++) {
                                    sanitizeNode(divChildren[c3]);
                                }
                                return;
                            } else {
                                var p = doc.createElement('p');
                                var textAlignDiv = el.style.textAlign || el.getAttribute('align') || '';
                                if (textAlignDiv) p.style.textAlign = textAlignDiv;
                                while (el.firstChild) p.appendChild(el.firstChild);
                                el.parentNode && el.parentNode.replaceChild(p, el);
                                el = p;
                                tag = 'p';
                            }
                        }

                        // Unwrap span berlebih atau konversi ke semantic formatting jika ada gaya tebal/miring
                        if (tag === 'span') {
                            var fwSpan = (el.style.fontWeight || '').toLowerCase();
                            var fsSpan = (el.style.fontStyle || '').toLowerCase();
                            var tdSpan = (el.style.textDecoration || '').toLowerCase();
                            var isBold = fwSpan === 'bold' || fwSpan === 'bolder' || parseInt(fwSpan) >= 600;
                            var isItalic = fsSpan === 'italic';
                            var isUnderline = tdSpan.indexOf('underline') !== -1;

                            if (isBold || isItalic || isUnderline) {
                                var wrap = null;
                                if (isBold) {
                                    wrap = doc.createElement('strong');
                                }
                                if (isItalic) {
                                    var em = doc.createElement('em');
                                    if (wrap) wrap.appendChild(em);
                                    else wrap = em;
                                }
                                if (isUnderline) {
                                    var u = doc.createElement('u');
                                    if (wrap) wrap.appendChild(u);
                                    else wrap = u;
                                }
                                var targetLeaf = wrap;
                                while (targetLeaf.firstElementChild) {
                                    targetLeaf = targetLeaf.firstElementChild;
                                }
                                while (el.firstChild) {
                                    targetLeaf.appendChild(el.firstChild);
                                }
                                el.parentNode && el.parentNode.replaceChild(wrap, el);
                                sanitizeNode(wrap);
                                return;
                            } else {
                                var spanChildren = Array.from(el.childNodes);
                                unwrap(el);
                                for (var c4 = 0; c4 < spanChildren.length; c4++) {
                                    sanitizeNode(spanChildren[c4]);
                                }
                                return;
                            }
                        }

                        // Konversi align attribute ke style.textAlign
                        var alignAttr = el.getAttribute('align');
                        if (alignAttr && !el.style.textAlign) {
                            el.style.textAlign = alignAttr.toLowerCase();
                        }

                        // Bersihkan seluruh atribut sampah (data-*, aria-*, on*, id, lang, dir, align, border, dll)
                        var attrs = Array.from(el.attributes);
                        for (var i = 0; i < attrs.length; i++) {
                            var attrName = attrs[i].name.toLowerCase();
                            if (
                                attrName.indexOf('data-') === 0 ||
                                attrName.indexOf('aria-') === 0 ||
                                attrName.indexOf('on') === 0 ||
                                attrName === 'id' ||
                                attrName === 'lang' ||
                                attrName === 'dir' ||
                                attrName === 'align' ||
                                attrName === 'valign' ||
                                attrName === 'border' ||
                                attrName === 'bgcolor' ||
                                attrName === 'color' ||
                                attrName === 'face' ||
                                attrName === 'size'
                            ) {
                                el.removeAttribute(attrs[i].name);
                            } else if (attrName === 'class') {
                                var cls = attrs[i].value;
                                if (cls.indexOf('img-selected') !== -1) {
                                    el.setAttribute('class', 'img-selected');
                                } else {
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
                        var childrenNodes = Array.from(el.childNodes);
                        for (var j = 0; j < childrenNodes.length; j++) {
                            sanitizeNode(childrenNodes[j]);
                        }

                        // Bersihkan tag formatting kosong
                        if (['strong', 'em', 'b', 'i', 'u'].indexOf(tag) !== -1) {
                            if (!el.textContent.trim() && el.children.length === 0) {
                                el.remove();
                            }
                        }
                    }
                }

                var rootChildren = Array.from(body.childNodes);
                for (var k = 0; k < rootChildren.length; k++) {
                    sanitizeNode(rootChildren[k]);
                }

                var cleanResult = body.innerHTML.trim();
                // Rampingkan paragraf kosong berturut-turut
                cleanResult = cleanResult.replace(new RegExp('(<p>(?:\\\\s|&nbsp;|<br\\\\s*\\\\/?>)*<\\\\/p>\\\\s*){2,}', 'gi'), '<p><br></p>');
                return cleanResult;
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
                // Jika hanya 1 baris teks tanpa enter, masukkan sebagai teks biasa (inline)
                if (text.indexOf(String.fromCharCode(10)) === -1) {
                    document.execCommand('insertText', false, text);
                } else {
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
            }
            this.updateContent();
        },

        // Tombol Bersihkan Format (Sapu) di toolbar
        cleanEditor() {
            var raw = '';
            if (this.editorMode === 'html' && this.$refs.htmlSource) {
                raw = this.$refs.htmlSource.value;
            } else if (this.$refs.editor) {
                raw = this.$refs.editor.innerHTML;
            } else if (this.form) {
                raw = this.form.body || '';
            }

            var cleaned = this.cleanHtml(raw);
            if (this.$refs.editor) {
                this.$refs.editor.innerHTML = cleaned || '<p><br></p>';
            }
            if (this.$refs.htmlSource) {
                this.$refs.htmlSource.value = cleaned;
            }
            if (this.form) {
                this._isInternalUpdate = true;
                this.form.body = cleaned;
            }
            this.autoFillSeo();
            if (window.showToast) {
                window.showToast('Format dokumen & HTML sampah berhasil dibersihkan!', 'success');
            }
        },

        // Tombol ✨ AI Rapikan di toolbar editor
        async tidyWithAi() {
            if (this.isAiTidying) return;
            var raw = '';
            if (this.editorMode === 'html' && this.$refs.htmlSource) {
                raw = this.$refs.htmlSource.value;
            } else if (this.$refs.editor) {
                raw = this.$refs.editor.innerHTML;
            } else if (this.form) {
                raw = this.form.body || '';
            }

            var plainText = (raw || '').replace(/<[^>]+>/g, ' ').replace(/\\s+/g, ' ').trim();
            if (!plainText || plainText.length < 25) {
                if (window.showToast) {
                    window.showToast('Tulis minimal 1-2 kalimat terlebih dahulu sebelum merapikan dengan AI!', 'warning');
                } else {
                    alert('Tulis minimal 1-2 kalimat terlebih dahulu sebelum merapikan dengan AI!');
                }
                return;
            }

            this.isAiTidying = true;
            try {
                var title = (this.form && this.form.title) ? this.form.title : '';
                var token = (typeof window !== 'undefined' && window.getCmsToken) ? window.getCmsToken() : '';
                var res = await fetch('/api/ai/tidy-content', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify({ content: raw, title: title })
                });

                var json = await res.json();
                if (!res.ok || json.error) {
                    throw new Error(json.error || 'Gagal memproses perapian dengan AI');
                }

                var tidied = json.data?.content || json.tidied_content || '';
                if (!tidied) throw new Error('Konten hasil AI kosong.');

                if (this.$refs.editor) {
                    this.$refs.editor.innerHTML = tidied;
                }
                if (this.$refs.htmlSource) {
                    this.$refs.htmlSource.value = tidied;
                }
                if (this.form) {
                    this._isInternalUpdate = true;
                    this.form.body = tidied;
                }
                this.autoFillSeo();
                if (window.showToast) {
                    window.showToast('✨ Paragraf & struktur tulisan berhasil dirapikan sesuai standar SEO!', 'success');
                }
            } catch (err) {
                console.error('[AI Tidy Error]', err);
                if (window.showToast) {
                    window.showToast('Gagal merapikan konten: ' + (err.message || 'Terjadi kesalahan sistem'), 'error');
                } else {
                    alert('Gagal merapikan konten: ' + (err.message || 'Terjadi kesalahan sistem'));
                }
            } finally {
                this.isAiTidying = false;
            }
        },

        setMode(m) {
            if (m === 'html') {
                this.updateContent();
                var raw = this.form ? this.form.body : '';
                var cleaned = this.cleanHtml(raw);
                if (this.form) {
                    this._isInternalUpdate = true;
                    this.form.body = cleaned;
                }
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
                    if (this.form) {
                        this._isInternalUpdate = true;
                        this.form.body = cleaned;
                    }
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
                .replace(/\\s+/g, ' ').trim();
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
                this._isInternalUpdate = true;
                if (this.form) {
                    this.form.body = this.$refs.editor.innerHTML;
                }
            }
            this.autoFillSeo();
        },
        
        checkSelection() {
            this.saveSelection();
            this.updateActiveFormats();
        },

        detectCurrentBlock() {
            var sel = window.getSelection();
            if (!sel || !sel.anchorNode || !this.$refs.editor) return 'p';
            var node = sel.anchorNode;
            if (node.nodeType === 3) node = node.parentNode;
            while (node && node !== this.$refs.editor) {
                var tag = (node.tagName || '').toLowerCase();
                if (['h2', 'h3', 'h4', 'blockquote', 'p'].indexOf(tag) !== -1) {
                    return tag;
                }
                node = node.parentNode;
            }
            return 'p';
        },
        
        updateActiveFormats() {
            var sel = window.getSelection();
            var currentAlign = '';
            if (sel && sel.anchorNode && this.$refs.editor) {
                var node = sel.anchorNode;
                if (node.nodeType === 3) node = node.parentNode;
                while (node && node !== this.$refs.editor) {
                    if (node.style && node.style.textAlign) {
                        currentAlign = node.style.textAlign.toLowerCase();
                        break;
                    }
                    if (node.getAttribute && node.getAttribute('align')) {
                        currentAlign = node.getAttribute('align').toLowerCase();
                        break;
                    }
                    node = node.parentNode;
                }
            }

            if (!currentAlign) {
                if (document.queryCommandState('justifyCenter')) currentAlign = 'center';
                else if (document.queryCommandState('justifyRight')) currentAlign = 'right';
                else if (document.queryCommandState('justifyFull')) currentAlign = 'justify';
                else if (document.queryCommandState('justifyLeft')) currentAlign = 'left';
            }

            this.activeFormats = {
                bold: document.queryCommandState('bold'),
                italic: document.queryCommandState('italic'),
                underline: document.queryCommandState('underline'),
                strikeThrough: document.queryCommandState('strikeThrough'),
                ul: document.queryCommandState('insertUnorderedList'),
                ol: document.queryCommandState('insertOrderedList'),
                alignLeft: currentAlign === 'left',
                alignCenter: currentAlign === 'center',
                alignRight: currentAlign === 'right',
                alignJustify: currentAlign === 'justify'
            };
            this.currentBlockFormat = this.detectCurrentBlock();
        },

        setBlockFormat(tag) {
            tag = (tag || 'p').toLowerCase();
            this.formatDropdownOpen = false;
            if (this.$refs.editor) this.$refs.editor.focus();
            this.restoreSelection();

            var success = false;
            try {
                success = document.execCommand('formatBlock', false, '<' + tag + '>');
            } catch (err) {}

            if (!success) {
                try {
                    success = document.execCommand('formatBlock', false, tag);
                } catch (e2) {}
            }

            // Fallback direct DOM transformation
            if (!success) {
                var sel = window.getSelection();
                if (sel && sel.anchorNode && this.$refs.editor) {
                    var node = sel.anchorNode;
                    if (node.nodeType === 3) node = node.parentNode;
                    while (node && node !== this.$refs.editor && ['p', 'h1', 'h2', 'h3', 'h4', 'blockquote', 'div'].indexOf(node.tagName.toLowerCase()) === -1) {
                        node = node.parentNode;
                    }
                    if (node && node !== this.$refs.editor) {
                        var newEl = document.createElement(tag);
                        newEl.innerHTML = node.innerHTML;
                        if (node.style.textAlign) newEl.style.textAlign = node.style.textAlign;
                        node.parentNode && node.parentNode.replaceChild(newEl, node);
                    }
                }
            }

            this.currentBlockFormat = tag;
            this.updateActiveFormats();
            this.updateContent();
            if (this.$refs.editor) this.$refs.editor.focus();
        },

        setAlignment(align) {
            if (this.$refs.editor) this.$refs.editor.focus();
            this.restoreSelection();

            var sel = window.getSelection();
            var handled = false;
            if (sel && sel.anchorNode && this.$refs.editor) {
                var node = sel.anchorNode;
                if (node.nodeType === 3) node = node.parentNode;
                while (node && node !== this.$refs.editor && ['p', 'h1', 'h2', 'h3', 'h4', 'blockquote', 'li', 'div'].indexOf(node.tagName.toLowerCase()) === -1) {
                    node = node.parentNode;
                }
                if (node && node !== this.$refs.editor) {
                    if (node.style.textAlign === align) {
                        node.style.textAlign = '';
                    } else {
                        node.style.textAlign = align;
                    }
                    node.removeAttribute('align');
                    handled = true;
                }
            }

            if (!handled) {
                var cmdMap = {
                    left: 'justifyLeft',
                    center: 'justifyCenter',
                    right: 'justifyRight',
                    justify: 'justifyFull'
                };
                if (cmdMap[align]) {
                    document.execCommand(cmdMap[align], false, null);
                }
            }

            this.updateActiveFormats();
            this.updateContent();
            if (this.$refs.editor) this.$refs.editor.focus();
        },
        
        execCmd(command, value = null) {
            if (this.$refs.editor) this.$refs.editor.focus();
            this.restoreSelection();
            try {
                if (command === 'formatBlock') {
                    this.setBlockFormat(value);
                    return;
                }
                document.execCommand(command, false, value);
            } catch (err) {
                console.warn('[Editor Command Error]', command, err);
            }
            this.updateActiveFormats();
            this.updateContent();
            if (this.$refs.editor) this.$refs.editor.focus();
        },
        
        promptLink() {
            this.saveSelection();
            this.linkUrl = '';
            this.linkModalOpen = true;
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
            var url = (this.linkUrl || '').trim();
            if (url) {
                if (this.$refs.editor) this.$refs.editor.focus();
                this.restoreSelection();
                if (!/^https?:\\/\\//i.test(url) && !url.startsWith('/') && !url.startsWith('#') && !url.startsWith('mailto:')) {
                    url = 'https://' + url;
                }
                document.execCommand('createLink', false, url);
                this.updateContent();
            }
            this.linkModalOpen = false;
            this.linkUrl = '';
        },

        openMediaManager() {
            this.saveSelection();
            window.dispatchEvent(new CustomEvent('open-editor-media'));
        },

        handleEnter(e) {
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
            if (sel && sel.rangeCount > 0) {
                const range = sel.getRangeAt(0);
                if (this.$refs.editor && this.$refs.editor.contains(range.commonAncestorContainer)) {
                    this.savedSelection = range.cloneRange();
                }
            }
        },
        
        restoreSelection() {
            if (this.savedSelection && this.$refs.editor) {
                const sel = window.getSelection();
                if (sel) {
                    sel.removeAllRanges();
                    sel.addRange(this.savedSelection);
                }
            } else if (this.$refs.editor) {
                this.$refs.editor.focus();
            }
        }
    };
}
`;
