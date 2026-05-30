import type { TransformFnParams } from "class-transformer";

export const emptyToUndefined = ({ value }: TransformFnParams): unknown => {
    if (typeof value !== "string") return value;
    const trimmed = value.trim();
    return trimmed === "" ? undefined : trimmed;
};
