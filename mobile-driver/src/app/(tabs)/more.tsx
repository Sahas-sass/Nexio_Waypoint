// Driver hub: profile, vehicle, quick access and support.
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/waypoint/chrome';
import { Icon, type IconName } from '@/components/waypoint/icon';
import { Button, Card, IconTile, Label, SectionHeading, StatusDot, TitleRow, WText } from '@/components/waypoint/ui';
import { driver, truckPhoto } from '@/data/mock';
import { Radius, Shadow, W } from '@/utils/theme';

const menuItems: { icon: IconName; label: string; detail: string; badge?: string }[] = [
  { icon: 'box', label: 'Vehicle checks', detail: 'Pre-trip complete', badge: 'Done' },
  { icon: 'history', label: 'Shift activity', detail: '6h 24m active today' },
  { icon: 'shield', label: 'Safety centre', detail: 'Guides and emergency help' },
  { icon: 'user', label: 'Account settings', detail: 'Profile and preferences' },
];

const quickLinks: { icon: IconName; title: string; detail: string }[] = [
  { icon: 'alert', title: 'Report Issue', detail: 'Vehicle or delivery' },
  { icon: 'navigation', title: 'Route Support', detail: 'Contact dispatch' },
  { icon: 'history', title: 'Documents', detail: 'Permits and forms' },
];

export default function MoreScreen() {
  return (
    <Screen>
      <TitleRow
        eyebrow="DRIVER HUB"
        title="More"
        subtitle="Your shift, vehicle and settings"
        aside={
          <View style={styles.settings}>
            <Icon name="more" size={22} color={W.gray} />
          </View>
        }
      />

      <LinearGradient
        colors={[W.yellow, W.brightYellow]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.profile}>
        <View style={styles.patternLarge} />
        <View style={styles.patternSmall} />
        <View style={styles.profileTop}>
          <View style={styles.largeAvatar}>
            <Icon name="user" size={29} />
            <View style={styles.largeAvatarDot} />
          </View>
          <View style={{ flex: 1 }}>
            <Label spacing={0.09} color="#795500">
              DRIVER · {driver.id}
            </Label>
            <WText size={18} weight={700} style={{ marginTop: 2 }}>
              {driver.name}
            </WText>
            <WText size={8} color="#7b5b13" style={{ marginTop: 2 }}>
              {driver.fleet}
            </WText>
          </View>
          <View style={styles.profileStatus}>
            <StatusDot color={W.green} size={6} />
            <WText size={8} weight={800} color={W.greenDark}>
              On shift
            </WText>
          </View>
        </View>
        <View style={styles.profileStats}>
          <ProfileStat label="TODAY" value="2" suffix="/ 6 stops" />
          <ProfileStat label="ON-TIME" value="96%" />
          <ProfileStat label="DRIVING" value="2h 18m" last />
        </View>
      </LinearGradient>

      <Card style={styles.vehicle}>
        <View style={styles.vehicleImage}>
          <Image
            source={{ uri: truckPhoto }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            accessibilityLabel="Assigned white freight truck TRK-024"
          />
          <View style={styles.assigned}>
            <WText size={6} weight={800}>
              ASSIGNED
            </WText>
          </View>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Label size={7} spacing={0.08}>
            YOUR VEHICLE
          </Label>
          <WText size={13} weight={700} style={{ marginTop: 2 }}>
            {driver.truck}
          </WText>
          <WText size={8} color={W.gray} style={{ marginTop: 2 }}>
            Heavy Freight Truck · 78% fuel
          </WText>
        </View>
        <IconTile icon="check" size={28} iconSize={15} radius={9} background={W.greenSoft} color={W.greenDark} style={{ marginRight: 4 }} />
      </Card>

      <SectionHeading title="Quick access" />
      <View style={styles.quickGrid}>
        <Pressable onPress={() => router.push('/offline')} style={styles.quickCell}>
          <LinearGradient
            colors={[W.blueSoft, W.white]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.quickCard, { borderColor: '#cceefa' }]}>
            <IconTile icon="cloud" size={37} iconSize={20} background={W.white} color={W.blueText} style={{ marginBottom: 10 }} />
            <WText size={11} weight={700}>
              Offline & Sync
            </WText>
            <WText size={8} color={W.gray} style={{ marginTop: 3 }}>
              All data synced
            </WText>
            <View style={styles.quickOnline}>
              <View style={styles.quickOnlineDot} />
              <WText size={7} weight={800} color={W.greenDark}>
                Online
              </WText>
            </View>
          </LinearGradient>
        </Pressable>
        {quickLinks.map((link) => (
          <Pressable key={link.title} style={styles.quickCell}>
            <View style={styles.quickCard}>
              <IconTile icon={link.icon} size={37} iconSize={20} background={W.yellowSoft} color="#9d6800" style={{ marginBottom: 10 }} />
              <WText size={11} weight={700}>
                {link.title}
              </WText>
              <WText size={8} color={W.gray} style={{ marginTop: 3 }}>
                {link.detail}
              </WText>
            </View>
          </Pressable>
        ))}
      </View>

      <SectionHeading title="Driver tools" meta={`${driver.truck} · Shift A`} style={{ marginTop: 2 }} />
      <Card style={styles.menu}>
        {menuItems.map((item, index) => (
          <Pressable
            key={item.label}
            accessibilityRole="button"
            style={[styles.menuRow, index === menuItems.length - 1 && { borderBottomWidth: 0 }]}>
            <IconTile icon={item.icon} iconSize={19} radius={11} background={W.muted} color="#8d6507" />
            <View style={{ flex: 1, minWidth: 0 }}>
              <WText size={10} weight={700}>
                {item.label}
              </WText>
              <WText size={8} color={W.gray} style={{ marginTop: 3 }}>
                {item.detail}
              </WText>
            </View>
            {item.badge && (
              <View style={styles.badge}>
                <Icon name="check" size={11} color={W.greenDark} />
                <WText size={7} weight={800} color={W.greenDark}>
                  {item.badge}
                </WText>
              </View>
            )}
            <Icon name="chevron" size={17} color="#b5b7bb" />
          </Pressable>
        ))}
      </Card>

      <LinearGradient
        colors={['#292a2d', W.charcoal]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.dispatch}>
        <IconTile icon="navigation" size={42} iconSize={22} radius={13} background={W.yellow} color={W.charcoal} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Label size={7} spacing={0.08} color={W.yellow}>
            NEED ASSISTANCE?
          </Label>
          <WText size={11} weight={700} color={W.white} style={{ marginTop: 2 }}>
            Dispatch Control
          </WText>
          <WText size={7} color="#bfc0c3" style={{ marginTop: 2 }}>
            Average response under 2 minutes
          </WText>
        </View>
        <Button
          variant="secondary"
          height={37}
          textSize={9}
          textColor={W.white}
          style={styles.dispatchCall}>
          Call
        </Button>
      </LinearGradient>

      <View style={styles.version}>
        <Icon name="shield" size={14} color={W.gray} />
        <WText size={8} color={W.gray}>
          Fleet Driver v2.8.4 · Secure connection
        </WText>
      </View>
    </Screen>
  );
}

