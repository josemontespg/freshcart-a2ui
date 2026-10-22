import {
  A2UI_BASIC_CATALOG_ID,
  A2UI_MCP_CATALOG_ID,
  A2UI_VERSION,
  FRESHCART_GROCERY_CATALOG_ID,
  type A2UIComponentBase,
  type A2UIv1Message,
} from '../types/a2ui-v1';

export const MCP_KITCHEN_SURFACE_ID = 'mcp-kitchen-surface' as const;

/**
 * Self-contained HTML/JS MCP App rendered inside the double-iframe sandbox
 * (`/a2ui-sandbox/sandbox.html` -> inner `<iframe sandbox="allow-scripts allow-forms allow-modals">`).
 *
 * Implements the A2UI v1.0 MCP AppBridge JSON-RPC 2.0 guest protocol:
 * 1. Sends `ui/initialize` request on load -> receives `hostCapabilities` -> sends `ui/notifications/initialized`
 * 2. Listens for `ui/notifications/data-model-update` from the parent A2UI surface (`recipeScale`, `toolInput`, `toolResult`, `modelContext`)
 * 3. Sends `ui/notifications/data-model-change` to mutate bound paths in the parent A2UI surface (`recipeScale/unitSystem`, `recipeScale/servings`, `recipeScale/FormattedCostEstimate`)
 * 4. Sends `ui/requests/function-call` to execute whitelisted A2UI catalog functions (`formatCurrency`, `formatNumber`) on the host
 * 5. Sends `tools/call` to execute whitelisted MCP tools (`add_mcp_pairing_to_cart`, `apply_kitchen_scaling`) on the host, and tests security rejection of non-whitelisted tools (`clear_entire_cart`).
 */
