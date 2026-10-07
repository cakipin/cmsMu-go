import { agensPage } from "./agens.page";
import { postsPage } from "./posts.page";
import { editorPage } from "./editor.page";
import { mediaPage } from "./media.page";
import { usersPage } from "./users.page";
import { themesPage } from "./themes.page";
import { settingsPage } from "./settings.page";
import { staticPage } from "./static.page";
import { pluginsPage } from "./plugins.page";

export const pagesBlock = `
    ${agensPage}
    ${postsPage}
    ${staticPage}     
    ${editorPage} 
    ${mediaPage}
    ${usersPage}
    ${themesPage}
    ${settingsPage}  
    ${pluginsPage}
`;
