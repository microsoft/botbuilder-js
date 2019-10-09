/// <summary>
/// Creates a function that will sequentially return its asynchronous output.
/// </summary>
export default function createAsyncSequencer<Result>(): (promise: Promise<Result>) => Promise<Result> {
    const queue = [];
    let busy;
    const release = async () => {
        if (busy) { return; }

        try {
            busy = true;

            while (queue.length) {
                const { promise, reject, resolve } = queue.shift();

                await promise.then(resolve, reject);
            }
        } finally {
            busy = false;
        }
    };

    return promise => {
        return new Promise<Result>((resolve, reject) => {
            queue.push({ promise, reject, resolve });

            // Although release() is an async function, we will fire-and-forget.
            // release() will do reject/resolve for us, so we should not wait for its completion.
            release();
        });
    };
}
