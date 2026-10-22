// ==========================================
// SMART HTML SANITIZER & AI CONTENT CLEANER
// ==========================================
export const customEditorCleanerMethods = `
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
            setTimeout(() => {
                this.updateContent();
            }, 10);
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
            this.recalculateCounts(cleaned);
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
                }
                return;
            }

            this.isAiTidying = true;
            try {
                var title = (this.form && this.form.title) ? this.form.title : '';
                var res = await fetch('/api/ai/tidy-content', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
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
                this.recalculateCounts(tidied);
                this.autoFillSeo();
                if (window.showToast) {
                    window.showToast('✨ Paragraf & struktur tulisan berhasil dirapikan sesuai standar SEO!', 'success');
                }
            } catch (err) {
                console.error('[AI Tidy Error]', err);
                if (window.showToast) {
                    window.showToast('Gagal merapikan konten: ' + (err.message || 'Terjadi kesalahan sistem'), 'error');
                }
            } finally {
                this.isAiTidying = false;
            }
        },
`;
