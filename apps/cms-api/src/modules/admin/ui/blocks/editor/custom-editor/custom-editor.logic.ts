import { customEditorCleanerMethods } from './custom-editor.cleaner';

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
        currentWordCount: 0,
        currentCharCount: 0,
        
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

            // Listener sinkronisasi seleksi kursor (realtime di mobile touch & desktop)
            const syncSel = () => {
                if (this.editorMode !== 'visual') return;
                const sel = window.getSelection();
                if (sel && sel.rangeCount > 0 && this.$refs.editor && (this.$refs.editor === sel.anchorNode || this.$refs.editor.contains(sel.anchorNode))) {
                    try {
                        this.savedSelection = sel.getRangeAt(0).cloneRange();
                        this.updateActiveFormats();
                    } catch (_) {}
                }
            };
            document.addEventListener('selectionchange', syncSel);
            this.initKeyboardAccessoryBar();
            
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
                
                // Button click & touch handlers
                const self = this;
                tb.querySelectorAll('button[data-align]').forEach(btn => {
                    const handleAlign = (ev) => {
                        ev.preventDefault();
                        ev.stopPropagation();
                        self.alignImage(btn.dataset.align);
                        self._updateToolbarActive(btn.dataset.align);
                    };
                    btn.addEventListener('mousedown', handleAlign);
                    btn.addEventListener('touchstart', handleAlign, { passive: false });
                });
                const delBtn = tb.querySelector('button[data-action="delete"]');
                if (delBtn) {
                    const handleDelete = (ev) => {
                        ev.preventDefault();
                        ev.stopPropagation();
                        self.removeImage();
                    };
                    delBtn.addEventListener('mousedown', handleDelete);
                    delBtn.addEventListener('touchstart', handleDelete, { passive: false });
                }
            }
            
            // Image click & touch listener — show floating toolbar above the image
            const handleImageSelect = (e) => {
                if (!this.$refs.editor) return;
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
            };
            this.$refs.editor?.addEventListener('click', handleImageSelect);
            this.$refs.editor?.addEventListener('touchend', (e) => {
                if (e.target && e.target.tagName === 'IMG') {
                    handleImageSelect(e);
                }
            });
            
            // Hide toolbar on scroll
            this.$refs.editor?.addEventListener('scroll', () => this._hideToolbar());
            window.addEventListener('scroll', () => this._hideToolbar(), { passive: true });
            // Hide on click/tap outside editor
            const hideOutside = (e) => {
                if (this._imgToolbar && !this._imgToolbar.contains(e.target) && !this.$refs.editor?.contains(e.target)) {
                    this._hideToolbar();
                }
            };
            document.addEventListener('click', hideOutside);
            document.addEventListener('touchstart', hideOutside, { passive: true });
            
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
        
