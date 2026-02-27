import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getRelativeTime = (dateStr) => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'Past';
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays < 7) return `In ${diffDays} days`;
  if (diffDays < 30) return `In ${Math.ceil(diffDays / 7)} wks`;
  return `In ${Math.ceil(diffDays / 30)} mo`;
};

export default function TripCard({ trip, onPress, onDelete }) {
  const relativeTime = getRelativeTime(trip.start_date);
  const isPast = relativeTime === 'Past';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.row}>
        <View style={styles.left}>
          <View style={styles.titleRow}>
            <Text style={styles.name} numberOfLines={1}>{trip.name}</Text>
            {relativeTime && (
              <View style={[styles.timeBadge, isPast && styles.timeBadgePast]}>
                <Text style={[styles.timeBadgeText, isPast && styles.timeBadgeTextPast]}>
                  {relativeTime}
                </Text>
              </View>
            )}
          </View>

          {trip.location_text ? (
            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={14} color={COLORS.accent500} />
              <Text style={styles.meta} numberOfLines={1}>{trip.location_text}</Text>
            </View>
          ) : null}

          {trip.start_date ? (
            <View style={styles.metaRow}>
              <Ionicons name="calendar-outline" size={14} color={COLORS.neutral400} />
              <Text style={styles.meta}>
                {formatDate(trip.start_date)}
                {trip.end_date ? ` — ${formatDate(trip.end_date)}` : ''}
              </Text>
            </View>
          ) : null}
        </View>

        <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={18} color={COLORS.error} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  left: {
    flex: 1,
    marginRight: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.neutral900,
  },
  timeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
    backgroundColor: COLORS.primary100,
  },
  timeBadgePast: {
    backgroundColor: COLORS.neutral100,
  },
  timeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary700,
  },
  timeBadgeTextPast: {
    color: COLORS.neutral500,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 3,
  },
  meta: {
    fontSize: 13,
    color: COLORS.neutral600,
    flex: 1,
  },
  deleteBtn: {
    padding: 4,
  },
});
