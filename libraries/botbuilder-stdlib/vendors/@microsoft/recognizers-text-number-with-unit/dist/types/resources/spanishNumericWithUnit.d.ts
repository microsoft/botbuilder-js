export declare namespace SpanishNumericWithUnit {
    const AgeSuffixList: ReadonlyMap<string, string>;
    const AreaSuffixList: ReadonlyMap<string, string>;
    const AreaAmbiguousValues: string[];
    const CurrencySuffixList: ReadonlyMap<string, string>;
    const CompoundUnitConnectorRegex = "(?<spacer>[^.])";
    const CurrencyPrefixList: ReadonlyMap<string, string>;
    const AmbiguousCurrencyUnitList: string[];
    const DimensionSuffixList: ReadonlyMap<string, string>;
    const AmbiguousDimensionUnitList: string[];
    const LengthSuffixList: ReadonlyMap<string, string>;
    const AmbiguousLengthUnitList: string[];
    const BuildPrefix = "(?<=(\\s|^|\\P{L}))";
    const BuildSuffix = "(?=(\\s|\\P{L}|$))";
    const ConnectorToken = "de";
    const SpeedSuffixList: ReadonlyMap<string, string>;
    const AmbiguousSpeedUnitList: string[];
    const TemperatureSuffixList: ReadonlyMap<string, string>;
    const VolumeSuffixList: ReadonlyMap<string, string>;
    const WeightSuffixList: ReadonlyMap<string, string>;
}
