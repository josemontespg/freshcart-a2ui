import type { A2UICheckRule } from '../types/a2ui-v1';
import {
  type DataEvaluationContext,
  coerceToBoolean,
  evaluateDynamicValue,
  isValidationResult,
} from './DataModelBinder';

export interface EvaluatedCheckItem {
  valid: boolean;
  code?: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface ComponentValidationState {
  isValid: boolean;
  hasErrors: boolean;
  hasWarnings: boolean;
  hasInfos: boolean;
  items: EvaluatedCheckItem[];
  failedItems: EvaluatedCheckItem[];
  firstErrorMessage?: string;
}

const VALID_DEFAULT_STATE: ComponentValidationState = {
  isValid: true,
  hasErrors: false,
  hasWarnings: false,
  hasInfos: false,
  items: [],
  failedItems: [],
  firstErrorMessage: undefined,
};

/**
 * Evaluates a single `A2UICheckRule` (`{ condition, message? }`) against the
 * active `DataEvaluationContext`.
 *
 * Per the A2UI v1.0 specification (`common_types.json#/$defs/CheckRule`):
 * - `condition` evaluates either to a structured `A2UIValidationResult` object
 *   (`{ valid, code?, message?, severity? }`) or a boolean.
 * - `rule.message` acts as the custom error message override / fallback when `!valid`.
 */
export function evaluateSingleCheckRule(
  rule: A2UICheckRule,
  context: DataEvaluationContext
): EvaluatedCheckItem {
  const rawOutcome = evaluateDynamicValue(rule.condition, context);

  if (isValidationResult(rawOutcome)) {
    const valid = Boolean(rawOutcome.valid);
    const severity = rawOutcome.severity ?? 'error';
    const message = valid
      ? rawOutcome.message ?? ''
      : rule.message || rawOutcome.message || 'Validation check failed.';
    return {
      valid,
      code: rawOutcome.code,
      message,
      severity,
    };
  }

  const valid = coerceToBoolean(rawOutcome);
  return {
    valid,
    code: valid ? undefined : 'CHECK_FAILED',
    message: valid ? '' : rule.message || 'Validation requirement not met.',
    severity: 'error',
  };
}

/**
 * Evaluates all `checks` configured on an A2UI v1.0 Checkable component
 * (`Button`, `TextField`, `CheckBox`, `ChoicePicker`, `Slider`, `DateTimeInput`).
 */
export function evaluateComponentChecks(
  checks: A2UICheckRule[] | undefined,
  context: DataEvaluationContext
): ComponentValidationState {
  if (!checks || !Array.isArray(checks) || checks.length === 0) {
    return VALID_DEFAULT_STATE;
  }

  const items = checks.map((rule) => evaluateSingleCheckRule(rule, context));
  const failedItems = items.filter((item) => !item.valid);
  const errorItems = failedItems.filter((item) => item.severity === 'error');
  const warningItems = failedItems.filter((item) => item.severity === 'warning');
  const infoItems = failedItems.filter((item) => item.severity === 'info');

  return {
    isValid: errorItems.length === 0,
    hasErrors: errorItems.length > 0,
    hasWarnings: warningItems.length > 0,
    hasInfos: infoItems.length > 0,
    items,
    failedItems,
    firstErrorMessage: errorItems[0]?.message ?? failedItems[0]?.message,
  };
}
