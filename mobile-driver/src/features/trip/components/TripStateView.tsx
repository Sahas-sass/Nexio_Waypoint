import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '@/components/waypoint/icon';
import { Button, Card, WText } from '@/components/waypoint/ui';
import { W } from '@/utils/theme';

/** Loading / error / empty placeholder shared by the trip screens. */
export function TripStateView({
  kind,
  title,
  message,
  onRetry,
}: {
  kind: 'loading' | 'error' | 'empty';
  title?: string;
  message?: string | null;
  onRetry?: () => void;
}) {
  const icon: IconName = kind === 'error' ? 'alert' : 'route';
  const heading =
    title ?? (kind === 'loading' ? 'Loading your trip…' : kind === 'error' ? 'Could not load your trip' : 'No active trip assigned');
  const body =
    message ??
    (kind === 'empty' ? 'Dispatch has not assigned you a loading or en-route trip yet. Pull down to refresh.' : null);

  return (
    <Card style={styles.card}>
      <View style={styles.iconWrap}>
        {kind === 'loading' ? <ActivityIndicator color={W.amberDark} /> : <Icon name={icon} size={22} color={W.amberDark} />}
      </View>
      <WText size={16} weight={800} style={styles.center}>
        {heading}
      </WText>
      {body ? (
        <WText size={12} weight={500} color={W.gray} style={[styles.center, { marginTop: 6 }]}>
          {body}
        </WText>
      ) : null}
      {onRetry && kind !== 'loading' ? (
        <View style={{ marginTop: 16, alignSelf: 'stretch' }}>
          <Button variant="secondary" onPress={onRetry}>
            Try again
          </Button>
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: 'center', paddingVertical: 28, paddingHorizontal: 20 },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: W.yellowSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  center: { textAlign: 'center' },
});
