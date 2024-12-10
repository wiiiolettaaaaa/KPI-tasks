function promiseMap(arr, promiseCallback) {
    const promises = arr.map((item, index) =>
        promiseCallback(item, index, arr)
    );

    return Promise.all(promises);
}

const demoArray = [1, 2, 3, 4, 5];

const promiseSquare = x =>
    new Promise((resolve, reject) => {
        setTimeout(() => {
            if (Math.random() < 0.2) reject(new Error("Random error"));
            else resolve(x * x);
        }, Math.random() * 50);
    });

promiseMap(demoArray, promiseSquare).then(result => console.log("Results:", result));
