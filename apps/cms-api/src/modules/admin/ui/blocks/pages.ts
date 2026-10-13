import { postsPage } from "./posts.page";
import { editorPage } from "./editor.page";
import { mediaPage } from "./media.page";
import { usersPage } from "./users.page";
import { themesPage } from "./themes.page";
import { settingsPage } from "./settings.page";
import { staticPage } from "./static.page";
import { pluginsPage } from "./plugins.page";

export const pagesBlock = `
    ${postsPage}
    ${staticPage}     
    ${editorPage} 
    ${mediaPage}
    ${usersPage}
    ${themesPage}
    ${settingsPage}  
    ${pluginsPage}
`;
