'use client';

/**
 * Verifica se o código está rodando no navegador
 */
export const isBrowser = typeof window !== 'undefined';

/**
 * Obtém um item do localStorage com validação
 * @param key A chave do item
 * @param defaultValue Valor padrão caso o item não exista
 * @returns O valor armazenado ou o valor padrão
 */
export function getLocalStorageItem<T>(key: string, defaultValue: T): T {
  if (!isBrowser) return defaultValue;
  
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    return JSON.parse(item) as T;
  } catch (e) {
    console.error(`Erro ao ler "${key}" do localStorage:`, e);
    return defaultValue;
  }
}

/**
 * Armazena um item no localStorage com tratamento de erros
 * @param key A chave do item
 * @param value O valor a ser armazenado
 * @returns true se o armazenamento foi bem-sucedido
 */
export function setLocalStorageItem<T>(key: string, value: T): boolean {
  if (!isBrowser) return false;
  
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error(`Erro ao salvar "${key}" no localStorage:`, e);
    return false;
  }
}

/**
 * Remove um item do localStorage
 * @param key A chave do item a ser removido
 */
export function removeLocalStorageItem(key: string): void {
  if (!isBrowser) return;
  
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.error(`Erro ao remover "${key}" do localStorage:`, e);
  }
}

/**
 * Limpa todos os dados do localStorage
 */
export function clearLocalStorage(): void {
  if (!isBrowser) return;
  
  try {
    localStorage.clear();
  } catch (e) {
    console.error("Erro ao limpar localStorage:", e);
  }
}

/**
 * Verifica se há suporte a localStorage no navegador
 */
export function hasLocalStorageSupport(): boolean {
  if (!isBrowser) return false;
  
  try {
    const testKey = "__test__";
    localStorage.setItem(testKey, testKey);
    const result = localStorage.getItem(testKey) === testKey;
    localStorage.removeItem(testKey);
    return result;
  } catch (e) {
    return false;
  }
} 