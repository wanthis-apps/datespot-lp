import { type ReactElement, type ReactNode } from 'react';
import { StyleSheet, Text, type StyleProp, type TextStyle } from 'react-native';

type FittedHeadingProps = {
  children: ReactNode;
  style?: StyleProp<TextStyle>;
};

/**
 * 画面の主見出しを1行に収める。
 * OSの文字サイズが大きくても、末尾だけ改行されないように縮小する。
 */
export function FittedHeading({
  children,
  style,
}: FittedHeadingProps): ReactElement {
  return (
    <Text
      accessibilityRole="header"
      numberOfLines={1}
      adjustsFontSizeToFit={true}
      minimumFontScale={0.5}
      style={[styles.heading, style]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  heading: {
    width: '100%',
    flexShrink: 1,
  },
});
