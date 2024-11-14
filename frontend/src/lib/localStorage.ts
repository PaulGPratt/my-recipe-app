export function setLocalStorage(key: string, value: any) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Get an item from localStorage
export function getLocalStorage(key: string) {
  const value = localStorage.getItem(key);
  return value ? JSON.parse(value) : null;
}

// Remove an item from localStorage
export function removeLocalStorage(key: string) {
  localStorage.removeItem(key);
}
