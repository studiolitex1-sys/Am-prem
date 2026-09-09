/**
 * Generates or retrieves a persistent device identifier stored in localStorage and cookie
 */
export function getPersistentDeviceId(): string {
  if (typeof window === 'undefined') return 'server_session';

  try {
    let deviceId = localStorage.getItem('valzz_device_id');
    if (!deviceId) {
      deviceId = 'dev_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
      localStorage.setItem('valzz_device_id', deviceId);
      document.cookie = `valzz_device_id=${deviceId}; path=/; max-age=31536000; SameSite=Lax`;
    }
    return deviceId;
  } catch {
    return 'fallback_device_' + Date.now();
  }
}
