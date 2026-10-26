/**
 * Sync and async injection were mixed: ```scopesOn``` and ```scopesOnAsync``` on one scope, or a
 * sync ```inject()``` reached a nested async injector that still has pending elements.
 */
export class TerraformInjectorConflictedInjectingMethodTypeError extends Error {}
