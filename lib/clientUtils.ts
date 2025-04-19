'use client';

/**
 * Verifica se o código está sendo executado no navegador (cliente)
 */
export const isBrowser = typeof window !== 'undefined';

/**
 * Obtém um valor do localStorage com segurança
 * @param key Chave para buscar no localStorage
 * @param defaultValue Valor padrão caso a chave não exista ou ocorra um erro
 */
export function getLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    if (!isBrowser) return defaultValue;
    
    const stored = localStorage.getItem(key);
    if (!stored) return defaultValue;
    
    return JSON.parse(stored) as T;
  } catch (error) {
    console.error(`Erro ao acessar localStorage (${key}):`, error);
    return defaultValue;
  }
}

/**
 * Define um valor no localStorage com segurança
 * @param key Chave para armazenar
 * @param value Valor para armazenar
 */
export function setLocalStorage<T>(key: string, value: T): boolean {
  try {
    if (!isBrowser) return false;
    
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Erro ao definir localStorage (${key}):`, error);
    return false;
  }
}

/**
 * Remove um valor do localStorage com segurança
 * @param key Chave para remover
 */
export function removeLocalStorage(key: string): boolean {
  try {
    if (!isBrowser) return false;
    
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Erro ao remover localStorage (${key}):`, error);
    return false;
  }
}

/**
 * Obtém um valor de texto simples do localStorage com segurança
 * @param key Chave para buscar
 * @param defaultValue Valor padrão caso a chave não exista ou ocorra um erro
 */
export function getLocalStorageItem(key: string, defaultValue: string = ''): string {
  try {
    if (!isBrowser) return defaultValue;
    
    const value = localStorage.getItem(key);
    return value !== null ? value : defaultValue;
  } catch (error) {
    console.error(`Erro ao acessar localStorage (${key}):`, error);
    return defaultValue;
  }
} 