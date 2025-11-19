import { either, taskEither } from "fp-ts";
import { Either } from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { TaskEither } from "fp-ts/lib/TaskEither";

/**
 * Maps a Promise which returns `Either<E, V>` into a `TaskEither<E, V>`.
 */
export function teFromEP<E, V>(promise: Promise<Either<E, V>>): TaskEither<E, V> {
    return pipe(
        taskEither.fromTask(() => promise),
        taskEither.map(taskEither.fromEither),
        taskEither.flatten,
    );
}

/**
 * Maps the `Right` variant of an `Either<E, V>` into a `TaskEither<E | E2, V2>`.
 */
export function mapEitherIntoTE<E, V, E2, V2>(task: (v: V) => Promise<Either<E2, V2>>): (e: Either<E, V>) => TaskEither<E | E2, V2>{
    return (e: Either<E, V>) => {
        return pipe(
            e,
            either.map(value => teFromEP(task(value))),
            taskEither.fromEither,
            taskEither.flattenW,
            a => a,
        );
    }
}