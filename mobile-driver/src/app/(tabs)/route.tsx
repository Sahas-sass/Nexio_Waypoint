import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  ImageBackground,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

const STOP_DATA = [
  {
    id: 1,
    number: '01',
    name: 'Fresh Store #18',
    location: 'Colombo 07',
    time: 'Before 8:00 AM',
    tags: ['Chilled'],
    status: 'completed',
  },
  {
    id: 2,
    number: '02',
    name: 'Fresh Store #22',
    location: 'Nugegoda',
    time: '8:00–8:30 AM',
    tags: ['Chilled'],
    status: 'current',
  },
  {
    id: 3,
    number: '03',
    name: 'Style Store #08',
    location: 'Colombo 03',
    time: '9:00–10:00 AM',
    tags: ['Ambient'],
    status: 'upcoming',
  },
  {
    id: 4,
    number: '04',
    name: 'Daily Market #11',
    location: 'Dehiwala',
    time: '10:30–11:15 AM',
    tags: ['Ambient'],
    status: 'upcoming',
  }
];

export default function RouteScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Feather name="user" size={18} color="#1C1C1E" />
          </View>
          <View style={styles.avatarStatusDot} />
        </View>

        <View style={styles.headerTextCenter}>
          <Text style={styles.headerTitle}>Today</Text>
          <Text style={styles.headerSubtitle}>Monday, 14 October</Text>
        </View>

        <View style={styles.onlinePill}>
          <View style={styles.onlineDot} />
          <Text style={styles.onlineText}>Online</Text>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        
        {/* Daily Itinerary Header */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.eyebrowText}>DAILY ITINERARY</Text>
            <Text style={styles.sectionTitle}>Today's Route</Text>
            <Text style={styles.sectionSubtitle}>TRK-024 • 6 Stops</Text>
          </View>
          <View style={styles.dateBadge}>
            <Text style={styles.dateBadgeNumber}>14</Text>
            <Text style={styles.dateBadgeMonth}>OCT</Text>
          </View>
        </View>

        {/* Large Image Card */}
        <View style={styles.truckCardContainer}>
          <ImageBackground 
            source={{ uri: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=2070&auto=format&fit=crop' }} 
            style={styles.truckCardBg}
            imageStyle={{ borderRadius: 24 }}
          >
            <View style={styles.truckCardOverlay}>
              <View style={styles.truckCardTopRow}>
                <View style={styles.yellowBadge}>
                  <Text style={styles.yellowBadgeText}>TRK-024</Text>
                </View>
                <Text style={styles.photoCredit}>Photo: A. Balashevsky</Text>
              </View>

              <View style={styles.truckCardContent}>
                <Text style={styles.truckTitle}>Heavy Freight Truck</Text>
                <View style={styles.truckStatsRow}>
                  <View style={styles.truckStatCol}>
                    <Text style={styles.truckStatLabel}>DRIVER</Text>
                    <Text style={styles.truckStatValue}>Kasun Perera</Text>
                  </View>
                  <View style={styles.truckStatCol}>
                    <Text style={styles.truckStatLabel}>LOAD</Text>
                    <Text style={styles.truckStatValue}>28 Items • 420 kg</Text>
                  </View>
                </View>
              </View>

              <View style={styles.truckCardFooter}>
                <View style={styles.departedRow}>
                  <Feather name="clock" size={14} color="#FFFFFF" />
                  <Text style={styles.departedText}>Departed 06:30 AM</Text>
                </View>
                <View style={styles.statusBadgeGreen}>
                  <Text style={styles.statusBadgeGreenText}>On schedule</Text>
                </View>
              </View>
            </View>
          </ImageBackground>
        </View>

        {/* Route Progress Card */}
        <View style={styles.progressCard}>
          <Text style={styles.eyebrowTextGray}>ROUTE PROGRESS</Text>
          <View style={styles.progressHeaderRow}>
            <Text style={styles.progressTitle}>2 of 6 Stops Completed</Text>
            <Text style={styles.progressPercent}>33%</Text>
          </View>

          {/* Stepper */}
          <View style={styles.stepperContainer}>
            {/* Step 1 & 2 Completed */}
            <View style={styles.stepCompleted}><Feather name="check" size={12} color="#FFF" /></View>
            <View style={styles.lineCompleted} />
            <View style={styles.stepCompleted}><Feather name="check" size={12} color="#FFF" /></View>
            <View style={styles.lineCompleted} />
            {/* Step 3 Current */}
            <View style={styles.stepCurrentOuter}>
              <View style={styles.stepCurrentInner} />
            </View>
            <View style={styles.lineUpcoming} />
            {/* Step 4, 5, 6 Upcoming */}
            <View style={styles.stepUpcoming} />
            <View style={styles.lineUpcoming} />
            <View style={styles.stepUpcoming} />
            <View style={styles.lineUpcoming} />
            <View style={styles.stepUpcoming} />
          </View>

          <View style={styles.nextDeliveryRow}>
            <View style={styles.nextDeliveryLeft}>
              <Feather name="clock" size={14} color="#8E8E93" />
              <Text style={styles.nextDeliveryText}>Next delivery</Text>
            </View>
            <Text style={styles.nextDeliveryTime}>7:10 AM</Text>
          </View>
        </View>

        {/* Today's Stops */}
        <View style={styles.stopsHeaderRow}>
          <Text style={styles.stopsTitle}>Today's stops</Text>
          <Text style={styles.stopsRemaining}>4 remaining</Text>
        </View>

        <View style={styles.stopsList}>
          {STOP_DATA.map((stop) => (
            <View key={stop.id} style={styles.stopItem}>
              <View style={styles.stopIndexCol}>
                <Text style={styles.stopIndexLabel}>STOP</Text>
                <Text style={styles.stopIndexNumber}>{stop.number}</Text>
              </View>
              
              <View style={[
                styles.stopCard, 
                stop.status === 'current' && styles.stopCardCurrent
              ]}>
                <View style={styles.stopCardHeader}>
                  <Text style={styles.stopName}>{stop.name}</Text>
                  
                  {stop.status === 'completed' && (
                    <View style={styles.stopBadgeCompleted}>
                      <Feather name="check" size={10} color="#34C759" />
                      <Text style={styles.stopBadgeCompletedText}>Completed</Text>
                    </View>
                  )}
                  {stop.status === 'current' && (
                    <View style={styles.stopBadgeCurrent}>
                      <Text style={styles.stopBadgeCurrentText}>Current Stop</Text>
                    </View>
                  )}
                  {stop.status === 'upcoming' && (
                    <View style={styles.stopBadgeUpcoming}>
                      <Text style={styles.stopBadgeUpcomingText}>Upcoming</Text>
                    </View>
                  )}
                </View>

                <View style={styles.stopLocationRow}>
                  <Ionicons name="location-outline" size={14} color="#8E8E93" />
                  <Text style={styles.stopLocationText}>{stop.location}</Text>
                </View>

                <View style={styles.stopTagsRow}>
                  <View style={styles.stopTag}>
                    <Feather name="clock" size={12} color="#4A4A4A" style={{marginRight: 4}} />
                    <Text style={styles.stopTagText}>{stop.time}</Text>
                  </View>
                  {stop.tags.map(tag => (
                    <View key={tag} style={[styles.stopTag, tag === 'Chilled' ? styles.stopTagChilled : styles.stopTagAmbient]}>
                      {tag === 'Chilled' && <Ionicons name="snow-outline" size={12} color="#007AFF" style={{marginRight: 4}} />}
                      <Text style={[styles.stopTagText, tag === 'Chilled' && {color: '#007AFF'}]}>{tag}</Text>
                    </View>
                  ))}
                </View>

                {stop.status === 'current' && (
                  <TouchableOpacity style={styles.openStopButton} activeOpacity={0.8}>
                    <Text style={styles.openStopButtonText}>Open Stop</Text>
                    <Feather name="chevron-right" size={16} color="#1C1C1E" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFCF3A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarStatusDot: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#34C759',
    borderWidth: 2,
    borderColor: '#FAFAFA',
  },
  headerTextCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
  },
  onlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F8F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34C759',
    marginRight: 6,
  },
  onlineText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1D9345',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  eyebrowText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A87900',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1C1C1E',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  dateBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  dateBadgeNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1C1C1E',
  },
  dateBadgeMonth: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8E8E93',
  },
  truckCardContainer: {
    width: '100%',
    height: 240,
    borderRadius: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },
  truckCardBg: {
    width: '100%',
    height: '100%',
  },
  truckCardOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 24,
    padding: 20,
    justifyContent: 'space-between',
  },
  truckCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  yellowBadge: {
    backgroundColor: '#FFCF3A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  yellowBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1C1C1E',
  },
  photoCredit: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
  },
  truckCardContent: {
    marginTop: 'auto',
    marginBottom: 16,
  },
  truckTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  truckStatsRow: {
    flexDirection: 'row',
  },
  truckStatCol: {
    marginRight: 24,
  },
  truckStatLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 2,
    letterSpacing: 1,
  },
  truckStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  truckCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  departedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  departedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  statusBadgeGreen: {
    backgroundColor: 'rgba(52, 199, 89, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeGreenText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#76E49A',
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  eyebrowTextGray: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8E8E93',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  progressPercent: {
    fontSize: 22,
    fontWeight: '800',
    color: '#A87900',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  stepCompleted: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#34C759',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lineCompleted: {
    flex: 1,
    height: 3,
    backgroundColor: '#34C759',
  },
  stepCurrentOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFCF3A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCurrentInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FAFAFA',
  },
  lineUpcoming: {
    flex: 1,
    height: 3,
    backgroundColor: '#E5E5EA',
  },
  stepUpcoming: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    backgroundColor: '#FFFFFF',
  },
  nextDeliveryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nextDeliveryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextDeliveryText: {
    fontSize: 13,
    color: '#8E8E93',
    marginLeft: 6,
    fontWeight: '500',
  },
  nextDeliveryTime: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  stopsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  stopsTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1C1C1E',
  },
  stopsRemaining: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8E8E93',
    marginBottom: 2,
  },
  stopsList: {
    paddingBottom: 20,
  },
  stopItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stopIndexCol: {
    width: 50,
    alignItems: 'flex-start',
    paddingTop: 16,
  },
  stopIndexLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#C7C7CC',
    letterSpacing: 1,
    marginBottom: 4,
  },
  stopIndexNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#4A4A4A',
  },
  stopCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  stopCardCurrent: {
    borderColor: '#FFCF3A',
    shadowColor: '#FFCF3A',
    shadowOpacity: 0.15,
  },
  stopCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  stopName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
    flex: 1,
  },
  stopBadgeCompleted: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  stopBadgeCompletedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1D9345',
    marginLeft: 4,
  },
  stopBadgeCurrent: {
    backgroundColor: '#FFCF3A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  stopBadgeCurrentText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#A87900',
  },
  stopBadgeUpcoming: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  stopBadgeUpcomingText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8E8E93',
  },
  stopLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stopLocationText: {
    fontSize: 13,
    color: '#8E8E93',
    marginLeft: 4,
    fontWeight: '500',
  },
  stopTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  stopTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  stopTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4A4A4A',
  },
  stopTagChilled: {
    backgroundColor: '#E5F1FF',
  },
  stopTagAmbient: {
    backgroundColor: '#F2F2F7',
  },
  openStopButton: {
    backgroundColor: '#FFCF3A',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 16,
  },
  openStopButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1C1E',
    marginRight: 4,
  }
});
