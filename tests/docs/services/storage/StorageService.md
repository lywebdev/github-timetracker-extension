# Руководство по тестированию `StorageService` с использованием `sinon-chrome`

Это руководство предназначено для новых разработчиков, чтобы объяснить, как работает класс `StorageService`, как он взаимодействует с API Chrome и как тестируется с использованием библиотеки `sinon-chrome` в проекте.

## 1. Что такое `StorageService`?

`StorageService` — это класс в проекте, который предоставляет удобный интерфейс для работы с локальным хранилищем браузера через API `chrome.storage.local`. Этот API используется в расширениях для браузеров (например, Chrome) для сохранения и получения данных.

### Основные методы `StorageService`
- **`get<T extends StorageValue>(key: string): Promise<T | null>`**: Получает значение по указанному ключу из хранилища. Возвращает `Promise`, который разрешается в значение (типа `T`) или `null`, если ключ не найден.
- **`set<T extends StorageValue>(key: string, value: T): Promise<void>`**: Сохраняет значение по указанному ключу.
- **`remove(key: string): Promise<void>`**: Удаляет ключ из хранилища.
- **`getMultiple<T extends StorageValue>(keys: string[]): Promise<Record<string, T | null>>`**: Получает значения для нескольких ключей.
- **`removeMultiple(keys: string[]): Promise<void>`**: Удаляет несколько ключей.

Пример реализации метода `get`:

```ts
class StorageService implements IStorageService {
   async get<T extends StorageValue>(key: string): Promise<T | null> {
      return new Promise((resolve) => {
         chrome.storage.local.get(key, (data: Record<string, T>) => {
            resolve(data[key] ?? null);
         });
      });
   }
}
```

Здесь `chrome.storage.local.get` — это вызов API Chrome для получения данных из локального хранилища.

## 2. Почему нужен `sinon-chrome`?

В реальной среде (браузере) объект `chrome` предоставляется самим браузером и содержит API, такие как `chrome.storage.local`, для работы с хранилищем. Однако тесты запускаются в среде Node.js (с использованием Jest), где объекта `chrome` нет. Чтобы эмулировать поведение API Chrome в тестах, мы используем библиотеку `sinon-chrome`.

`sinon-chrome` предоставляет замоканную (mocked) версию объекта `chrome`, которая позволяет:
- Имитировать вызовы API, такие как `chrome.storage.local.get`, `set`, `remove`.
- Контролировать возвращаемые значения в тестах.
- Проверять, были ли методы API вызваны с правильными аргументами.

## 3. Настройка тестовой среды

Для интеграции `sinon-chrome` в тесты используется файл `setupTests.ts`, который выполняется перед запуском всех тестов (это указано в `jest.config.ts` через `setupFiles`).

### Код `setupTests.ts`

```ts
import * as chrome from 'sinon-chrome';

global.chrome = chrome as any;
```

- **`import * as chrome from 'sinon-chrome'`**: Импортирует замоканный объект `chrome` из библиотеки `sinon-chrome`.
- **`global.chrome = chrome as any`**: Присваивает замоканный объект глобальной переменной `chrome`, чтобы он был доступен во всех тестах и в коде `StorageService`. Это имитирует реальный объект `chrome`, который был бы в браузере.
- **`as any`**: Используется для обхода возможных ошибок типов TypeScript, так как типы `sinon-chrome` могут не полностью соответствовать реальному API Chrome.

### Jest-конфигурация (`jest.config.ts`)

Файл `jest.config.ts` настраивает Jest для работы с TypeScript и тестовой средой:

```ts
import type { JestConfigWithTsJest } from 'ts-jest';

const config: JestConfigWithTsJest = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.ts$': ['ts-jest', {}],
  },
  setupFiles: ['./setupTests.ts'],
};

export default config;
```

- **`testEnvironment: 'jsdom'`**: Устанавливает тестовую среду, имитирующую браузер.
- **`transform`**: Указывает, что файлы с расширением `.ts` обрабатываются `ts-jest` для поддержки TypeScript.
- **`setupFiles: ['./setupTests.ts']`**: Гарантирует, что `setupTests.ts` выполняется перед тестами, устанавливая `global.chrome`.

## 4. Как тестируется `StorageService`

Тесты для `StorageService` находятся в файле (например, `StorageService.test.ts`) и используют Jest и `sinon-chrome`. Рассмотрим пример теста для метода `get`:

