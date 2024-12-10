function asyncMap(arr, asyncCallback, signal) {
    //використання abortcontroller для скасування
    // якщо сигнал не передано додаємо новий контролер
    const abortController = signal || new AbortController();
    const { signal: abortSignal } = abortController;

    //обробка масиву з урахуванням скасування
    const promises = arr.map(async (item, i) => {
        if (abortSignal.aborted) { //перевірка чи скасовано операцію до виконання
            return { error: 'Operation aborted', index: i };
        }

        try {
            const result = await asyncCallback(item, i, arr, abortSignal);
            return result;
        } catch (error) {
            if (abortSignal.aborted) { //обробка скасування під час виконання
                return { error: 'Operation aborted', index: i };
            }
            console.error(`Error processing element at index ${i}:`, error); //залишаю з 2 таски логування помилок
            return { error: error.message, index: i };
        }
    });

    const results = Promise.all(promises);
    return { results, abortController };
}

const demoArray = [1, 2, 3, 4, 5];

const asyncSquare = async (x, i, arr, signal) => {
    await new Promise((resolve, reject) => {
        const timeout = setTimeout(resolve, Math.random() * 50);
        signal.addEventListener('abort', () => { // перевірка скасування та виклик reject якщо скасовано
            clearTimeout(timeout); //чистка таймера щоб уникнути витік памяті
            reject(new Error('Operation aborted'));
        });
    });
    if (Math.random() < 0.2) throw new Error("Random error");
    return x * x;
};

const { results, abortController } = asyncMap(demoArray, asyncSquare);

setTimeout(() => abortController.abort(), 100); //операція скасується якщо більше 100мс

results.then(res => console.log("Results:", res)).catch(err => console.error("Error:", err));