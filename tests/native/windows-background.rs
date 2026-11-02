//! Sonda di regressione: ignora soltanto il target tecnico dell'event loop Tao.
use std::ffi::c_void;
type Hwnd = *mut c_void;
#[repr(C)]
#[derive(Default)]
struct Rect {
    left: i32,
    top: i32,
    right: i32,
    bottom: i32,
}
struct Probe {
    pid: u32,
    visible: u32,
}
#[link(name = "user32")]
unsafe extern "system" {
    fn EnumWindows(callback: unsafe extern "system" fn(Hwnd, isize) -> i32, data: isize) -> i32;
    fn GetWindowThreadProcessId(window: Hwnd, pid: *mut u32) -> u32;
    fn IsWindowVisible(window: Hwnd) -> i32;
    fn GetWindowRect(window: Hwnd, rect: *mut Rect) -> i32;
    fn GetClassNameW(window: Hwnd, text: *mut u16, length: i32) -> i32;
}
unsafe extern "system" fn visit(window: Hwnd, data: isize) -> i32 {
    let probe = unsafe { &mut *(data as *mut Probe) };
    let mut pid = 0;
    unsafe { GetWindowThreadProcessId(window, &mut pid) };
    if pid == probe.pid && unsafe { IsWindowVisible(window) } != 0 {
        let mut rect = Rect::default();
        let mut class = [0u16; 256];
        unsafe { GetWindowRect(window, &mut rect) };
        let length = unsafe { GetClassNameW(window, class.as_mut_ptr(), 256) };
        let class = String::from_utf16_lossy(&class[..length as usize]);
        if class != "Tao Thread Event Target" && rect.right > rect.left && rect.bottom > rect.top {
            probe.visible += 1;
        }
    }
    1
}
fn main() {
    let mut probe = Probe {
        pid: std::env::args().nth(1).unwrap().parse().unwrap(),
        visible: 0,
    };
    assert_ne!(
        unsafe { EnumWindows(visit, &mut probe as *mut _ as isize) },
        0
    );
    println!("{}", probe.visible);
    std::process::exit(if probe.visible == 0 { 0 } else { 1 });
}
