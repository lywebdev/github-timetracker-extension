- https://developer.chrome.com/docs/extensions/how-to/test/unit-testing?hl=ru
- https://medium.com/@victoronsoftware/add-unit-tests-to-chrome-extension-2024-fe0b9dc1b688
- https://jestjs.io/docs/jest-object#jestspyonobject-methodname

# Examples repos: 
- https://github.com/getvictor/create-chrome-extension/tree/main/7-unit-tests


# Тестирование Chrome API с использованием Jest Mocks

## Введение

При тестировании кода, который взаимодействует с Chrome API (например, `chrome.storage.local` или `chrome.runtime`), в среде Jest требуется имитация этого API, так как Jest работает в Node.js, где объект `chrome` отсутствует. Для этого используется механизм моков (mock functions) в Jest. В данном документе описывается, как настроить глобальный мок для Chrome API в `__mocks__/chrome.ts`, когда его использовать, и как переопределять поведение в тестах для возврата разных значений.

## Зачем нужен глобальный мок `__mocks__/chrome.ts`?

Файл `__mocks__/chrome.ts` — это глобальный мок, который автоматически применяется Jest ко всем тестам, если он указан в `jest.config.ts` через опцию `setupFiles`. Его основное назначение:

- **Имитация Chrome API**: Предоставляет фейковый объект `chrome`, чтобы код, использующий `chrome.storage`, `chrome.runtime` и т.д., не вызывал ошибку `chrome is not defined`.
- **Упрощение тестирования**: Позволяет избежать дублирования кода мока в каждом тестовом файле.
- **Контроль поведения**: Дает возможность отслеживать вызовы методов и задавать их поведение в тестах.

### Пример глобального мока
Файл `__mocks__/chrome.ts` может выглядеть так:

```typescript
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
global.chrome = {
  runtime: {
    onMessage: {
      addListener: jest.fn(),
      hasListeners: jest.fn(() => true),
    },
    onInstalled: {
      addListener: jest.fn(),
    },
    onStartup: {
      addListener: jest.fn(),
    },
    sendMessage: jest.fn(),
  },
  storage: {
    sync: {
      get: jest.fn(),
      set: jest.fn(),
    },
    local: {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn(),
    },
  },
};
```

Этот мок предоставляет базовую структуру Chrome API, где методы вроде `get`, `set`, `addListener` и т.д. заменены на функции Jest (`jest.fn()`), которые можно настроить в тестах.

## Когда использовать глобальный мок?

Глобальный мок из `__mocks__/chrome.ts` рекомендуется использовать, если:

- Ваш проект активно взаимодействует с Chrome API (например, в расширениях для браузера).
- Вы хотите централизованно определить базовую реализацию Chrome API для всех тестов.
- Вам нужно минимизировать дублирование кода мока в тестовых файлах.

**Когда он не нужен?**
- Если код не использует Chrome API, мок не будет задействован и не повлияет на тесты.
- Если требуется специфическое поведение, отличающееся от глобального мока, его можно переопределить в конкретных тестах (см. ниже).

## Переопределение поведения мока в тестах

Часто в разных тестах требуется, чтобы методы Chrome API возвращали разные значения или вели себя по-разному. Глобальный мок задает базовую структуру, но его поведение можно переопределить в отдельных тестах с помощью методов Jest, таких как `mockImplementation`, `mockReturnValue` или `mockResolvedValue`.

### Пример: Разные возвращаемые значения

Предположим, вы тестируете сервис `StorageService`, который использует `chrome.storage.local.get`. В одном тесте метод должен вернуть `{ key: 'value' }`, а в другом — `{}`.

```typescript
import { StorageService } from '../services/github/StorageService';

describe('StorageService', () => {
  let storageService: StorageService;

  beforeEach(() => {
    storageService = new StorageService();
    jest.clearAllMocks(); // Очищаем вызовы моков перед каждым тестом
  });

  it('should return a value for an existing key', async () => {
    // Переопределяем chrome.storage.local.get
    chrome.storage.local.get.mockImplementation((keys, callback) => {
      callback({ testKey: 'testValue' });
    });

    const result = await storageService.get<string>('testKey');
    expect(chrome.storage.local.get).toHaveBeenCalledWith('testKey', expect.any(Function));
    expect(result).toBe('testValue');
  });

  it('should return null for a non-existing key', async () => {
    // Переопределяем chrome.storage.local.get для другого случая
    chrome.storage.local.get.mockImplementation((keys, callback) => {
      callback({});
    });

    const result = await storageService.get<string>('testKey');
    expect(chrome.storage.local.get).toHaveBeenCalledWith('testKey', expect.any(Function));
    expect(result).toBeNull();
  });
});
```

