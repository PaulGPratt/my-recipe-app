// cookieUtils.js

// Set a cookie with an expiry in days
export function setCookie(name: string, value: string, days: number) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
  }
  
  // Get a cookie value by name
  export function getCookie(name : string) : string {
    return document.cookie.split('; ').reduce((acc, cookie) => {
      const [key, val] = cookie.split('=');
      return key === name ? decodeURIComponent(val) : acc;
    }, '');
  }
  
  // Delete a cookie by name
  export function deleteCookie(name: string) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
  