function ProfileStat({ label, value, suffix, last }: { label: string; value: string; suffix?: string; last?: boolean }) {
  return (
    <View style={[styles.profileStat, !last && styles.profileStatDivider]}>
      <Label size={7} spacing={0.07} color="#795500">
        {label}
      </Label>
      <WText size={14} weight={700} style={{ marginTop: 3 }}>
        {value}
        {suffix && (
          <WText size={8} weight={700} color="#795500">
            {' '}
            {suffix}
          </WText>
        )}
      </WText>
    </View>
  );
}

const styles = StyleSheet.create({
  settings: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: W.white,
    borderWidth: 1,
    borderColor: W.border,
    boxShadow: Shadow.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profile: {
    minHeight: 205,
    borderRadius: Radius.lg,
    padding: 17,
    overflow: 'hidden',
    marginBottom: 12,
    justifyContent: 'space-between',
    gap: 11,
    boxShadow: '0px 12px 28px rgba(245,158,11,0.18)',
  },
  patternLarge: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 38,
    borderColor: 'rgba(255,255,255,0.17)',
    right: -77,
    top: -84,
  },
  patternSmall: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 18,
    borderColor: 'rgba(255,255,255,0.13)',
    right: 90,
    top: 36,
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  largeAvatar: {
    width: 54,
    height: 54,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.78)',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 6px 16px rgba(118,79,0,0.1)',
  },
  largeAvatarDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    right: -2,
    bottom: -2,
    backgroundColor: W.green,
    borderWidth: 2,
    borderColor: W.yellow,
  },
  profileStatus: {
    minHeight: 27,
    paddingHorizontal: 8,
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.72)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  profileStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.58)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.55)',
    borderRadius: 15,
    paddingVertical: 11,
    paddingHorizontal: 4,
  },
  profileStat: {
    flex: 1,
    paddingHorizontal: 10,
  },
  profileStatDivider: {
    borderRightWidth: 1,
    borderRightColor: 'rgba(121,85,0,0.14)',
  },
  vehicle: {
    minHeight: 79,
    borderRadius: 18,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  vehicleImage: {
    width: 74,
    height: 61,
    borderRadius: 12,
    overflow: 'hidden',
  },
  assigned: {
    position: 'absolute',
    left: 5,
    bottom: 5,
    backgroundColor: W.yellow,
    borderRadius: 5,
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  quickCell: {
    flexBasis: '48%',
    flexGrow: 1,
  },
  quickCard: {
    minHeight: 122,
    borderWidth: 1,
    borderColor: W.border,
    borderRadius: 17,
    backgroundColor: W.white,
    padding: 12,
    alignItems: 'flex-start',
    boxShadow: Shadow.sm,
  },
  quickOnline: {
    position: 'absolute',
    right: 9,
    top: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  quickOnlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: W.green,
  },
  menu: {
    paddingVertical: 3,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  menuRow: {
    minHeight: 63,
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: W.divider,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  badge: {
    minHeight: 22,
    paddingHorizontal: 6,
    borderRadius: 99,
    backgroundColor: W.greenSoft,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  dispatch: {
    minHeight: 76,
    borderRadius: Radius.md,
    padding: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    boxShadow: Shadow.md,
  },
  dispatchCall: {
    width: 59,
    paddingHorizontal: 0,
    borderColor: '#555',
    backgroundColor: '#38393c',
  },
  version: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
});
