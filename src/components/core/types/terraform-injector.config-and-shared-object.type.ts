export type TerraformInjectorConfigAndSharedObjectType<ConfigType, SharedType> =

    | Exclude<ConfigType, undefined>
    | {
        config: Exclude<ConfigType, undefined>;
        shared: SharedType;
      };
