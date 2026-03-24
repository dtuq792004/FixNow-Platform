import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView, type WebViewNavigation } from 'react-native-webview';

// ── URL Pattern Detectors ──────────────────────────────────────────────────────
// Matches both dev (exp://IP/--/payment/success) and prod (mobile://payment/success)
const isSuccessUrl = (url: string) =>
  url.includes('/payment/success') || url.includes('payment/success');

const isCancelUrl = (url: string) =>
  url.includes('/payment/cancel') || url.includes('payment/cancel');

export default function PaymentWebViewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { checkoutUrl, requestId } = useLocalSearchParams<{
    checkoutUrl: string;
    requestId: string;
  }>();

  const webviewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const hasNavigated = useRef(false); // prevent double-fire

  /** Central result handler — called from both interceptor & nav state change */
  const handlePaymentResult = (url: string): boolean => {
    if (hasNavigated.current) return false;
    if (isSuccessUrl(url)) {
      hasNavigated.current = true;
      router.replace({ pathname: '/payment/success', params: { requestId } } as never);
      return true;
    }
    if (isCancelUrl(url)) {
      hasNavigated.current = true;
      router.replace({ pathname: '/payment/cancel', params: { requestId } } as never);
      return true;
    }
    return false;
  };

  /** Fires for EVERY navigation attempt — before the WebView loads the URL.
   *  This is the ONLY reliable way to catch exp:// / mobile:// deep links
   *  because WebView cannot load non-http(s) schemes and won't fire onNavigationStateChange for them.
   *  Return false = block WebView from loading; return true = allow.
   */
  const onShouldStartLoadWithRequest = (request: { url: string }) => {
    const url = request.url;
    // Intercept deep-link redirect from PayOS
    if (isSuccessUrl(url) || isCancelUrl(url)) {
      handlePaymentResult(url);
      return false; // block — we handle navigation ourselves
    }
    return true; // allow https:// PayOS pages to load normally
  };

  const handleNavigationChange = (navState: WebViewNavigation) => {
    setCanGoBack(navState.canGoBack);
    // Fallback: also catches https returnUrl if PayOS ever uses one
    handlePaymentResult(navState.url);
  };

  const handleClose = () => {
    if (!hasNavigated.current) {
      hasNavigated.current = true;
      router.replace({ pathname: '/payment/cancel', params: { requestId } } as never);
    }
  };

  if (!checkoutUrl) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Không tìm thấy URL thanh toán.</Text>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Quay lại</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <Pressable
          onPress={canGoBack ? () => webviewRef.current?.goBack() : handleClose}
          style={styles.headerBtn}
          accessibilityLabel="Quay lại"
        >
          <Feather name="arrow-left" size={22} color="#18181b" />
        </Pressable>

        <View style={styles.headerCenter}>
          <View style={styles.lockBadge}>
            <Feather name="lock" size={11} color="#16a34a" />
          </View>
          <Text style={styles.headerTitle}>Thanh toán PayOS</Text>
        </View>

        <Pressable onPress={handleClose} style={styles.headerBtn} accessibilityLabel="Đóng">
          <Feather name="x" size={22} color="#18181b" />
        </Pressable>
      </View>

      {/* ── WebView ─────────────────────────────────────────────────────── */}
      <WebView
        ref={webviewRef}
        source={{ uri: checkoutUrl }}
        style={styles.webview}
        onNavigationStateChange={handleNavigationChange}
        onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        originWhitelist={['https://*', 'http://*', 'exp://*', 'mobile://*']}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#f97316" />
            <Text style={styles.loadingText}>Đang tải trang thanh toán...</Text>
          </View>
        )}
      />

      {/* ── Loading bar ────────────────────────────────────────────────── */}
      {loading && (
        <View style={styles.topLoadingBar}>
          <View style={styles.topLoadingProgress} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f5',
    backgroundColor: '#ffffff',
  },
  headerBtn: {
    padding: 8,
    borderRadius: 8,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  lockBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#18181b',
  },
  webview: {
    flex: 1,
  },
  topLoadingBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#f4f4f5',
  },
  topLoadingProgress: {
    width: '60%',
    height: '100%',
    backgroundColor: '#f97316',
    borderRadius: 2,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#71717a',
    marginTop: 8,
  },
  errorText: {
    fontSize: 15,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  backBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#18181b',
    borderRadius: 10,
  },
  backBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
});