${customEditorCleanerMethods}

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
                const text = (this.$refs.editor.innerText || this.$refs.editor.textContent || '')
                    .replace(/\\s+/g, ' ').trim();
                this.currentCharCount = text.length;
                this.currentWordCount = text ? text.split(/\\s+/).filter(Boolean).length : 0;
            }
            this.autoFillSeo();
            if (typeof window !== 'undefined' && window.__CMS_AUTOSAVE && this.form) {
                window.__CMS_AUTOSAVE.trigger(this);
            }
        },
        
        checkSelection() {
            this.saveSelection();
            this.updateActiveFormats();
        },

        initKeyboardAccessoryBar() {
            if (typeof window === 'undefined' || !window.visualViewport) return;
            const updateToolbarPos = () => {
                if (window.innerWidth > 1023) {
                    if (this.$refs.toolbar) this.$refs.toolbar.style.bottom = '';
                    return;
                }
                const toolbar = this.$refs.toolbar;
                if (!toolbar) return;
                const vv = window.visualViewport;
                // Selisih antara tinggi layout viewport dan visual viewport (tinggi keyboard virtual)
                const offsetBottom = Math.max(0, window.innerHeight - (vv.offsetTop + vv.height));
                toolbar.style.bottom = offsetBottom + 'px';
            };
            window.visualViewport.addEventListener('resize', updateToolbarPos);
            window.visualViewport.addEventListener('scroll', updateToolbarPos);
            window.addEventListener('resize', updateToolbarPos);
            setTimeout(updateToolbarPos, 200);
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

            // Fallback direct DOM transformation yang menjamin tag berubah & kursor tidak hilang di mobile
            var currentTag = this.detectCurrentBlock();
            if (!success || currentTag !== tag) {
                var sel = window.getSelection();
                if (sel && sel.anchorNode && this.$refs.editor) {
                    var node = sel.anchorNode;
                    if (node.nodeType === 3) node = node.parentNode;
                    while (node && node !== this.$refs.editor && ['p', 'h1', 'h2', 'h3', 'h4', 'blockquote', 'div'].indexOf(node.tagName.toLowerCase()) === -1) {
                        node = node.parentNode;
                    }
                    if (node && node !== this.$refs.editor) {
                        var newEl = document.createElement(tag);
                        newEl.innerHTML = node.innerHTML || '<br>';
                        if (node.style.textAlign) newEl.style.textAlign = node.style.textAlign;
                        node.parentNode && node.parentNode.replaceChild(newEl, node);
                        
                        // Kembalikan seleksi / kursor ke elemen baru
                        var newRange = document.createRange();
                        newRange.selectNodeContents(newEl);
                        newRange.collapse(false);
                        sel.removeAllRanges();
                        sel.addRange(newRange);
                    }
                }
            }

            this.saveSelection();
            this.currentBlockFormat = tag;
            this.updateActiveFormats();
            this.updateContent();
            if (this.$refs.editor) this.$refs.editor.focus();
        },

        setAlignment(align) {
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

            this.saveSelection();
            this.updateActiveFormats();
            this.updateContent();
            if (this.$refs.editor) this.$refs.editor.focus();
        },
        
        execCmd(command, value = null) {
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
            this.saveSelection();
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
                this.restoreSelection();
                if (!/^https?:\\/\\//i.test(url) && !url.startsWith('/') && !url.startsWith('#') && !url.startsWith('mailto:')) {
                    url = 'https://' + url;
                }
                document.execCommand('createLink', false, url);
                this.saveSelection();
                this.updateContent();
            }
            this.linkModalOpen = false;
            this.linkUrl = '';
            if (this.$refs.editor) this.$refs.editor.focus();
        },

        openMediaManager() {
            this.saveSelection();
            window.dispatchEvent(new CustomEvent('open-editor-media'));
        },

        handleEnter(e) {
            var sel = window.getSelection();
            if (sel && sel.anchorNode && this.$refs.editor) {
                var node = sel.anchorNode;
                if (node.nodeType === 3) node = node.parentNode;
                while (node && node !== this.$refs.editor && ['h1', 'h2', 'h3', 'h4', 'blockquote'].indexOf(node.tagName.toLowerCase()) === -1) {
                    node = node.parentNode;
                }

                // Jika Enter ditekan di dalam Heading atau Blockquote
                if (node && node !== this.$refs.editor) {
                    var tag = node.tagName.toLowerCase();
                    if (['h1', 'h2', 'h3', 'h4', 'blockquote'].indexOf(tag) !== -1) {
                        var text = (node.textContent || '').trim();
                        // 1. Kasus Heading / Quote kosong: ubah langsung menjadi paragraf normal
                        if (!text || text === '') {
                            e.preventDefault();
                            var p = document.createElement('p');
                            p.innerHTML = '<br>';
                            node.parentNode && node.parentNode.replaceChild(p, node);
                            var range = document.createRange();
                            range.setStart(p, 0);
                            range.collapse(true);
                            sel.removeAllRanges();
                            sel.addRange(range);
                            this.saveSelection();
                            this.currentBlockFormat = 'p';
                            this.updateActiveFormats();
                            this.updateContent();
                            return;
                        }

                        // 2. Kasus kursor berada di akhir baris Heading / Quote: buat <p><br></p> baru di bawahnya
                        var curRange = sel.getRangeAt(0);
                        var isAtEnd = false;
                        try {
                            var testRange = curRange.cloneRange();
                            testRange.selectNodeContents(node);
                            testRange.setStart(curRange.endContainer, curRange.endOffset);
                            var remainingText = testRange.toString().trim();
                            if (remainingText === '') {
                                isAtEnd = true;
                            }
                        } catch (_) {}

                        if (isAtEnd) {
                            e.preventDefault();
                            var newP = document.createElement('p');
                            newP.innerHTML = '<br>';
                            if (node.nextSibling) {
                                node.parentNode.insertBefore(newP, node.nextSibling);
                            } else {
                                node.parentNode.appendChild(newP);
                            }
                            var r = document.createRange();
                            r.setStart(newP, 0);
                            r.collapse(true);
                            sel.removeAllRanges();
                            sel.addRange(r);
                            this.saveSelection();
                            this.currentBlockFormat = 'p';
                            this.updateActiveFormats();
                            this.updateContent();
                            return;
                        }
                    }
                }
            }

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
                try {
                    const range = sel.getRangeAt(0);
                    if (this.$refs.editor && (this.$refs.editor === range.commonAncestorContainer || this.$refs.editor.contains(range.commonAncestorContainer))) {
                        this.savedSelection = range.cloneRange();
                    }
                } catch (_) {}
            }
        },
        
        restoreSelection() {
            if (!this.$refs.editor) return;
            this.$refs.editor.focus();
            const sel = window.getSelection();
            if (!sel) return;

            // 1. Coba pulihkan savedSelection jika masih terpasang valid di dalam editor
            if (this.savedSelection) {
                try {
                    if (this.$refs.editor === this.savedSelection.commonAncestorContainer || this.$refs.editor.contains(this.savedSelection.commonAncestorContainer)) {
                        sel.removeAllRanges();
                        sel.addRange(this.savedSelection);
                        return;
                    }
                } catch (_) {}
            }

            // 2. Jika kursor saat ini sudah berada di dalam editor, gunakan dan simpan
            if (sel.rangeCount > 0 && sel.anchorNode && (this.$refs.editor === sel.anchorNode || this.$refs.editor.contains(sel.anchorNode))) {
                try {
                    this.savedSelection = sel.getRangeAt(0).cloneRange();
                } catch (_) {}
                return;
            }

            // 3. Fallback: tempatkan kursor aktif di akhir dokumen editor
            try {
                const range = document.createRange();
                range.selectNodeContents(this.$refs.editor);
                range.collapse(false);
                sel.removeAllRanges();
                sel.addRange(range);
                this.savedSelection = range.cloneRange();
            } catch (_) {}
        }
    };
}
`;
