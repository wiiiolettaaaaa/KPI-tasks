async function asyncMap(arr, asyncCallback, signal) {
    const promises = arr.map(async (item, i) => {
        try {
            if (signal && signal.aborted) { //перевірка чи сигнал скасовано
                throw new Error("Operation aborted");
            }

            const result = await asyncCallback(item, i, arr, signal); //виклик зворотнього виклику для обробки
            return result;
        } catch (error) {
            console.error(`Error processing element at index ${i}:`, error);
            return { error: error.message, index: i };
        }
    });

    const results = await Promise.all(promises);
    return results;
}

const demoArray = [1, 2, 3, 4, 5];

const asyncSquare = async (x, i, arr, signal) => {
    if (signal && signal.aborted) { //перевірка чи сигнал скасовано на початку
        throw new Error("Operation aborted");
    }

    await new Promise((resolve, reject) => { //асинхрона затримка
        const timeout = Math.random() * 50;
        const timer = setTimeout(resolve, timeout);

        signal?.addEventListener('abort', () => {
            clearTimeout(timer); //чистка таймера щоб уникнути витік памяті
            reject(new Error("Operation aborted"));
        });
    });

    if (Math.random() < 0.2) throw new Error("Random error");
    return x * x;
};

const controller = new AbortController();
const signal = controller.signal;

asyncMap(demoArray, asyncSquare, signal)
    .then(result => console.log("Results:", result))
    .catch(error => console.error("Error:", error));

setTimeout(() => { //скасування оперції через 100мс
    controller.abort();
    console.log("Operation aborted");
}, 100);