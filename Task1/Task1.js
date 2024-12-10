async function asyncMap(arr, asyncCallback) {
    const results = [];
    for (let i = 0; i < arr.length; i++) {
        const startTime = Date.now();
        try {
            const result = await asyncCallback(arr[i], i, arr);
            results.push(result);
        } catch (error) {
            console.error(`Error processing element at index ${i}:`, error);
            results.push(null);
        }
    }
    return results;
}

const demoArray = [1, 2, 3, 4, 5];

const asyncSquare = async x => {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 50));
    if (Math.random() < 0.2) throw new Error("Random error");
    return x * x;
};

asyncMap(demoArray, asyncSquare).then(result => console.log("Results:", result));