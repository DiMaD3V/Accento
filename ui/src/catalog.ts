import type {LanguageOption} from './components';
import languages from '../../localization/languages.json';
import characterSetCodes from './character-sets.json';
import currencies from '../../localization/currencies.json';
export const interfaceLanguages:LanguageOption[] = languages.map(language=>({
  locale:language.code,label:language.name,code:language.code.toUpperCase(),keywords:[language.english,...language.countries],
}));
export const characterSets = languages.filter(language=>characterSetCodes.includes(language.code));
export const currencyOptions = [...new Set(Object.values(currencies).flat())].map(symbol=>({
  symbol,keys:Object.entries(currencies).filter(([,symbols])=>(symbols as string[]).includes(symbol)).map(([key])=>key),
}));
