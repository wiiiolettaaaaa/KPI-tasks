### Task 3

```javascript
async function asyncMap(arr, asyncCallback, signal) {
    const promises = arr.map(async (item, i) => {
        try {
            if (signal && signal.aborted) {
                throw new Error("Operation aborted");
            }

            const result = await asyncCallback(item, i, arr, signal);
            return result;
        } catch (error) {
            console.error(`Error processing element at index ${i}:`, error);
            return { error: error.message, index: i };
        }
    });

    const results = await Promise.all(promises);
    return results;
}
```
Обробляє всі елементи масиву arr асинхронно за допомогою asyncCallback і підтримує скасування через AbortController.Повертає масив, у якому кожен елемент — це результат роботи asyncCallback або об’єкт із інформацією про помилку.

•	Ключові моменти:
1.	arr.map(...): Для кожного елемента масиву створюється асинхронна функція, яка:	Перевіряє, чи скасована операція (signal.aborted).	Викликає асинхронний зворотний виклик asyncCallback.	Логує помилки та повертає об’єкт із деталями помилки, якщо вона виникла.
2.	Promise.all(promises): Чекає завершення всіх асинхронних операцій та повертає масив результатів.

```javascript
const demoArray = [1, 2, 3, 4, 5];

const asyncSquare = async (x, i, arr, signal) => {
    if (signal && signal.aborted) {
        throw new Error("Operation aborted");
    }

    await new Promise((resolve, reject) => {
        const timeout = Math.random() * 50;
        const timer = setTimeout(resolve, timeout);

        signal?.addEventListener('abort', () => {
            clearTimeout(timer);
            reject(new Error("Operation aborted"));
        });
    });

    if (Math.random() < 0.2) throw new Error("Random error");
    return x * x;
};
```
Масив demoArray — це набір даних, які потрібно обробити. Асинхронно обчислює квадрат числа x з додаванням випадкової затримки та обробкою скасування. Повертає квадрат числа x або завершується помилкою.

•	Ключові моменти:
1.	Перевірка signal.aborted:
	Якщо сигнал скасування активовано, операція завершується з помилкою "Operation aborted".
2.	Асинхронна затримка:
	Симулює тривалі операції через setTimeout із випадковою затримкою.	Якщо abort активується під час очікування, таймер скасовується, а обчислення завершується помилкою.
3.	Випадкова помилка:
У 20% випадків кидається помилка "Random error", щоб перевірити обробку помилок.

```javascript
const controller = new AbortController();
const signal = controller.signal;

asyncMap(demoArray, asyncSquare, signal)
    .then(result => console.log("Results:", result))
    .catch(error => console.error("Error:", error));
```
1. Cтворення AbbortController
2. Викликається asyncMap, яка:
   *	Обробляє всі елементи demoArray за допомогою asyncSquare.
   *	Повертає результати роботи.
3. Результати логуються у консоль:
   *	Якщо все виконано успішно, результати виводяться в console.log.
   *	Якщо виникає помилка (наприклад, через некоректний сигнал або іншу проблему), вона обробляється в catch.

```javascript
setTimeout(() => {
    controller.abort();
    console.log("Operation aborted");
}, 100);
```
Через 100 мс викликається controller.abort(), що:
*	Активує сигнал abort.
*	Скасовує всі незавершені операції.