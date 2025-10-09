import type { TLoadedType } from "../../type.js";
import { injectDependency } from "runtime-compiler";
import { code } from "./assert.js";

/**
 * Compile to a dependency
 */
export default (schema: TLoadedType): string => injectDependency('(()=>{' + code(schema) + '})()');
