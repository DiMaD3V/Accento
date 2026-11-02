import {spawn,spawnSync,execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdtemp,readFile,mkdir,writeFile,copyFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';

// A separate mutex, no keyboard hook, and an isolated preferences directory protect the running app.
const directory=await mkdtemp(path.join(tmpdir(),'accento-desktop-'));
const executable=path.resolve(process.argv[2]??'target/debug/Accento.exe');
const backgroundProbe=path.join(directory,'background-probe.exe');
execFileSync('rustc',['--edition','2024',path.resolve('tests/native/windows-background.rs'),'-o',backgroundProbe],{windowsHide:true,stdio:'pipe'});
const child=spawn(executable,['--desktop-test'],{windowsHide:true,env:{...process.env,LOCALAPPDATA:directory,ACCENTO_CONFIG_DIR:path.join(directory,'Accento'),WEBVIEW2_USER_DATA_FOLDER:path.join(directory,'WebView2'),WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS:'--remote-debugging-port=9437'}});
const errors=[];child.stderr.on('data',data=>errors.push(data.toString()));
let browser;
try{
  for(let attempt=0;attempt<100;attempt++){
    if(child.exitCode!==null)throw new Error(`Desktop exited: ${child.exitCode}\n${errors.join('')}`);
    try{browser=await chromium.connectOverCDP('http://127.0.0.1:9437');break;}catch{await new Promise(resolve=>setTimeout(resolve,200));}
  }
  assert.ok(browser,'WebView2 debugging connection unavailable');
  const context=browser.contexts()[0];
  let page=context.pages()[0]??await context.waitForEvent('page');
  await page.waitForFunction(()=>!!window.__TAURI_INTERNALS__);
  await page.getByRole('heading',{name:'Generale',exact:true}).waitFor();
  const loadedUrl=page.url();
  assert.equal(spawnSync(backgroundProbe,[String(child.pid)],{windowsHide:true}).status,1,'Probe must detect the open settings window');
  if(executable.replaceAll('\\','/').includes('/release/'))assert.ok(!loadedUrl.includes(':1421'),'Release must use embedded assets, not the development server');
  const invoke=(command,args)=>page.evaluate(({command,args})=>window.__TAURI_INTERNALS__.invoke(command,args),{command,args});
  const initial=await invoke('get_settings');assert.equal(initial.preferences.delay_ms,300);
  assert.equal(initial.preferences.theme,'dark');
  assert.equal(initial.preferences.currency_symbols,true);
  assert.deepEqual(initial.preferences.selected_currencies,['€']);
  assert.equal(initial.preferences.popup_position,'top');
  assert.equal(await invoke('plugin:window|is_decorated'),false);
  await page.getByRole('button',{name:'Massimizza',exact:true}).click();
  await page.getByRole('button',{name:'Ripristina',exact:true}).waitFor();
  assert.equal(await invoke('plugin:window|is_maximized'),true);
  await page.getByRole('button',{name:'Ripristina',exact:true}).click();
  await page.getByRole('button',{name:'Massimizza',exact:true}).waitFor();
  const autostart=page.getByRole('checkbox',{name:'Avvio automatico',exact:true});
  assert.equal(await invoke('get_autostart'),false);
  await autostart.check();
  await page.waitForFunction(()=>!document.querySelector('fieldset')?.disabled);
  assert.equal(await invoke('get_autostart'),true);
  assert.equal(JSON.parse(await readFile(path.join(directory,'Accento/autostart.json'),'utf8')),true);
  assert.equal((await invoke('get_settings')).preferences.delay_ms,300);
  await autostart.uncheck();
  await page.waitForFunction(()=>!document.querySelector('fieldset')?.disabled);
  assert.equal(await invoke('get_autostart'),false);
  await page.locator('[data-currency="$"]').check();
  await page.getByRole('radio',{name:'In basso',exact:true}).check();
  await page.getByRole('button',{name:'Salva modifiche'}).click();
  await page.getByRole('status').filter({hasText:'Tutte le modifiche sono salvate'}).waitFor();
  const selection=await invoke('get_settings');
  assert.deepEqual(selection.preferences.selected_currencies,['€','$']);
  assert.equal(selection.preferences.popup_position,'bottom');
  const selectionDisk=JSON.parse(await readFile(path.join(directory,'Accento/settings.json'),'utf8'));
  assert.deepEqual(selectionDisk.selected_currencies,['€','$']);
  assert.equal(selectionDisk.popup_position,'bottom');
  const currency=page.locator('[data-special-set="currency"]');
  await currency.click();await currency.uncheck();await page.getByRole('button',{name:'Salva modifiche'}).click();
  await page.getByRole('status').filter({hasText:'Tutte le modifiche sono salvate'}).waitFor();
  assert.equal((await invoke('get_settings')).preferences.currency_symbols,false);
  const currencyDisk=JSON.parse(await readFile(path.join(directory,'Accento/settings.json'),'utf8'));
  assert.equal(currencyDisk.currency_symbols,false);
  await currency.click();await page.getByRole('button',{name:'Salva modifiche'}).click();
  await page.getByRole('status').filter({hasText:'Tutte le modifiche sono salvate'}).waitFor();
  assert.equal((await invoke('get_settings')).preferences.currency_symbols,true);
  assert.equal((await invoke('get_settings')).preferences.selected_currencies.length,25);
  assert.deepEqual((await invoke('get_settings')).preferences.languages,['it']);
  for(const change of [{selected_currencies:['invalid']},{popup_position:'left'}]){
    await assert.rejects(()=>invoke('save_settings',{preferences:{...selection.preferences,...change}}));
  }
  await page.locator('main').evaluate(element=>{element.scrollTop=0;});
  const languages=JSON.parse(await readFile('localization/languages.json','utf8'));
  for(const language of languages){
    const next={...initial.preferences,ui_language:language.code,languages:[language.code],theme:'light'};
    const snapshot=await invoke('save_settings',{preferences:next});
    assert.equal(snapshot.preferences.ui_language,language.code);
    assert.deepEqual(snapshot.preferences.languages,[language.code]);
    assert.equal(snapshot.preferences.theme,'dark','Legacy or forged light preferences must not change dark mode');
  }
  const invalid={...initial.preferences,delay_ms:2};
  await assert.rejects(()=>invoke('save_settings',{preferences:invalid}));
  assert.equal((await invoke('get_settings')).preferences.delay_ms,300);
  const preferences={...initial.preferences,delay_ms:450,ui_language:'sq',languages:['sq','ro','pl','tr','pt'],excluded_apps:['notepad.exe'],theme:'dark',currency_symbols:false};
  const saved=await invoke('save_settings',{preferences});assert.deepEqual(saved.preferences,preferences);
  await page.getByRole('heading',{name:'Të përgjithshme',exact:true}).waitFor();
  await page.locator('.sets-disclosure').filter({hasText:'Grupet e shkronjave'}).waitFor();
  const disk=JSON.parse(await readFile(path.join(directory,'Accento/settings.json'),'utf8'));assert.deepEqual(disk,preferences);
  assert.equal((await invoke('set_paused',{paused:true})).paused,true);
  await page.getByRole('button',{name:'Aktivizo',exact:true}).waitFor();
  assert.equal((await invoke('set_paused',{paused:false})).paused,false);
  await mkdir('docs/evidenze/react-tauri',{recursive:true});
  await page.screenshot({path:'docs/evidenze/react-tauri/desktop-albanian-dark.png'});
  // Real Tauri close interception: a draft must survive the attempted close.
  await page.getByRole('textbox',{name:'Vonesa e hapjes'}).fill('600');
  await invoke('plugin:window|close');
  await page.getByRole('alertdialog').waitFor();
  await page.getByRole('button',{name:'Vazhdo redaktimin',exact:true}).click();
  assert.equal(await page.getByRole('textbox',{name:'Vonesa e hapjes'}).inputValue(),'600');
  await page.getByRole('button',{name:'Anulo ndryshimet',exact:true}).click();
  await page.getByRole('button',{name:'Ruaj ndryshimet'}).waitFor({state:'visible'});
  await page.waitForFunction(()=>document.querySelector('footer button[data-variant="primary"]')?.disabled);
  await page.getByRole('button',{name:'Minimizo',exact:true}).click();
  for(let i=0;!(await invoke('plugin:window|is_minimized'));i++){
    assert.ok(i<20,'Minimize must reach the native window');await new Promise(resolve=>setTimeout(resolve,100));
  }
  const closed=page.waitForEvent('close');
  await invoke('plugin:window|close');
  await closed;
  assert.equal(child.exitCode,null,'Closing settings must leave the backend running');
  await writeFile('docs/evidenze/react-tauri/desktop-test.json',JSON.stringify({passed:true,executable,loadedUrl,locales:languages.length,checks:['Tauri/WebView2 startup','custom app bar: undecorated window, maximize/restore/minimize','autostart IPC enables/disables and persists in an isolated test profile; real login entries untouched','individual currencies and popup position persist through Rust IPC','invalid currency selections and popup positions rejected','separate special-set bulk selection persists without changing languages','Rust get/save/pause IPC','invalid configuration rejected without changing state','all national locales and character sets accepted','dark mode enforced for legacy/forged light preferences','atomic persisted preferences','React receives native state events','unsaved draft close protection','webview closes while backend remains running'],keyboardHook:false},null,2)+'\n');
  console.log(`Desktop integration and ${languages.length} locale/set round-trips passed. Keyboard hooks disabled for this isolated test.`);
}finally{
  await browser?.close().catch(()=>{});
  child.kill();
  if(child.exitCode===null)await new Promise(resolve=>child.once('exit',resolve));
}

// Il percorso contiene spazi; il processo in background non deve aprire impostazioni.
const backgroundDirectory=await mkdtemp(path.join(tmpdir(),'Accento background test '));
const backgroundExecutable=path.join(backgroundDirectory,'Accento.exe');
await copyFile(executable,backgroundExecutable);
const background=spawn(backgroundExecutable,['--desktop-test','--background'],{windowsHide:true,env:{...process.env,ACCENTO_CONFIG_DIR:path.join(backgroundDirectory,'profile')}});
try{
  await new Promise(resolve=>setTimeout(resolve,2500));
  assert.equal(background.exitCode,null,'Background process must remain running');
  const visible=execFileSync(backgroundProbe,[String(background.pid)],{encoding:'utf8',windowsHide:true}).trim();
  assert.equal(visible,'0','Background startup must not show application windows');
  const report=JSON.parse(await readFile('docs/evidenze/react-tauri/desktop-test.json','utf8'));
  report.executableSha256=createHash('sha256').update(await readFile(executable)).digest('hex');
  report.checks.push('background launch from a path with spaces has no visible application windows; probe detects the normal foreground launch');
  await writeFile('docs/evidenze/react-tauri/desktop-test.json',JSON.stringify(report,null,2)+'\n');
  console.log('Background launch from a path with spaces: process remains active with no main window.');
}finally{background.kill();}
