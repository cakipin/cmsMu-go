import { baseStyle } from './styles/base.style';
import { layoutStyle } from './styles/layout.style';
import { componentsStyle } from './styles/components.style';
import { legacyStyle } from './styles/legacy.style';

export const css = [baseStyle, layoutStyle, componentsStyle, legacyStyle].join('\n');
