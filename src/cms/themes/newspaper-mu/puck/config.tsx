import React from "react";
import type { Config } from "@puckeditor/core";

export const puckConfig: Config = {
  components: {
    NewspaperHeader: {
      fields: {
        logoUrl: { type: "text" },
        menuItems: {
          type: "array",
          arrayFields: {
            label: { type: "text" },
            url: { type: "text" }
          }
        }
      },
      defaultProps: {
        logoUrl: "/theme-assets/newspaper-mu/images/logo.png",
        menuItems: [
          { label: "Home", url: "/" },
          { label: "News", url: "/category/news" },
          { label: "Tech", url: "/category/tech" }
        ]
      },
      render: ({ logoUrl, menuItems }) => (
        <div className="td-header-wrap td-header-style-1">
          <div className="td-header-top-menu-full td-container-wrap">
            <div className="td-container td-header-row td-header-top-menu">
              <div className="top-bar-style-1">
                <div className="td-header-sp-top-menu">
                    <ul className="top-header-menu td_ul_top_menu">
                        <li className="menu-item"><a href="#">About</a></li>
                        <li className="menu-item"><a href="#">Contact</a></li>
                    </ul>
                </div>
              </div>
            </div>
          </div>
          
          <div className="td-header-menu-wrap-full td-container-wrap">
            <div className="td-header-menu-wrap td-header-gradient">
              <div className="td-container td-header-row td-header-main-menu">
                <div className="td-header-sp-logo">
                  <h1 className="td-logo">
                    <a href="/">
                      {logoUrl ? <img src={logoUrl} alt="Logo" style={{maxHeight:'40px'}} /> : "NewspaperMu"}
                    </a>
                  </h1>
                </div>
                <div className="td-main-menu-logo td-logo-in-menu">
                   <div id="td-header-menu" role="navigation">
                       <ul className="sf-menu">
                           {(menuItems || []).map((item: any, idx: number) => (
                             <li key={idx} className="menu-item"><a href={item.url}>{item.label}</a></li>
                           ))}
                       </ul>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },

    NewspaperPostGrid: {
      fields: {
        title: { type: "text" },
        categoryId: { type: "text" }
      },
      defaultProps: {
        title: "Latest Articles",
        categoryId: ""
      },
      render: ({ title }) => (
        <div className="td_block_wrap td_block_big_grid_1 td_uid_12_5c82a3b_rand td-grid-style-1 td-hover-1 td-big-grids">
           <div className="td_block_inner">
             <h4 className="block-title"><span>{title}</span></h4>
             <div id="newspaper-post-grid-placeholder">
               <div dangerouslySetInnerHTML={{__html: `<!-- NEWSPAPER_POST_GRID_START -->`}} />
               <div className="td-big-grid-wrapper">
                  <div className="td_module_mx5 td-animation-stack td-big-grid-post-0 td-big-grid-post">
                      <div className="td-module-image">
                         <div className="td-module-thumb"><a href="#"><img src="https://via.placeholder.com/600x400" /></a></div>
                         <div className="td-post-category">News</div>
                      </div>
                      <div className="td-meta-info-container">
                         <div className="td-meta-align">
                            <h3 className="entry-title"><a href="#">Sample Big Post Title for Newspaper Theme</a></h3>
                         </div>
                      </div>
                  </div>
               </div>
               <div dangerouslySetInnerHTML={{__html: `<!-- NEWSPAPER_POST_GRID_END -->`}} />
             </div>
           </div>
        </div>
      )
    },

    NewspaperFooter: {
      fields: {
        aboutText: { type: "textarea" },
        copyright: { type: "text" }
      },
      defaultProps: {
        aboutText: "NewspaperMu is a clone of the popular Newspaper theme designed specifically for cmsMu.",
        copyright: "© 2026 cmsMu. All rights reserved."
      },
      render: ({ aboutText, copyright }) => (
        <div className="td-footer-wrapper td-container-wrap td-footer-template-1">
           <div className="td-container">
              <div className="td-pb-row">
                 <div className="td-pb-span4">
                    <aside className="footer-logo-wrap">
                       <img src="/theme-assets/newspaper-mu/images/logo.png" alt="Logo" style={{maxHeight:'40px'}} />
                       <div className="footer-text-wrap">{aboutText}</div>
                    </aside>
                 </div>
              </div>
           </div>
           <div className="td-sub-footer-container td-container-wrap">
              <div className="td-container">
                 <div className="td-pb-row">
                    <div className="td-pb-span td-sub-footer-copy">
                       {copyright}
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )
    }
  }
};
