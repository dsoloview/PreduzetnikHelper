import type { TransformFnParams } from "class-transformer";

/**
 * `class-transformer` callback that trims a string and converts an empty
 * result to `undefined`. Use with `@Transform(emptyToUndefined)` on optional
 * string fields so that `@IsOptional()` actually skips validation when the
 * client sends `""` from a web form.
 *
 * Non-string values are returned unchanged.
 */
export const emptyToUndefined = ({ value }: TransformFnParams): unknown => {
    if (typeof value !== "string") return value;
    const trimmed = value.trim();
    return trimmed === "" ? undefined : trimmed;
};
