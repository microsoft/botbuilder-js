/// <summary>
/// Reads blob as ArrayBuffer.
/// </summary>

export default async function readAsArrayBuffer(blob): Promise<ArrayBuffer> {
    return new Promise<ArrayBuffer>((resolve, reject) => {
        try {
            const fileReader = new FileReader();

            fileReader.onload = event => {
                const target = event.target as FileReader;

                resolve(target.result as ArrayBuffer);
            };

            fileReader.onerror = () => reject(new Error('Failed to read blob as array buffer.'));

            fileReader.readAsArrayBuffer(blob);
        } catch (err) {
            reject(err);
        }
    });
}
