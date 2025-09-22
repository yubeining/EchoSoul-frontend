import { useState, useEffect, useCallback } from 'react';
import { userApi } from '../services/api';
import { error as logError } from '../utils/logger';

export interface UserSearchResult {
  id: number;
  uid: string;
  username: string;
  nickname: string;
  email?: string;
  mobile?: string;
  avatar?: string;
  intro?: string;
  lastActive?: string;
  createdAt?: string;
}

interface UseUserSearchOptions {
  debounceMs?: number;
  minQueryLength?: number;
}

export const useUserSearch = (options: UseUserSearchOptions = {}) => {
  const { debounceMs = 300, minQueryLength = 2 } = options;
  
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 当查询变化时触发搜索（带防抖）
  useEffect(() => {
    if (query.length < minQueryLength) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      setError(null);

      try {
        // 调用真实的API
        const response = await userApi.searchUsers(query);
        setResults(response.data.users);
      } catch (err) {
        logError('用户搜索失败:', err);
        setError(err instanceof Error ? err.message : '搜索失败');
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [query, debounceMs, minQueryLength]);

  // 清空搜索结果
  const clearResults = useCallback(() => {
    setResults([]);
    setQuery('');
    setError(null);
  }, []);

  return {
    query,
    setQuery,
    results,
    isSearching,
    error,
    clearResults
  };
};

