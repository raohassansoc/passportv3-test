const CountrySchemas = {
  validator: {
    name: "required|string",
  },
  niceNames: {
    name: "Name",
  },
};

const CitySchemas = {
  validator: {
    name: "required|string",
    country_id: "required",
    province_id: "required",
  },
  niceNames: {
    name: "Name",
    country_id: "Country",
    province_id: "Province",
  },
};

const ProvinceSchemas = {
  validator: {
    name: "required|string",
    country_id: "required",
  },
  niceNames: {
    name: "Name",
    country_id: "Country",
    province_id: "Province",
  },
};

const TimezoneSchemas = {
  validator: {
    zoneName: "required|string",
  },
  niceNames: {
    zoneName: "TimeZone Name",
  },
};

const WeekDaySchemas = {
  validator: {
    name: "required|string|alphaspace|minLength:2|maxLength:10|isUnique:Master/WeekDay,name",
    description: "string|maxLength:255",
  },
  niceNames: {
    name: "Name",
  },
};
const LanguageSchemas = {
  validator: {
    name: "required|alphaspace|minLength:2|maxLength:50|isUnique:Master/Language,name",
    description: "string|maxLength:255",
  },
  niceNames: {
    name: "Name",
  },
};

const ZipCodeSchemas = {
  validator: {
    name: "required|minLength:2|maxLength:50",
    city_id: "required",
    country_id: "required",
    province_id: "required",
  },
  niceNames: {
    name: "ZipCode",
    city_id: "city",
  },
};
const EquitySchemas = {
  validator: {
    total_equity: "decimal",
  },
  niceNames: {},
};

const CurrencySchema = {
  validator: {},
  niceNames: {},
};

const CurrencyCategorySchema = {
  validator: {},
  niceNames: {},
};

module.exports = {
  CitySchemas,
  CountrySchemas,
  ProvinceSchemas,
  TimezoneSchemas,
  WeekDaySchemas,
  ZipCodeSchemas,
  LanguageSchemas,
  EquitySchemas,
  CurrencySchema,
  CurrencyCategorySchema,
};
