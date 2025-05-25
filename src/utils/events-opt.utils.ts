

//@ts-expect-error ignore

export function makeDebounceFunction(func, delay: number) {
    let timer: ReturnType<typeof setTimeout>;
//@ts-expect-error ignore
    return (...args) => {
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(() => {
            func(...args);
        }, delay);
    };
}
