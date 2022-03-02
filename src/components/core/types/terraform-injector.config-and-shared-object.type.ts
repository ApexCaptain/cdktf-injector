export type TerraformInjectorConfigAndSharedObjectType<ConfigType, SharedType> =
  Exclude<ConfigType, undefined> | [Exclude<ConfigType, undefined>, SharedType];