```ts
import * as chrome from 'sinon-chrome';
import { StorageService } from '../src/services/storage/StorageService';

describe('StorageService with sinon-chrome', () => {
  let storageService: StorageService;

  beforeEach(() => {
    storageService = new StorageService();
  });

  afterEach(() => {
    chrome.flush();
  });

  it('should return value for existing key', async () => {
    chrome.storage.local.get.yields({ testKey: 'testValue' });
    const result = await storageService.get<string>('testKey');
    expect(chrome.storage.local.get.calledWith('testKey')).toBe(true);
    expect(result).toBe('testValue');
  });
});
```

### Разбор теста

1. **Импорты**:
   - `import * as chrome from 'sinon-chrome'`: Импортирует замоканный объект `chrome` для управления поведением API в тесте.
   - `import { StorageService } from '../src/services/storage/StorageService'`: Импортирует тестируемый класс.

2. **Настройка тестов**:
   - `beforeEach`: Создает новый экземпляр `StorageService`.
   - `afterEach`: Вызывает `chrome.flush()` для очистки всех заглушек после каждого теста.

3. **Тест `should return value for existing key`**:
   - **`chrome.storage.local.get.yields({ testKey: 'testValue' })`**: Настраивает заглушку так, что вызов `chrome.storage.local.get` возвращает объект `{ testKey: 'testValue' }`, имитируя хранилище с ключом `testKey` и значением `testValue`.
   - **`const result = await storageService.get<string>('testKey')`**: Вызывает метод `get` с ключом `testKey`. Метод обращается к `chrome.storage.local.get`, который замокан `sinon-chrome`.
   - **`expect(chrome.storage.local.get.calledWith('testKey')).toBe(true)`**: Проверяет, что метод `get` вызвал `chrome.storage.local.get` с правильным аргументом (`testKey`).
   - **`expect(result).toBe('testValue')`**: Проверяет, что метод `get` вернул ожидаемое значение (`testValue`).

### Как это работает?
- Когда `StorageService` вызывает `chrome.storage.local.get`, он использует глобальный объект `chrome`, который в тестовой среде подменен `sinon-chrome` (благодаря `setupTests.ts`).
- `sinon-chrome` позволяет тесту контролировать, что возвращает `chrome.storage.local.get`, и проверять, был ли метод вызван с правильными аргументами.

## 5. Почему используется `sinon-chrome`?

- **Отсутствие реального браузера**: Тесты выполняются в Node.js, где нет API Chrome. `sinon-chrome` эмулирует это API.
- **Контроль поведения**: Позволяет задавать, что возвращают методы вроде `get`, и проверять их вызовы.
- **Изоляция тестов**: Заглушки изолируют тесты от реального хранилища, делая их предсказуемыми и быстрыми.

## 6. Важные замечания для разработчиков

- **Глобальный объект `chrome`**: В тестах `chrome` — это замоканный объект из `sinon-chrome`, установленный через `setupTests.ts`. В реальном коде (в браузере) это настоящий API Chrome.
- **Асинхронность**: Методы `StorageService` асинхронны (возвращают `Promise`), поэтому в тестах используется `async/await`.
- **Типизация**: Используйте `@types/sinon-chrome` для поддержки TypeScript. Иногда требуется `as any` для обхода ошибок типов.
- **Сброс заглушек**: Всегда сбрасывайте заглушки в `beforeEach` и очищайте их в `afterEach`, чтобы тесты были независимыми.
- **ESM-совместимость**: Проект использует ECMAScript Modules (`"type": "module"` в `package.json`), поэтому импорты должны быть в формате `import * as chrome from 'sinon-chrome'`, а не `require`.

## 7. Как запустить тесты?

Для запуска тестов выполните:

```bash
npm run test
```

Для запуска в режиме наблюдения (watch):

```bash
npm run test:watch
```

Для генерации отчета о покрытии кода:

```bash
npm run test:coverage
```

## 8. Пример отладки

Если тест не проходит:
- Проверьте, что `setupTests.ts` корректно устанавливает `global.chrome`.
- Убедитесь, что заглушки (`yields`, `reset`) настроены правильно.
- Проверьте реализацию `StorageService`, чтобы убедиться, что она использует `chrome.storage.local` ожидаемым образом.

## 9. Ресурсы

- **Документация `sinon-chrome`**: [GitHub](https://github.com/acvetkov/sinon-chrome)
- **Документация Jest**: [jestjs.io](https://jestjs.io/)
- **API Chrome Storage**: [developer.chrome.com/docs/extensions/reference/storage](https://developer.chrome.com/docs/extensions/reference/storage)

Это руководство должно помочь вам понять, как `StorageService` взаимодействует с API Chrome и как тестируется с использованием `sinon-chrome`. Если у вас есть вопросы, обратитесь к старшим разработчикам или документации проекта!