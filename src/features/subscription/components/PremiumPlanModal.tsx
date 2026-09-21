import { type ReactElement } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components';
import type { Palette } from '@/theme';
import { PREMIUM_PLAN } from '../constants';

type PremiumPlanModalProps = {
  visible: boolean;
  isPremium: boolean;
  palette: Palette;
  onClose: () => void;
  onSubscribe: () => void;
};

export function PremiumPlanModal({
  visible,
  isPremium,
  palette,
  onClose,
  onSubscribe,
}: PremiumPlanModalProps): ReactElement {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.card,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
          onPress={() => undefined}
        >
          <Text style={[styles.kicker, { color: palette.primary }]}>
            {PREMIUM_PLAN.headline}
          </Text>
          <Text style={[styles.title, { color: palette.text }]}>
            {PREMIUM_PLAN.name}
          </Text>
          <Text style={[styles.price, { color: palette.text }]}>
            {PREMIUM_PLAN.priceLabel}
          </Text>
          <Text style={[styles.description, { color: palette.textSecondary }]}>
            {PREMIUM_PLAN.description}
          </Text>
          <View style={styles.benefits}>
            {PREMIUM_PLAN.benefits.map((benefit) => (
              <View key={benefit} style={styles.benefitRow}>
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color={palette.primary}
                />
                <Text style={[styles.benefit, { color: palette.text }]}>
                  {benefit}
                </Text>
              </View>
            ))}
          </View>
          {isPremium ? (
            <Button
              label="とじる"
              onPress={onClose}
              palette={palette}
              variant="ghost"
            />
          ) : (
            <View style={styles.actions}>
              <Button
                label="このプランに登録する"
                onPress={onSubscribe}
                palette={palette}
              />
              <Button
                label="あとで"
                onPress={onClose}
                palette={palette}
                variant="ghost"
              />
            </View>
          )}
          <Text style={[styles.footnote, { color: palette.muted }]}>
            決済は次フェーズの RevenueCat 連携で有効化します。
          </Text>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(20, 12, 14, 0.55)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 24,
  },
  kicker: {
    fontSize: 13,
    fontWeight: '700',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
    marginTop: 12,
  },
  benefits: {
    gap: 10,
    marginVertical: 20,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  benefit: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    gap: 8,
  },
  footnote: {
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 12,
  },
});
