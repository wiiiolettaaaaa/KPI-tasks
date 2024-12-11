const { EventEmitter } = require('events');
const { Readable } = require('stream');

async function asyncMap(arr, asyncCallback, signal, chunkSize = 10) {
    const events = new EventEmitter();

    const asyncSquare = async (x, i, arr, signal) => {
        if (signal && signal.aborted) {
            throw new Error("Operation aborted");
        }

        await new Promise((resolve, reject) => {
            const timeout = Math.random() * 50;
            const timer = setTimeout(resolve, timeout);

            const abortHandler = () => {
                clearTimeout(timer);
                reject(new Error("Operation aborted"));
            };

            signal?.addEventListener('abort', abortHandler);

            setTimeout(() => {
                signal?.removeEventListener('abort', abortHandler);
            }, timeout);
        });

        if (Math.random() < 0.2) throw new Error("Random error");
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
                if (signal && signal.aborted) {
                    throw new Error("Operation aborted");
                }

                const result = await asyncCallback(item, i + startIndex, chunk, signal);
                events.emit('progress', { index: i + startIndex, value: result });
                return result;
            } catch (error) {
                events.emit('error', { index: i + startIndex, error: error.message });
                return { error: error.message, index: i + startIndex };
            }
        });

        return await Promise.all(promises);
    }

    const stream = Readable.from(arr);

    asyncMapStream(stream, asyncSquare, signal, chunkSize)
        .then(results => {
            events.emit('complete', results);
        })
        .catch(error => {
            events.emit('failure', error);
        });

    return events;
}

const demoArray = Array.from({ length: 1000 }, (_, i) => i + 1);
const controller = new AbortController();
const signal = controller.signal;

const events = asyncMap(demoArray, asyncSquare, signal, 20);

events.on('progress', data => {
    console.log(`Processed index ${data.index}, result: ${data.value}`);
});

events.on('error', error => {
    console.error(`Error at index ${error.index}: ${error.error}`);
});

events.on('complete', results => {
    console.log('Final results:', results);
});

events.on('failure', error => {
    console.error('Operation failed:', error);
});

setTimeout(() => {
    controller.abort();
    console.log("Operation aborted");
}, 100);