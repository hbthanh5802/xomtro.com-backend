// Định nghĩa các operators được hỗ trợ
type SupportedOperator =
  | 'eq'
  | 'ne'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'in'
  | 'notIn'
  | 'between'
  | 'like'
  | 'ilike'
  | 'isNull'
  | 'isNotNull';

// Helper type để xác định kiểu giá trị dựa vào operator
type OperatorValueType<T, O extends SupportedOperator> = O extends 'in' | 'notIn'
  ? T[]
  : O extends 'between'
    ? [T, T]
    : O extends 'isNull' | 'isNotNull'
      ? never
      : T;

// Helper type để xác định operators hợp lệ cho mỗi kiểu dữ liệu
type ValidOperatorsForType<T> = T extends string
  ? 'eq' | 'ne' | 'in' | 'notIn' | 'like' | 'ilike' | 'isNull' | 'isNotNull'
  : T extends number
    ? 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'notIn' | 'between' | 'isNull' | 'isNotNull'
    : T extends Date
      ? 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'between' | 'isNull' | 'isNotNull'
      : T extends boolean
        ? 'eq' | 'ne' | 'isNull' | 'isNotNull'
        : never;

// Type cho một condition
export type Condition<T, K extends keyof T> = {
  operator: ValidOperatorsForType<T[K]>;
  value: OperatorValueType<T[K], ValidOperatorsForType<T[K]>>;
};

// Type cho conditions object
export type ConditionsType<T> = {
  [K in keyof T]?: Condition<T, K>;
};
