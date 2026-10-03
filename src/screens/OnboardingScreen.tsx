import { useMemo, useRef, useState, type ReactElement } from 'react';
import {
  Dimensions,
  FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewToken,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, FittedHeading, RemoteImage } from '@/components';
import { useAppTheme, useI18n } from '@/context';
import { useOnboarding } from '../../hooks/useOnboarding';
import type { AppTranslationKey } from '@/i18n';
import type { RootStackScreenProps } from '@/navigation/types';

type OnboardingScreenProps = Partial<RootStackScreenProps<'Onboarding'>>;

type OnboardingSlide = {
  id: 'spots' | 'coupons' | 'plans';
  emoji: string;
  titleKey: AppTranslationKey;
  bodyKey: AppTranslationKey;
  imageUrl: string;
};

const SLIDES: readonly OnboardingSlide[] = [
  {
    id: 'spots',
    emoji: '📍',
    titleKey: 'onboarding.slide1Title',
    bodyKey: 'onboarding.slide1Body',
    imageUrl:
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1200&q=80',
  },
  {
    id: 'coupons',
    emoji: '🎟',
    titleKey: 'onboarding.slide2Title',
    bodyKey: 'onboarding.slide2Body',
    imageUrl:
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1200&q=80',
  },
  {
    id: 'plans',
    emoji: '🗺',
    titleKey: 'onboarding.slide3Title',
    bodyKey: 'onboarding.slide3Body',
    imageUrl:
      'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=1200&q=80',
  },
];

const SCREEN_WIDTH = Dimensions.get('window').width;

export function OnboardingScreen({
  navigation,
  route,
}: OnboardingScreenProps): ReactElement {
  const insets = useSafeAreaInsets();
  const { isDark, palette } = useAppTheme();
  const { t } = useI18n();
  const { complete } = useOnboarding();
  const listRef = useRef<FlatList<OnboardingSlide>>(null);
  const [index, setIndex] = useState(0);
  const replay = route?.params?.replay === true;
  const isLast = index === SLIDES.length - 1;

  const viewabilityConfig = useMemo(
    () => ({ viewAreaCoveragePercentThreshold: 60 }),
    [],
  );

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const first = viewableItems[0];
      if (first?.index !== null && first?.index !== undefined) {
        setIndex(first.index);
      }
    },
  ).current;

  const handleNext = (): void => {
    if (isLast) {
      void complete().then(() => {
        if (replay && navigation !== undefined && navigation.canGoBack()) {
          navigation.goBack();
        }
      });
      return;
    }

    listRef.current?.scrollToIndex({ index: index + 1, animated: true });
  };

  const handleSkip = (): void => {
    listRef.current?.scrollToIndex({
      index: SLIDES.length - 1,
      animated: true,
    });
  };

  return (
    <View
      style={[
        styles.screen,
        {
          backgroundColor: palette.background,
          paddingTop: insets.top + 8,
          paddingBottom: Math.max(insets.bottom, 16),
        },
      ]}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={styles.topRow}>
        <Text style={[styles.kicker, { color: palette.primary }]}>
          {t('onboarding.kicker')}
        </Text>
        {isLast ? (
          <View />
        ) : (
          <Pressable accessibilityRole="button" onPress={handleSkip}>
            <Text style={[styles.skip, { color: palette.muted }]}>
              {t('common.skip')}
            </Text>
          </Pressable>
        )}
      </View>

      <FlatList
        ref={listRef}
        data={[...SLIDES]}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onMomentumScrollEnd={(event: NativeSyntheticEvent<NativeScrollEvent>) => {
          const next = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setIndex(next);
        }}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
            <RemoteImage
              uri={item.imageUrl}
              style={styles.image}
              accessibilityLabel={t(item.titleKey)}
            />
            <Text style={styles.emoji}>{item.emoji}</Text>
            <FittedHeading style={[styles.title, { color: palette.text }]}>
              {t(item.titleKey)}
            </FittedHeading>
            <Text style={[styles.body, { color: palette.textSecondary }]}>
              {t(item.bodyKey)}
            </Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((slide, slideIndex) => (
            <View
              key={slide.id}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    slideIndex === index ? palette.primary : palette.border,
                  width: slideIndex === index ? 22 : 8,
                },
              ]}
            />
          ))}
        </View>
        <Button
          label={isLast ? t('common.start') : t('common.next')}
          palette={palette}
          onPress={handleNext}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  kicker: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  skip: {
    fontSize: 13,
    fontWeight: '700',
  },
  slide: {
    paddingHorizontal: 20,
    gap: 12,
  },
  image: {
    width: '100%',
    height: 260,
    borderRadius: 24,
  },
  emoji: {
    fontSize: 32,
    marginTop: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
  },
  body: {
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 999,
  },
});