const CULINARY_MCP_APP_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>FreshCart Culinary Studio MCP App</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: linear-gradient(180deg, #0c1914 0%, #11221b 100%);
      color: #ecfdf5;
      padding: 14px;
      line-height: 1.45;
    }
    .app-shell {
      border: 1px solid rgba(16, 185, 129, 0.28);
      border-radius: 14px;
      background: rgba(6, 20, 15, 0.78);
      padding: 13px;
      display: flex;
      flex-direction: column;
      gap: 11px;
    }
    .top-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      flex-wrap: wrap;
      border-bottom: 1px solid rgba(16, 185, 129, 0.18);
      padding-bottom: 9px;
    }
    .title-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .badge-mcp {
      background: rgba(16, 185, 129, 0.2);
      border: 1px solid rgba(52, 211, 153, 0.45);
      color: #6ee7b7;
      font-size: 10px;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 999px;
      letter-spacing: 0.03em;
      text-transform: uppercase;
    }
    h1 {
      font-size: 13px;
      font-weight: 700;
      color: #ffffff;
    }
    .origin-pill {
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 10px;
      color: #a7f3d0;
      background: rgba(16, 185, 129, 0.12);
      padding: 2px 8px;
      border-radius: 6px;
      border: 1px solid rgba(16, 185, 129, 0.25);
    }
    .controls-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      flex-wrap: wrap;
      background: rgba(255, 255, 255, 0.04);
      padding: 9px 11px;
      border-radius: 10px;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .control-group {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .label {
      font-size: 11px;
      color: #a7f3d0;
      font-weight: 600;
    }
    .btn {
      appearance: none;
      border: 1px solid rgba(52, 211, 153, 0.4);
      background: rgba(16, 185, 129, 0.16);
      color: #ecfdf5;
      font-size: 11px;
      font-weight: 600;
      padding: 5px 10px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .btn:hover {
      background: rgba(16, 185, 129, 0.32);
      border-color: #34d399;
    }
    .btn.active {
      background: #10b981;
      color: #052e16;
      border-color: #34d399;
      font-weight: 700;
    }
    .btn-primary {
      background: #0aad0a;
      border-color: #22c55e;
      color: #ffffff;
      font-weight: 700;
    }
    .btn-primary:hover {
      background: #089208;
    }
    .btn-danger {
      background: rgba(244, 63, 94, 0.16);
      border-color: rgba(251, 113, 133, 0.45);
      color: #fecdd3;
    }
    .btn-danger:hover {
      background: rgba(244, 63, 94, 0.28);
    }
    .conversion-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 7px;
    }
    .conv-card {
      background: rgba(255, 255, 255, 0.045);
      border: 1px solid rgba(16, 185, 129, 0.18);
      border-radius: 9px;
      padding: 8px 10px;
    }
    .conv-name {
      font-size: 11px;
      color: #d1fae5;
      font-weight: 600;
    }
    .conv-val {
      font-size: 13px;
      font-weight: 700;
      color: #ffffff;
      margin-top: 2px;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    }
    .conv-note {
      font-size: 10px;
      color: #6ee7b7;
      margin-top: 1px;
    }
    .actions-bar {
      display: flex;
      flex-wrap: wrap;
      gap: 7px;
    }
    .status-box {
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 10.5px;
      background: rgba(0, 0, 0, 0.45);
      border: 1px solid rgba(52, 211, 153, 0.25);
      border-radius: 8px;
      padding: 8px 10px;
      color: #a7f3d0;
      word-break: break-word;
    }
    .status-box.error {
      border-color: rgba(251, 113, 133, 0.55);
      color: #fecdd3;
      background: rgba(136, 19, 55, 0.28);
    }
  </style>
</head>
<body>
  <div class="app-shell">
    <div class="top-bar">
      <div class="title-wrap">
        <span class="badge-mcp">MCP App · Sandboxed Guest</span>
        <h1>Precision Kitchen Converter &amp; Pan Scaler</h1>
      </div>
      <span class="origin-pill" id="originReadout">origin: checking...</span>
    </div>

    <!-- Bi-Directional DataModel Controls -->
    <div class="controls-row">
      <div class="control-group">
        <span class="label">Servings (2-Way @path):</span>
        <button type="button" class="btn" id="btnDecServings">−</button>
        <strong id="servingsValue" style="font-size: 13px; min-width: 24px; text-align: center;">4</strong>
        <button type="button" class="btn" id="btnIncServings">+</button>
      </div>

      <div class="control-group">
        <span class="label">Units:</span>
        <button type="button" class="btn active" id="btnMetric">Metric (g / ml / °C)</button>
        <button type="button" class="btn" id="btnImperial">Imperial (oz / cups / °F)</button>
      </div>
    </div>

    <!-- Live Converted Ingredient & Pan Matrix -->
    <div class="conversion-grid" id="conversionGrid"></div>

    <!-- MCP Bridge RPC Action Buttons -->
    <div class="actions-bar">
      <button type="button" class="btn btn-primary" id="btnCallMcpAddCart">
        🛒 tools/call: Add Wild Salmon &amp; EVOO Pairing ($24.97)
      </button>
      <button type="button" class="btn" id="btnCallHostFn">
        ⚡ ui/requests/function-call: Host formatCurrency()
      </button>
      <button type="button" class="btn btn-danger" id="btnCallUnauthorizedTool">
        🛡️ Test Blocked Tool (clear_entire_cart)
      </button>
    </div>

    <div class="status-box" id="bridgeStatus">
      Initializing A2UI v1.0 MCP AppBridge handshake (ui/initialize)...
    </div>
  </div>

  <script>
    (function() {
      var state = {
        servings: 4,
        unitSystem: 'metric',
        panStyle: 'cast-iron-skillet',
        formattedCost: '$24.97'
      };

      var pendingRequests = {};
      var nextRpcId = 1;

      var originEl = document.getElementById('originReadout');
      var servingsEl = document.getElementById('servingsValue');
      var gridEl = document.getElementById('conversionGrid');
      var statusEl = document.getElementById('bridgeStatus');
      var btnMetric = document.getElementById('btnMetric');
      var btnImperial = document.getElementById('btnImperial');

      // Show opaque origin ("null") proving allow-same-origin is stripped
      originEl.textContent = 'window.origin: ' + String(window.origin);

      function setStatus(text, isError) {
        statusEl.textContent = text;
        statusEl.className = isError ? 'status-box error' : 'status-box';
      }

      function sendRpcRequest(method, params, callback) {
        var id = 'mcp-rpc-' + (nextRpcId++);
        if (callback) {
          pendingRequests[id] = callback;
        }
        window.parent.postMessage({
          jsonrpc: '2.0',
          id: id,
          method: method,
          params: params || {}
        }, '*');
      }

      function sendRpcNotification(method, params) {
        window.parent.postMessage({
          jsonrpc: '2.0',
          method: method,
          params: params || {}
        }, '*');
      }

      function reportHeight() {
        var h = Math.max(295, document.documentElement.scrollHeight + 8);
        sendRpcNotification('ui/notifications/size-changed', { height: h });
      }

      function renderConversions() {
        servingsEl.textContent = String(state.servings);
        btnMetric.className = state.unitSystem === 'metric' ? 'btn active' : 'btn';
        btnImperial.className = state.unitSystem === 'imperial' ? 'btn active' : 'btn';

        var scale = state.servings / 4;
        var panLabel = state.panStyle === 'sheet-pan-roast'
          ? 'Half-Sheet Pan'
          : state.panStyle === 'dutch-oven-braise'
          ? '5.5 qt Dutch Oven'
          : '12" Cast-Iron Skillet';

        var panTempC = state.panStyle === 'sheet-pan-roast' ? 215 : state.panStyle === 'dutch-oven-braise' ? 185 : 205;
        var panTempF = Math.round(panTempC * 9 / 5 + 32);

        var items = [
          {
            name: 'Wild Sockeye Salmon Fillet',
            metric: Math.round(680 * scale) + ' g',
            imperial: (24 * scale).toFixed(1) + ' oz (' + (1.5 * scale).toFixed(2) + ' lb)',
            note: 'Pan mode: ' + panLabel
          },
          {
            name: 'Cold-Pressed Extra Virgin Olive Oil',
            metric: Math.round(45 * scale) + ' ml (' + Math.round(41 * scale) + ' g)',
            imperial: (3 * scale).toFixed(1) + ' tbsp (' + (1.5 * scale).toFixed(1) + ' fl oz)',
            note: '3:1 Citrus-Herb Emulsion Ratio'
          },
          {
            name: 'Organic Tri-Color Quinoa (Dry -> Cooked)',
            metric: Math.round(185 * scale) + ' g dry -> ' + Math.round(555 * scale) + ' g',
            imperial: (1.0 * scale).toFixed(2) + ' cups dry -> ' + (3.0 * scale).toFixed(1) + ' cups',
            note: '1 : 1.75 Simmer Hydration'
          },
          {
            name: 'Target Sear / Roast Temperature',
            metric: panTempC + ' °C (Internal 52 °C medium-rare)',
            imperial: panTempF + ' °F (Internal 125 °F medium-rare)',
            note: 'Est. Pairing Bundle: ' + state.formattedCost
          }
        ];

        gridEl.innerHTML = items.map(function(item) {
          var val = state.unitSystem === 'metric' ? item.metric : item.imperial;
          return '<div class="conv-card">' +
            '<div class="conv-name">' + item.name + '</div>' +
            '<div class="conv-val">' + val + '</div>' +
            '<div class="conv-note">' + item.note + '</div>' +
          '</div>';
        }).join('');

        reportHeight();
      }

      // Listen for JSON-RPC 2.0 messages relayed by the outer sandbox proxy
      window.addEventListener('message', function(event) {
        var data = event.data;
        if (!data || typeof data !== 'object' || data.jsonrpc !== '2.0') return;

        // Handle responses to our requests (ui/initialize, ui/requests/function-call, tools/call)
        if (data.id !== undefined && pendingRequests[data.id]) {
          var cb = pendingRequests[data.id];
          delete pendingRequests[data.id];
          cb(data.error, data.result);
          return;
        }

        // Handle Host -> App notifications
        if (data.method === 'ui/notifications/data-model-update') {
          var payload = data.params && data.params.data ? data.params.data : {};
          var rs = payload.recipeScale;
          if (rs && typeof rs === 'object') {
            if (typeof rs.servings === 'number') state.servings = rs.servings;
            if (typeof rs.unitSystem === 'string') state.unitSystem = rs.unitSystem;
            if (typeof rs.panStyle === 'string') state.panStyle = rs.panStyle;
            if (typeof rs.FormattedCostEstimate === 'string') {
              state.formattedCost = rs.FormattedCostEstimate;
            }
          }
          renderConversions();
          setStatus(
            '[Host -> App] ui/notifications/data-model-update synced: servings=' +
              state.servings + ', units=' + state.unitSystem + ', pan=' + state.panStyle,
            false
          );
        }
      });

      // Interactive Controls -> push ui/notifications/data-model-change to Host
      document.getElementById('btnDecServings').addEventListener('click', function() {
        var next = Math.max(1, state.servings - 1);
        state.servings = next;
        renderConversions();
        sendRpcNotification('ui/notifications/data-model-change', {
          path: 'recipeScale/servings',
          value: next
        });
        setStatus('[App -> Host] Sent ui/notifications/data-model-change (recipeScale/servings = ' + next + ')', false);
      });

      document.getElementById('btnIncServings').addEventListener('click', function() {
        var next = Math.min(10, state.servings + 1);
        state.servings = next;
        renderConversions();
        sendRpcNotification('ui/notifications/data-model-change', {
          path: 'recipeScale/servings',
          value: next
        });
        setStatus('[App -> Host] Sent ui/notifications/data-model-change (recipeScale/servings = ' + next + ')', false);
      });

      btnMetric.addEventListener('click', function() {
        state.unitSystem = 'metric';
        renderConversions();
        sendRpcNotification('ui/notifications/data-model-change', {
          path: 'recipeScale/unitSystem',
          value: 'metric'
        });
        setStatus('[App -> Host] Sent ui/notifications/data-model-change (recipeScale/unitSystem = "metric")', false);
      });

      btnImperial.addEventListener('click', function() {
        state.unitSystem = 'imperial';
        renderConversions();
        sendRpcNotification('ui/notifications/data-model-change', {
          path: 'recipeScale/unitSystem',
          value: 'imperial'
        });
        setStatus('[App -> Host] Sent ui/notifications/data-model-change (recipeScale/unitSystem = "imperial")', false);
      });

      // Call Host Catalog Function via ui/requests/function-call
      document.getElementById('btnCallHostFn').addEventListener('click', function() {
        var rawTotal = (24.97 * (state.servings / 4));
        sendRpcRequest(
          'ui/requests/function-call',
          {
            name: 'formatCurrency',
            arguments: {
              value: rawTotal,
              currency: 'USD',
              decimals: 2
            }
          },
          function(err, res) {
            if (err) {
              setStatus('[Host Function Error] ' + err.message, true);
              return;
            }
            var formatted = res && res.value ? String(res.value) : '$' + rawTotal.toFixed(2);
            state.formattedCost = formatted;
            renderConversions();
            sendRpcNotification('ui/notifications/data-model-change', {
              path: 'recipeScale/FormattedCostEstimate',
              value: formatted
            });
            setStatus(
              '[Host Function Result] ui/requests/function-call formatCurrency(' +
                rawTotal.toFixed(2) + ') => ' + formatted,
              false
            );
          }
        );
      });

      // Authorized MCP Tool Call -> adds bundle to FreshCart live cart
      document.getElementById('btnCallMcpAddCart').addEventListener('click', function() {
        sendRpcRequest(
          'tools/call',
          {
            name: 'add_mcp_pairing_to_cart',
            arguments: {
              servings: state.servings,
              unitSystem: state.unitSystem,
              panStyle: state.panStyle,
              items: [
                { productId: 'prod-salmon-fillet', quantity: Math.max(1, Math.round(state.servings / 2)) },
                { productId: 'prod-extra-virgin-olive-oil', quantity: 1 },
                { productId: 'prod-lemons', quantity: 1 }
              ]
            }
          },
          function(err, res) {
            if (err) {
              setStatus('[MCP tools/call Error] ' + err.message, true);
              return;
            }
            var textMsg = (res && res.content && res.content[0] && res.content[0].text)
              ? res.content[0].text
              : 'Tool executed';
            setStatus('[MCP CallToolResult] ' + textMsg, false);
          }
        );
      });

      // Security Policy Test -> Unauthorized tool call rejected with -32601
      document.getElementById('btnCallUnauthorizedTool').addEventListener('click', function() {
        sendRpcRequest(
          'tools/call',
          {
            name: 'clear_entire_cart',
            arguments: { reason: 'sandbox_escape_attempt' }
          },
          function(err) {
            if (err) {
              setStatus(
                '[Security Policy Verified ✓] JSON-RPC ' + err.code + ': ' + err.message,
                true
              );
            }
          }
        );
      });

      // Kick off Phase B MCP AppBridge Handshake: ui/initialize
      renderConversions();
      sendRpcRequest(
        'ui/initialize',
        {
          protocolVersion: '2025-03-26',
          clientInfo: {
            name: 'freshcart-culinary-studio-mcp-app',
            version: '1.0.0'
          }
        },
        function(err, result) {
          if (err) {
            setStatus('Handshake failed: ' + err.message, true);
            return;
          }
          sendRpcNotification('ui/notifications/initialized', {});
          reportHeight();
          setStatus(
            '[Phase B Handshake Complete ✓] Host capabilities verified (sandboxed-iframe=null origin, data-model-sync=active).',
            false
          );
        }
      );
    })();
  </script>
</body>
</html>`;

export interface McpKitchenScenarioOptions {
  servings?: number;
  unitSystem?: 'metric' | 'imperial';
  panStyle?: 'cast-iron-skillet' | 'sheet-pan-roast' | 'dutch-oven-braise';
}

/**
 * Builds the A2UI v1.0 JSONL message stream (`createSurface`, `updateComponents`, `updateDataModel`)
 * showcasing the A2UI v1.0 MCP Catalog (`https://a2ui.org/specification/v1_0/catalogs/mcp/catalog.json`):
 * - `McpApp` sandboxed double-iframe component with two-way `@path` bindings, `allowedFunctions`, and `allowedTools`
 * - `callMcpTool` catalog function invoked declaratively from a native A2UI `Button`
 */
export function buildMcpKitchenAppStream(
  options: McpKitchenScenarioOptions = {}
): A2UIv1Message[] {
  const servings = options.servings ?? 4;
  const unitSystem = options.unitSystem ?? 'metric';
  const panStyle = options.panStyle ?? 'cast-iron-skillet';

  const components: A2UIComponentBase[] = [
    {
      id: 'root',
      component: 'Column',
      gap: 'md',
      children: [
        'hero_intro_card',
        'host_controls_card',
        'sandboxed_mcp_app',
        'pairing_product_card',
      ],
    },
    {
      id: 'hero_intro_card',
      component: 'Card',
      child: 'hero_intro_col',
    },
    {
      id: 'hero_intro_col',
      component: 'Column',
      gap: 'sm',
      children: ['hero_title_text', 'hero_subtitle_text', 'live_sync_banner'],
    },
    {
      id: 'hero_title_text',
      component: 'Text',
      variant: 'h3',
      text: '🧪 A2UI v1.0 MCP App Studio (Double-Iframe Sandbox)',
    },
    {
      id: 'hero_subtitle_text',
      component: 'Text',
      variant: 'body',
      text: 'This surface embeds an interactive MCP App (`McpApp` from `https://a2ui.org/specification/v1_0/catalogs/mcp/catalog.json`) inside an isolated double-iframe sandbox (`window.origin === "null"`). Changes to Servings or Units sync bi-directionally between native A2UI v1.0 components and the sandboxed iframe over JSON-RPC 2.0.',
    },
    {
      id: 'live_sync_banner',
      component: 'Text',
      variant: 'caption',
      text: {
        '@call': 'formatString',
        args: {
          value:
            '🔄 Live Host DataModel State — Servings: ${/mcpState/recipeScale/servings} | Unit System: ${/mcpState/recipeScale/unitSystem} | Est. Bundle: ${/mcpState/recipeScale/FormattedCostEstimate} | Status: ${/mcpState/lastActionConfirmation}',
        },
      },
    },
    {
      id: 'host_controls_card',
      component: 'Card',
      child: 'host_controls_col',
    },
    {
      id: 'host_controls_col',
      component: 'Column',
      gap: 'sm',
      children: [
        'host_controls_heading',
        'host_servings_slider',
        'host_pan_picker',
        'host_call_mcp_tool_btn',
      ],
    },
    {
      id: 'host_controls_heading',
      component: 'Text',
      variant: 'h4',
      text: '1. Native A2UI Host Controls (Pushes `ui/notifications/data-model-update` -> Iframe)',
    },
    {
      id: 'host_servings_slider',
      component: 'Slider',
      label: 'Target Servings (Synced with Sandboxed MCP App)',
      minValue: 1,
      maxValue: 10,
      step: 1,
      value: { '@path': '/mcpState/recipeScale/servings' },
    },
    {
      id: 'host_pan_picker',
      component: 'ChoicePicker',
      label: 'Cookware Vessel (Updates Iframe Conversion Matrix)',
      variant: 'mutuallyExclusive',
      options: [
        { label: '12" Cast-Iron Skillet', value: 'cast-iron-skillet' },
        { label: 'Half-Sheet Pan Roast', value: 'sheet-pan-roast' },
        { label: '5.5 qt Dutch Oven', value: 'dutch-oven-braise' },
      ],
      value: { '@path': '/mcpState/recipeScale/panStyle' },
    },
    {
      id: 'host_call_mcp_tool_btn',
      component: 'Button',
      variant: 'secondary',
      child: 'host_call_mcp_tool_label',
      action: {
        functionCall: {
          '@call': 'callMcpTool',
          args: {
            serverUrl: 'mcp://freshcart-culinary-studio/tools',
            toolName: 'sync_pantry_staples',
            arguments: {
              servings: { '@path': '/mcpState/recipeScale/servings' },
              unitSystem: { '@path': '/mcpState/recipeScale/unitSystem' },
              panStyle: { '@path': '/mcpState/recipeScale/panStyle' },
            },
            targetDataPath: '/mcpState/toolResult',
          },
        },
      },
    },
    {
      id: 'host_call_mcp_tool_label',
      component: 'Text',
      text: '⚡ Invoke Declarative `@call: "callMcpTool"` (`sync_pantry_staples`)',
    },
    {
      id: 'sandboxed_mcp_app',
      component: 'McpApp',
      catalogId: A2UI_MCP_CATALOG_ID,
      title: 'FreshCart Culinary Studio & Precision Converter (McpApp)',
      height: 330,
      htmlContent: `url_encoded:${encodeURIComponent(CULINARY_MCP_APP_HTML)}`,
      allowedTools: [
        'add_mcp_pairing_to_cart',
        'apply_kitchen_scaling',
        'sync_pantry_staples',
      ],
      allowedFunctions: {
        formatCurrency: {},
        formatNumber: {},
      },
      data: {
        paths: {
          recipeScale: '/mcpState/recipeScale',
          toolInput: '/mcpState/toolInput',
          toolResult: '/mcpState/toolResult',
          modelContext: '/mcpState/modelContext',
        },
      },
    },
    {
      id: 'pairing_product_card',
      component: 'ProductDealCard',
      catalogId: FRESHCART_GROCERY_CATALOG_ID,
      productId: 'prod-salmon-fillet',
      badgeText: 'MCP Sommelier & Chef Pick',
      dealReason:
        'Paired with Cold-Pressed Extra Virgin Olive Oil & Organic Lemons via the Sandboxed Culinary MCP App.',
      ctaLabel: 'Add Wild Salmon Fillet ($14.99)',
      action: {
        event: {
          name: 'add_pairing_item',
          context: {
            productId: 'prod-salmon-fillet',
            quantity: 1,
            title: 'Wild Alaskan Sockeye Salmon Fillet',
          },
        },
      },
    },
  ];

  const initialDataModel: Record<string, unknown> = {
    mcpState: {
      recipeScale: {
        servings,
        unitSystem,
        panStyle,
        FormattedCostEstimate: '$24.97',
      },
      toolInput: {
        recipeName: 'Pan-Seared Wild Sockeye Salmon with Citrus-Herb Emulsion',
        baseServings: 4,
      },
      toolResult: {
        status: 'ready',
        lastSyncedAt: 'Initial Handshake',
      },
      modelContext: {
        storeId: 'freshcart-organic',
        protocolVersion: '1.0',
      },
      lastActionConfirmation:
        'Double-iframe MCP sandbox ready — try toggling units or calling tools inside the iframe!',
    },
  };

  return [
    {
      version: A2UI_VERSION,
      createSurface: {
        surfaceId: MCP_KITCHEN_SURFACE_ID,
        catalogId: A2UI_BASIC_CATALOG_ID,
        sendDataModel: true,
      },
    },
    {
      version: A2UI_VERSION,
      updateComponents: {
        surfaceId: MCP_KITCHEN_SURFACE_ID,
        components,
      },
    },
    {
      version: A2UI_VERSION,
      updateDataModel: {
        surfaceId: MCP_KITCHEN_SURFACE_ID,
        path: '/',
        value: initialDataModel,
      },
    },
  ];
}
