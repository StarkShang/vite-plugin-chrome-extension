export interface UseCase<T, U> {
    description: string;
    input: T;
    output: U;
}
