import { BackHandler, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';

import { createFinanceDependencies } from '../../modules/finance/service/finance.dependencies';

const CLEANUP_TIMEOUT_MS = 1500;

async function withTimeout<T>(task: Promise<T>, timeoutMs: number): Promise<T | undefined> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(undefined), timeoutMs);
    task
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch(() => {
        clearTimeout(timer);
        resolve(undefined);
      });
  });
}

async function clearTemporaryCache(): Promise<void> {
  if (Platform.OS === 'web' || !FileSystem.cacheDirectory) return;

  try {
    const entries = await FileSystem.readDirectoryAsync(FileSystem.cacheDirectory);
    await Promise.all(
      entries.map((entry) =>
        FileSystem.deleteAsync(`${FileSystem.cacheDirectory}${entry}`, {
          idempotent: true,
        }),
      ),
    );
  } catch {
    // Cache cleanup is best-effort and must never prevent the app from closing.
  }
}

export async function exitAppSafely(): Promise<void> {
  try {
    const { repository } = createFinanceDependencies();
    await withTimeout(repository.cleanup(), CLEANUP_TIMEOUT_MS);
    await withTimeout(clearTemporaryCache(), CLEANUP_TIMEOUT_MS);
  } finally {
    if (Platform.OS === 'android') {
      BackHandler.exitApp();
    }
  }
}
