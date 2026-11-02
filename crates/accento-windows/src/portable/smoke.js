// Runs only for --desktop-test with an explicit report path and isolated preferences.
(async () => {
  const invoke = window.__TAURI_INTERNALS__.invoke;
  const checks = [];
  try {
    for (let attempt = 0; !document.querySelector('main h1'); attempt++) {
      if (attempt === 100) throw new Error('React settings did not become ready.');
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    checks.push('React settings loaded in the native WebView');
    const platform = await invoke('get_platform');
    const initial = await invoke('get_settings');
    if (initial.preferences.delay_ms !== 300 || initial.preferences.theme !== 'dark') {
      throw new Error('Unexpected initial settings.');
    }
    checks.push('Native platform and preference IPC');
    if(await invoke('get_autostart'))throw new Error('Isolated autostart must default to false.');
    if(!(await invoke('set_autostart',{enabled:true})))throw new Error('Autostart enable failed.');
    if(!(await invoke('get_autostart')))throw new Error('Autostart state did not persist.');
    if(await invoke('set_autostart',{enabled:false}))throw new Error('Autostart disable failed.');
    checks.push('Isolated launch-at-login enable, read and disable; real login items untouched');
    if(await invoke('plugin:window|is_decorated'))throw new Error('Settings must use the unified app bar.');
    checks.push('Undecorated settings window with the custom app bar');
    let rejected = false;
    try { await invoke('save_settings', {preferences: {...initial.preferences, delay_ms: 2}}); }
    catch { rejected = true; }
    if (!rejected) throw new Error('Invalid preferences were accepted.');
    checks.push('Invalid preferences rejected');
    const preferences = {...initial.preferences, delay_ms: 450, ui_language: 'en', currency_symbols: false};
    await invoke('save_settings', {preferences});
    const saved = await invoke('get_settings');
    if (JSON.stringify(saved.preferences) !== JSON.stringify(preferences)) {
      throw new Error('Saved preferences did not round-trip.');
    }
    checks.push('Preferences saved through Rust IPC');
    if (!(await invoke('set_paused', {paused: true})).paused) throw new Error('Pause failed.');
    if ((await invoke('set_paused', {paused: false})).paused) throw new Error('Resume failed.');
    checks.push('Pause and resume with input hooks disabled');
    await invoke('finish_desktop_test', {report: {passed: true, platform, checks, keyboardHook: false}});
  } catch (error) {
    await invoke('finish_desktop_test', {report: {passed: false, checks, error: String(error), keyboardHook: false}});
  }
})();
