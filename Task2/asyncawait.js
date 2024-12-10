async function asyncMap(arr, asyncCallback) {
    const promises = arr.map(async (item, i) => {
        try {
            const result = await asyncCallback(item, i, arr);
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

const asyncSquare = async x => {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 50));
    if (Math.random() < 0.2) throw new Error("Random error");
    return x * x;
};

asyncMap(demoArray, asyncSquare).then(result => console.log("Results:", result));