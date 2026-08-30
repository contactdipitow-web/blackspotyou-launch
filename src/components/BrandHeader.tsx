import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme';

export function BrandHeader({ inverse = false, compact = false }: { inverse?: boolean; compact?: boolean }) {
  const primary = inverse ? colors.white : colors.ink;
  return (
    <View style={[styles.row, compact && styles.compact]} accessible accessibilityRole="header">
      <View style={[styles.mark, inverse && styles.markInverse]}><Text style={styles.markText}>B</Text></View>
      <Text style={[styles.wordmark, { color: primary }]}>BLACKSPOT <Text style={styles.you}>YOU</Text></Text>
    </View>
  );
}

export function ParisWatermark({ dark = false }: { dark?: boolean }) {
  const color = dark ? 'rgba(255,255,255,.12)' : 'rgba(109,40,217,.12)';
  return (
    <View pointerEvents="none" style={styles.watermark}>
      <View style={[styles.towerTop, { borderBottomColor: color }]} />
      <View style={[styles.towerStem, { backgroundColor: color }]} />
      <View style={[styles.towerBase, { borderTopColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  compact: { transform: [{ scale: 0.94 }] },
  mark: { width: 34, height: 34, borderRadius: 12, backgroundColor: colors.purple, alignItems: 'center', justifyContent: 'center' },
  markInverse: { borderWidth: 1, borderColor: 'rgba(255,255,255,.25)' },
  markText: { color: colors.white, fontSize: 18, fontWeight: '950' },
  wordmark: { fontSize: 17, fontWeight: '950', letterSpacing: 1.1 },
  you: { color: colors.purple },
  watermark: { position: 'absolute', width: 170, height: 210, right: -20, bottom: -52, opacity: .9, alignItems: 'center' },
  towerTop: { width: 0, height: 0, borderLeftWidth: 56, borderRightWidth: 56, borderBottomWidth: 128, borderLeftColor: 'transparent', borderRightColor: 'transparent' },
  towerStem: { width: 15, height: 42, marginTop: -12 },
  towerBase: { width: 138, height: 38, borderTopWidth: 11, borderLeftWidth: 21, borderRightWidth: 21, borderLeftColor: 'transparent', borderRightColor: 'transparent' },
});
