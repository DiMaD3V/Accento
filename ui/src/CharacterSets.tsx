import {useEffect,useRef,useState} from 'react';
import {Check,ChevronDown} from 'lucide-react';
import {Button} from './components';
import {characterSets,currencyOptions} from './catalog';
import type {Preferences} from './api';
import type dictionaries from './messages.json';
import currencies from '../../localization/currencies.json';

type Props = {
  draft:Preferences;
  update:(change:Partial<Preferences>)=>void;
  onError:(message:string)=>void;
  text:typeof dictionaries.it;
};
export function CharacterSets({draft,update,onError,text}:Props) {
  const [expanded,setExpanded]=useState(true);
  const languagesRef=useRef<HTMLInputElement>(null);
  const specialRef=useRef<HTMLInputElement>(null);
  const allLanguages=characterSets.every(set=>draft.languages.includes(set.code));
  const allCurrencies=draft.currency_symbols&&currencyOptions.every(({symbol})=>draft.selected_currencies.includes(symbol));
  const someCurrencies=draft.currency_symbols&&draft.selected_currencies.length>0;
  useEffect(()=>{if(languagesRef.current)languagesRef.current.indeterminate=!allLanguages;},[allLanguages]);
  useEffect(()=>{if(specialRef.current)specialRef.current.indeterminate=someCurrencies&&!allCurrencies;},[someCurrencies,allCurrencies]);
  function toggleSet(code:string) {
    const selected=draft.languages.includes(code);
    if(selected&&characterSets.filter(set=>draft.languages.includes(set.code)).length<=1){onError(text.AtLeastOne);return;}
    update({languages:selected?draft.languages.filter(item=>item!==code):[...draft.languages,code]});
  }
  function toggleAll() {
    if(allLanguages){
      // Preserve the first active language: preferences always require one.
      update({languages:[characterSets.find(set=>draft.languages.includes(set.code))?.code??'it']});
      onError(text.AtLeastOne);
    }else update({languages:characterSets.map(set=>set.code)});
  }
  function toggleSpecial(){
    update(allCurrencies?{currency_symbols:false}:{currency_symbols:true,selected_currencies:currencyOptions.map(({symbol})=>symbol)});
  }
  function toggleCurrency(symbol:string) {
    update({currency_symbols:true,selected_currencies:!draft.currency_symbols?[symbol]:draft.selected_currencies.includes(symbol)?draft.selected_currencies.filter(value=>value!==symbol):[...draft.selected_currencies,symbol]});
  }
  return <section className="sets-panel" aria-label={text.Sets}>
    <div className="sets-panel-header">
      <Button variant="quiet" className="sets-disclosure" aria-expanded={expanded} aria-controls="sets-panel-content" onPress={()=>setExpanded(value=>!value)}>
        <span className="sets-panel-copy"><strong>{text.Sets}</strong></span>
        <ChevronDown size={17} className={expanded?'expanded':''}/>
      </Button>
    </div>
    <div id="sets-panel-content" className="sets-panel-content" hidden={!expanded}>
      <section className="language-sets" aria-labelledby="language-sets-heading">
        <div className="set-group-heading"><h2 id="language-sets-heading"><label className="set-option set-group-toggle">
          <input ref={languagesRef} type="checkbox" data-group="languages" checked={allLanguages} onChange={toggleAll}/>
          <span className="set-checkbox" aria-hidden="true">{allLanguages?<Check size={13}/>:<span className="mixed-mark"/>}</span><span>{text.LanguageSets}</span>
        </label></h2>
        </div>
        <div className="sets-grid">{characterSets.map(set=><label key={set.code} className="set-option" title={set.sample}>
          <input type="checkbox" data-language={set.code} checked={draft.languages.includes(set.code)} aria-description={set.sample} onChange={()=>toggleSet(set.code)}/>
          <span className="set-checkbox" aria-hidden="true"><Check size={13}/></span><span>{set.name}</span>
        </label>)}</div>
      </section>
      <section className="special-sets" aria-labelledby="special-sets-heading">
        <div className="set-group-heading"><h2 id="special-sets-heading"><label className="set-option set-group-toggle">
          <input ref={specialRef} type="checkbox" data-special-set="currency" checked={allCurrencies} onChange={toggleSpecial}/>
          <span className="set-checkbox" aria-hidden="true">{allCurrencies?<Check size={13}/>:someCurrencies?<span className="mixed-mark"/>:null}</span><span>{text.SpecialSets}</span>
        </label></h2></div>
        <p className="currency-caption">{text.Currency}</p>
        <div className="sets-grid currency-options">
          {currencyOptions.map(({symbol,keys})=><label key={symbol} className="set-option">
            <input type="checkbox" data-currency={symbol} checked={draft.currency_symbols&&draft.selected_currencies.includes(symbol)} onChange={()=>toggleCurrency(symbol)}/>
            <span className="set-checkbox" aria-hidden="true"><Check size={13}/></span>
            <span className="currency-symbol">{symbol}</span><span className="currency-keys">{keys.join(' / ')}</span>
          </label>)}
        </div>
        <details className="currency-details"><summary>{text.Currency} · {text.Variants}</summary>
          <dl>{Object.entries(currencies).map(([key,symbols])=><div key={key}><dt><kbd>{key}</kbd></dt><dd>{symbols.join(' · ')}</dd></div>)}</dl>
        </details>
      </section>
    </div>
  </section>;
}
