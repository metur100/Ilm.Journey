/**
 * Config plugin: Android draws text with exactly the layout it was measured with.
 *
 * Without React Native's `enablePreparedTextLayout` flag, Android measures a text with one StaticLayout and the
 * TextView then breaks the lines again by itself. On recent Android versions the two can disagree by a few pixels,
 * so a text that was measured as two lines is drawn as three and its last word is cut off ("That’s it" → "That’s",
 * "… the flat-map" without "line."). The flag makes the TextView reuse the measured layout.
 */
const { withMainApplication } = require('expo/config-plugins');

const MARKER = '// withPreparedTextLayout';

module.exports = function withPreparedTextLayout(config) {
  return withMainApplication(config, (cfg) => {
    let src = cfg.modResults.contents;
    if (src.includes(MARKER) || cfg.modResults.language !== 'kt') return cfg;
    src = src.replace(
      /(import com\.facebook\.react\.defaults\.DefaultNewArchitectureEntryPoint\n)/,
      `$1import com.facebook.react.internal.featureflags.ReactNativeFeatureFlags
import com.facebook.react.internal.featureflags.ReactNativeNewArchitectureFeatureFlagsDefaults
`,
    );
    src = src.replace(
      /( *)loadReactNative\(this\)\n/,
      `$1loadReactNative(this)
$1${MARKER}: draw text with the layout it was measured with (no clipped last words).
$1ReactNativeFeatureFlags.dangerouslyForceOverride(object : ReactNativeNewArchitectureFeatureFlagsDefaults() {
$1  override fun enablePreparedTextLayout(): Boolean = true
$1})
`,
    );
    if (!src.includes(MARKER)) throw new Error('withPreparedTextLayout: MainApplication.kt has an unexpected shape');
    cfg.modResults.contents = src;
    return cfg;
  });
};
