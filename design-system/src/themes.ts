import {defineTheme, type DefineThemeInput, type DefinedTheme, type TokenValue} from '@astryxdesign/core/theme';
import data from '../tokens/resolved.json';
import {phosphorIcons} from './icons';
export type Brand = keyof typeof data.themes;
function tokenValues(input:Record<string,string|string[]>):Record<string,TokenValue>{
  return Object.fromEntries(Object.entries(input).map(([key,value])=>{
    if(!Array.isArray(value)) return [key,value];
    if(value.length!==2) throw new Error(`${key} needs a light/dark pair`);
    return [key,[value[0],value[1]] as [string,string]];
  }));
}
export const themes = Object.fromEntries(Object.entries(data.themes).map(([id, source]) => [id, defineTheme({
  ...source,
  tokens: tokenValues(source.tokens) as DefineThemeInput['tokens'],
  localTokens: tokenValues(source.localTokens),
  icons: phosphorIcons,
  components: {
    button: {base: {borderRadius:'var(--sg-radius-action)'}},
    'icon-button': {base: {borderRadius:'var(--sg-radius-action)'}},
    card: {base: {borderRadius:'var(--radius-container)',padding:'var(--spacing-6)'}},
    badge: {
      'variant:success': {backgroundColor:'var(--sg-success-subtle)',color:'var(--sg-success-text)'},
      'variant:warning': {backgroundColor:'var(--sg-warning-subtle)',color:'var(--sg-warning-text)'},
      'variant:error': {backgroundColor:'var(--sg-error-subtle)',color:'var(--sg-error-text)'},
      'variant:info': {backgroundColor:'var(--sg-info-subtle)',color:'var(--sg-info-text)'}
    }
  },
  adaptations: {rules:[{when:{pointer:'coarse'},value:{tokens:{'--size-element-sm':'2.75rem'}}}]}
})])) as Record<Brand,DefinedTheme>;
