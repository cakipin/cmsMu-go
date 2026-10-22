export const customEditorStyles = `
        <style>
            .custom-editor-container {
                border: 1px solid #cbd5e1;
                border-radius: 0 6px 6px 6px;
                background: #fff;
                overflow: visible;
                position: relative !important;
                box-shadow: 0 1px 3px rgba(0,0,0,0.04);
            }
            .editor-top-bar {
                display: flex !important;
                justify-content: space-between !important;
                align-items: flex-end !important;
                margin-bottom: -1px !important;
                z-index: 2 !important;
                width: 100% !important;
            }
            .editor-tab-group {
                display: flex !important;
                gap: 4px !important;
                align-items: flex-end !important;
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
                color: #0f172a !important;
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
                position: relative !important;
                z-index: 10 !important;
            }
            .editor-btn-group {
                display: inline-flex !important;
                align-items: center !important;
                gap: 2px !important;
                flex-shrink: 0 !important;
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
            .editor-select-wrapper {
                position: relative !important;
                display: inline-flex !important;
                align-items: center !important;
                flex-shrink: 0 !important;
            }
            .editor-format-select {
                appearance: none !important;
                -webkit-appearance: none !important;
                -moz-appearance: none !important;
                height: 28px !important;
                padding: 2px 28px 2px 10px !important;
                border: 1px solid #cbd5e1 !important;
                border-radius: 4px !important;
                background: #ffffff !important;
                font-size: 12px !important;
                font-weight: 500 !important;
                color: #334155 !important;
                cursor: pointer !important;
                outline: none !important;
                flex-shrink: 0 !important;
                min-width: 100px !important;
                max-width: 130px !important;
                transition: border-color 0.15s ease !important;
            }
            .editor-format-select:focus {
                border-color: #94a3b8 !important;
            }
            .editor-select-icon {
                position: absolute !important;
                right: 8px !important;
                pointer-events: none !important;
                font-size: 9px !important;
                opacity: 0.6 !important;
                color: #334155 !important;
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
            .editor-link-popover {
                position: absolute;
                top: calc(100% + 6px);
                left: 0;
                z-index: 9999;
                background: #fff;
                border: 1px solid #c3c4c7;
                border-radius: 6px;
                padding: 12px;
                width: 280px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.15);
            }
            .editor-status-bar {
                display: flex !important;
                align-items: center !important;
                justify-content: space-between !important;
                padding: 8px 14px !important;
                background: #f8fafc !important;
                border-top: 1px solid #e2e8f0 !important;
                font-size: 12px !important;
                color: #64748b !important;
                box-sizing: border-box !important;
            }
            .editor-status-badge {
                display: inline-flex !important;
                align-items: center !important;
                gap: 5px !important;
                padding: 2px 8px !important;
                border-radius: 4px !important;
                background: #e0f2fe !important;
                color: #0369a1 !important;
                font-weight: 600 !important;
                font-size: 11px !important;
            }
            .editor-status-muted {
                font-size: 11px !important;
                color: #94a3b8 !important;
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

            @media (max-width: 767px) {
                .editor-top-bar {
                    flex-direction: row !important;
                    justify-content: space-between !important;
                    align-items: center !important;
                    gap: 6px !important;
                    padding-bottom: 2px !important;
                    min-height: 44px !important;
                }
                .editor-media-btn, .editor-tab-btn {
                    padding: 8px 12px !important;
                    font-size: 12px !important;
                    min-height: 42px !important;
                    display: inline-flex !important;
                    align-items: center !important;
                }
                .editor-tab-group {
                    gap: 3px !important;
                }
                /* Mobile & Tablet: Toolbar Floating Permanen di Atas Keyboard (Bottom Accessory Bar) */
                .editor-toolbar {
                    position: fixed !important;
                    bottom: 0 !important;
                    left: 0 !important;
                    right: 0 !important;
                    width: 100vw !important;
                    max-width: 100vw !important;
                    box-sizing: border-box !important;
                    z-index: 9999 !important;
                    background: #ffffff !important;
                    border-top: 1px solid #cbd5e1 !important;
                    border-bottom: none !important;
                    box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.08) !important;
                    padding: 6px 8px !important;
                    padding-bottom: max(6px, env(safe-area-inset-bottom)) !important;
                    flex-wrap: nowrap !important;
                    overflow-x: auto !important;
                    -webkit-overflow-scrolling: touch !important;
                    scrollbar-width: none !important;
                    gap: 4px !important;
                    transition: bottom 0.1s ease-out !important;
                }
                .editor-toolbar::-webkit-scrollbar {
                    display: none !important;
                }
                .editor-format-btn {
                    height: 36px !important;
                    padding: 4px 10px !important;
                    font-size: 13px !important;
                }
                .editor-format-select {
                    height: 40px !important;
                    font-size: 16px !important;
                    padding: 4px 28px 4px 10px !important;
                    min-width: 110px !important;
                    max-width: 140px !important;
                }
                .editor-dropdown-item {
                    padding: 10px 14px !important;
                    font-size: 14px !important;
                }
                .editor-toolbar button.editor-btn {
                    width: 40px !important;
                    height: 40px !important;
                    min-width: 40px !important;
                    max-width: 40px !important;
                    font-size: 14px !important;
                    border-radius: 6px !important;
                    cursor: pointer !important;
                }
                .editor-toolbar button.editor-btn:active {
                    transform: scale(0.95) !important;
                }
                .editor-toolbar button.editor-btn-ai {
                    width: auto !important;
                    max-width: none !important;
                    min-width: 36px !important;
                    padding: 0 8px !important;
                }
                .editor-toolbar button.editor-btn-ai .ai-text {
                    opacity: 1 !important;
                    max-width: 54px !important;
                    font-size: 11px !important;
                }
                .editor-toolbar .toolbar-divider {
                    height: 22px !important;
                    margin: 0 2px !important;
                }
                /* Mobile: Modal Link Popover Fixed di Tengah Layar (Bypass toolbar overflow clipping) */
                .editor-link-popover {
                    position: fixed !important;
                    top: 50% !important;
                    left: 50% !important;
                    transform: translate(-50%, -50%) !important;
                    width: calc(100vw - 32px) !important;
                    max-width: 340px !important;
                    box-shadow: 0 10px 35px rgba(0,0,0,0.3) !important;
                    z-index: 99999 !important;
                }
                /* Mobile: Anti scroll-trap pada contenteditable (Scroll alami level halaman) + bantalan bawah */
                .modern-editor-content {
                    padding: 14px 12px 76px 12px !important;
                    font-size: 15px !important;
                    min-height: 280px !important;
                    max-height: none !important;
                    overflow-y: visible !important;
                    line-height: 1.65 !important;
                }
                .modern-editor-content h2 {
                    font-size: 1.35em !important;
                    margin-top: 0.9em !important;
                    margin-bottom: 0.4em !important;
                }
                .modern-editor-content h3 {
                    font-size: 1.2em !important;
                    margin-top: 0.8em !important;
                    margin-bottom: 0.35em !important;
                }
                .modern-editor-content h4 {
                    font-size: 1.1em !important;
                    margin-top: 0.7em !important;
                    margin-bottom: 0.3em !important;
                }
                .modern-editor-content p {
                    margin-bottom: 0.8em !important;
                }
                .editor-status-bar {
                    padding: 6px 10px !important;
                    font-size: 11px !important;
                }
            }
        </style>
`;