### Объяснение
- **Переопределение**: В каждом тесте метод `chrome.storage.local.get` настраивается с помощью `mockImplementation` для возврата нужных данных.
- **Изоляция**: `jest.clearAllMocks()` в `beforeEach` очищает историю вызовов моков, чтобы тесты не влияли друг на друга.
- **Гибкость**: Можно задавать любое поведение, например, возвращать числа, объекты или вызывать коллбэки с ошибками.

### Использование `mockReturnValue`
Для простых случаев, когда нужно только задать возвращаемое значение:

```typescript
it('should return a specific value', async () => {
  chrome.storage.local.get.mockImplementation((keys, callback) => {
    callback({ testKey: 42 });
  });

  const result = await storageService.get<number>('testKey');
  expect(result).toBe(42);
});
```

## Отключение глобального мока

Если в каком-то тесте глобальный мок из `__mocks__/chrome.ts` не нужен или мешает, его можно временно отключить:

```typescript
it('should test without global chrome mock', () => {
  jest.unmock('chrome'); // Отключаем глобальный мок
  global.chrome = {
    storage: {
      local: {
        get: jest.fn((keys, callback) => callback({ customKey: 'customValue' })),
      },
    },
  };

  const result = await storageService.get<string>('customKey');
  expect(result).toBe('customValue');
});
```

**Важно**: После таких тестов восстановите глобальный мок с помощью `jest.resetModules()` или `jest.restoreAllMocks()`, чтобы не повлиять на другие тесты.

## Локальный мок вместо глобального

Если глобальный мок не нужен или вы хотите использовать другой мок только для одного тестового файла:

```typescript
beforeEach(() => {
  global.chrome = {
    storage: {
      local: {
        get: jest.fn(),
        set: jest.fn(),
        remove: jest.fn(),
      },
    },
  };
});
```

Однако это менее удобно для проектов с большим количеством тестов, зависящих от Chrome API, так как требует дублирования кода.

## Рекомендации

1. **Очистка моков**:
    - Используйте `jest.clearAllMocks()` в `beforeEach`, чтобы избежать влияния предыдущих тестов на последующие.
    - Если нужно сбросить реализацию моков, используйте `jest.resetAllMocks()`.

2. **Динамическое поведение**:
    - Для реалистичной имитации Chrome API настройте моки так, чтобы они реагировали на действия (например, `hasListeners` возвращает `true` только после вызова `addListener`).

3. **Отладка**:
    - Используйте `console.log` для проверки вызовов моков:
      ```typescript
      console.log(chrome.storage.local.get.mock.calls);
      ```
    - Это помогает понять, как и с какими аргументами вызывается мок.

4. **Типизация**:
    - Если вы хотите строгую типизацию, уберите `@ts-nocheck` из `__mocks__/chrome.ts` и используйте типы из `@types/chrome`:
      ```typescript
      import type { Runtime, Storage } from 'webextension-polyfill';
 
      const chromeMock: Partial<Runtime.Static & Storage.Static> = {
        storage: {
          local: {
            get: jest.fn(),
            set: jest.fn(),
            remove: jest.fn(),
          },
        },
      };
      global.chrome = chromeMock as any;
      ```

## Заключение

Глобальный мок `__mocks__/chrome.ts` — это удобный способ имитировать Chrome API для всех тестов, минимизируя дублирование кода. Для ситуаций, когда методы должны возвращать разные значения в разных тестах, используйте `mockImplementation` или `mockReturnValue` для переопределения поведения. Если глобальный мок мешает, его можно временно отключить или заменить локальным моков. Следуя этим рекомендациям, вы сможете гибко тестировать код, зависящий от Chrome API, с полной изоляцией и контролем.