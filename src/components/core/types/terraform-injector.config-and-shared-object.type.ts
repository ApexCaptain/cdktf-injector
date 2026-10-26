/**
 * What a configure callback returns: the element config alone, or ```[config, shared]```.
 * ```shared``` is any extra value you want to keep next to the element; read it later
 * through the container's ```shared``` getter.
 */
export type TerraformInjectorConfigAndSharedObjectType<ConfigType, SharedType> =
  Exclude<ConfigType, undefined> | [Exclude<ConfigType, undefined>, SharedType];
