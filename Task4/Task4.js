async function asyncMap(arr, asyncCallback, signal, chunkSize = 10) {
    const { Readable } = require('stream');

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

    const demoArray = Array.from({ length: 5 }, (_, i) => i + 1);
    const stream = Readable.from(demoArray);
    const controller = new AbortController();

    asyncMapStream(stream, asyncSquare, signal, 20)
        .then(result => console.log("Остаточні результати:", result))
        .catch(error => console.error("Помилка:", error));

    setTimeout(() => {
        controller.abort();
        console.log("Операцію скасовано");
    }, 100);
}

const demoArray = Array.from({ length: 5 }, (_, i) => i + 1);

const controller = new AbortController();
const signal = controller.signal;

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

setTimeout(() => {
    controller.abort();
    console.log("Операцію скасовано");
}, 100);