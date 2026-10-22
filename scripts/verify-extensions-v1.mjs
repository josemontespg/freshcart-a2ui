import assert from 'node:assert/strict';
import {
  ExtensionsSchema as V10ExtensionsSchema,
  CreateSurfaceMessageSchema,
  ActionMessageSchema,
  MessageProcessor,
  PayloadValidator,
  STRICT_VALIDATION,
  basicCatalog,
} from '@a2ui/web_core/v1_0';
import { ExtensionsSchema as SharedExtensionsSchema } from '../node_modules/@a2ui/web_core/src/types/common-types.js';

console.log('=== Verifying A2UI v1.0 Protocol Extensions (metadata.extensions) ===\n');

// 1. Verify valid UAX #31 extension keys on CreateSurfaceMessageSchema & ActionMessageSchema
const validCreateSurface = {
  version: 'v1.0',
  createSurface: {
    surfaceId: 'extensions_showcase_surface',
    catalogId: basicCatalog.id,
    sendDataModel: true,
    metadata: {
      extensions: {
        freshcart_theme: { palette: 'harvest-gold', accentColor: '#D97706' },
        freshcart_confettiOnAction: { enabled: true, particleCount: 32 },
        freshcart_aisleHighlight: { storeId: 'freshcart-organic', interactiveStorefrontSync: true },
        freshcart_animations: { surfaceTransition: 'smooth-reveal' },
        freshcart_analyticsProvenance: { campaignId: 'chef_tasting_extensions_2026' },
        a2ui_telemetry: { sessionId: 'fc_ext_session_v1' },
      },
    },
  },
};

const parsedSurface = CreateSurfaceMessageSchema.safeParse(validCreateSurface);
assert.equal(parsedSurface.success, true, 'Valid UAX #31 surface metadata.extensions should pass');
console.log('✓ 1. CreateSurfaceMessageSchema accepts valid UAX #31 metadata.extensions');

const validActionMessage = {
  version: 'v1.0',
  action: {
    name: 'add_tasting_board_to_cart',
    surfaceId: 'extensions_showcase_surface',
    sourceComponentId: 'add_tasting_board_btn',
    timestamp: new Date().toISOString(),
    context: { guestCount: 4 },
    metadata: {
      extensions: {
        freshcart_analyticsProvenance: { conversionEvent: 'add_tasting_board_bundle' },
        freshcart_clientContext: { confettiFired: true },
        a2ui_telemetry: { roundTripVerified: true },
      },
    },
  },
};

const parsedAction = ActionMessageSchema.safeParse(validActionMessage);
assert.equal(parsedAction.success, true, 'Valid UAX #31 action metadata.extensions should pass');
console.log('✓ 2. ActionMessageSchema accepts valid UAX #31 action.metadata.extensions');

// 2. Verify Bug #1: V10ExtensionsSchema in @a2ui/web_core@0.14.0 wrongly accepts ':' and '-'
// while SharedExtensionsSchema rejects them!
const hyphenKeyPayload = { 'invalid-key-with-dashes': true };
const colonKeyPayload = { 'invalid:key:with:colons': true };
const dotKeyPayload = { 'freshcart.theme': { palette: 'harvest-gold' } };

assert.equal(
  V10ExtensionsSchema.safeParse(dotKeyPayload).success,
  false,
  'Dotted key (freshcart.theme) is rejected by UAX #31 regex'
);
assert.equal(
  V10ExtensionsSchema.safeParse(hyphenKeyPayload).success,
  true,
  'BUG-EXT-01 reproduced: v1_0 ExtensionsSchema in @a2ui/web_core@0.14.0 wrongly accepts hyphens (-)'
);
assert.equal(
  SharedExtensionsSchema.safeParse(hyphenKeyPayload).success,
  false,
  'Shared ExtensionsSchema rejects hyphens (-)'
);
assert.equal(
  V10ExtensionsSchema.safeParse(colonKeyPayload).success,
  true,
  'BUG-EXT-01 reproduced: v1_0 ExtensionsSchema in @a2ui/web_core@0.14.0 wrongly accepts colons (:)'
);
console.log(
  '✓ 3. Reproduced BUG-EXT-01: @a2ui/web_core@0.14.0 v1_0 ExtensionsSchema regex (/^[\\p{XID_Start}_][\\p{XID_Continue}:-]*$/u) wrongly accepts hyphens & colons'
);

// 3. Verify Bug #2: PayloadValidator.validateComponent strips 'metadata' before validateCommonEnvelopeFields
const validator = new PayloadValidator(basicCatalog, STRICT_VALIDATION);
let threwOnInvalidMetadata = false;
try {
  validator.validateComponent({
    id: 'root',
    component: 'Text',
    text: 'Hello',
    metadata: {
      unrecognizedTopLevelMetadataKey: true,
      extensions: {
        '123_invalid_leading_digit!': true,
      },
    },
  });
} catch {
  threwOnInvalidMetadata = true;
}
assert.equal(
  threwOnInvalidMetadata,
  false,
  'BUG-EXT-02 reproduced: PayloadValidator.validateComponent strips metadata before validateCommonEnvelopeFields'
);
console.log(
  '✓ 4. Reproduced BUG-EXT-02: PayloadValidator.validateComponent strips `metadata` in stripEnvelopeKeys() before validateCommonEnvelopeFields() runs (dead code)'
);

// 4. Verify Bug #3: SurfaceModel.dispatchAction drops `metadata.extensions` on outbound actions
let capturedAction = null;
const processor = new MessageProcessor(
  [basicCatalog],
  (action) => {
    capturedAction = action;
  },
  { version: 'v1.0', validationConfig: STRICT_VALIDATION }
);

processor.processMessages([
  validCreateSurface,
  {
    version: 'v1.0',
    updateComponents: {
      surfaceId: 'extensions_showcase_surface',
      components: [
        {
          id: 'root',
          component: 'Text',
          text: 'Artisanal Tasting Board',
          metadata: {
            extensions: {
              freshcart_animations: { entrance: 'fade-in-up' },
            },
          },
        },
      ],
    },
  },
]);

const surfaceModel = processor.model.getSurface('extensions_showcase_surface');
assert.ok(surfaceModel, 'SurfaceModel should be created');
assert.deepEqual(
  surfaceModel.metadata?.extensions?.freshcart_theme,
  { palette: 'harvest-gold', accentColor: '#D97706' },
  'SurfaceModel.metadata.extensions should be preserved'
);

const rootCompModel = surfaceModel.componentsModel.get('root');
assert.deepEqual(
  rootCompModel?.metadata?.extensions?.freshcart_animations,
  { entrance: 'fade-in-up' },
  'ComponentModel.metadata.extensions should be preserved'
);

await surfaceModel.dispatchAction(
  {
    event: {
      name: 'add_tasting_board_to_cart',
      context: { guestCount: 4 },
      metadata: {
        extensions: {
          freshcart_analyticsProvenance: { source: 'button' },
        },
      },
    },
    metadata: {
      extensions: {
        freshcart_analyticsProvenance: { source: 'button' },
      },
    },
  },
  'root'
);

assert.ok(capturedAction, 'Action should be emitted');
assert.equal(
  capturedAction.metadata,
  undefined,
  'BUG-EXT-03 reproduced: SurfaceModel.dispatchAction silently drops metadata.extensions on outbound actions'
);
console.log(
  '✓ 5. Reproduced BUG-EXT-03: SurfaceModel.dispatchAction silently drops `metadata.extensions` from outbound ActionPayload'
);

console.log('\nAll A2UI v1.0 Protocol Extensions checks passed!');
