import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

type Props = {
  children: ReactNode;
};

type State = {
  error: Error | null;
};

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[DateSpot] render error', {
      message: error.message,
      stack: error.stack,
      componentStack: info.componentStack,
    });
  }

  private handleRetry = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    if (this.state.error === null) {
      return this.props.children;
    }

    const { error } = this.state;

    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.kicker}>DateSpot debug</Text>
          <Text style={styles.title}>起動エラーを捕捉しました</Text>
          <Text style={styles.errorText} selectable>
            {error.message}
          </Text>
          {error.stack !== undefined ? (
            <Text style={styles.errorText} selectable>
              {error.stack}
            </Text>
          ) : null}
          <Pressable onPress={this.handleRetry} style={styles.button}>
            <Text style={styles.buttonLabel}>再試行</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1412',
  },
  content: {
    paddingTop: 64,
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 12,
  },
  kicker: {
    color: '#f3c6b4',
    fontSize: 13,
    fontWeight: '600',
  },
  title: {
    color: '#ff3b30',
    fontSize: 22,
    fontWeight: '700',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#e86b4a',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  buttonLabel: {
    color: '#fff8f5',
    fontWeight: '700',
  },
});
