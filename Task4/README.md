### Task4
```javascript
async function asyncMap(arr, asyncCallback, signal, chunkSize = 10) {
    const { Readable } = require('stream');
```
Функція створює потік зі списку (використовує модуль stream) та викликає іншу функцію для обробки елементів за допомогою потоків.

```javascript
const asyncSquare = async (x, i, arr, signal) => {
        if (signal?.aborted) {
            throw new Error("Операцію скасовано");
        }

        await new Promise((resolve, reject) => {
            const timeout = Math.random() * 50;
            const timer = setTimeout(resolve, timeout);

            const abortHandler = () => {
                clearTimeout(timer);
                reject(new Error("Операцію скасовано"));
            };

            signal?.addEventListener('abort', abortHandler);

            const cleanUp = () => signal?.removeEventListener('abort', abortHandler);
            setTimeout(cleanUp, timeout);
        });

        if (Math.random() < 0.2) throw new Error("Випадкова помилка");
        return x * x;
    };
```

* Виконує асинхронну операцію для кожного числа x.
* Викидає помилку, якщо операцію скасовано (signal.aborted).
* Чекає випадковий час перед обчисленням, щоб імітувати затримку.

```javascript
async function asyncMapStream(stream, asyncCallback, signal, chunkSize = 10) {
        const results = [];
        let chunk = [];
        let index = 0;

        for await (const item of stream) {
            chunk.push(item);

            if (chunk.length === chunkSize) {
                const chunkResults = await processChunk(chunk, asyncCallback, index, signal);
                results.push(...chunkResults);
                index += chunk.length;
                chunk = [];
            }
        }

        if (chunk.length > 0) {
            const chunkResults = await processChunk(chunk, asyncCallback, index, signal);
            results.push(...chunkResults);
        }

        return results;
    }
```

Обробляє потік даних у “пакетах” розміром chunkSize:
*	Зчитує дані з потоку.
*	Збирає дані в масив chunk.
*	Після заповнення “пакету” або завершення потоку:
     1. Викликає функцію processChunk для обробки пакету.
     2. Додає результати до масиву results.

```javascript
async function processChunk(chunk, asyncCallback, startIndex, signal) {
        const promises = chunk.map(async (item, i) => {
            try {
                if (signal?.aborted) {
                    throw new Error("Операцію скасовано");
                }

                const result = await asyncCallback(item, i + startIndex, chunk, signal);
                return result;
            } catch (error) {
                console.error(`Помилка при обробці елемента на індексі ${i + startIndex}:`, error);
                return { error: error.message, index: i + startIndex };
            }
        });

        return await Promise.all(promises);
    }
```

Обробляє “пакет” елементів із затримками та обробкою помилок:
*	Для кожного елемента викликає асинхронну функцію asyncCallback. 
* Якщо є помилка, додає інформацію про неї в результати. 
* Повертає всі результати за допомогою Promise.all.

```javascript
const demoArray = Array.from({ length: 5 }, (_, i) => i + 1);

const controller = new AbortController();
const signal = controller.signal;
```
* demoArray — масив чисел від 1 до 1000. 
* controller та signal — використовується для скасування операцій.

```javascript
asyncMap(demoArray, async (x, i, arr, signal) => {
    if (signal?.aborted) {
        throw new Error("Операцію скасовано");
    }

    await new Promise((resolve, reject) => {
        const timeout = Math.random() * 50;
        const timer = setTimeout(resolve, timeout);

        const abortHandler = () => {
            clearTimeout(timer);
            reject(new Error("Операцію скасовано"));
        };

        signal?.addEventListener('abort', abortHandler);

        const cleanUp = () => signal?.removeEventListener('abort', abortHandler);
        setTimeout(cleanUp, timeout);
    });

    if (Math.random() < 0.2) throw new Error("Випадкова помилка");
    return x * x;
}, signal)
    .then(result => console.log("Остаточні результати:", result))
    .catch(error => console.error("Помилка:", error));
```
* Передає масив demoArray, асинхронну функцію та сигнал. 
* Викликає функцію для обробки кожного елемента масиву.

```javascript
setTimeout(() => {
    controller.abort();
    console.log("Операцію скасовано");
}, 100);
```
* Скасування (AbortController)
* Скасовує операції через 100 мс (controller.abort()).
